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
import { Account, NetworkType, Password, Crypto, Address } from 'symbol-sdk';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
// internal dependencies
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { ValidationRuleset } from '@/core/validation/ValidationRuleset';
// child components
import { ValidationProvider } from 'vee-validate';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
import { ProfileService } from '@/services/ProfileService';

@Component({
    components: {
        ValidationProvider,
        FormWrapper,
        FormRow,
        ErrorTooltip,
    },
    computed: {
        ...mapGetters({
            networkType: 'network/networkType',
            currentAccount: 'account/currentAccount',
            currentPass: 'temporary/password',
        }),
    },
})
export class FormProfileUnlockTs extends Vue {
    /**
     * Current network type
     * @var {NetworkType}
     */
    public networkType: NetworkType;

    /**
     * Currently active account
     * @var {AccountModel}
     */
    public currentAccount: AccountModel;

    /**
     * Validation rules
     * @var {ValidationRuleset}
     */
    public validationRules = ValidationRuleset;

    /**
     * Form items
     * @var {any}
     */
    public formItems = {
        password: '',
    };

    /**
     * Text shown in the confirmation button
     * @type {string}
     */
    @Prop({ default: 'confirm' }) buttonText: string;

    /**
     * Whether to hide submit button
     */
    @Prop({ default: false }) hideSubmit: boolean;

    /**
     * Whether to focus password input when mounted
     */
    @Prop({ default: true }) focus: boolean;

    /**
     * Whether to show a loading animation on confirm button and disable input
     */
    @Prop({ default: false }) isLoading: boolean;

    @Prop({ default: false }) disabled: boolean;
    /// region computed properties getter/setter
    /// end-region computed properties getter/setter

    public mounted(): void {
        if (this.focus) {
            this.$nextTick().then(() => (this.$refs['passwordInput'] as any).focus());
        }
    }

    /**
     * Attempt decryption of private key to unlock
     * .
     * @return {void}
     */

    public get isLedger(): boolean {
        return this.currentAccount.type === AccountType.LEDGER || this.currentAccount.type === AccountType.LEDGER_OPT_IN;
    }

    public get isTrezor(): boolean {
        return this.currentAccount.type === AccountType.TREZOR;
    }

    public accountService = new ProfileService();

    public processVerification() {
        try {
            const password = new Password(this.formItems.password);
            if (this.isLedger || this.isTrezor) {
                const passwordHash = ProfileService.getPasswordHash(password);
                // read account's password hash and compare
                const currentProfile = this.accountService.getProfileByName(this.currentAccount.profileName);
                const accountPass = currentProfile.password;

                if (accountPass == passwordHash) {
                    const publicKey = this.currentAccount.publicKey;
                    const address = Address.createFromPublicKey(publicKey, this.networkType);
                    return this.$emit('success', { account: { ...this.currentAccount, address }, password });
                }
            } else {
                const privateKey: string = Crypto.decrypt(this.currentAccount.encryptedPrivateKey, password.value);

                if (privateKey.length === 64) {
                    const unlockedAccount = Account.createFromPrivateKey(privateKey, this.networkType);
                    return this.$emit('success', { account: unlockedAccount, password });
                }
            }
            return this.$emit('error', this.$t('error_invalid_password'));
        } catch (e) {
            this.$emit('error', e);
        }
    }
}
