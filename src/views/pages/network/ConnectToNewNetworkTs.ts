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
import FormLabel from '@/components/FormLabel/FormLabel.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { NotificationType } from '@/core/utils/NotificationType';
import { URLHelpers } from '@/core/utils/URLHelpers';
import app from '@/main';
// @ts-ignore
import { officialIcons } from '@/views/resources/Images';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import Component from 'vue-class-component';

@Component({
    components: {
        ValidationObserver,
        ValidationProvider,
        ErrorTooltip,
        FormWrapper,
        FormRow,
        FormLabel,
    },
})
export default class ConnectToNewNetworkTs extends ValidatedComponent {
    /**
     * Form fields
     * @var {Object}
     */
    public formItems = {
        name: '',
        nodeUrl: '',
        explorerUrl: '',
        faucetUrl: '',
    };
    public submitting = false;
    public completed = false;
    public result = {};

    public async onSubmit() {
        this.submitting = true;
        try {
            const nodeUrl = URLHelpers.getNodeUrl(this.formItems.nodeUrl);
            this.$store.dispatch(
                'app/SET_LOADING_OVERLAY',
                {
                    show: true,
                    message: `${app.$t('info_connecting_peer', {
                        peerUrl: nodeUrl,
                    })}`,
                    disableCloseButton: true,
                },
                { root: true },
            );
            this.result = await this.$store.dispatch('network/CONNECT_TO_NEW_NETWORK', { ...this.formItems, nodeUrl });
            await this.$store.dispatch('notification/ADD_SUCCESS', this.$t(NotificationType.NODE_CONNECTION_SUCCEEDED));
            console.log(this.result);
            this.completed = true;
            this.formItems = {
                name: '',
                nodeUrl: '',
                explorerUrl: '',
                faucetUrl: '',
            };
        } catch (e) {
            this.$store.dispatch('notification/ADD_ERROR', e.message);
        } finally {
            this.$store.dispatch(
                'app/SET_LOADING_OVERLAY',
                {
                    show: false,
                    disableCloseButton: true,
                },
                { root: true },
            );
            this.submitting = false;
        }
    }
    get loginIcon() {
        return officialIcons.customerAlice;
    }

    public async onLoginClick() {
        await this.$store.dispatch('profile/LOG_OUT');
        this.$router.push('/login');
    }
    public async osCreateProfileClick() {
        await this.$store.dispatch('profile/LOG_OUT');
        this.$router.push('/profiles/create');
    }

    public parentRouteName = 'ConnectToNewNetwork';
}
