/*
 * Copyright 2020 NEM Foundation (https://nem.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */
import {
  NetworkType,
  Password,
  RepositoryFactoryHttp,
  Address,
  AccountInfo,
  AccountRepository,
  AccountSearchCriteria,
  PublicAccount,
  Page,
  AccountType as sdkAccountType,
} from 'symbol-sdk'
import { RemoteAccountService } from '@/services/RemoteAccountService'
import { WalletsModel2 } from '@MOCKS/Accounts'
import { getTestProfile } from '@MOCKS/profiles'
import { Observable, of } from 'rxjs'

const repositoryFactory = new (class RepositoryFactoryHttpForTest extends RepositoryFactoryHttp {
  createAccountRepository(): AccountRepository {
    return new (class AccountRepositoryForTest implements AccountRepository {
      getAccountInfo(address: Address): Observable<AccountInfo> {
        return of({ address: Address.createFromRawAddress(WalletsModel2.address) } as AccountInfo)
      }

      getAccountsInfo(addresses: Address[]): Observable<AccountInfo[]> {
        return of([
          {
            address: Address.createFromRawAddress(WalletsModel2.address),
            accountType: sdkAccountType.Main,
          } as AccountInfo,
          {
            address: PublicAccount.createFromPublicKey(
              'FA0939C5F11FC89A8EB997329C64AC785CDD23AE9D73C3E060D3B5FF0BABC2A4',
              NetworkType.TEST_NET,
            ).address,
            accountType: sdkAccountType.Remote_Unlinked,
          } as AccountInfo,
        ])
      }

      search(criteria: AccountSearchCriteria): Observable<Page<AccountInfo>> {
        return of(new Page([{ address: Address.createFromRawAddress(WalletsModel2.address) } as AccountInfo], 1, 1))
      }
    })()
  }
})('http://localhost:3000', {
  networkType: NetworkType.TEST_NET,
  generationHash: 'ACECD90E7B248E012803228ADB4424F0D966D24149B72E58987D2BF2F2AF03C4',
})
repositoryFactory.getNetworkType = jest.fn(() => of(NetworkType.MIJIN_TEST))

describe('services/RemoteAccountService', () => {
  describe('getAvailableRemotePublicKey()', () => {
    test('should return the first linkable public key', async (done) => {
      // prepare

      // act
      const remoteAccount = await new RemoteAccountService(
        WalletsModel2,
        getTestProfile('profile1'),
        repositoryFactory.createAccountRepository(),
      ).getAvailableRemoteAccount(new Password('password'))

      expect(remoteAccount.publicKey).toBe('BB6FF99C52B3C9D880D5E59C10AD696D90CF84A8E825CCA16F584A8BCE4D17E6')
      done()
    })
  })
})
