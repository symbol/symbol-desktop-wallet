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
// configuration
// child components
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import RentalFee from '@/components/RentalFees/RentalFee.vue';
import { NamespaceModel } from '@/core/database/entities/NamespaceModel';
import { NamespaceService } from '@/services/NamespaceService';
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue';
import { NamespaceId } from 'symbol-sdk';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
// internal dependencies
import { FormNamespaceRegistrationTransactionTs } from '../FormNamespaceRegistrationTransaction/FormNamespaceRegistrationTransactionTs';

@Component({
    components: { ErrorTooltip, ModalTransactionConfirmation, RentalFee },
    computed: {
        ...mapGetters({
            namespaces: 'namespace/ownedNamespaces',
        }),
    },
})
export class FormExtendNamespaceDurationTransactionTs extends FormNamespaceRegistrationTransactionTs {
    @Prop({ default: null, required: true }) namespaceId: NamespaceId;

    private namespaces: NamespaceModel[];

    /**
     * Current namespace info
     * @readonly
     * @private
     * @type {NamespaceInfo}
     */
    protected get currentNamespaceEndHeight(): number {
        const currentNamespace = this.namespaces.find((model) => model.namespaceIdHex === this.namespaceId.toHex());
        return (currentNamespace && currentNamespace.endHeight) || 0;
    }

    /**
     * View of the namespace current expiration information
     * @readonly
     * @type {string}
     */
    protected get currentExpirationInfoView(): {
        expired: boolean;
        expiration: string;
    } {
        return this.getExpirationInfoFromEndHeight(this.currentNamespaceEndHeight);
    }

    /**
     * Namespace new expiration height
     * @readonly
     * @protected
     * @type {number}
     */
    protected get newEndHeight(): number {
        const currentExpirationHeight = this.currentNamespaceEndHeight;
        const newExpiration = Number(this.formItems.duration) + currentExpirationHeight;
        return isNaN(newExpiration) ? currentExpirationHeight : newExpiration;
    }

    /**
     * New namespace duration
     * @readonly
     * @protected
     * @type {number}
     */
    protected get newDuration(): number {
        return (
            this.newEndHeight -
            this.currentHeight -
            Math.floor(this.networkConfiguration.namespaceGracePeriodDuration / this.networkConfiguration.blockGenerationTargetTime)
        );
    }

    /**
     * View of the new current expiration information
     * @readonly
     * @type {string}
     */
    protected get newExpirationInfoView(): string {
        return this.getExpirationInfoFromEndHeight(this.newEndHeight).expiration;
    }

    /**
     * Returns a view of a namespace expiration info
     * @private
     * @param {NamespaceInfo} mosaicInfo
     * @returns {string}
     */
    private getExpirationInfoFromEndHeight(endHeight: number): { expiration: string; expired: boolean } {
        return NamespaceService.getExpiration(this.networkConfiguration, this.currentHeight, endHeight);
    }

    async mounted() {
        this.$store.dispatch('network/REST_NETWORK_RENTAL_FEES');
    }
}
