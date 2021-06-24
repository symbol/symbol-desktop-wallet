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
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccountInfo, Address, MosaicId, PublicAccount, NetworkType, RepositoryFactory } from 'symbol-sdk';
// internal dependencies
import { DerivationService } from '@/services/DerivationService';
import { AccountService } from '@/services/AccountService';
import { NotificationType } from '@/core/utils/NotificationType';
import { Formatters } from '@/core/utils/Formatters';
// child components
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue';
import { NetworkCurrencyModel } from '@/core/database/entities/NetworkCurrencyModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { ProfileService } from '@/services/ProfileService';
import _ from 'lodash';

@Component({
    computed: {
        ...mapGetters({
            networkType: 'network/networkType',
            networkMosaic: 'mosaic/networkMosaic',
            networkCurrency: 'mosaic/networkCurrency',
            currentProfile: 'profile/currentProfile',
            addressesList: 'account/addressesList',
            selectedAccounts: 'account/selectedAddressesToInteract',
        }),
    },
    components: { MosaicAmountDisplay },
})
export default class AccountSelectionTs extends Vue {
    /**
     * Form is being submitted
     */
    protected isLoading: boolean = false;

    /**
     * Formatting helpers
     * @protected
     */
    protected formatters = Formatters;

    /**
     * Network's currency mosaic id
     * @see {Store.networkType}
     * @var {NetworkType}
     */
    public networkType: NetworkType;

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
     * Derivation Service
     * @var {DerivationService}
     */
    public derivation: DerivationService;

    /**
     * Account Service
     * @var {AccountService}
     */
    public accountService: AccountService;

    /**
     * Profile service
     * @var {ProfileService}
     */
    public profileService: ProfileService = new ProfileService();

    /**
     * Balances map
     * @var {any}
     */
    public addressBalanceMap: { [address: string]: number } = {};

    /**
     * Map of selected accounts
     * @var {number[]}
     */
    public selectedAccounts: number[];

    /**
     * List of addresses
     * @var {Address[]}
     */
    public addressesList: Address[];

    public networkCurrency: NetworkCurrencyModel;

    /**
     * Hook called when the page is mounted
     * @return {void}
     */
    async mounted() {
        this.derivation = new DerivationService(this.currentProfile.networkType);
        this.accountService = new AccountService();
        await this.$store.dispatch('temporary/initialize');
        this.$store.commit('account/resetPublicKeyList');
        this.$store.commit('account/resetAddressesList');
        this.$store.commit('account/resetSelectedAddressesToInteract');

        Vue.nextTick().then(() => {
            setTimeout(async () => {
                this.isLoading = true;
                await this.initAccounts();
                this.isLoading = false;
            }, 200);
        });
    }

    public previous() {
        this.$router.push({ name: 'profiles.accessTrezor.info' });
    }

    /**
     * Trezor popup error notification handler
     */
    private trezorErrorNotificationHandler(error: any) {
        if (typeof error === 'string') {
            switch (error) {
                case 'Popup closed':
                    this.$store.dispatch('notification/ADD_ERROR', 'trezor_popup_closed');
                    return;
                case 'Cancelled':
                case 'Permissions not granted':
                    this.$store.dispatch('notification/ADD_ERROR', 'trezor_user_reject_request');
                    return;
                case 'Device call in process':
                    this.$store.dispatch('notification/ADD_ERROR', 'trezor_existed_popup_openning');
                    return;
                case 'Transport is missing':
                    this.$store.dispatch('notification/ADD_ERROR', 'trezor_bridge_missing');
                    return;
            }
        }
        this.$store.dispatch('notification/ADD_ERROR', this.$t('trezor_popup_common_error', { reason: error.message || error }));
    }

    /**
     * Finalize the account selection process by adding
     * the selected accounts to storage.
     * @return {void}
     */
    public async submit() {
        // cannot submit without selecting at least one account
        if (!this.selectedAccounts.length) {
            return this.$store.dispatch('notification/ADD_ERROR', NotificationType.IMPORT_EMPTY_ACCOUNT_LIST);
        }
        return this.$router.push({ name: 'profiles.accessTrezor.finalize' });
    }

    /**
     * Fetch account balances and map to address
     * @return {void}
     */
    private async initAccounts() {
        try {
            // - generate addresses
            const accounts = await this.accountService.getTrezorAccounts(this.currentProfile.networkType, 10);
            const publicKeyList = accounts.map((account) => account.publicKey);
            const addressesList = accounts.map((account) => account.address);

            this.$store.commit('account/publicKeyList', publicKeyList);
            this.$store.commit('account/addressesList', addressesList);

            // fetch accounts info
            const repositoryFactory = this.$store.getters['network/repositoryFactory'] as RepositoryFactory;
            if (repositoryFactory) {
                const accountsInfo = await repositoryFactory.createAccountRepository().getAccountsInfo(this.addressesList).toPromise();
                // map balances
                this.addressBalanceMap = {
                    ...this.addressBalanceMap,
                    ...this.mapBalanceByAddress(accountsInfo, this.networkMosaic, this.addressesList),
                };
            } else {
                this.$store.dispatch('notification/ADD_ERROR', 'symbol_node_cannot_connect');
                return;
            }
        } catch (error) {
            this.trezorErrorNotificationHandler(error);
            this.$router.push({ name: 'profiles.accessTrezor.info' });
        }
    }

    public mapBalanceByAddress(accountsInfo: AccountInfo[], mosaicId: MosaicId, addressList: Address[]): { [address: string]: number } {
        const addressToAccountInfo = _.keyBy(accountsInfo, (a) => a.address.plain());
        return _.chain(addressList)
            .keyBy((a) => a.plain())
            .mapValues((a) => addressToAccountInfo[a.plain()]?.mosaics.find((m) => m.id.equals(mosaicId))?.amount.compact() ?? 0)
            .value();
    }

    /**
     * Called when clicking on an address to add it to the selection
     * @param {number} pathNumber
     */
    protected onAddAddress(pathNumber: number): void {
        this.$store.commit('account/addToSelectedAddressesToInteract', pathNumber);
    }
}
