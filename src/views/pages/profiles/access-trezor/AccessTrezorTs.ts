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
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Formatters } from '@/core/utils/Formatters';
import { mapGetters } from 'vuex';
import { AccountInfo, Address, MosaicId, RepositoryFactory } from 'symbol-sdk';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { AccountService } from '@/services/AccountService';
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue';

@Component({
    components: {
        MosaicAmountDisplay,
    },
    computed: {
        ...mapGetters({
            currentMnemonic: 'temporary/mnemonic',
            networkType: 'network/networkType',
            networkMosaic: 'mosaic/networkMosaic',
            networkCurrency: 'mosaic/networkCurrency',
            currentProfile: 'profile/currentProfile',
            currentPassword: 'temporary/password',
            addressesList: 'account/addressesList',
            selectedAccounts: 'account/selectedAddressesToInteract',
        }),
    },
})
export default class AccessTrezorTs extends Vue {
    /**
     * Formatting helpers
     * @protected
     */
    protected formatters = Formatters;
    /**
     * List of steps
     * @var {string[]}
     */
    public StepBarTitleList = ['create_profile', 'select_accounts', 'finish'];

    /**
     * Network's currency mosaic id
     * @see {Store.Mosaic}
     * @var {MosaicId}
     */
    public networkMosaic: MosaicId;

    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public currentProfile: ProfileModel;

    /**
     * Temporary stored mnemonic pass phrase
     * @see {Store.Temporary}
     * @var {MnemonicPassPhrase}
     */
    public currentMnemonic: string;

    /**
     * Account Service
     * @var {AccountService}
     */
    public accountService: AccountService;

    /**
     * List of addresses
     * @var {Address[]}
     */
    public addressesList: Address[];

    /**
     * Balances map
     * @var {any}
     */
    public addressMosaicMap = {};

    /**
     * Map of selected accounts
     * @var {number[]}
     */
    public selectedAccounts: number[];

    /**
     * Indicates if account balance and addresses are already fetched
     */
    private initialized: boolean = false;

    /**
     * Hook called when the page is mounted
     * @return {void}
     */
    async mounted() {
        this.accountService = new AccountService();
        await this.$store.dispatch('temporary/initialize');
        this.$store.commit('account/resetSelectedAddressesToInteract');
    }

    /**
     * Error notification handler
     */
    private errorNotificationHandler(error: any) {
        this.$store.dispatch('notification/ADD_ERROR', this.$t('create_profile_failed', { reason: error.message || error }));
    }

    @Watch('selectedAccounts')
    /**
     * Fetch account balances and map to address
     * @return {void}
     */
    private async initAccounts() {
        try {
            if (this.initialized || !this.selectedAccounts.length) {
                return;
            }

            // fetch accounts info
            const repositoryFactory = this.$store.getters['network/repositoryFactory'] as RepositoryFactory;
            if (repositoryFactory) {
                const accountsInfo = await repositoryFactory.createAccountRepository().getAccountsInfo(this.addressesList).toPromise();
                // map balances
                this.addressMosaicMap = {
                    ...this.addressMosaicMap,
                    ...this.mapBalanceByAddress(accountsInfo, this.networkMosaic),
                };
            } else {
                this.$store.dispatch('notification/ADD_ERROR', 'symbol_node_cannot_connect');
                return;
            }

            this.initialized = true;
        } catch (error) {
            this.errorNotificationHandler(error);
        }
    }

    public mapBalanceByAddress(accountsInfo: AccountInfo[], mosaic: MosaicId): Record<string, number> {
        return accountsInfo
            .map(({ mosaics, address }) => {
                // - check balance
                const hasNetworkMosaic = mosaics.find((mosaicOwned) => mosaicOwned.id.equals(mosaic));

                // - account doesn't hold network mosaic so the balance is zero
                if (hasNetworkMosaic === undefined) {
                    return {
                        address: address.plain(),
                        balance: 0,
                    };
                }
                // - map balance to address
                const balance = hasNetworkMosaic.amount.compact();
                return {
                    address: address.plain(),
                    balance: balance,
                };
            })
            .reduce((acc, { address, balance }) => ({ ...acc, [address]: balance }), {});
    }

    public getCurrentStep(): number {
        switch (this.$route.name) {
            default:
            case 'profiles.accessTrezor.info':
                return 0;
            case 'profiles.accessTrezor.walletSelection':
                return 1;
            case 'profiles.accessTrezor.finalize':
                return 2;
        }
    }

    public getStepClassName(index: number): string {
        return this.getCurrentStep() == index ? 'active' : this.getCurrentStep() > index ? 'done' : '';
    }

    /**
     * Called when clicking on an address to remove it from the selection
     * @protected
     * @param {number} pathNumber
     */
    protected onRemoveAddress(pathNumber: number): void {
        this.$store.commit('account/removeFromSelectedAddressesToInteract', pathNumber);
    }
}
