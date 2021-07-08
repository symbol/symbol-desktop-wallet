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
import { MultisigAccountInfo, MultisigAccountModificationTransaction, UInt64, Address } from 'symbol-sdk';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
// internal dependencies
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue';
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue';
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
// @ts-ignore
import AddCosignatoryInput from '@/components/AddCosignatoryInput/AddCosignatoryInput.vue';
// @ts-ignore
import RemoveCosignatoryInput from '@/components/RemoveCosignatoryInput/RemoveCosignatoryInput.vue';
// @ts-ignore
import CosignatoryModificationsDisplay from '@/components/CosignatoryModificationsDisplay/CosignatoryModificationsDisplay.vue';
// @ts-ignore
import ApprovalAndRemovalInput from '@/components/ApprovalAndRemovalInput/ApprovalAndRemovalInput.vue';
// @ts-ignore
import MultisigCosignatoriesDisplay from '@/components/MultisigCosignatoriesDisplay/MultisigCosignatoriesDisplay.vue';
import { TransactionCommand } from '@/services/TransactionCommand';

/// region custom types
export interface CosignatoryModification {
    addOrRemove: 'add' | 'remove';
    cosignatory: Address;
}

export type CosignatoryModifications = {
    [address: string]: CosignatoryModification;
};

@Component({
    components: {
        FormWrapper,
        ValidationObserver,
        ValidationProvider,
        FormRow,
        SignerSelector,
        AddCosignatoryInput,
        RemoveCosignatoryInput,
        CosignatoryModificationsDisplay,
        MaxFeeAndSubmit,
        ModalTransactionConfirmation,
        ApprovalAndRemovalInput,
        MultisigCosignatoriesDisplay,
    },
})
export class FormMultisigAccountModificationTransactionTs extends FormTransactionBase {
    /// region component properties
    @Prop({
        default: '',
    })
    signer: string;

    @Prop({
        default: null,
    })
    minApprovalDelta: number;

    @Prop({
        default: null,
    })
    minRemovalDelta: number;

    @Prop({
        default: false,
    })
    hideSubmit: boolean;
    /// end-region component properties

    /**
     * Form items
     * @var {any}
     */
    public formItems = {
        signerAddress: '',
        minApprovalDelta: 0,
        minRemovalDelta: 0,
        cosignatoryModifications: {},
        maxFee: 0,
    };

    public get multisigOperationType(): 'conversion' | 'modification' {
        if (this.isCosignatoryMode || this.currentAccount.isMultisig) {
            return 'modification';
        }
        return 'conversion';
    }

    public get currentMultisigInfo(): MultisigAccountInfo {
        return this.currentSignerMultisigInfo;
    }

    /**
     * Reset the form with properties
     * @see {FormTransactionBase}
     * @return {void}
     */
    protected resetForm() {
        // - set default deltas values
        const defaultMinApprovalDelta = this.multisigOperationType === 'conversion' ? 1 : 0;
        const defaultMinRemovalDelta = this.multisigOperationType === 'conversion' ? 1 : 0;

        // - set default form values
        this.formItems.minApprovalDelta = !!this.minApprovalDelta ? this.minApprovalDelta : defaultMinApprovalDelta;
        this.formItems.minRemovalDelta = !!this.minRemovalDelta ? this.minRemovalDelta : defaultMinRemovalDelta;
        this.formItems.cosignatoryModifications = {};
        if (!!this.currentAccount) {
            this.formItems.signerAddress = this.currentAccount.address; // always select current account on form reset
        }

        // - maxFee must be absolute
        this.formItems.maxFee = this.defaultFee;
    }

    /**
     * Getter for whether forms should aggregate transactions in BONDED
     * @see {FormTransactionBase}
     * @return {boolean} Always true
     */
    protected isMultisigMode(): boolean {
        return true;
    }

    /**
     * Getter for TRANSFER transactions that will be staged
     * @see {FormTransactionBase}
     * @return {MultisigAccountModificationTransaction[]}
     */
    protected getTransactions(): MultisigAccountModificationTransaction[] {
        this.createDeadline();
        const deadline = this.simpleTransactionDeadline;
        return [
            MultisigAccountModificationTransaction.create(
                deadline,
                this.formItems.minApprovalDelta,
                this.formItems.minRemovalDelta,
                this.addressAdditions,
                this.addressDeletions,
                this.networkType,
                UInt64.fromUint(this.formItems.maxFee),
            ),
        ];
    }

    protected get addressAdditions() {
        return Object.values(this.formItems.cosignatoryModifications)
            .filter(({ addOrRemove }) => addOrRemove === 'add')
            .map(({ cosignatory }) => cosignatory);
    }

    protected get addressDeletions() {
        return Object.values(this.formItems.cosignatoryModifications)
            .filter(({ addOrRemove }) => addOrRemove === 'remove')
            .map(({ cosignatory }) => cosignatory);
    }

    /**
     * Setter for TRANSFER transactions that will be staged
     * @see {FormTransactionBase}
     * @param {TransferTransaction[]} transactions
     * @throws {Error} If not overloaded in derivate component
     */
    protected setTransactions(transactions: MultisigAccountModificationTransaction[]) {
        // this form creates only 1 transaction
        const transaction = transactions.shift();
        this.formItems.minApprovalDelta = transaction.minApprovalDelta;
        this.formItems.minRemovalDelta = transaction.minRemovalDelta;
        this.formItems.cosignatoryModifications = this.getCosignatoryModificationsFromTransaction(transaction);
        this.formItems.maxFee = transaction.maxFee ? transaction.maxFee.compact() : this.defaultFee;
    }

    private getCosignatoryModificationsFromTransaction(transaction: MultisigAccountModificationTransaction): CosignatoryModifications {
        const additions: CosignatoryModification[] = transaction.addressAdditions.map((address: Address) => ({
            addOrRemove: 'add',
            cosignatory: address,
        }));

        const deletions: CosignatoryModification[] = transaction.addressDeletions.map((address: Address) => ({
            addOrRemove: 'remove',
            cosignatory: address,
        }));

        return [...additions, ...deletions].reduce(
            (acc, modification) => ({
                ...acc,
                [modification.cosignatory.plain()]: modification,
            }),
            {},
        );
    }

    /// region super.onChangeSigner
    /**
     * Hook called when a signer is selected.
     *
     * This override is needed in order to fetch the multi-signature
     * information for the currently selected signer. This fixes a
     * reactivity problem with SignerSelector selected value in case
     * of long-loading (e.g. fetch of multisig data).
     *
     * @override
     * @param {string} address
     */
    public async onChangeSigner(address: string) {
        if (!address) {
            return;
        }
        // whether the new signer is a multisig account
        const signerIsMultisigAccount = this.currentAccount.address !== address;

        // force update form fields
        this.formItems.signerAddress = address;
        this.formItems.minApprovalDelta = signerIsMultisigAccount ? 0 : 1;
        this.formItems.minRemovalDelta = signerIsMultisigAccount ? 0 : 1;
        this.formItems.cosignatoryModifications = {};

        await this.$store.dispatch('account/SET_CURRENT_SIGNER', {
            address: Address.createFromRawAddress(address),
            reset: false,
            unsubscribeWS: true,
        });
    }
    /// end-region super.onChangeSigner

    /**
     * Hook called when the subcomponent MultisigCosignatoriesDisplay
     * emits the event `remove`.
     *
     * @param {Address} address
     */
    public onClickRemove(address: Address) {
        const modifications = this.formItems.cosignatoryModifications;

        // - in case address is part of "modifications"
        if (modifications && modifications[address.plain()]) {
            Vue.delete(this.formItems.cosignatoryModifications, address.plain());
            return;
        }
        // - in case address is part of "cosignatories", register modification
        else {
            Vue.set(this.formItems.cosignatoryModifications, address.plain(), {
                cosignatory: address,
                addOrRemove: 'remove',
            });
        }
    }

    /**
     * Hook called when the subcomponent MultisigCosignatoriesDisplay
     * emits the event `add`.
     *
     * @param {PublicAccount} publicAccount
     */
    public onClickAdd(address: Address) {
        Vue.set(this.formItems.cosignatoryModifications, address.plain(), {
            cosignatory: address,
            addOrRemove: 'add',
        });
    }

    public onClickUndo(address: Address) {
        Vue.delete(this.formItems.cosignatoryModifications, address.plain());
    }

    /// region validation handling
    /**
     * Calculation of the new multisig properties
     * For input validation purposes
     * @readonly
     * @private
     * @type {{
     *     minApproval: number,
     *     minRemoval: number,
     *     cosignatoryNumber: number,
     *   }}
     */
    private get newMultisigProperties(): {
        minApproval: number;
        minRemoval: number;
        cosignatoryNumber: number;
    } {
        // calculate new min approval
        const newMinApproval = this.currentMultisigInfo
            ? this.currentMultisigInfo.minApproval + this.formItems.minApprovalDelta
            : this.formItems.minApprovalDelta;

        // calculate new min approval
        const newMinRemoval = this.currentMultisigInfo
            ? this.currentMultisigInfo.minRemoval + this.formItems.minRemovalDelta
            : this.formItems.minRemovalDelta;

        // calculate the delta of added cosigners
        const numberOfAddedCosigners = this.addressAdditions.length - this.addressDeletions.length;

        const newCosignatoryNumber = this.currentMultisigInfo
            ? this.currentMultisigInfo.cosignatoryAddresses.length + numberOfAddedCosigners
            : numberOfAddedCosigners;

        return {
            minApproval: newMinApproval,
            minRemoval: newMinRemoval,
            cosignatoryNumber: newCosignatoryNumber,
        };
    }

    /**
     * Whether the new multisig configuration is correct
     * @readonly
     * @protected
     * @return {'OK' | false}
     */
    protected get areInputsValid(): 'OK' | false {
        const { minApproval, minRemoval, cosignatoryNumber } = this.newMultisigProperties;
        const maxCosignatoriesPerAccount = this.networkConfiguration.maxCosignatoriesPerAccount;
        return cosignatoryNumber >= minApproval &&
            cosignatoryNumber >= minRemoval &&
            cosignatoryNumber <= maxCosignatoriesPerAccount &&
            !(cosignatoryNumber > 0 && (minApproval == 0 || minRemoval == 0))
            ? 'OK'
            : false;
    }

    protected showErrorNotification(): void {
        // no message if inputs are OK
        if (this.areInputsValid === 'OK') {
            return;
        }

        this.$store.dispatch('notification/ADD_ERROR', this.errorMessage);
    }

    /**
     * Error message shown in the notice
     * @readonly
     * @protected
     * @return {string}
     */
    protected get errorMessage(): string {
        const { minApproval, minRemoval, cosignatoryNumber } = this.newMultisigProperties;
        const maxCosignatoriesPerAccount = this.networkConfiguration.maxCosignatoriesPerAccount;

        // no message if inputs are OK
        if (this.areInputsValid === 'OK') {
            return;
        }

        if (cosignatoryNumber < minApproval) {
            return `${this.$t('approval_greater_than_cosignatories', {
                delta: minApproval - cosignatoryNumber,
            })}`;
        }

        if (cosignatoryNumber < minRemoval) {
            return `${this.$t('removal_greater_than_cosignatories', {
                delta: minRemoval - cosignatoryNumber,
            })}`;
        }

        if (cosignatoryNumber > maxCosignatoriesPerAccount) {
            return `${this.$t('too_many_cosignatories', {
                maxCosignatoriesPerAccount,
                delta: cosignatoryNumber - maxCosignatoriesPerAccount,
            })}`;
        }
        if (cosignatoryNumber > 0 && (minApproval == 0 || minRemoval == 0)) {
            return `${this.$t('removal_or_approval_is_zero', {
                delta: cosignatoryNumber,
            })}`;
        }
    }

    /// end-region validation handling

    /**
     * This method is overriden in order to provide custom requiredCosignatures calculation
     * @see {requiredCosignatures}
     * @override
     * @return { TransactionCommand }
     */
    public createTransactionCommand(): TransactionCommand {
        const transactions = this.getTransactions();
        const mode = this.getTransactionCommandMode(transactions);
        return new TransactionCommand(
            mode,
            this.selectedSigner,
            this.currentSignerPublicKey,
            transactions,
            this.networkMosaic,
            this.generationHash,
            this.networkType,
            this.epochAdjustment,
            this.networkConfiguration,
            this.transactionFees,
            this.requiredCosignatures,
        );
    }

    /**
     * Calculating number of requiredCosignatures to use in maxFee calculation
     * @override
     * @type number
     */
    protected get requiredCosignatures(): number {
        if (this.multisigOperationType === 'conversion') {
            return this.addressAdditions.length;
        }
        // proceed if modification

        // if nothing is changed in the form or minApprovalDelta != 0 then the default value will be existing minApproval
        let requiredCosignatures = this.currentMultisigInfo.minApproval;

        if (this.addressAdditions.length > 0) {
            /*
      this is an edge case, since the new additions signatures are mandatory, there might be a case
      where all the existing cosignatories sign their parts before new additions do.
      So in order to stay safe we are adding all the cosignatories including the new additions.
      */
            requiredCosignatures = this.currentMultisigInfo.cosignatoryAddresses.length + this.addressAdditions.length;
        } else {
            if (
                (this.formItems.minRemovalDelta != 0 || this.addressDeletions.length > 0) &&
                this.currentMultisigInfo.minRemoval > requiredCosignatures
            ) {
                requiredCosignatures = this.currentMultisigInfo.minRemoval;
            }
        }

        return requiredCosignatures;
    }

    /**
     * Whether form has any changes
     * @readonly
     * @return {boolean}
     */
    public get hasFormAnyChanges(): boolean {
        return (
            this.addressAdditions.length > 0 ||
            this.addressDeletions.length > 0 ||
            this.formItems.minApprovalDelta !== 0 ||
            this.formItems.minRemovalDelta !== 0
        );
    }
}
