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
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { MosaicModel } from '@/core/database/entities/MosaicModel';
// internal dependencies
import { createValidationRuleSet } from '@/core/validation/ValidationRuleset';
// child components
import { ValidationProvider } from 'vee-validate';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        ValidationProvider,
        ErrorTooltip,
    },
    computed: {
        ...mapGetters({
            mosaics: 'mosaic/mosaics',
        }),
    },
})
export class AmountInputTs extends ValidatedComponent {
    @Prop({ default: '' }) value: string;
    @Prop({ default: '' }) mosaicHex: string;

    /**
     * Available mosaics models
     */
    public mosaics: MosaicModel[];

    @Watch('mosaicHex')
    created() {
        // update validation rule to reflect correct mosaic divisibility
        const chosenMosaic = this.mosaics.find((mosaic) => this.mosaicHex === mosaic.mosaicIdHex);
        // set validation rules for this field
        this.validationRules = createValidationRuleSet({
            ...this.networkConfiguration,
            maxMosaicDivisibility: chosenMosaic ? chosenMosaic.divisibility : this.networkConfiguration.maxMosaicDivisibility,
        });
    }

    /// region computed properties getter/setter
    public get relativeValue(): string {
        return this.value;
    }

    public set relativeValue(amount: string) {
        this.$emit('input', amount);
    }
    /// end-region computed properties getter/setter
}
