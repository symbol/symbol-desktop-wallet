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
import { Address, MultisigAccountGraphInfo, MultisigAccountInfo, NetworkType } from 'symbol-sdk';
// internal dependencies
import { AccountModel } from '@/core/database/entities/AccountModel';
import { Signer } from '@/store/Account';

export class MultisigService {
    /**
     * Returns all available multisig info from a multisig graph
     * @static
     * @param {MultisigAccountGraphInfo} multisig graph info
     * @returns {MultisigAccountInfo[]} multisig info
     */
    public static getMultisigInfoFromMultisigGraphInfo(graphInfo: MultisigAccountGraphInfo): MultisigAccountInfo[] {
        const { multisigEntries } = graphInfo;

        const multisigsInfo = [...multisigEntries.keys()]
            .sort((a, b) => b - a) // Get addresses from top to bottom
            .map((key) => multisigEntries.get(key) || [])
            .filter((x) => x.length > 0);

        return [].concat(...multisigsInfo).map((item) => item); // flatten
    }

    public getSigners(
        networkType: NetworkType,
        knownAccounts: AccountModel[],
        currentAccount: AccountModel,
        currentAccountMultisigInfo: MultisigAccountInfo | undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        multisigAccountsInfo: MultisigAccountInfo[] | undefined,
    ): Signer[] {
        if (!currentAccount) {
            return [];
        }
        const self: Signer[] = [
            {
                address: Address.createFromRawAddress(currentAccount.address),
                label: currentAccount.name,
                multisig: currentAccountMultisigInfo && currentAccountMultisigInfo.isMultisig(),
                requiredCosignatures: (currentAccountMultisigInfo && currentAccountMultisigInfo.minApproval) || 0,
            },
        ];

        if (!currentAccountMultisigInfo) {
            return self;
        }

        // check if other child multisig accounts are already cosigners of other accounts and add their children multisig as signers if any to the main cosignatory account
        let addedSignerFromMutlisigAccounts: Signer[] = [];
        multisigAccountsInfo.map((entry) => {
            if (
                (entry.minApproval > 0 || entry.minRemoval > 0) &&
                entry.multisigAddresses.length > 0 &&
                entry.cosignatoryAddresses.some((value) => value.equals(Address.createFromRawAddress(currentAccount.address)))
            ) {
                entry.multisigAddresses.map((address) => {
                    return (addedSignerFromMutlisigAccounts = self.concat([
                        {
                            address,
                            multisig: true,
                            label: this.getAccountLabel(address, knownAccounts),
                            requiredCosignatures: (currentAccountMultisigInfo && currentAccountMultisigInfo.minApproval) || 0,
                        },
                    ]));
                });
            }
        });

        // check for next level signers and add them to the main cosignatory as signers if any
        let addressesFromNextLevel: Signer[] = [];
        addedSignerFromMutlisigAccounts.map((addressEntry) => {
            multisigAccountsInfo.map((term) => {
                if (
                    term.cosignatoryAddresses.some((value) => value.equals(addressEntry.address)) &&
                    !addressEntry.address.equals(Address.createFromRawAddress(currentAccount.address))
                ) {
                    return (addressesFromNextLevel = addedSignerFromMutlisigAccounts.concat([
                        {
                            address: term.accountAddress,
                            multisig: true,
                            label: this.getAccountLabel(term.accountAddress, knownAccounts),
                            requiredCosignatures: (currentAccountMultisigInfo && currentAccountMultisigInfo.minApproval) || 0,
                        },
                    ]));
                }
            });
        });

        return addressesFromNextLevel.concat(
            ...currentAccountMultisigInfo.multisigAddresses.map((address) => {
                return {
                    address,
                    multisig: true,
                    label: this.getAccountLabel(address, knownAccounts),
                    requiredCosignatures: (currentAccountMultisigInfo && currentAccountMultisigInfo.minApproval) || 0,
                };
            }),
        );
    }

    private getAccountLabel(address: Address, accounts: AccountModel[]): string {
        const account = accounts.find((wlt) => address.plain() === wlt.address);
        return (account && account.name) || address.plain();
    }
}
