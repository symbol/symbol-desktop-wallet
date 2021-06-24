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
import { NetworkType, Password } from 'symbol-sdk';
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
import { AccountService } from '@/services/AccountService';
import { networkConfig } from '@/config';

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
    isTrezor = false;

    created() {
        this.profileService = new ProfileService();
        this.formItems.networkType = NetworkType.MAIN_NET;
        const { isLedger, isTrezor } = this.$route.meta;
        this.isLedger = isLedger;
        this.isTrezor = isTrezor;
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
        this.connect(this.formItems.networkType);
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
                case 26368:
                case 27904:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_opened_app');
                    return;
                case 25871:
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
        this.$store.dispatch('notification/ADD_ERROR', this.$t('create_profile_failed', { reason: error.message || error }));
    }

    /**
     * Persist created account and redirect to next step
     * @return {void}
     */
    private persistAccountAndContinue() {
        // -  password stored as hash (never plain.)
        const passwordHash = ProfileService.getPasswordHash(new Password(this.formItems.password));
        const genHash = networkConfig[this.formItems.networkType].networkConfigurationDefaults.generationHash || this.generationHash;
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
        if (this.isLedger) {
            // try for make sure device was connected for next step require it
            const accountService = new AccountService();
            accountService
                .getLedgerAccounts(this.formItems.networkType, 1)
                .then(() => {
                    // flush and continue
                    this.$router.push({ name: this.nextPage });
                })
                .catch((error) => {
                    this.errorNotificationHandler(error);
                });
        } else {
            // flush and continue
            this.$router.push({ name: this.nextPage });
        }
    }

    /**
     * filter tags
     */
    public stripTagsProfile() {
        this.formItems.profileName = FilterHelpers.stripFilter(this.formItems.profileName);
        this.formItems.hint = FilterHelpers.stripFilter(this.formItems.hint);
    }
}
