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
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { SettingsModel } from '@/core/database/entities/SettingsModel';
import { NotificationType } from '@/core/utils/NotificationType';
// internal dependencies
import { $eventBus } from '@/events';
import { AccountService } from '@/services/AccountService';
import { ProfileService } from '@/services/ProfileService';
// configuration
import { SettingService } from '@/services/SettingService';
import { officialIcons } from '@/views/resources/Images';
import _ from 'lodash';
import { Password } from 'symbol-sdk';
// child components
// @ts-ignore
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component } from 'vue-property-decorator';
import VideoBackground from 'vue-responsive-video-background-player';
import { mapGetters } from 'vuex';

@Component({
    computed: {
        ...mapGetters({
            currentProfile: 'profile/currentProfile',
            isAuthenticated: 'profile/isAuthenticated',
            generationHash: 'network/generationHash',
            allNetworkModels: 'network/allNetworkModels',
        }),
    },
    components: {
        ErrorTooltip,
        ValidationProvider,
        ValidationObserver,
        LanguageSelector,
        VideoBackground,
    },
})
export default class LoginPageTs extends ValidatedComponent {
    /**
     * Display the application version. This is injected in the app when built.
     */
    public packageVersion = process.env.PACKAGE_VERSION || '0';

    public allNetworkModels: Record<string, NetworkModel>;

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
    }[] = [];

    private performingLogin = false;

    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public currentProfile: ProfileModel;

    private generationHash: string;

    /**
     * Profiles repository
     * @var {ProfileService}
     */
    public profileService = new ProfileService();

    public accountService = new AccountService();

    /**
     * Form items
     */
    public formItems: any = {
        currentProfileName: '',
        password: '',
        hasHint: false,
    };

    /**
     * All known profiles names
     */
    protected get profileNames(): string[] {
        return this.profiles.map((p) => p.profileName);
    }
    /**
     * Hook called when the page is mounted
     * @return {void}
     */
    public created() {
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
    }

    /**
     * Getter for network type label
     * @param {generationHash} string
     * @return {string}
     */
    public getGenerationHashLabel(generationHash: string): string {
        return this.allNetworkModels[generationHash]?.name || 'Loading...';
    }

    /**
     * Get profile password hint
     * XXX should be encrypted with accessSalt.
     * @return {string}
     */
    public getPasswordHint(): string {
        const profileName = this.formItems.currentProfileName;
        const profile = this.profileService.getProfileByName(profileName);
        return (profile && profile.hint) || '';
    }

    /**
     * Submit action, validates form and logs in user if valid
     * @return {void}
     */
    public async submit() {
        if (this.performingLogin) {
            return;
        }

        if (!this.formItems.currentProfileName.length) {
            return this.$store.dispatch('notification/ADD_ERROR', NotificationType.PROFILE_NAME_INPUT_ERROR);
        }

        if (!this.formItems.password.length || this.formItems.password.length < 8) {
            return this.$store.dispatch('notification/ADD_ERROR', NotificationType.WRONG_PASSWORD_ERROR);
        }

        this.performingLogin = true;
        // now compare password hashes
        return this.processLogin().finally(() => (this.performingLogin = false));
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

    /**
     * Process login request.
     * @return {void}
     */
    private async processLogin() {
        try {
            const currentProfileName = this.formItems.currentProfileName;
            const profile = this.profileService.getProfileByName(currentProfileName);
            const settingService = new SettingService();

            // if profile doesn't exist, authentication is not valid
            if (!profile) {
                return this.$store.dispatch('notification/ADD_ERROR', 'Invalid login attempt');
            }

            // profile exists, fetch data
            const settings: SettingsModel = settingService.getProfileSettings(
                currentProfileName,
                this.allNetworkModels[profile.generationHash],
            );

            const knownAccounts: AccountModel[] = this.accountService.getKnownAccounts(profile.accounts);
            if (knownAccounts.length == 0) {
                throw new Error('knownAccounts is empty');
            }

            // use service to generate password hash
            const passwordHash = ProfileService.getPasswordHash(new Password(this.formItems.password));

            // read profile's password hash and compare
            if (profile.password !== passwordHash) {
                return this.$store.dispatch('notification/ADD_ERROR', NotificationType.WRONG_PASSWORD_ERROR);
            }

            // if profile setup was not finalized, redirect
            if (!profile.seed && profile.accounts.length == 0 && !this.isLedgerProfile()) {
                this.$store.dispatch('profile/SET_CURRENT_PROFILE', profile);
                this.$store.dispatch('temporary/SET_PASSWORD', this.formItems.password);
                this.$store.dispatch(
                    'diagnostic/ADD_WARNING',
                    'Profile has not setup mnemonic pass phrase, redirecting: ' + currentProfileName,
                );
                return this.$router.push({
                    name: 'profiles.createProfile.generateMnemonic',
                });
            }

            // read default account from settings
            const defaultAccountId = settings.defaultAccount ? settings.defaultAccount : knownAccounts[0].id;
            if (!defaultAccountId) {
                throw new Error('defaultAccountId could not be resolved');
            }
            const defaultAccount = knownAccounts.find((w) => w.id == defaultAccountId);
            if (!defaultAccount) {
                throw new Error(`defaultAccount could not be resolved from id ${defaultAccountId}`);
            }

            // LOGIN SUCCESS: update app state
            await this.$store.dispatch('profile/SET_CURRENT_PROFILE', profile);
            await this.$store.dispatch('network/CONNECT', {});
            this.$store.dispatch('account/SET_KNOWN_ACCOUNTS', profile.accounts);
            await this.$store.dispatch('account/SET_CURRENT_ACCOUNT', defaultAccount);
            this.$store.dispatch('diagnostic/ADD_DEBUG', 'Profile login successful with currentProfileName: ' + currentProfileName);
            $eventBus.$emit('onLogin', currentProfileName);
            await this.$store.dispatch('network/REST_NETWORK_RENTAL_FEES');
            return this.$router.push({ name: 'dashboard' });
        } catch (e) {
            console.log(e);
            console.log('Unknown error trying to login', e.message || `${e}`);
            return this.$store.dispatch('notification/ADD_ERROR', `Unknown error trying to login: ${JSON.stringify(e)}`);
        }
    }

    public get offlineIcon() {
        return officialIcons.sent;
    }
}
