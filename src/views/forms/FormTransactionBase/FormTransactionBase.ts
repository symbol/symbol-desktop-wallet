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
import { MosaicId, MultisigAccountInfo, NetworkType, PublicAccount, Transaction, TransactionFees, Address, Deadline } from 'symbol-sdk';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
// internal dependencies
import { AccountModel } from '@/core/database/entities/AccountModel';
import { ValidationObserver } from 'vee-validate';
import { Signer } from '@/store/Account';
import { NetworkCurrencyModel } from '@/core/database/entities/NetworkCurrencyModel';
import { TransactionCommand, TransactionCommandMode } from '@/services/TransactionCommand';
import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel';

@Component({
    computed: {
        ...mapGetters({
            generationHash: 'network/generationHash',
            networkType: 'network/networkType',
            epochAdjustment: 'network/epochAdjustment',
            defaultFee: 'app/defaultFee',
            currentAccount: 'account/currentAccount',
            selectedSigner: 'account/currentSigner',
            currentSignerPublicKey: 'account/currentSignerPublicKey',
            currentSignerAddress: 'account/currentSignerAddress',
            currentSignerMultisigInfo: 'account/currentSignerMultisigInfo',
            currentAccountMultisigInfo: 'account/currentAccountMultisigInfo',
            isCosignatoryMode: 'account/isCosignatoryMode',
            networkMosaic: 'mosaic/networkMosaic',
            networkCurrency: 'mosaic/networkCurrency',
            signers: 'account/signers',
            networkConfiguration: 'network/networkConfiguration',
            transactionFees: 'network/transactionFees',
            isOfflineMode: 'network/isOfflineMode',
        }),
    },
})
export class FormTransactionBase extends Vue {
    /// region store getters
    /**
     * Network generation hash
     */
    public generationHash: string;

    /**
     * Network type
     * @var {NetworkType}
     */
    public networkType: NetworkType;

    /**
     * The network configuration epochAdjustment.
     */
    public epochAdjustment: number;

    /**
     * Default fee setting
     */
    public defaultFee: number;

    /**
     * Currently active account
     */
    public currentAccount: AccountModel;

    /**
     * Currently active signer
     */
    public selectedSigner: Signer;

    /**
     * Currently active signer's public key
     */
    public currentSignerPublicKey: string;

    /**
     * Currently active signer's address
     */
    public currentSignerAddress: Address;

    /**
     * Current account multisig info
     * @type {MultisigAccountInfo}
     */
    public currentAccountMultisigInfo: MultisigAccountInfo;

    /**
     * Current signer multisig info
     * @var {MultisigAccountInfo}
     */
    public currentSignerMultisigInfo: MultisigAccountInfo;

    /**
     * Whether the form is in cosignatory mode (cosigner selected)
     * @var {boolean}
     */
    public isCosignatoryMode: boolean;

    /**
     * Networks currency mosaic
     * @var {MosaicId}
     */
    public networkMosaic: MosaicId;

    /**
     * Currently staged transactions
     * @var {Transaction[]}
     */
    public stagedTransactions: Transaction[];

    /**
     * Public key of the current signer
     * @var {any}
     */
    public currentSigner: PublicAccount;

    public signers: Signer[];

    public networkCurrency: NetworkCurrencyModel;

    public networkConfiguration: NetworkConfigurationModel;

    public command: TransactionCommand;

    protected transactionFees: TransactionFees;

    protected isOfflineMode: boolean;

    /**
     * Type the ValidationObserver refs
     * @type {{
     *     observer: InstanceType<typeof ValidationObserver>
     *   }}
     */
    public $refs!: {
        observer: InstanceType<typeof ValidationObserver>;
    };

    /// end-region store getters

    /// region property watches
    @Watch('currentAccount')
    onCurrentAccountChange() {
        this.resetForm(); // @TODO: probably not the best way
        this.resetFormValidation();
    }

    /// end-region property watches

    /**
     * Whether the form is currently awaiting a signature
     * @var {boolean}
     */
    public isAwaitingSignature: boolean = false;

    /**
     * Hook called when the component is mounted
     * @return {void}
     */
    public async created() {
        this.$store.dispatch('network/LOAD_TRANSACTION_FEES');
        this.resetForm();
    }

    /**
     * it creates the deadlines for the transactions.
     */
    protected createDeadline(): Deadline {
        return Deadline.create(this.epochAdjustment);
    }

    /**
     * Hook called when the component is being destroyed (before)
     * @return {void}
     */
    public async beforeDestroy() {
        // reset the selected signer if it is not the current account
        if (!this.currentAccount) {
            return;
        }

        if (!this.selectedSigner.address.equals(Address.createFromRawAddress(this.currentAccount.address))) {
            await this.$store.dispatch('account/SET_CURRENT_SIGNER', {
                address: Address.createFromRawAddress(this.currentAccount.address),
                reset: false,
                unsubscribeWS: true,
            });
        }
    }

    /**
     * Current signer's multisig accounts
     * @readonly
     * @type {{publicKey: string, label: string}[]}
     */
    get multisigAccounts(): Signer[] {
        const signers = this.signers;
        // if "self" is multisig, also return self
        if (this.isMultisigAccount) {
            return signers;
        }

        // all signers except current account
        return [...signers].splice(1);
    }

    get hasConfirmationModal(): boolean {
        return this.isAwaitingSignature;
    }

    set hasConfirmationModal(f: boolean) {
        this.isAwaitingSignature = f;
    }

    get isMultisigAccount(): boolean {
        return this.currentAccountMultisigInfo && this.currentAccountMultisigInfo.isMultisig();
    }

    /// end-region computed properties getter/setter

    /**
     * Reset the form with properties
     * @throws {Error} If not overloaded in derivate component
     */
    protected resetForm() {
        throw new Error("Method 'resetForm()' must be overloaded in derivate components.");
    }
    /**
     * Getter for whether forms should aggregate transactions in BONDED
     * @return {boolean}
     */
    protected isMultisigMode(): boolean {
        return this.isCosignatoryMode === true;
    }

    /**
     * Getter for transactions that will be staged
     * @throws {Error} If not overloaded in derivate component
     */
    protected getTransactions(): Transaction[] {
        throw new Error("Getter method 'getTransactions()' must be overloaded in derivate components.");
    }

    /**
     * Setter for transactions that will be staged
     * @param {Transaction[]} transactions
     * @throws {Error} If not overloaded in derivate component
     */
    protected setTransactions(transactions: Transaction[]) {
        //TODO do we need these methods?
        const error = `setTransactions() must be overloaded. Call got ${transactions.length} transactions.`;
        throw new Error(error);
    }

    /**
     * Hook called when the confirmation modal must open
     * @see {FormTransactionBase}
     * @throws {Error} If not overloaded in derivate component
     */
    protected onShowConfirmationModal() {
        this.hasConfirmationModal = true;
    }

    /**
     * Hook called when a signer is selected.
     * @param {string} publicKey
     */
    public async onChangeSigner(address: string) {
        // this.currentSigner = PublicAccount.createFromPublicKey(publicKey, this.networkType)
        await this.$store.dispatch('account/SET_CURRENT_SIGNER', {
            address: Address.createFromRawAddress(address),
            reset: false,
            unsubscribeWS: false,
        });
    }

    protected getTransactionCommandMode(transactions: Transaction[]): TransactionCommandMode {
        if (this.isMultisigMode()) {
            // If min Approval equal one, we can announce it with AggregateComplete to skip the lock fees.
            if (this.currentSignerMultisigInfo.minApproval === 1) {
                return TransactionCommandMode.AGGREGATE;
            }

            return TransactionCommandMode.MULTISIGN;
        }
        if (transactions.length > 1) {
            return TransactionCommandMode.AGGREGATE;
        } else {
            return TransactionCommandMode.SIMPLE;
        }
    }

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

    protected get requiredCosignatures() {
        return this.currentSignerMultisigInfo ? this.currentSignerMultisigInfo.minApproval : this.selectedSigner.requiredCosignatures;
    }

    /**
     * Process form input
     * @return {void}
     */
    public onSubmit() {
        // - open signature modal
        this.command = this.createTransactionCommand();
        this.onShowConfirmationModal();
    }

    /**
     * Hook called when the child component ModalTransactionConfirmation triggers
     * the event 'success'
     */
    public onConfirmationSuccess() {
        // if the form was in multisig, set the signer to be the main account
        // this triggers resetForm in the @Watch('currentAccount') hook
        if (this.isMultisigMode()) {
            this.$store.dispatch('account/SET_CURRENT_ACCOUNT', this.currentAccount);
        }
        this.resetForm();
        this.hasConfirmationModal = false;
        this.$emit('on-confirmation-success');
        // Reset form validation
        this.resetFormValidation();
    }

    public reset(): void {
        this.resetForm();
        this.resetFormValidation();
    }

    /**
     * Reset form validation
     * @private
     */
    private resetFormValidation(): void {
        this.$refs && this.$refs.observer && this.$refs.observer.reset();
    }

    /**
     * Hook called when the child component ModalTransactionConfirmation triggers
     * the event 'error'
     * @return {void}
     */
    public onConfirmationError(error: string) {
        this.$store.dispatch('notification/ADD_ERROR', error);
    }

    /**
     * Hook called when the child component ModalTransactionConfirmation triggers
     * the event 'close'
     * @return {void}
     */
    public onConfirmationCancel() {
        this.hasConfirmationModal = false;
    }
}
