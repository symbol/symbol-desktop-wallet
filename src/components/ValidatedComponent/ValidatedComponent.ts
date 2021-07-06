/*
 * Copyright 2020 NEM Foundation (https://nem.io)
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

import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { createValidationRuleSet } from '@/core/validation/ValidationRuleset';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: {
        ...mapGetters({
            networkConfiguration: 'network/networkConfiguration',
            networkModel: 'network/networkModel',
        }),
    },
})
export class ValidatedComponent extends Vue {
    /**
     * The current network model.
     */
    public networkModel: NetworkModel;
    /**
     * Current network configuration.
     */
    public networkConfiguration: NetworkConfigurationModel;

    /**
     * Validation rules
     * @var {ValidationRuleset}
     */
    public validationRules;

    /**
     * Hook called when the component is created
     * @return {void}
     */
    public created() {
        this.validationRules = createValidationRuleSet(this.networkConfiguration);
    }
}
