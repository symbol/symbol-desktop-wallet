/*
 * Copyright 2020-present NEM (https://nem.io)
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
// @ts-ignore
import AccountSignerSelector from '@/components/AccountSignerSelector/AccountSignerSelector.vue';
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
// @ts-ignore
import HardwareConfirmationButton from '@/components/HardwareConfirmationButton/HardwareConfirmationButton.vue';
// @ts-ignore
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue';
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue';
// @ts-ignore
import MessageInput from '@/components/MessageInput/MessageInput.vue';
// @ts-ignore
import RecipientInput from '@/components/RecipientInput/RecipientInput.vue';
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue';
// internal dependencies
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { SettingsModel } from '@/core/database/entities/SettingsModel';
import { AccountService } from '@/services/AccountService';
import { LedgerService } from '@/services/LedgerService';
import { ProfileService } from '@/services/ProfileService';
import { SettingService } from '@/services/SettingService';
import { AccountTransactionSigner, TransactionSigner } from '@/services/TransactionAnnouncerService';
// @ts-ignore
import FormProfileUnlock from '@/views/forms/FormProfileUnlock/FormProfileUnlock.vue';
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase';
// @ts-ignore
import FormTransferTransaction from '@/views/forms/FormTransferTransaction/FormTransferTransaction.vue';
import _ from 'lodash';
import { Account, Address, AggregateTransaction, CosignatureTransaction } from 'symbol-sdk';
// child components
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        ErrorTooltip,
        ValidationProvider,
        ValidationObserver,
        LanguageSelector,
        SignerSelector,
        FormWrapper,
        MessageInput,
        RecipientInput,
        FormRow,
        MaxFeeAndSubmit,
        FormTransferTransaction,
        HardwareConfirmationButton,
        FormProfileUnlock,
        AccountSignerSelector,
    },
    computed: {
        ...mapGetters({
            currentProfile: 'profile/currentProfile',
            isAuthenticated: 'profile/isAuthenticated',
            allNetworkModels: 'network/allNetworkModels',
        }),
    },
})
export class FormOfflineCosignTransactionTs extends FormTransactionBase {
    @Prop()
    public transaction: AggregateTransaction;

    /**
     * All known profiles
     */
    private profiles: ProfileModel[];

    /**
     * Profiles indexed by network type
     */
    private profilesClassifiedByGenerationHash: {
        generationHash: string;
        profiles: ProfileModel[];
    }[];

    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public currentProfile: ProfileModel;

    /**
     * Profiles repository
     * @var {ProfileService}
     */
    public profileService = new ProfileService();

    public accountService = new AccountService();

    public allNetworkModels: Record<string, NetworkModel>;

    /**
     * Form items
     */
    public formItems: any = {
        currentProfileName: '',
    };

    public loaded: boolean = false;

    /**
     * Hook called when the page is mounted
     * @return {void}
     */
    public async created() {
        // filter out invalid profiles
        this.profiles = this.profileService.getProfiles().filter((p) => p.accounts.length > 0);

        if (!this.profiles.length) {
            return;
        }

        const profilesGroupedByGenerationHash = _.groupBy(this.profiles, (p) => p.generationHash);
        this.profilesClassifiedByGenerationHash = Object.values(profilesGroupedByGenerationHash).map((profiles) => ({
            generationHash: profiles[0].generationHash,
            profiles: profiles,
        }));

        // accounts available, iterate to first profile
        this.formItems.currentProfileName = this.profiles[0].profileName;
        this.onProfileNameChange();
    }

    /**
     * Getter for network type label
     * @param generationHash
     * @return {string}
     */
    public getGenerationHashLabel(generationHash: string): string {
        return this.allNetworkModels[generationHash]?.name || 'Loading...';
    }

    public async onProfileNameChange() {
        this.loaded = false;
        const currentProfileName = this.formItems.currentProfileName;
        const profile = this.profileService.getProfileByName(currentProfileName);
        if (!profile) {
            return;
        }

        const settingService = new SettingService();

        const settings: SettingsModel = settingService.getProfileSettings(currentProfileName, this.networkModel);
        const knownAccounts: AccountModel[] = this.accountService.getKnownAccounts(profile.accounts);

        if (knownAccounts.length == 0) {
            throw new Error('knownAccounts is empty');
        }

        // knownAccounts = knownAccounts.filter(account => this.transaction.signedByAccount(PublicAccount.createFromPublicKey(account.publicKey, profile.networkType)));

        const defaultAccountId = settings.defaultAccount ? settings.defaultAccount : knownAccounts[0].id;
        if (!defaultAccountId) {
            throw new Error('defaultAccountId could not be resolved');
        }
        const defaultAccount = knownAccounts.find((w) => w.id == defaultAccountId);
        if (!defaultAccount) {
            throw new Error(`defaultAccount could not be resolved from id ${defaultAccountId}`);
        }

        await this.$store.dispatch('profile/SET_CURRENT_PROFILE', profile);
        await this.$store.dispatch('network/CONNECT', { isOffline: true });
        this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', profile.accounts);
        await this.$store.dispatch('account/SET_CURRENT_ACCOUNT', defaultAccount);
        this.$store.dispatch('diagnostic/ADD_DEBUG', 'Profile login successful with currentProfileName: ' + currentProfileName);
        await this.$store.dispatch('network/REST_NETWORK_RENTAL_FEES');
        const signers = knownAccounts.map((account) => ({
            address: Address.createFromRawAddress(account.address),
            label: account.name,
            multisig: account.isMultisig,
            requiredCosignatures: 0,
        }));
        this.$store.commit('account/signers', signers);

        this.loaded = true;
    }

    isLedgerProfile(): boolean {
        const profileService = new ProfileService();
        const currentProfileName = this.formItems.currentProfileName;
        const profile = profileService.getProfileByName(currentProfileName);
        const existingLedgerAccounts = profile.accounts.find((w) => {
            if (this.accountService.getAccount(w).type == AccountType.fromDescriptor('Ledger')) {
                return w;
            }
        });
        if (existingLedgerAccounts !== ('' || undefined)) {
            return true;
        }
        return false;
    }

    public get isUsingHardwareWallet(): boolean {
        // XXX should use "stagedTransaction.signer" to identify account
        return (
            this.currentAccount &&
            (this.currentAccount.type === AccountType.TREZOR ||
                this.currentAccount.type === AccountType.LEDGER ||
                this.currentAccount.type === AccountType.LEDGER_OPT_IN)
        );
    }

    public onError(error: string) {
        this.$emit('error', error);
    }

    public onAccountUnlocked({ account }: { account: Account }) {
        // - log about unlock success
        this.$store.dispatch('diagnostic/ADD_INFO', 'Account ' + account.address.plain() + ' unlocked successfully.');
        return this.onSigner(new AccountTransactionSigner(account));
    }

    public async onSigner(transactionSigner: TransactionSigner) {
        // - sign cosignature transaction
        if (this.currentAccount.type === AccountType.LEDGER || this.currentAccount.type === AccountType.LEDGER_OPT_IN) {
            try {
                const ledgerService = new LedgerService(this.currentProfile.networkType);
                const isAppSupported = await ledgerService.isAppSupported();
                if (!isAppSupported) {
                    throw { errorCode: 'ledger_not_supported_app' };
                }
                const currentPath = this.currentAccount.path;
                const isOptinLedgerWallet = this.currentAccount.type === AccountType.LEDGER_OPT_IN;
                const networkType = this.currentProfile.networkType;
                const accountService = new AccountService();
                this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
                const signerPublicKey = await accountService.getLedgerPublicKeyByPath(networkType, currentPath, true, isOptinLedgerWallet);
                if (signerPublicKey === this.currentAccount.publicKey.toLowerCase()) {
                    const signature = await ledgerService.signCosignatureTransaction(
                        currentPath,
                        this.transaction,
                        signerPublicKey,
                        isOptinLedgerWallet,
                    );
                    this.$emit('signedCosignature', signature);
                } else {
                    throw { errorCode: 'ledger_not_correct_account' };
                }
            } catch (error) {
                this.errorNotificationHandler(error);
            }
        } else {
            const cosignature = CosignatureTransaction.create(this.transaction);
            const signCosignatureTransaction = await transactionSigner.signCosignatureTransaction(cosignature).toPromise();
            this.$emit('signedCosignature', signCosignatureTransaction);
        }
    }

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
                case 'ledger_not_correct_account':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_correct_account');
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
                case 26368:
                    this.$store.dispatch('notification/ADD_ERROR', 'transaction_too_long');
                    return;
            }
        } else if (error.name) {
            switch (error.name) {
                case 'TransportOpenUserCancelled':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_no_device_selected');
                    return;
            }
        }
        this.$store.dispatch('notification/ADD_ERROR', this.$t('sign_transaction_failed', { reason: error.message || error }));
    }

    protected resetForm() {
        return;
    }
}
