/*
 * Copyright 2020-present NEM (https://nem.io)
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
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue';
// @ts-ignore
import MosaicSelector from '@/components/MosaicSelector/MosaicSelector.vue';
// @ts-ignore
import ProtectedPrivateKeyDisplay from '@/components/ProtectedPrivateKeyDisplay/ProtectedPrivateKeyDisplay.vue';
// @ts-ignore
import RecipientInput from '@/components/RecipientInput/RecipientInput.vue';
// @ts-ignore
import RestrictionDirectionInput, { RestrictionDirection } from '@/components/RestrictionDirectionInput/RestrictionDirectionInput.vue';
// @ts-ignore
import RestrictionTypeInput, { RestrictionBlockType } from '@/components/RestrictionTypeInput/RestrictionTypeInput.vue';
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue';
// @ts-ignore
import TransactionTypeSelector from '@/components/TransactionTypeSelector/TransactionTypeSelector.vue';
import { AddressValidator, AliasValidator } from '@/core/validation/validators';
// internal dependencies
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase';
// @ts-ignore
import ModalFormProfileUnlock from '@/views/modals/ModalFormProfileUnlock/ModalFormProfileUnlock.vue';
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue';
import {
    AccountRestriction,
    AccountRestrictionTransaction,
    Address,
    AddressRestrictionFlag,
    Deadline,
    MosaicId,
    MosaicRestrictionFlag,
    NamespaceId,
    OperationRestrictionFlag,
    Transaction,
    UInt64,
} from 'symbol-sdk';
// child components
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import RestrictionFlagMapping from './RestrictionFlagMapping';

export enum AccountRestrictionTxType {
    ADDRESS = 'ADDRESS',
    MOSAIC = 'MOSAIC',
    TRANSACTION_TYPE = 'TRANSACTION_TYPE',
}

@Component({
    components: {
        FormWrapper,
        ModalTransactionConfirmation,
        RecipientInput,
        SignerSelector,
        ValidationObserver,
        MaxFeeAndSubmit,
        FormRow,
        RestrictionTypeInput,
        ProtectedPrivateKeyDisplay,
        ModalFormProfileUnlock,
        RestrictionDirectionInput,
        MosaicSelector,
        TransactionTypeSelector,
        ErrorTooltip,
        ValidationProvider,
    },
    computed: {
        ...mapGetters({
            accountAddressRestrictions: 'restriction/accountAddressRestrictions',
            accountMosaicRestrictions: 'restriction/accountMosaicRestrictions',
            accountOperationRestrictions: 'restriction/accountOperationRestrictions',
        }),
    },
})
export class FormAccountRestrictionTransactionTs extends FormTransactionBase {
    @Prop({ default: AccountRestrictionTxType.ADDRESS })
    readonly restrictionTxType: AccountRestrictionTxType;

    @Prop({ default: null })
    readonly restrictionToBeDeleted: any;

    /**
     * Form items
     * @var {any}
     */
    public formItems = {
        signerAddress: '',
        recipientRaw: '',
        mosaicIdRaw: '',
        transactionType: null,
        direction: RestrictionDirection.INCOMING,
        blockType: RestrictionBlockType.BLOCK,
        maxFee: 0,
    };

    protected isDeleteMode = false;

    public accountAddressRestrictions: AccountRestriction[];
    public accountMosaicRestrictions: AccountRestriction[];
    public accountOperationRestrictions: AccountRestriction[];

    /**
     * Reset the form with properties
     * @return {void}
     */
    protected resetForm() {
        this.formItems.maxFee = this.defaultFee;
        this.formItems.signerAddress = this.currentSignerAddress.plain();

        if (this.restrictionToBeDeleted) {
            this.isDeleteMode = true;
            if (this.restrictionTxType === AccountRestrictionTxType.ADDRESS) {
                this.formItems.recipientRaw = this.restrictionToBeDeleted.value;
            } else if (this.restrictionTxType === AccountRestrictionTxType.MOSAIC) {
                this.formItems.mosaicIdRaw = this.restrictionToBeDeleted.value;
            } else {
                const restriction: AccountRestriction = this.restrictionToBeDeleted.hiddenData.rowObject;
                this.formItems.transactionType = restriction.values[0];
            }
            this.formItems.direction = this.restrictionToBeDeleted.direction;
            this.formItems.blockType = this.restrictionToBeDeleted.action;
        } else {
            this.formItems.recipientRaw = '';
            this.formItems.mosaicIdRaw = '';
            this.formItems.transactionType = null;
            this.formItems.direction =
                this.restrictionTxType === AccountRestrictionTxType.TRANSACTION_TYPE
                    ? RestrictionDirection.OUTGOING
                    : RestrictionDirection.INCOMING;
        }
    }

    /**
     * Recipient used in the transaction
     * @readonly
     * @protected
     * @type {(Address | NamespaceId)}
     */
    protected get instantiatedRecipient(): Address | NamespaceId {
        const { recipientRaw } = this.formItems;
        if (AddressValidator.validate(recipientRaw)) {
            return Address.createFromRawAddress(recipientRaw);
        } else if (AliasValidator.validate(recipientRaw)) {
            return new NamespaceId(recipientRaw);
        } else {
            return null;
        }
    }

    /**
     * Getter for transactions that will be staged
     * @throws {Error} If not overloaded in derivate component
     */
    protected getTransactions(): Transaction[] {
        return [this.createTransaction(this.restrictionTxType)];
    }

    private createTransaction(restrictionTxType: AccountRestrictionTxType): Transaction {
        switch (this.restrictionTxType) {
            case AccountRestrictionTxType.ADDRESS: {
                const toBeAdded = this.isDeleteMode ? [] : [this.instantiatedRecipient];
                const toBeDeleted = this.isDeleteMode ? [this.instantiatedRecipient] : [];
                this.createDeadline();
                const deadline = this.simpleTransactionDeadline as Deadline;
                return AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
                    deadline,
                    RestrictionFlagMapping.toRestrictionFlag(
                        restrictionTxType,
                        this.formItems.direction,
                        this.formItems.blockType,
                    ) as AddressRestrictionFlag,
                    toBeAdded,
                    toBeDeleted,
                    this.networkType,
                    UInt64.fromUint(this.formItems.maxFee),
                );
            }
            case AccountRestrictionTxType.MOSAIC: {
                const toBeAdded = this.isDeleteMode ? [] : [new MosaicId(this.formItems.mosaicIdRaw)];
                const toBeDeleted = this.isDeleteMode ? [new MosaicId(this.formItems.mosaicIdRaw)] : [];
                this.createDeadline();
                const deadline = this.simpleTransactionDeadline as Deadline;
                return AccountRestrictionTransaction.createMosaicRestrictionModificationTransaction(
                    deadline,
                    RestrictionFlagMapping.toRestrictionFlag(
                        restrictionTxType,
                        this.formItems.direction,
                        this.formItems.blockType,
                    ) as MosaicRestrictionFlag,
                    toBeAdded,
                    toBeDeleted,
                    this.networkType,
                    UInt64.fromUint(this.formItems.maxFee),
                );
            }
            case AccountRestrictionTxType.TRANSACTION_TYPE: {
                const toBeAdded = this.isDeleteMode ? [] : [this.formItems.transactionType];
                const toBeDeleted = this.isDeleteMode ? [this.formItems.transactionType] : [];
                this.createDeadline();
                const deadline = this.simpleTransactionDeadline as Deadline;
                return AccountRestrictionTransaction.createOperationRestrictionModificationTransaction(
                    deadline,
                    RestrictionFlagMapping.toRestrictionFlag(
                        restrictionTxType,
                        this.formItems.direction,
                        this.formItems.blockType,
                    ) as OperationRestrictionFlag,
                    toBeAdded,
                    toBeDeleted,
                    this.networkType,
                    UInt64.fromUint(this.formItems.maxFee),
                );
            }
        }
    }

    protected get directionDisabled() {
        return this.restrictionTxType !== AccountRestrictionTxType.ADDRESS;
    }

    protected get submitButtonText() {
        return this.restrictionToBeDeleted ? 'delete' : 'send';
    }

    protected get submitButtonClasses() {
        return this.isDeleteMode ? 'danger-button' : 'inverted-button';
    }

    protected get transactionTypeDisabled(): boolean {
        let restrictions = [];
        if (this.restrictionTxType === AccountRestrictionTxType.ADDRESS) {
            restrictions = this.accountAddressRestrictions;
        } else if (this.restrictionTxType === AccountRestrictionTxType.MOSAIC) {
            restrictions = this.accountMosaicRestrictions;
        } else {
            restrictions = this.accountOperationRestrictions;
        }

        if (restrictions?.length > 0 || this.restrictionTxType === AccountRestrictionTxType.TRANSACTION_TYPE) {
            if (restrictions[0]) {
                this.formItems.blockType = RestrictionFlagMapping.toBlockType(restrictions[0].restrictionFlags);
            }
            return true;
        }
        return false;
    }
}
