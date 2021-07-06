/*
 * Copyright 2020 NEM (https://nem.io)
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
import { MosaicService } from '@/services/MosaicService';
import { of } from 'rxjs';
import {
    AccountInfo,
    AccountRepository,
    Address,
    MosaicFlags,
    MosaicId,
    MosaicInfo,
    MosaicRepository,
    NetworkCurrencies,
    NetworkType,
    Page,
    RepositoryFactory,
    UInt64,
} from 'symbol-sdk';
import { anything, deepEqual, instance, mock, when } from 'ts-mockito';

const fakeMosaicInfo = new MosaicInfo(
    1,
    '59FDA0733F17CF0001772CBC',
    new MosaicId([3646934825, 3576016193]),
    new UInt64([3403414400, 2095475]),
    new UInt64([1, 0]),
    Address.createFromRawAddress('TAD5BAHLOIXCRRB6GU2H72HPXMBBVAEUQRYPHBY'),
    1,
    new MosaicFlags(7),
    3,
    UInt64.fromNumericString('1000'),
);

const address1 = Address.createFromRawAddress('TAD5BAHLOIXCRRB6GU2H72HPXMBBVAEUQRYPHBY');
const accountInfo1 = { address: address1, mosaics: [{ id: fakeMosaicInfo.id, amount: UInt64.fromUint(10) }] } as AccountInfo;

const address2 = Address.createFromRawAddress('TAWJ2M7BGKWGBPOUGD5NDKHYDDQ7OQD26HJMMQQ');
const accountInfo2 = { address: address2, mosaics: [{ id: fakeMosaicInfo.id, amount: UInt64.fromUint(20) }] } as AccountInfo;

const address3 = Address.createFromRawAddress('TDARSPFSZVLYGBOHGOVWIKAZ4FGGDPGZ3DSS7CQ');
const accountInfo3 = { address: address3, mosaics: [{ id: fakeMosaicInfo.id, amount: UInt64.fromUint(30) }] } as AccountInfo;

const address4 = Address.createFromRawAddress('TCEPWMC37ZGXOGOXQOAGDYPI7YH65HLXIMLKNOQ');
const accountInfo4 = { address: address4, mosaics: [{ id: fakeMosaicInfo.id, amount: UInt64.fromUint(40) }] } as AccountInfo;

const address5 = Address.createFromRawAddress('TAUDGSA7IEFH6MRGXO26SUU3W5ICF7OLLI3O7CY');
const accountInfo5 = { address: address5, mosaics: [{ id: fakeMosaicInfo.id, amount: UInt64.fromUint(50) }] } as AccountInfo;

const mosaicService = new MosaicService();

const mockRepoFactory = mock<RepositoryFactory>();

const mockMosaicRepository = mock<MosaicRepository>();
when(mockMosaicRepository.getMosaic(anything())).thenReturn(of(fakeMosaicInfo));
when(mockMosaicRepository.getMosaics(anything())).thenReturn(of([fakeMosaicInfo]));
when(mockMosaicRepository.search(anything())).thenReturn(of(new Page([fakeMosaicInfo], 1, 1)));

const mosaicRepository = instance(mockMosaicRepository);
const mockAccountRepository = mock<AccountRepository>();

when(mockAccountRepository.getAccountsInfo(deepEqual([address1, address2, address3, address4, address5]))).thenReturn(
    of([accountInfo1, accountInfo2, accountInfo3, accountInfo4, accountInfo5]),
);

when(mockAccountRepository.getAccountsInfo(deepEqual([address1]))).thenReturn(of([accountInfo1]));
when(mockAccountRepository.getAccountsInfo(deepEqual([address3]))).thenReturn(of([accountInfo3]));

const accountRepository = instance(mockAccountRepository);
when(mockRepoFactory.createAccountRepository()).thenReturn(accountRepository);
when(mockRepoFactory.createMosaicRepository()).thenReturn(mosaicRepository);

when(mockRepoFactory.getEpochAdjustment()).thenReturn(of(1573430400));
when(mockRepoFactory.getGenerationHash()).thenReturn(of('Some Gen Hash'));
when(mockRepoFactory.getNetworkType()).thenReturn(of(NetworkType.MIJIN_TEST));
when(mockRepoFactory.getCurrencies()).thenReturn(of(NetworkCurrencies.PUBLIC));
const repositoryFactory = instance(mockRepoFactory);

describe('services/MosaicService', () => {
    test('getMosaics all addresses', async () => {
        const generationHash = await repositoryFactory.getGenerationHash().toPromise();
        const { networkCurrency } = await mosaicService.getNetworkCurrencies(repositoryFactory).toPromise();
        const addresses: Address[] = [address1, address2, address3, address4, address5];
        const accountInfos = await repositoryFactory.createAccountRepository().getAccountsInfo(addresses).toPromise();
        const result = await mosaicService
            .getMosaics(repositoryFactory, generationHash, networkCurrency, accountInfos, address1)
            .toPromise();
        console.log(JSON.stringify(result, null, 2));
    });

    test('getMosaics account 1 addresses', async () => {
        const generationHash = await repositoryFactory.getGenerationHash().toPromise();
        const { networkCurrency } = await mosaicService.getNetworkCurrencies(repositoryFactory).toPromise();
        const addresses: Address[] = [address1];
        const accountInfos = await repositoryFactory.createAccountRepository().getAccountsInfo(addresses).toPromise();
        const result = await mosaicService
            .getMosaics(repositoryFactory, generationHash, networkCurrency, accountInfos, address1)
            .toPromise();
        console.log(JSON.stringify(result, null, 2));
    });

    test('getMosaics account 3 addresses', async () => {
        const generationHash = await repositoryFactory.getGenerationHash().toPromise();
        const { networkCurrency } = await mosaicService.getNetworkCurrencies(repositoryFactory).toPromise();
        const addresses: Address[] = [address3];
        const accountInfos = await repositoryFactory.createAccountRepository().getAccountsInfo(addresses).toPromise();
        const result = await mosaicService
            .getMosaics(repositoryFactory, generationHash, networkCurrency, accountInfos, address1)
            .toPromise();
        console.log(JSON.stringify(result, null, 2));
    });
});
