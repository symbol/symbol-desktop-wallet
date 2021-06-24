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
import { Vue, Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ProfileService } from '@/services/ProfileService';
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { AccountService } from '@/services/AccountService';
import { DerivationPathLevels, DerivationService } from '@/services/DerivationService';
import { PublicAccount, Password } from 'symbol-sdk';
import { SimpleObjectStorage } from '@/core/database/backends/SimpleObjectStorage';
import { ProfileModel } from '@/core/database/entities/ProfileModel';

@Component({
    computed: {
        ...mapGetters({
            currentProfile: 'profile/currentProfile',
            networkType: 'network/networkType',
            networkMosaic: 'mosaic/networkMosaic',
            networkCurrency: 'mosaic/networkCurrency',
            currentPassword: 'temporary/password',
            currentMnemonic: 'temporary/mnemonic',
            publicKeyList: 'account/publicKeyList',
            selectedAccounts: 'account/selectedAddressesToInteract',
        }),
    },
})
export default class FinalizeTs extends Vue {
    /**
     * Form is being submitted
     */
    protected isLoading: boolean = false;
    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public currentProfile: ProfileModel;

    /**
     * Temporary stored password
     * @see {Store.Temporary}
     * @var {Password}
     */
    public currentPassword: Password;

    /**
     * Temporary stored mnemonic pass phrase
     * @see {Store.Temporary}
     * @var {MnemonicPassPhrase}
     */
    public currentMnemonic: string;

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
     * List of publicKey
     * @var {string[]}
     */
    public publicKeyList: string[];

    /**
     * Map of selected accounts
     * @var {number[]}
     */
    public selectedAccounts: number[];

    /**
     * Controls submit button for terms and conditions
     * @type {boolean}
     */
    private marked: boolean = false;

    /**
     * Modal forms visibility states
     * @protected
     * @type {{
     *     termsAndConditions: boolean
     *     privacyAndPolicy: boolean
     *   }}
     */
    protected modalVisibility: {
        termsAndConditions: boolean;
        privacyAndPolicy: boolean;
    } = {
        termsAndConditions: false,
        privacyAndPolicy: false,
    };

    /**
     * Profile Service
     * @var {ProfileService}
     */
    public profileService: ProfileService = new ProfileService();

    /**
     * Hook called when the page is mounted
     * @return {void}
     */
    async mounted() {
        this.derivation = new DerivationService(this.currentProfile.networkType);
        this.accountService = new AccountService();
    }

    /**
     * Closes a modal
     * @protected
     * @param {string} modalIdentifier
     * @return {void}
     */
    protected displayModal(modalIdentifier: string): void {
        Vue.set(this.modalVisibility, modalIdentifier, true);
    }

    /**
     * Closes a modal
     * @protected
     * @param {string} modalIdentifier
     * @return {void}
     */
    protected closeModal(modalIdentifier: string): void {
        Vue.set(this.modalVisibility, modalIdentifier, false);
    }

    /**
     * Error notification handler
     */
    private errorNotificationHandler(error: any) {
        this.$store.dispatch('notification/ADD_ERROR', this.$t('create_profile_failed', { reason: error.message || error }));
    }

    /**
     * Create an accounts
     * @return {AccountModel}
     */
    private async createAccountsFromPathIndexes(indexes: number[]): Promise<AccountModel[]> {
        const accountPath = AccountService.getAccountPathByNetworkType(this.currentProfile.networkType);
        const paths = indexes.map((index) => {
            if (index == 0) {
                return accountPath;
            }

            return this.derivation.incrementPathLevel(accountPath, DerivationPathLevels.Profile, index);
        });

        // const accounts = await this.accountService.generateTrezorAccountsPaths(this.currentProfile.networkType, paths);
        const publicKeys = indexes.map((index) => this.publicKeyList[index]);

        const accounts = publicKeys.map((publicKey) =>
            PublicAccount.createFromPublicKey(publicKey.toUpperCase(), this.currentProfile.networkType),
        );

        return accounts.map((account, i) => {
            return {
                id: SimpleObjectStorage.generateIdentifier(),
                profileName: this.currentProfile.profileName,
                name: `Trezor Account ${indexes[i] + 1}`,
                node: '',
                type: AccountType.TREZOR,
                address: account.address['plain'](),
                publicKey: account.publicKey,
                encryptedPrivateKey: '',
                path: paths[i],
                isMultisig: false,
            };
        });
    }

    public async finish() {
        try {
            this.isLoading = true;
            // create account models
            const normalAccounts = await this.createAccountsFromPathIndexes(this.selectedAccounts);

            const accounts = [...normalAccounts];
            // save newly created accounts
            accounts.forEach((account, index) => {
                // Store accounts using repository
                this.accountService.saveAccount(account);
                // set current account
                if (index === 0) {
                    this.$store.dispatch('account/SET_CURRENT_ACCOUNT', account);
                }
                // add accounts to profile
                this.$store.dispatch('profile/ADD_ACCOUNT', account);
            });

            // get accounts identifiers
            const accountIdentifiers = accounts.map((account) => account.id);

            // set known accounts
            this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', accountIdentifiers);

            this.profileService.updateAccounts(this.currentProfile, accountIdentifiers);

            this.$store.dispatch('temporary/RESET_STATE');
            await this.$store.dispatch('network/REST_NETWORK_RENTAL_FEES');
            // execute store actions
            return this.$router.push({ name: 'dashboard' });
        } catch (error) {
            this.errorNotificationHandler(error);
        }
    }
}
