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
import {
    Address,
    EncryptedMessage,
    Message,
    Mosaic,
    MosaicId,
    NamespaceId,
    PlainMessage,
    RawUInt64,
    Transaction,
    TransferTransaction,
    UInt64,
    Account,
    PublicAccount,
    SignedTransaction,
    Deadline,
} from 'symbol-sdk';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
// internal dependencies
import { AccountType } from '@/core/database/entities/AccountModel';
import { Formatters } from '@/core/utils/Formatters';
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase';
import { AddressValidator, AliasValidator } from '@/core/validation/validators';
import { MosaicInputsManager } from './MosaicInputsManager';
import { ITransactionEntry } from '@/views/pages/dashboard/invoice/DashboardInvoicePageTs';
// child components
import { ValidationObserver } from 'vee-validate';
// @ts-ignore
import AmountInput from '@/components/AmountInput/AmountInput.vue';
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
// @ts-ignore
import MessageInput from '@/components/MessageInput/MessageInput.vue';
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue';
// @ts-ignore
import MosaicAttachmentInput from '@/components/MosaicAttachmentInput/MosaicAttachmentInput.vue';
// @ts-ignore
import MosaicSelector from '@/components/MosaicSelector/MosaicSelector.vue';
// @ts-ignore
import RecipientInput from '@/components/RecipientInput/RecipientInput.vue';
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue';
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue';
// @ts-ignore
import ModalTransactionUriImport from '@/views/modals/ModalTransactionUriImport/ModalTransactionUriImport.vue';
// @ts-ignore
import TransactionUriDisplay from '@/components/TransactionUri/TransactionUriDisplay/TransactionUriDisplay.vue';
// @ts-ignore
import ProtectedPrivateKeyDisplay from '@/components/ProtectedPrivateKeyDisplay/ProtectedPrivateKeyDisplay.vue';
// @ts-ignore
import ModalFormProfileUnlock from '@/views/modals/ModalFormProfileUnlock/ModalFormProfileUnlock.vue';
// @ts-ignore
const AccountSignerSelector = () => import('@/components/AccountSignerSelector/AccountSignerSelector.vue');

// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
import { MosaicService } from '@/services/MosaicService';
import { MosaicModel } from '@/core/database/entities/MosaicModel';
import { FilterHelpers } from '@/core/utils/FilterHelpers';
import { TransactionCommand } from '@/services/TransactionCommand';
import { appConfig } from '@/config';
import { NotificationType } from '@/core/utils/NotificationType';
const { DECIMAL_SEPARATOR } = appConfig.constants;

export interface MosaicAttachment {
    mosaicHex: string;
    amount: string; // Relative amount
    id?: MosaicId;
    name?: string;
    uid?: number;
}

@Component({
    components: {
        AmountInput,
        FormWrapper,
        MessageInput,
        ModalTransactionConfirmation,
        MosaicAttachmentInput,
        MosaicSelector,
        RecipientInput,
        SignerSelector,
        ValidationObserver,
        MaxFeeAndSubmit,
        FormRow,
        ModalTransactionUriImport,
        TransactionUriDisplay,
        ProtectedPrivateKeyDisplay,
        ModalFormProfileUnlock,
        AccountSignerSelector,
    },
    computed: {
        ...mapGetters({
            currentHeight: 'network/currentHeight',
            balanceMosaics: 'mosaic/balanceMosaics',
            currentRecipient: 'account/currentRecipient',
            feesConfig: 'network/feesConfig',
        }),
    },
})
export class FormTransferTransactionTs extends FormTransactionBase {
    @Prop({
        default: null,
    })
    recipient: Address;

    @Prop({
        default: null,
    })
    message: Message;

    @Prop({
        default: false,
    })
    hideSubmit: boolean;

    @Prop({
        default: false,
    })
    hideSave: boolean;

    @Prop({
        default: false,
    })
    hideSigner: boolean;

    @Prop({
        default: false,
    })
    showTransactionActions: boolean;

    @Prop({
        default: false,
    })
    hideEncryption: boolean;

    @Prop({
        default: () => ({}),
    })
    value: any;

    @Prop({
        default: '',
    })
    title: string;

    @Prop({
        default: false,
    })
    isAggregate: boolean;

    @Prop({
        default: undefined,
    })
    submitButtonText: string;

    @Prop({
        default: false,
    })
    editMode: boolean;

    /// end-region component properties

    /**
     * Formatters helpers
     * @var {Formatters}
     */
    public formatters = Formatters;

    /**
     * Form items
     * @var {any}
     */
    public formItems = {
        signerAddress: '',
        attachedMosaics: new Array<MosaicAttachment>(),
        recipientRaw: '',
        recipient: null,
        selectedMosaicHex: '',
        relativeAmount: 0,
        messagePlain: '',
        encryptMessage: false,
        maxFee: 0,
        mosaics: [],
        signerPublicKey: '',
    };

    public currentHeight: number;

    protected mosaicInputsManager: MosaicInputsManager;

    private balanceMosaics: MosaicModel[];

    private isMounted: boolean = false;

    /**
     * Whether ModalTransactionUriImport is visible
     */
    private isImportTransactionUriModalVisible = false;

    /**
     * Transaction imported via transaction URI
     */
    private importedTransaction: Transaction;

    /**
     * Holds the just in time transactions
     */
    public transactions: TransferTransaction[] = [];

    /**
     * Calculated recommended fee based on the txs size
     */
    private calculatedRecommendedFee: number = 0;

    /**
     * Current recipient account info
     */
    private currentRecipient: PublicAccount;

    private encyptedMessage: Message;

    private showUnlockAccountModal = false;

    private importTransaction = false;

    private plainMessage: string;
    private feesConfig: {
        fast: number;
        median: number;
        slow: number;
        slowest: number;
        free: number;
    };
    private transactionSize: number = 0;
    /**
     * Reset the form with properties
     * @return {void}
     */
    protected resetForm(): void {
        this.showUnlockAccountModal = false;
        this.mosaicInputsManager = MosaicInputsManager.initialize(this.currentMosaicList());

        if (this.editMode) {
            return;
        }

        // - reset attached mosaics
        this.formItems.attachedMosaics = [];

        // - set default form values
        if (this.isAggregate) {
            if (this.isMounted) {
                this.formItems.signerAddress = this.selectedSigner ? this.selectedSigner.address.plain() : this.currentAccount.address;
            }
        } else {
            this.formItems.signerAddress = this.selectedSigner ? this.selectedSigner.address.plain() : this.currentAccount.address;
        }

        this.formItems.selectedMosaicHex = this.networkMosaic.toHex();
        // default currentAccount Address to recipientRaw
        if (this.$route.path.indexOf('invoice') > -1) {
            this.formItems.recipientRaw = this.currentAccount.address || '';
            this.onChangeRecipient();
        } else {
            this.formItems.recipientRaw = !!this.recipient ? this.recipient.plain() : '';
        }
        this.formItems.recipient = !!this.recipient ? this.recipient : null;

        const attachedMosaics: MosaicAttachment[] = [
            {
                id: new MosaicId(this.networkCurrency.mosaicIdHex),
                mosaicHex: this.networkCurrency.mosaicIdHex,
                name: this.networkCurrency.namespaceIdFullname,
                amount: '0',
                uid: Math.floor(Math.random() * 10e6), // used to index dynamic inputs
            },
        ];

        this.formItems.messagePlain = this.message ? Formatters.hexToUtf8(this.message.payload) : '';
        this.formItems.encryptMessage = false;
        this.encyptedMessage = null;
        // - maxFee must be absolute
        this.formItems.maxFee = this.defaultFee;

        // transaction details passed via router
        this.importTransaction = this.$route.params.transaction || this.importedTransaction ? true : false;
        if (this.importTransaction) {
            this.setTransactions([!!this.importedTransaction ? this.importedTransaction : this.$route.params.transaction] as any);
            this.formItems.attachedMosaics.forEach((attachedMosaic) => {
                this.mosaicInputsManager.setSlot(attachedMosaic.mosaicHex, attachedMosaic.uid);
            });
            this.onChangeRecipient();
        } else {
            // - set attachedMosaics and allocate slots
            attachedMosaics.forEach((attachedMosaic, index) => {
                this.mosaicInputsManager.setSlot(attachedMosaic.mosaicHex, attachedMosaic.uid);
                Vue.set(this.formItems.attachedMosaics, index, attachedMosaic);
            });
        }
        this.triggerChange();
    }

    /**
     * Returns the mosaic list of the current account or current signer
     * depending on the multisig situation
     * @protected
     * @returns
     */
    protected currentMosaicList(): MosaicModel[] {
        // filter out expired mosaics
        return this.balanceMosaics.filter((mosaicInfo) => {
            // calculate expiration
            const expiration = MosaicService.getExpiration(
                mosaicInfo,
                this.currentHeight,
                this.networkConfiguration.blockGenerationTargetTime,
            );
            // skip if mosaic is expired
            return expiration !== 'expired';
        });
    }

    /**
     * Getter for TRANSFER transactions that will be staged
     * @see {FormTransactionBase}
     * @return {TransferTransaction[]}
     */
    protected getTransactions(): TransferTransaction[] {
        let deadline: Deadline;
        if (this.$route.fullPath.indexOf('offline') !== -1) {
            deadline = this.createOfflineDeadline();
        } else {
            deadline = !this.isMultisigMode() ? this.simpleTransactionDeadline : this.aggregateTransactionDeadline;
        }
        const mosaicsInfo = this.$store.getters['mosaic/mosaics'] as MosaicModel[];

        // Push network currency info for offline transaction format amount to absolute
        if (mosaicsInfo.length === 0) {
            mosaicsInfo.push({
                mosaicIdHex: this.networkCurrency.mosaicIdHex,
                divisibility: this.networkCurrency.divisibility,
                name: this.networkCurrency.namespaceIdFullname,
                isCurrencyMosaic: true,
                balance: 0,
            } as MosaicModel);
        }

        const mosaics = this.formItems.attachedMosaics
            .filter((attachment) => attachment.uid) // filter out null values
            .map(
                (attachment): Mosaic => {
                    const amount = Number(attachment.amount.trim().replace(DECIMAL_SEPARATOR, '.'));
                    const info = mosaicsInfo.find((i) => i.mosaicIdHex === attachment.mosaicHex);
                    const div = info ? info.divisibility : 0;
                    // - format amount to absolute
                    return new Mosaic(new MosaicId(RawUInt64.fromHex(attachment.mosaicHex)), UInt64.fromUint(amount * Math.pow(10, div)));
                },
            );
        return [
            TransferTransaction.create(
                deadline,
                this.instantiatedRecipient,
                mosaics.length ? mosaics : [],
                this.formItems.encryptMessage ? this.encyptedMessage : PlainMessage.create(this.formItems.messagePlain || ''),
                this.networkType,
                UInt64.fromUint(this.formItems.maxFee),
            ),
        ];
    }

    /**
     * Setter for TRANSFER transactions that will be staged
     * @see {FormTransactionBase}
     * @param {TransferTransaction[]} transactions
     * @throws {Error} If not overloaded in derivate component
     */
    protected setTransactions(transactions: TransferTransaction[]) {
        // - this form creates only 1 transaction
        const transaction = transactions.shift();

        // - populate recipient
        this.formItems.recipientRaw =
            transaction.recipientAddress instanceof NamespaceId
                ? transaction.recipientAddress.fullName
                : transaction.recipientAddress.plain();

        // - populate attached mosaics
        this.formItems.attachedMosaics = this.mosaicsToAttachments(transaction.mosaics);

        // - populate message
        const encryptedMessage = transaction.message instanceof EncryptedMessage;
        this.formItems.encryptMessage = encryptedMessage;
        this.formItems.messagePlain = transaction.message?.payload;
        if (encryptedMessage) {
            this.encyptedMessage = transaction.message;
        }

        // - populate maxFee
        this.formItems.maxFee = transaction.maxFee.compact();
    }

    /// region computed properties getter/setter
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

    protected get isLedger(): boolean {
        return this.currentAccount.type === AccountType.LEDGER || this.currentAccount.type === AccountType.LEDGER_OPT_IN;
    }

    protected get hasAccountUnlockModal(): boolean {
        return this.showUnlockAccountModal;
    }

    protected set hasAccountUnlockModal(f: boolean) {
        this.showUnlockAccountModal = f;
    }

    /// end-region computed properties getter/setter

    /**
     * Hook called when the child component MosaicAttachmentDisplay triggers
     * the event 'delete'
     * @return {void}
     */
    public onDeleteMosaic(id: MosaicId) {
        const updatedAttachedMosaics = [...this.formItems.attachedMosaics].filter(({ mosaicHex }) => mosaicHex !== id.toHex());

        // fixes reactivity on attachedMosaics (observer resolution)
        Vue.set(this.formItems, 'attachedMosaics', updatedAttachedMosaics);
    }

    /**
     * Hook called when the child component ButtonAdd triggers
     * the event 'click'
     * @return {void}
     */
    protected onMosaicInputChange(payload: { mosaicAttachment: MosaicAttachment; inputIndex: number }): void {
        const { mosaicAttachment, inputIndex } = payload;

        // set slot
        this.mosaicInputsManager.setSlot(mosaicAttachment.mosaicHex, inputIndex);

        // update formItems
        const newAttachedMosaics = [...this.formItems.attachedMosaics];
        const indexToUpdate = newAttachedMosaics.findIndex(({ uid }) => uid == inputIndex);
        newAttachedMosaics[indexToUpdate] = mosaicAttachment;
        Vue.set(this.formItems, 'attachedMosaics', newAttachedMosaics);
        this.triggerChange();
    }

    /**
     * Handle deletion of a mosaic input
     * @protected
     * @param {number} inputIndex
     */
    protected onDeleteMosaicInput(index: number): void {
        // unset mosaic input slot
        this.mosaicInputsManager.unsetSlot(index);

        // update formItems, set input uid to null
        const indexToUpdate = this.formItems.attachedMosaics.findIndex(({ uid }) => uid == index);
        Vue.set(this.formItems.attachedMosaics, indexToUpdate, { uid: null });
        // delete the last one in order to re-render the list
        this.formItems.attachedMosaics.pop();
        this.triggerChange();
    }

    /**
     * Internal helper to format a {Mosaic} entry into
     * an array of MosaicAttachment used in this form.
     * @internal
     * @param {Mosaic[]} mosaics
     * @return {MosaicAttachment[]}
     */
    private mosaicsToAttachments(mosaics: Mosaic[]): MosaicAttachment[] {
        return mosaics
            .map((mosaic) => {
                const info = this.balanceMosaics.find((m) => mosaic.id.toHex() === m.mosaicIdHex);
                if (!info) {
                    return null;
                }
                // amount will be converted to RELATIVE
                return {
                    id: new MosaicId(info.mosaicIdHex), // XXX resolve mosaicId from namespaceId
                    mosaicHex: info.mosaicIdHex, // XXX resolve mosaicId from namespaceId
                    name: info.name,
                    amount: (Number(mosaic.amount.toString()) / Math.pow(10, info.divisibility)).toLocaleString(undefined, {
                        maximumFractionDigits: info.divisibility,
                    }),
                    uid: Math.floor(Math.random() * 10e6), // used to index dynamic inputs
                };
            })
            .filter((a) => a);
    }

    /**
     *  Hook called when adding a new mosaic attachment input
     * @protected
     */
    protected addMosaicAttachmentInput(): void {
        if (!this.mosaicInputsManager.hasFreeSlots()) {
            return;
        }

        // generate id and prepare mosaic for slot
        const uid = Math.floor(Math.random() * 10e6);
        const [mosaicToAffectToNewInput] = this.mosaicInputsManager.getMosaicsBySlot(uid);

        // update inputs manager and form items
        this.mosaicInputsManager.setSlot(mosaicToAffectToNewInput, uid);
        this.formItems.attachedMosaics.push({
            mosaicHex: mosaicToAffectToNewInput,
            amount: '0',
            uid,
        });

        this.triggerChange();
    }

    /**
     * Handler when changing message
     */
    onChangeMessage() {
        this.triggerChange();
    }

    /**
     * Handler when changing recipient
     */
    onChangeRecipient() {
        // filter tags
        this.formItems.recipientRaw = FilterHelpers.stripFilter(this.formItems.recipientRaw);
        if (Address.isValidRawAddress(this.formItems.recipientRaw)) {
            this.$store.dispatch('account/GET_RECIPIENT', Address.createFromRawAddress(this.formItems.recipientRaw)).then(() => {
                if (!this.currentRecipient?.publicKey || /^0*$/.test(this.currentRecipient.publicKey)) {
                    this.resetEncryptedMessage();
                }
            });
        } else {
            this.resetEncryptedMessage();
        }
        this.triggerChange();
    }

    /**
     * Handler when changing max fee
     */
    onChangeMaxFee() {
        if (this.formItems.recipientRaw && this.formItems.recipientRaw !== '') {
            this.triggerChange();
        }
    }

    triggerChange() {
        this.isMultisigMode() ? this.createDeadline(48) && this.createDeadline(6) : this.createDeadline(2);
        if (
            AddressValidator.validate(this.formItems.recipientRaw) &&
            ((!this.isMultisigMode() && this.simpleTransactionDeadline) ||
                (this.isMultisigMode() && this.aggregateTransactionDeadline && this.hashLockTransactionDeadline))
        ) {
            this.transactions = this.getTransactions();
            this.transactionSize = this.transactions && this.transactions[0].size;
            // avoid error
            if (this.transactions && this.transactions[0].deadline) {
                const data: ITransactionEntry[] = [];
                this.transactions.map((item: TransferTransaction) => {
                    data.push({
                        transaction: item,
                        attachments: this.mosaicsToAttachments(item.mosaics),
                    });
                });

                this.$emit('onTransactionsChange', data);
                this.calculateDynamicFees();
            }
        } else {
            this.transactions = null;
            this.resetDynamicFees();
            this.resetEncryptedMessage();
        }
    }

    /**
     * Resetting the form when choosing a multisig signer and changing multisig signer
     * Is necessary to make the mosaic inputs reactive
     */
    @Watch('selectedSigner')
    onSelectedSignerChange() {
        this.formItems.signerAddress = this.selectedSigner.address.plain();
        if (this.isMultisigMode()) {
            this.resetForm();
        }
    }

    /**
     * ModalTransactionUriImport modal page close event handler
     */
    onImportTransactionURIModalClose() {
        this.isImportTransactionUriModalVisible = false;
    }

    /**
     * Import transactionURI complete event handler
     * @param transaction transaction to be imported
     */
    onImportTransaction(transaction: Transaction) {
        this.importedTransaction = transaction;
        this.resetForm();
    }

    /**
     * Encrypt message checkbox click
     */
    onEncryptionChange() {
        const importedTransactionMessage = this.getImportedTransactionMessage();
        const isEncrypted = importedTransactionMessage instanceof EncryptedMessage;
        if (!this.currentRecipient?.publicKey) {
            this.$store
                .dispatch('notification/ADD_ERROR', this.$t(NotificationType.RECIPIENT_PUBLIC_KEY_INVALID_ERROR))
                .then(() => (this.formItems.encryptMessage = isEncrypted));
        } else if (!this.formItems.messagePlain) {
            this.$store
                .dispatch('notification/ADD_ERROR', this.$t(NotificationType.ENCRYPTED_MESSAGE_EMPTY_ERROR))
                .then(() => (this.formItems.encryptMessage = isEncrypted));
        } else {
            if (this.formItems.encryptMessage) {
                // to encrypt message
                if (this.importTransaction) {
                    if (isEncrypted) {
                        this.formItems.messagePlain = importedTransactionMessage.payload;
                    } else {
                        this.hasAccountUnlockModal = true;
                    }
                } else {
                    this.hasAccountUnlockModal = true;
                }
            } else {
                // to decrypt message
                if (this.importTransaction) {
                    const isEncrypted = importedTransactionMessage instanceof EncryptedMessage;
                    if (isEncrypted) {
                        this.hasAccountUnlockModal = true;
                    } else {
                        this.formItems.messagePlain = importedTransactionMessage.payload;
                    }
                } else {
                    this.formItems.messagePlain = this.plainMessage;
                    this.encyptedMessage = undefined;
                }
            }
        }
    }

    private getImportedTransactionMessage(): Message {
        const importTransaction = (!!this.importedTransaction
            ? this.importedTransaction
            : this.$route.params.transaction) as TransferTransaction;
        return importTransaction?.message;
    }

    /**
     * Hook called when the account has been unlocked
     * @param {Account} account
     * @return {boolean}
     */
    onAccountUnlocked(account: Account): boolean {
        this.hasAccountUnlockModal = false;
        this.plainMessage = this.formItems.messagePlain;
        if (!this.formItems.encryptMessage && this.importTransaction) {
            const importedTransactionMessage = this.getImportedTransactionMessage();
            if (importedTransactionMessage instanceof EncryptedMessage) {
                const message: PlainMessage = EncryptedMessage.decrypt(
                    importedTransactionMessage,
                    account.privateKey,
                    this.currentRecipient,
                );
                this.formItems.messagePlain = message?.payload;
            }
        } else {
            this.encyptedMessage = this.formItems.messagePlain
                ? EncryptedMessage.create(this.formItems.messagePlain, this.currentRecipient, account.privateKey)
                : PlainMessage.create('');
            this.formItems.encryptMessage = true;
            this.formItems.messagePlain = this.encyptedMessage.payload;
        }
        return true;
    }

    closeAccountUnlockModal() {
        this.hasAccountUnlockModal = false;
    }

    /**
     * Calculates the dynamic fees based on the txs size
     * */
    private calculateDynamicFees() {
        this.createTransactionCommandForFee(this.feesConfig.median)
            .getTotalMaxFee()
            .subscribe((val) => (this.calculatedRecommendedFee = val.compact()));
    }

    /**
     * Creates a TransactionCommand object to calculate total fee
     * for the given dynamic fee (Recommended/Highest)
     * @param {number} maxFee
     */
    private createTransactionCommandForFee(maxFee: number): TransactionCommand {
        const transactions = this.getTransactions().map((t) => {
            //@ts-ignore
            t.maxFee = UInt64.fromUint(maxFee);
            return t;
        });

        const mode = this.getTransactionCommandMode(transactions);
        return new TransactionCommand(
            mode,
            this.selectedSigner,
            this.currentSignerPublicKey,
            transactions,
            this.networkMosaic,
            this.generationHash,
            this.epochAdjustment,
            this.networkType,
            this.networkConfiguration,
            this.transactionFees,
            this.currentSignerMultisigInfo ? this.currentSignerMultisigInfo.minApproval : this.selectedSigner.requiredCosignatures,
        );
    }

    /**
     * Resets calculated dynamic fees
     */
    private resetDynamicFees() {
        this.calculatedRecommendedFee = 0;
    }

    /**
     * Reset encrypted message
     */
    private resetEncryptedMessage() {
        this.encyptedMessage = null;
        this.formItems.encryptMessage = false;
        this.hasAccountUnlockModal = false;
        this.$store.dispatch('account/GET_RECIPIENT', null);
    }
    /**
     * emit formItems values to aggregate transaction form to be saved in storage
     */
    public emitToAggregate() {
        if (this.transactions && this.transactions[0]) {
            this.formItems.mosaics = this.transactions[0].mosaics;
            this.formItems.signerPublicKey = this.currentSignerPublicKey;
            this.$emit('txInput', this.formItems);
        }
    }
    mounted() {
        if (this.isAggregate && this.value) {
            Object.assign(this.formItems, this.value);
            if (this.formItems.attachedMosaics.length) {
                this.mosaicInputsManager = MosaicInputsManager.initialize(this.currentMosaicList());
                this.formItems.attachedMosaics.forEach((m) => this.mosaicInputsManager.setSlot(m.mosaicHex, m.uid));
            }
        }

        this.isMounted = true;
    }
    /**
     * watch title to change form items on select different transactions
     */
    @Watch('title', { immediate: true })
    onTitleChange() {
        if (this.isAggregate && this.value) {
            Object.assign(this.formItems, this.value);
        }
    }

    /**
     * Hook called when the child component ModalTransactionConfirmation triggers
     * the event 'signed'
     */
    public onSignedOfflineTransaction(signedTransaction: SignedTransaction) {
        this.$emit('txSigned', signedTransaction);
    }
    protected createOfflineDeadline(deadlineInHours = 2): Deadline {
        return Deadline.create(this.epochAdjustment, deadlineInHours);
    }
}
