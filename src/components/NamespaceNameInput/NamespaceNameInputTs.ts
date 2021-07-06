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
// external dependencies
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { NamespaceRegistrationType } from 'symbol-sdk';
// child components
import { ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';

@Component({
    components: {
        ValidationProvider,
        ErrorTooltip,
        FormRow,
    },
})
export class NamespaceNameInputTs extends ValidatedComponent {
    @Prop({ default: null }) value: string;

    @Prop({ default: NamespaceRegistrationType.RootNamespace })
    namespaceRegistrationType: NamespaceRegistrationType;

    @Prop({ default: true }) isNeedAutoFocus: boolean;

    /// region computed properties getter/setter
    public get chosenValue(): string {
        return this.value;
    }

    public set chosenValue(input: string) {
        this.$emit('input', input);
    }

    /**
     * Validation rule
     * @readonly
     * @type {Record<string, any>}
     */
    public get validationRule(): Record<string, any> {
        return this.namespaceRegistrationType === NamespaceRegistrationType.RootNamespace
            ? this.validationRules.namespaceName
            : this.validationRules.subNamespaceName;
    }
    /// end-region computed properties getter/setter
}
