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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
// internal dependencies
import { ProfileModel } from '@/core/database/entities/ProfileModel';
// child components
// @ts-ignore
import FormProfileUnlock from '@/views/forms/FormProfileUnlock/FormProfileUnlock.vue';
// @ts-ignore
import ModalBackupReminder from '@/views/modals/ModalBackupReminder/ModalBackupReminder.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { NotificationType } from '@/core/utils/NotificationType';
import { Crypto, NetworkType, Password, PublicAccount } from 'symbol-sdk';
import { SimpleObjectStorage } from '@/core/database/backends/SimpleObjectStorage';
import { FilterHelpers } from '@/core/utils/FilterHelpers';
import { ValidationRuleset } from '@/core/validation/ValidationRuleset';
import { DerivationService } from '@/services/DerivationService';
import { LedgerService } from '@/services/LedgerService';
import { MnemonicPassPhrase } from 'symbol-hd-wallets';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { AccountService } from '@/services/AccountService';

@Component({
    components: {
        FormProfileUnlock,
        ModalBackupReminder,
        FormRow,
        ValidationProvider,
        ErrorTooltip,
        ValidationObserver,
        FormWrapper,
    },
    computed: {
        ...mapGetters({
            networkType: 'network/networkType',
            currentProfile: 'profile/currentProfile',
            knownAccounts: 'account/knownAccounts',
            isPrivateKeyProfile: 'profile/isPrivateKeyProfile',
            currentAccount: 'account/currentAccount',
        }),
    },
})
export class ModalFormSubAccountCreationTs extends Vue {
    @Prop({
        default: false,
    })
    visible: boolean;

    /**
     * Visibility state
     * @type {boolean}
     */
    get show(): boolean {
        return this.visible;
    }

    /**
     * Emits close event
     */
    set show(val) {
        if (!val) {
            this.$emit('close');
        }
    }

    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {ProfileModel}
     */
    public currentProfile: ProfileModel;

    /**
     * Currently active account
     */
    public currentAccount: AccountModel;
    /**
     * Known accounts identifiers
     */
    public knownAccounts: AccountModel[];

    /**
     * Currently active network type
     */
    public networkType: NetworkType;

    /**
     * Accounts repository
     */
    public accountService: AccountService;

    /**
     * Derivation paths service
     */
    public paths: DerivationService;

    /**
     * Validation rules
     */
    public validationRules = ValidationRuleset;

    /**
     * Whether account is currently being unlocked
     */
    public isUnlockingAccount: boolean = false;

    /**
     * Current unlocked password
     * @var {Password}
     */
    public currentPassword: Password;

    public isPrivateKeyProfile: boolean;

    /**
     * Form fields
     * @var {Object}
     */
    public formItems = {
        type: '',
        privateKey: '',
        name: '',
    };

    /**
     * Whether backup reminder is shown
     */
    public isModalBackupReminderShown: boolean = false;

    /**
     * Type the ValidationObserver refs
     * @type {{
     *     observer: InstanceType<typeof ValidationObserver>
     *   }}
     */
    public $refs!: {
        observer: InstanceType<typeof ValidationObserver>;
    };

    public isCreatingAccount = false;

    public created() {
        this.accountService = new AccountService();
        this.paths = new DerivationService(this.currentProfile.networkType);
        this.formItems.type = this.isPrivateKeyAccount ? 'privatekey_account' : 'child_account';
    }

    /// region computed properties getter/setter
    public get hasAccountUnlockModal(): boolean {
        return this.isUnlockingAccount;
    }

    public set hasAccountUnlockModal(f: boolean) {
        this.isUnlockingAccount = f;
    }

    public get knownPaths(): string[] {
        if (!this.knownAccounts || !this.knownAccounts.length) {
            return [];
        }
        // filter accounts to only known account names
        return this.knownAccounts
            .filter((account) => ![AccountType.LEDGER_OPT_IN, AccountType.OPT_IN].includes(account.type))
            .map((a) => a.path)
            .filter((p) => p);
    }

    public get isLedger(): boolean {
        return this.currentAccount.type === AccountType.LEDGER || this.currentAccount.type === AccountType.LEDGER_OPT_IN;
    }

    public get isTrezor(): boolean {
        return this.currentAccount.type === AccountType.TREZOR;
    }

    public get isPrivateKeyAccount(): boolean {
        return this.isPrivateKeyProfile && !this.isLedger && !this.isTrezor;
    }

    /// end-region computed properties getter/setter

    /**
     * Error notification handler
     */
    private errorNotificationHandler(error: any) {
        if (error.message && error.message.includes('cannot open device with path')) {
            error.errorCode = 'ledger_connected_other_app';
        }
        if (error.errorCode) {
            switch (error.errorCode) {
                case 'NoDevice':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_no_device');
                    return;
                case 'ledger_not_supported_app':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_supported_app');
                    return;
                case 'ledger_connected_other_app':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_connected_other_app');
                    return;
                case 26628:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_device_locked');
                    return;
                case 27904:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_opened_app');
                    return;
                case 27264:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_using_xym_app');
                    return;
                case 27013:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_user_reject_request');
                    return;
            }
        } else if (error.name) {
            switch (error.name) {
                case 'TransportOpenUserCancelled':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_no_device_selected');
                    return;
            }
        }
        this.$store.dispatch('notification/ADD_ERROR', this.$t('add_account_failed', { reason: error.message || error }));
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
     * Close backup reminder modal
     * @return {void}
     */
    public async closeBackupReminderModal() {
        this.isModalBackupReminderShown = false;
        await this.createAcount();
        this.show = false;
    }

    /**
     * When account is unlocked, the sub account can be created
     */
    public async onAccountUnlocked(unlockResult: { password: Password }) {
        this.currentPassword = unlockResult.password;
        if (this.formItems.type === 'privatekey_account') {
            this.isModalBackupReminderShown = true;
        } else {
            await this.createAcount();
            this.show = false;
        }
    }

    private async createAcount() {
        this.isCreatingAccount = true;
        try {
            // - interpret form items
            const values = { ...this.formItems };
            const type = values.type && ['child_account', 'privatekey_account'].includes(values.type) ? values.type : 'child_account';

            // - create sub account (can be either derived or by private key)
            let subAccount: AccountModel;
            switch (type) {
                default:
                case 'child_account':
                    subAccount = this.deriveNextChildAccount(values.name);
                    break;

                case 'privatekey_account':
                    subAccount = this.accountService.getSubAccountByPrivateKey(
                        this.currentProfile,
                        this.currentPassword,
                        this.formItems.name,
                        this.formItems.privateKey,
                        this.currentProfile.networkType,
                    );
                    break;
            }

            // - return if subAccount is undefined
            if (!subAccount) {
                return;
            }

            // Verify that the import is repeated
            const hasAddressInfo = this.knownAccounts.find((w) => w.address === subAccount.address);
            if (hasAddressInfo !== undefined) {
                this.$store.dispatch('notification/ADD_ERROR', this.$t('error_private_key_already_exists', { name: hasAddressInfo.name }));
                return null;
            }

            // - remove password before GC
            this.currentPassword = null;

            // - use repositories for storage
            this.accountService.saveAccount(subAccount);

            // - update app state
            await this.$store.dispatch('profile/ADD_ACCOUNT', subAccount);
            await this.$store.dispatch('account/SET_CURRENT_ACCOUNT', subAccount);
            await this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', this.currentProfile.accounts);
            this.$store.dispatch('notification/ADD_SUCCESS', NotificationType.OPERATION_SUCCESS);
            this.$emit('submit', this.formItems);
        } catch (error) {
            this.$store.dispatch('notification/ADD_ERROR', 'An error happened, please try again.');
            return null;
        } finally {
            this.isCreatingAccount = false;
        }
    }

    /**
     * Use HD account derivation to get next child account
     * @param {string} child account name
     * @return {AccountModel}
     */
    private deriveNextChildAccount(childAccountName: string): AccountModel | null {
        try {
            if (this.isLedger) {
                this.importSubAccountFromLedger(childAccountName)
                    .then((res) => {
                        this.accountService.saveAccount(res);
                        // - update app state
                        this.$store.dispatch('profile/ADD_ACCOUNT', res);
                        this.$store.dispatch('account/SET_CURRENT_ACCOUNT', res);
                        this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', this.currentProfile.accounts);
                        this.$store.dispatch('notification/ADD_SUCCESS', NotificationType.OPERATION_SUCCESS);
                        this.$emit('submit', this.formItems);
                    })
                    .catch((error) => {
                        this.errorNotificationHandler(error);
                    });
            } else if (this.isTrezor) {
                this.importSubAccountFromTrezor(childAccountName)
                    .then((res) => {
                        this.accountService.saveAccount(res);
                        // - update app state
                        this.$store.dispatch('profile/ADD_ACCOUNT', res);
                        this.$store.dispatch('account/SET_CURRENT_ACCOUNT', res);
                        this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', this.currentProfile.accounts);
                        this.$store.dispatch('notification/ADD_SUCCESS', NotificationType.OPERATION_SUCCESS);
                        this.$emit('submit', this.formItems);
                    })
                    .catch((error) => {
                        this.trezorErrorNotificationHandler(error);
                    });
            } else {
                // - get next path
                const nextPath = this.paths.getNextAccountPath(this.knownPaths);

                this.$store.dispatch('diagnostic/ADD_DEBUG', 'Adding child account with derivation path: ' + nextPath);

                // - decrypt mnemonic
                const encSeed = this.currentProfile.seed;
                const passphrase = Crypto.decrypt(encSeed, this.currentPassword.value);
                const mnemonic = new MnemonicPassPhrase(passphrase);

                // create account by mnemonic
                return this.accountService.getChildAccountByPath(
                    this.currentProfile,
                    this.currentPassword,
                    mnemonic,
                    nextPath,
                    this.currentProfile.networkType,
                    childAccountName,
                );
            }
        } catch (error) {
            this.errorNotificationHandler(error);
            return null;
        }
    }
    /**
     * filter tags
     */
    public stripTagsAccountName() {
        this.formItems.name = FilterHelpers.stripFilter(this.formItems.name);
    }

    async importSubAccountFromLedger(childAccountName: string): Promise<AccountModel> | null {
        try {
            const ledgerService = new LedgerService(this.currentProfile.networkType);
            const isAppSupported = await ledgerService.isAppSupported();
            if (!isAppSupported) {
                throw { errorCode: 'ledger_not_supported_app' };
            }
            const accountService = new AccountService();
            const isOptinLedgerWallet = false;
            const nextPath = this.paths.getNextAccountPath(this.knownPaths);
            const publicKey = await accountService.getLedgerPublicKeyByPath(
                this.currentProfile.networkType,
                nextPath,
                false,
                isOptinLedgerWallet,
            );
            const address = PublicAccount.createFromPublicKey(publicKey, this.currentProfile.networkType).address;
            return {
                id: SimpleObjectStorage.generateIdentifier(),
                name: childAccountName,
                profileName: this.currentProfile.profileName,
                node: '',
                type: AccountType.fromDescriptor('Ledger'),
                address: address.plain(),
                publicKey: publicKey.toUpperCase(),
                encryptedPrivateKey: '',
                path: nextPath,
                isMultisig: false,
            };
        } catch (error) {
            this.$store.dispatch('SET_UI_DISABLED', {
                isDisabled: false,
                message: '',
            });
            throw error;
        }
    }

    async importSubAccountFromTrezor(childAccountName: string): Promise<AccountModel> | null {
        try {
            const accountService = new AccountService();
            const nextPath = this.paths.getNextAccountPath(this.knownPaths);
            const publicKey = await accountService.getTrezorPublicKeyByPath(this.currentProfile.networkType, nextPath, false);
            const address = PublicAccount.createFromPublicKey(publicKey, this.currentProfile.networkType).address;
            return {
                id: SimpleObjectStorage.generateIdentifier(),
                name: childAccountName,
                profileName: this.currentProfile.profileName,
                node: '',
                type: AccountType.fromDescriptor('Trezor'),
                address: address.plain(),
                publicKey: publicKey.toUpperCase(),
                encryptedPrivateKey: '',
                path: nextPath,
                isMultisig: false,
            };
        } catch (error) {
            this.$store.dispatch('SET_UI_DISABLED', {
                isDisabled: false,
                message: '',
            });
            throw error;
        }
    }

    public get isValidName(): boolean {
        if (!this.formItems.name) {
            return false;
        } else {
            const knownAccounts = Object.values(this.accountService.getKnownAccounts(this.currentProfile.accounts));
            return undefined === knownAccounts.find((w) => this.formItems.name.toUpperCase() === w.name.toUpperCase());
        }
    }
}
