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
import FormRow from '@/components/FormRow/FormRow.vue';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
// @ts-ignore
import { PrivateKeyValidator } from '@/core/validation/validators';
import { Account } from 'symbol-sdk';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
@Component({
    components: {
        ErrorTooltip,
        ValidationObserver,
        ValidationProvider,
        FormRow,
        FormWrapper,
    },
    computed: {
        ...mapGetters({
            currentProfile: 'profile/currentProfile',
        }),
    },
})
export default class ModalImportPrivateKeyTs extends ValidatedComponent {
    @Prop({
        default: false,
    })
    visible: boolean;

    @Prop({
        default: '',
    })
    title: string;
    /**
     * Validation rules
     * @var {ValidationRuleset}
     */
    private privateKey: string = '';
    private type: string = '';
    private currentProfile: ProfileModel;
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

    public get isValidPrivateKey(): boolean {
        if (PrivateKeyValidator.validate(this.privateKey, this.currentProfile.networkType) || this.type === 'random_key') {
            return true;
        }
        return false;
    }

    /**
     * Hook called when child component FormSubAccountCreation emits
     * the 'submit' event.
     */
    public onSubmit() {
        let account = {};
        if (!!this.privateKey.length) {
            account = Account.createFromPrivateKey(this.privateKey, this.currentProfile.networkType);
        }
        if (this.title == 'create_remote_public_key') {
            if (this.type === 'own_key') {
                this.$emit('submit', { account: account, type: 'account' });
            } else {
                this.$emit('submit', { account: undefined, type: 'account' });
            }
        } else {
            if (this.type === 'own_key') {
                this.$emit('submit', { account: account, type: 'vrf' });
            } else {
                this.$emit('submit', { account: undefined, type: 'vrf' });
            }
        }
        this.$emit('confirmed', true);
    }
    get showPrivateKeyInput() {
        return this.type === 'own_key';
    }
}
