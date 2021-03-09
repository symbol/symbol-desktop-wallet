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
import { NetworkType, Password, PublicAccount } from 'symbol-sdk';
// internal dependencies
import { ValidationRuleset } from '@/core/validation/ValidationRuleset';
import { ProfileService } from '@/services/ProfileService';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
// child components
import { ValidationObserver, ValidationProvider } from 'vee-validate';
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
import { NetworkTypeHelper } from '@/core/utils/NetworkTypeHelper';
import { FilterHelpers } from '@/core/utils/FilterHelpers';
import { SimpleObjectStorage } from '@/core/database/backends/SimpleObjectStorage';
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { AccountService } from '@/services/AccountService';
import { LedgerService } from '@/services/LedgerService';
import { networkConfig } from '@/config';
import { Network } from 'symbol-hd-wallets';

/// end-region custom types

@Component({
    components: {
        ValidationObserver,
        ValidationProvider,
        ErrorTooltip,
        FormWrapper,
        FormRow,
    },
    computed: {
        ...mapGetters({
            generationHash: 'network/generationHash',
            currentProfile: 'profile/currentProfile',
            isConnected: 'network/isConnected',
        }),
    },
})
export class FormProfileCreationTs extends Vue {
    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public currentProfile: ProfileModel;
    private isConnected: boolean;
    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public profileService: ProfileService;

    isLedger = false;

    created() {
        this.profileService = new ProfileService();
        this.formItems.networkType = NetworkType.MAIN_NET;
        const { isLedger } = this.$route.meta;
        this.isLedger = isLedger;
    }

    /**
     * Currently active network type
     * @see {Store.Network}
     * @var {string}
     */
    public generationHash: string;

    /**
     * Ledger Accounts repository
     * @var {ProfileService}
     */
    public ledgerAccountService = new AccountService();

    /**
     * Validation rules
     * @var {ValidationRuleset}
     */
    public validationRules = ValidationRuleset;

    /**
     * Form fields
     * @var {Object}
     */
    public formItems = {
        profileName: '',
        password: '',
        passwordAgain: '',
        hint: '',
        networkType: this.$store.getters['network/networkType'],
    };

    /**
     * Network types
     * @var {NetworkNodeEntry[]}
     */
    public networkTypeList = NetworkTypeHelper.networkTypeList;

    /**
     * Type the ValidationObserver refs
     * @type {{
     *     observer: InstanceType<typeof ValidationObserver>
     *   }}
     */
    public $refs!: {
        observer: InstanceType<typeof ValidationObserver>;
    };

    /// region computed properties getter/setter
    get nextPage() {
        if (!this.isConnected) {
            this.connect(this.formItems.networkType);
        }
        return this.$route.meta.nextPage;
    }

    /// end-region computed properties getter/setter

    public connect(newNetworkType) {
        this.$store.dispatch('network/CONNECT', { networkType: newNetworkType });
    }

    /**
     * Submit action, validates form and creates account in storage
     * @return {void}
     */
    public submit() {
        // @VEE
        this.persistAccountAndContinue();
        this.resetValidations();
    }

    /**
     *  resets form validation
     */

    public resetValidations(): void {
        this.$refs && this.$refs.observer && this.$refs.observer.reset();
    }

    /**
     * Persist created account and redirect to next step
     * @return {void}
     */
    private persistAccountAndContinue() {
        // -  password stored as hash (never plain.)
        const passwordHash = ProfileService.getPasswordHash(new Password(this.formItems.password));
        const genHash = this.generationHash || networkConfig[this.formItems.networkType].networkConfigurationDefaults.generationHash;
        const profile: ProfileModel = {
            profileName: this.formItems.profileName,
            accounts: [],
            seed: '',
            password: passwordHash,
            hint: this.formItems.hint,
            networkType: this.formItems.networkType,
            generationHash: genHash,
            termsAndConditionsApproved: false,
            selectedNodeUrlToConnect: '',
        };
        // use repository for storage
        this.profileService.saveProfile(profile);

        // execute store actions
        this.$store.dispatch('profile/SET_CURRENT_PROFILE', profile);
        this.$store.dispatch('temporary/SET_PASSWORD', this.formItems.password);

        // flush and continue
        this.$router.push({ name: this.nextPage });
    }

    /**
     * filter tags
     */
    public stripTagsProfile() {
        this.formItems.profileName = FilterHelpers.stripFilter(this.formItems.profileName);
        this.formItems.hint = FilterHelpers.stripFilter(this.formItems.hint);
    }

    /**
     * Get a account instance of Ledger from default path
     * @param {number} networkType
     * @return {AccountModel}
     */
    private async importDefaultLedgerAccount(networkType: number, curve: Network = Network.SYMBOL): Promise<AccountModel> {
        const defaultPath = AccountService.getAccountPathByNetworkType(networkType);
        const ledgerService = new LedgerService(networkType);
        const isAppSupported = await ledgerService.isAppSupported();
        if (!isAppSupported) {
            throw { errorCode: 'ledger_not_supported_app' };
        }
        const profileName = this.formItems.profileName;
        const accountService = new AccountService();
        const isOptinSymbolWallet = curve === Network.BITCOIN;
        const accountResult = await accountService.getLedgerPublicKeyByPath(networkType, defaultPath, false, isOptinSymbolWallet);
        const publicKey = accountResult;
        const address = PublicAccount.createFromPublicKey(publicKey, networkType).address;

        // add account to list
        const accName = this.currentProfile.profileName;

        return {
            id: SimpleObjectStorage.generateIdentifier(),
            name: accName,
            profileName: profileName,
            node: '',
            type: isOptinSymbolWallet ? AccountType.LEDGER_OPT_IN : AccountType.LEDGER,
            address: address.plain(),
            publicKey: publicKey.toUpperCase(),
            encryptedPrivateKey: '',
            path: defaultPath,
            isMultisig: false,
        };
    }
}
