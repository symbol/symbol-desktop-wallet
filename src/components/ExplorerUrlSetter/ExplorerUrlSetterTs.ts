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
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
// child components
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        ValidationProvider,
        ValidationObserver,
        ErrorTooltip,
        FormRow,
    },
    computed: {
        ...mapGetters({
            explorerUrl: 'app/explorerUrl',
        }),
    },
})
export class ExplorerUrlSetterTs extends ValidatedComponent {
    @Prop({
        default: '',
    })
    value: string;

    @Prop({
        default: true,
    })
    autoSubmit: boolean;

    /**
     * Explorer URL
     * @var {string}
     */
    public explorerUrl: string;

    /**
     * Default explorer link list
     * @readonly
     * @type {string[]}
     */
    get defaultExplorerLinkList(): string[] {
        return [this.networkModel.explorerUrl].filter((f) => f);
    }

    /**
     * Currently explorer url
     */
    get chosenExplorerUrl() {
        return this.value && this.value.length ? this.value : this.explorerUrl;
    }

    /**
     * Sets the new language
     */
    set chosenExplorerUrl(url: string) {
        if (this.autoSubmit) {
            this.$store.dispatch('app/SET_EXPLORER_URL', url);
        }

        this.$emit('input', url);
    }
}
