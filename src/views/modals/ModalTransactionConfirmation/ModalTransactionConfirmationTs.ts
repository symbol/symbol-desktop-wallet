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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import {
    Account,
    Password,
    Transaction,
    MosaicId,
    MultisigAccountInfo,
    NetworkType,
    PublicAccount,
    TransactionFees,
    Address,
    SignedTransaction,
    AggregateTransaction,
    Deadline,
    LockFundsTransaction,
    Mosaic,
    UInt64,
    Crypto,
    TransactionType,
    LinkAction,
} from 'symbol-sdk';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { ValidationObserver } from 'vee-validate';
import { Signer } from '@/store/Account';
import { NetworkCurrencyModel } from '@/core/database/entities/NetworkCurrencyModel';
import { TransactionCommand, TransactionCommandMode } from '@/services/TransactionCommand';
import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel';
// @ts-ignore
import { Observable, of } from 'rxjs';
import { AccountService } from '@/services/AccountService';
import { LedgerService } from '@/services/LedgerService';

// internal dependencies
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { LedgerHarvestingMode } from '@/store/Harvesting';
import { AccountTransactionSigner, TransactionAnnouncerService, TransactionSigner } from '@/services/TransactionAnnouncerService';
// child components
// @ts-ignore
import TransactionDetails from '@/components/TransactionDetails/TransactionDetails.vue';
// @ts-ignore
import FormProfileUnlock from '@/views/forms/FormProfileUnlock/FormProfileUnlock.vue';
// @ts-ignore
import HardwareConfirmationButton from '@/components/HardwareConfirmationButton/HardwareConfirmationButton.vue';

@Component({
    components: {
        TransactionDetails,
        FormProfileUnlock,
        HardwareConfirmationButton,
    },
    computed: {
        ...mapGetters({
            currentAccount: 'account/currentAccount',
            generationHash: 'network/generationHash',
            networkType: 'network/networkType',
            epochAdjustment: 'network/epochAdjustment',
            defaultFee: 'app/defaultFee',
            currentProfile: 'profile/currentProfile',
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
            simpleTransactionDeadline: 'network/simpleTransactionDeadline',
            aggregateTransactionDeadline: 'network/aggregateTransactionDeadline',
            hashLockTransactionDeadline: 'network/hashLockTransactionDeadline',
        }),
    },
})
export class ModalTransactionConfirmationTs extends Vue {
    @Prop({
        default: false,
    })
    public delegated: boolean;

    @Prop({
        default: false,
    })
    public visible: boolean;

    @Prop({
        required: true,
    })
    public command: any;

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
     * Whether the form is currently awaiting a signature
     * @var {boolean}
     */
    public isAwaitingSignature: boolean = false;
    /**
     * Public key of the current signer
     * @var {any}
     */
    public currentProfile: ProfileModel;

    public currentSigner: PublicAccount;

    public signers: Signer[];

    public networkCurrency: NetworkCurrencyModel;

    public networkConfiguration: NetworkConfigurationModel;

    protected transactionFees: TransactionFees;

    protected isOfflineMode: boolean;
    private simpleTransactionDeadline: Deadline;
    private aggregateTransactionDeadline: Deadline;
    private hashLockTransactionDeadline: Deadline;
    /**
     * Type the ValidationObserver refs
     * @type {{
     *     observer: InstanceType<typeof ValidationObserver>
     *   }}
     */
    public $refs!: {
        observer: InstanceType<typeof ValidationObserver>;
    };
    get hasConfirmationModal(): boolean {
        return this.isAwaitingSignature;
    }

    set hasConfirmationModal(f: boolean) {
        this.isAwaitingSignature = f;
    }
    /**
     * Currently active account
     * @see {Store.Account}
     * @var {AccountModel}
     */
    public currentAccount: AccountModel;

    /**
     * List of transactions on-stage
     * @see {Store.Account}
     * @var {Transaction[]}
     */
    public stagedTransactions: Transaction[] = [];
    /**
     * Getter for whether forms should aggregate transactions in BONDED
     * @return {boolean}
     */
    protected isMultisigMode(): boolean {
        return this.isCosignatoryMode === true;
    }

    public async mounted() {
        this.stagedTransactions = await this.command.resolveTransactions().toPromise();
    }
    /**
     * Reset the form with properties
     * @throws {Error} If not overloaded in derivate component
     */
    protected resetForm() {
        throw new Error("Method 'resetForm()' must be overloaded in derivate components.");
    }
    /**
     * Getter for transactions that will be staged
     * @throws {Error} If not overloaded in derivate component
     */
    protected getTransactions(): Transaction[] {
        throw new Error("Getter method 'getTransactions()' must be overloaded in derivate components.");
    }
    protected getTransactionCommandMode(transactions: Transaction[]): TransactionCommandMode {
        if (this.isMultisigMode()) {
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
            this.currentSignerMultisigInfo ? this.currentSignerMultisigInfo.minApproval : this.selectedSigner.requiredCosignatures,
        );
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

    /// region computed properties getter/setter
    /**
     * Returns whether current account is a hardware wallet
     * @return {boolean}
     */
    public get isUsingHardwareWallet(): boolean {
        // XXX should use "stagedTransaction.signer" to identify account
        return (
            this.currentAccount.type === AccountType.TREZOR ||
            this.currentAccount.type === AccountType.LEDGER ||
            this.currentAccount.type === AccountType.LEDGER_OPT_IN
        );
    }

    /**
     * Visibility state
     * @type {boolean}
     */
    public get show(): boolean {
        return this.visible;
    }

    /**
     * Emits close event
     */
    public set show(val) {
        if (!val) {
            this.$emit('close');
        }
    }
    /// end-region computed properties getter/setter

    /**
     * Error notification handler
     */
    private errorNotificationHandler(error: any) {
        if (error.message && error.message.includes('cannot open device with path')) {
            error.errorCode = 'ledger_connected_other_app';
        }
        if (error.errorCode) {
            switch (error.errorCode) {
                case 'NoDevice':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_no_device');
                    return;
                case 'ledger_not_supported_app':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_supported_app');
                    return;
                case 'ledger_connected_other_app':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_connected_other_app');
                    return;
                case 'ledger_not_correct_account':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_correct_account');
                    return;
                case 26628:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_device_locked');
                    return;
                case 27904:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_opened_app');
                    return;
                case 27264:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_not_using_xym_app');
                    return;
                case 27013:
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_user_reject_request');
                    return;
                case 26368:
                    this.$store.dispatch('notification/ADD_ERROR', 'transaction_too_long');
                    return;
            }
        } else if (error.name) {
            switch (error.name) {
                case 'TransportOpenUserCancelled':
                    this.$store.dispatch('notification/ADD_ERROR', 'ledger_no_device_selected');
                    return;
            }
        }
        this.$store.dispatch('notification/ADD_ERROR', this.$t('sign_transaction_failed', { reason: error.message || error }));
    }

    /**
     * Hook called when child component FormProfileUnlock emits
     * the 'success' event.
     *
     * This hook shall *sign transactions* with the \a account
     * that has been unlocked. Subsequently it will also announce
     * the signed transaction.
     *
     */
    public async onAccountUnlocked({ account, password }: { account: Account; password?: Password }): Promise<void> {
        // - log about unlock success
        this.$store.dispatch('diagnostic/ADD_INFO', `Account ${account.address.plain()} unlocked successfully.`);
        // - get transaction stage config
        if (this.$route.path === '/delegatedHarvesting') {
            this.$emit('unlocked', password);
        }
        return this.onSigner(new AccountTransactionSigner(account));
    }

    private async getLedgerAccountOnSignerValues() {
        const ledgerService = new LedgerService(this.currentProfile.networkType);
        const isAppSupported = await ledgerService.isAppSupported();
        if (!isAppSupported) {
            throw { errorCode: 'ledger_not_supported_app' };
        }
        const currentPath = this.currentAccount.path;
        const isOptinLedgerWallet = this.currentAccount.type === AccountType.LEDGER_OPT_IN;
        const networkType = this.currentProfile.networkType;
        const accountService = new AccountService();
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signerPublicKey = await accountService.getLedgerPublicKeyByPath(networkType, currentPath, true, isOptinLedgerWallet);
        if (signerPublicKey === this.currentAccount.publicKey.toLowerCase()) {
            const publicKey = signerPublicKey;
            const ledgerAccount = PublicAccount.createFromPublicKey(publicKey.toUpperCase(), networkType);
            const multisigAccount = PublicAccount.createFromPublicKey(this.command.signerPublicKey, this.networkType);
            const stageTransactions = this.command.stageTransactions;
            const maxFee = stageTransactions.sort((a, b) => a.maxFee.compare(b.maxFee))[0].maxFee;
            // - open signature modal
            const txMode = this.command.mode;
            return {
                ledgerService,
                currentPath,
                isOptinLedgerWallet,
                networkType,
                accountService,
                publicKey,
                ledgerAccount,
                multisigAccount,
                stageTransactions,
                maxFee,
                txMode,
            };
        } else {
            throw { errorCode: 'ledger_not_correct_account' };
        }
    }

    private async ledgerAccountSimpleTransactionOnSigner(values) {
        const { ledgerService, currentPath, isOptinLedgerWallet, ledgerAccount, stageTransactions } = values;
        stageTransactions.map(async (t) => {
            const transaction = this.command.calculateSuggestedMaxFee(t);
            ledgerService
                .signTransaction(currentPath, transaction, this.generationHash, ledgerAccount.publicKey, isOptinLedgerWallet)
                .then((res: any) => {
                    if (this.isOfflineMode) {
                        this.$emit('transaction-signed', res);
                    } else {
                        // - notify about successful transaction announce
                        this.onConfirmationSuccess();
                        const services = new TransactionAnnouncerService(this.$store);
                        services.announce(res);
                        this.show = false;
                    }
                })
                .catch((error) => {
                    this.show = false;
                    this.errorNotificationHandler(error);
                });
        });
    }

    private async ledgerAccountAggregateTransactionOnSigner(values) {
        const { ledgerService, currentPath, isOptinLedgerWallet, ledgerAccount, multisigAccount, stageTransactions, maxFee } = values;
        this.$store.dispatch('network/SET_TRANSACTION_DEADLINE', { root: true });
        const deadline = this.simpleTransactionDeadline;
        const aggregate = this.command.calculateSuggestedMaxFee(
            AggregateTransaction.createComplete(
                deadline,
                stageTransactions.map((t) => t.toAggregate(multisigAccount)),
                this.networkType,
                [],
                maxFee,
            ),
        );
        ledgerService
            .signTransaction(currentPath, aggregate, this.generationHash, ledgerAccount.publicKey, isOptinLedgerWallet)
            .then((res) => {
                if (this.isOfflineMode) {
                    this.$emit('transaction-signed', res);
                } else {
                    // - notify about successful transaction announce
                    this.onConfirmationSuccess();
                    const services = new TransactionAnnouncerService(this.$store);
                    services.announce(res);
                    this.show = false;
                }
            })
            .catch((error) => {
                this.show = false;
                this.errorNotificationHandler(error);
            });
    }

    private async ledgerAccountMultisigTransactionOnSigner(values) {
        const { ledgerService, currentPath, isOptinLedgerWallet, ledgerAccount, multisigAccount, stageTransactions, maxFee } = values;
        await this.$store.dispatch('network/SET_TRANSACTION_DEADLINE', 48, { root: true });
        const aggregateDeadline = this.aggregateTransactionDeadline;
        const aggregate = this.command.calculateSuggestedMaxFee(
            AggregateTransaction.createBonded(
                aggregateDeadline,
                stageTransactions.map((t) => t.toAggregate(multisigAccount)),
                this.networkType,
                [],
                maxFee,
            ),
        );
        const signedAggregateTransaction = await ledgerService
            .signTransaction(currentPath, aggregate, this.generationHash, ledgerAccount.publicKey, isOptinLedgerWallet)
            .then((signedAggregateTransaction) => {
                return signedAggregateTransaction;
            });

        await this.$store.dispatch('network/SET_TRANSACTION_DEADLINE', 6, { root: true });
        const hashLockDeadline = this.hashLockTransactionDeadline;

        const hashLock = this.command.calculateSuggestedMaxFee(
            LockFundsTransaction.create(
                hashLockDeadline,
                new Mosaic(this.networkMosaic, UInt64.fromNumericString(this.networkConfiguration.lockedFundsPerAggregate)),
                UInt64.fromUint(5760),
                signedAggregateTransaction,
                this.networkType,
                maxFee,
            ),
        );
        const signedHashLock = await ledgerService
            .signTransaction(currentPath, hashLock, this.generationHash, ledgerAccount.publicKey, isOptinLedgerWallet)
            .then((res) => {
                return res;
            });
        const signedTransactions: Observable<SignedTransaction>[] = [of(signedHashLock), of(signedAggregateTransaction)];
        // - notify about successful transaction announce
        this.onConfirmationSuccess();
        const service = new TransactionAnnouncerService(this.$store);
        const announcements = await of(this.command.announceHashAndAggregateBonded(service, signedTransactions));
        announcements.forEach((announcement) => {
            announcement.subscribe((res) => {
                if (!res.success) {
                    this.errorNotificationHandler(res.error);
                }
            });
        });
        this.show = false;
    }

    private async ledgerAccountOnSigner(): Promise<void> {
        const values = await this.getLedgerAccountOnSignerValues();
        if (values.txMode == TransactionCommandMode.SIMPLE) {
            await this.ledgerAccountSimpleTransactionOnSigner(values);
        } else if (values.txMode == TransactionCommandMode.AGGREGATE) {
            await this.ledgerAccountAggregateTransactionOnSigner(values);
        } else {
            await this.ledgerAccountMultisigTransactionOnSigner(values);
        }
    }

    // <-- Delegated harvesting
    private getDelegatedHarvestingMode(transactions: Transaction[]) {
        if (this.isMultisigMode()) {
            if (transactions.length === 4) {
                return LedgerHarvestingMode.MULTISIG_DELEGATED_HARVESTING_START_OR_SWAP;
            } else if (transactions.length === 2) {
                return LedgerHarvestingMode.MULTISIG_DELEGATED_HARVESTING_STOP;
            }
        } else if (transactions.length === 2) {
            return LedgerHarvestingMode.DELEGATED_HARVESTING_START_OR_SWAP;
        } else if (transactions.length === 1) {
            return LedgerHarvestingMode.DELEGATED_HARVESTING_STOP;
        }
    }

    private async getLedgerAccDelHarvestOnSignerValues() {
        const ledgerService = new LedgerService(this.currentProfile.networkType);
        const isAppSupported = await ledgerService.isAppSupported();
        if (!isAppSupported) {
            throw { errorCode: 'ledger_not_supported_app' };
        }
        const currentPath = this.currentAccount.path;
        const isOptinLedgerWallet = this.currentAccount.type === AccountType.LEDGER_OPT_IN;
        const networkType = this.currentProfile.networkType;
        const accountService = new AccountService();
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signerPublicKey = await accountService.getLedgerPublicKeyByPath(networkType, currentPath, true, isOptinLedgerWallet);
        if (signerPublicKey === this.currentAccount.publicKey.toLowerCase()) {
            const ledgerAccount = PublicAccount.createFromPublicKey(signerPublicKey.toUpperCase(), networkType);
            // - open signature modal
            const dMode = this.getDelegatedHarvestingMode(this.stagedTransactions);
            return {
                ledgerService,
                currentPath,
                isOptinLedgerWallet,
                networkType,
                accountService,
                signerPublicKey,
                ledgerAccount,
                dMode,
            };
        } else {
            throw { errorCode: 'ledger_not_correct_account' };
        }
    }

    private async ledgerAccDelHarvestOnStartOrSwap(values) {
        console.log('start or swap called');
        const { ledgerService, currentPath, isOptinLedgerWallet, ledgerAccount } = values;
        const keyLinkAggregateCompleteTransaction = this.stagedTransactions[0];
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedKeyLinkAggregateCompleteTransaction = await ledgerService.signTransaction(
            currentPath,
            keyLinkAggregateCompleteTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );

        const persistentDelegationRequestTransaction = this.stagedTransactions[1];
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedPersistentDelegationRequestTransaction = await ledgerService.signTransaction(
            currentPath,
            persistentDelegationRequestTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );
        // Announce 1, after success, storage 2
        // - notify about successful transaction announce
        this.onConfirmationSuccess();
        const services = new TransactionAnnouncerService(this.$store);
        services.announce(signedKeyLinkAggregateCompleteTransaction).subscribe((res) => {
            if (res.success) {
                const accountAddress = this.command.currentSignerHarvestingModel.accountAddress;
                this.command.saveSignedPersistentDelReqTxs(accountAddress, [signedPersistentDelegationRequestTransaction]);
                this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                    accountAddress,
                    isPersistentDelReqSent: false,
                });

                this.$store.dispatch('harvesting/UPDATE_ACCOUNT_SELECTED_HARVESTING_NODE', {
                    accountAddress,
                    selectedHarvestingNode: this.command.formItems.nodeModel,
                });
            }
        });
        this.show = false;
    }

    private async ledgerAccDelHarvestKeyOnStop(values) {
        const { ledgerService, currentPath, isOptinLedgerWallet, ledgerAccount } = values;
        const keyUnLinkAggregateCompleteTransaction = this.stagedTransactions[0];
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedKeyUnLinkAggregateCompleteTransaction = await ledgerService.signTransaction(
            currentPath,
            keyUnLinkAggregateCompleteTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );
        // - notify about successful transaction announce
        this.onConfirmationSuccess();
        const services = new TransactionAnnouncerService(this.$store);
        services.announce(signedKeyUnLinkAggregateCompleteTransaction).subscribe((res) => {
            if (res.success) {
                const accountAddress = this.command.currentSignerHarvestingModel.accountAddress;
                // @ts-ignore
                if (!!res.transaction?.innerTransactions) {
                    // @ts-ignore
                    res.transaction?.innerTransactions.forEach((val) => {
                        if (val.type === TransactionType.ACCOUNT_KEY_LINK && this.command.remotePrivateKeyTemp) {
                            val.linkAction === LinkAction.Link
                                ? this.command.saveRemoteKey(
                                      accountAddress,
                                      Crypto.encrypt(this.command.remotePrivateKeyTemp, this.command.password),
                                  )
                                : this.command.saveRemoteKey(accountAddress, null);
                        }
                        if (val.type === TransactionType.VRF_KEY_LINK && this.command.vrfPrivateKeyTemp) {
                            val.linkAction == LinkAction.Link
                                ? this.command.saveVrfKey(
                                      accountAddress,
                                      Crypto.encrypt(this.command.vrfPrivateKeyTemp, this.command.password),
                                  )
                                : this.command.saveVrfKey(accountAddress, null);
                        }
                        if (val.type === TransactionType.NODE_KEY_LINK) {
                            this.$store.dispatch('harvesting/SET_POLLING_TRIALS', 1);
                            this.command.updateHarvestingRequestStatus(accountAddress, false);
                        }
                        this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                            accountAddress,
                            isPersistentDelReqSent: false,
                        });
                    });
                } else {
                    if (res.transaction.type === TransactionType.ACCOUNT_KEY_LINK) {
                        // @ts-ignore

                        res.transaction.linkAction === LinkAction.Link && this.command.remotePrivateKeyTemp
                            ? this.command.saveRemoteKey(
                                  accountAddress,
                                  Crypto.encrypt(this.command.remotePrivateKeyTemp, this.command.password),
                              )
                            : this.command.saveRemoteKey(accountAddress, null);
                    }
                    if (res.transaction.type === TransactionType.VRF_KEY_LINK) {
                        // @ts-ignore
                        res.transaction.linkAction == LinkAction.Link && this.command.vrfPrivateKeyTemp
                            ? this.command.saveVrfKey(accountAddress, Crypto.encrypt(this.command.vrfPrivateKeyTemp, this.command.password))
                            : this.command.saveVrfKey(accountAddress, null);
                    }
                    if (res.transaction.type === TransactionType.NODE_KEY_LINK) {
                        this.$store.dispatch('harvesting/SET_POLLING_TRIALS', 1);
                        this.command.updateHarvestingRequestStatus(accountAddress, false);
                    }
                    if (res.transaction.type === TransactionType.TRANSFER) {
                        this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                            accountAddress,
                            isPersistentDelReqSent: true,
                        });
                    } else {
                        this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                            accountAddress,
                            isPersistentDelReqSent: false,
                        });
                    }
                }

                this.$store.dispatch('harvesting/UPDATE_ACCOUNT_SELECTED_HARVESTING_NODE', {
                    accountAddress,
                    selectedHarvestingNode: this.command.formItems.nodeModel,
                });
            }
        });
        this.show = false;
    }

    private async ledgerAccMultisigDelHarvestOnStartOrSwap(values) {
        const { ledgerService, currentPath, isOptinLedgerWallet, ledgerAccount } = values;

        const lockFundsKeyLinkAggregateBondedTransaction = this.stagedTransactions[0];
        const keyLinkAggregateBondedTransaction = this.stagedTransactions[1];

        const lockFundsPersistentDelegationRequestAggregateBondedTransaction = this.stagedTransactions[2];
        const persistentDelegationRequestAggregateBondedTransaction = this.stagedTransactions[3];

        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedKeyLinkAggregateBondedTransaction = await ledgerService.signTransaction(
            currentPath,
            keyLinkAggregateBondedTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );

        Object.assign(lockFundsKeyLinkAggregateBondedTransaction, {
            hash: signedKeyLinkAggregateBondedTransaction.hash,
        });
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedLockFundsKeyLinkAggregateBondedTransaction = await ledgerService.signTransaction(
            currentPath,
            lockFundsKeyLinkAggregateBondedTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );

        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedPersistentDelegationRequestAggregateBondedTransaction = await ledgerService.signTransaction(
            currentPath,
            persistentDelegationRequestAggregateBondedTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );

        Object.assign(lockFundsPersistentDelegationRequestAggregateBondedTransaction, {
            hash: signedPersistentDelegationRequestAggregateBondedTransaction.hash,
        });
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedLockFundsPersistentDelegationRequestAggregateBondedTransaction = await ledgerService.signTransaction(
            currentPath,
            lockFundsPersistentDelegationRequestAggregateBondedTransaction,
            this.generationHash,
            ledgerAccount.publicKey,
            isOptinLedgerWallet,
        );

        const signedKeyLinkTransactions: Observable<SignedTransaction>[] = [
            of(signedLockFundsKeyLinkAggregateBondedTransaction),
            of(signedKeyLinkAggregateBondedTransaction),
        ];
        // - notify about successful transaction announce
        this.onConfirmationSuccess();
        const service = new TransactionAnnouncerService(this.$store);
        this.command.announceHashAndAggregateBonded(service, signedKeyLinkTransactions).subscribe((res) => {
            if (res.success) {
                const accountAddress = this.command.currentSignerHarvestingModel.accountAddress;
                this.command.saveSignedPersistentDelReqTxs(accountAddress, [
                    signedLockFundsPersistentDelegationRequestAggregateBondedTransaction,
                    signedPersistentDelegationRequestAggregateBondedTransaction,
                ]);
                this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                    accountAddress,
                    isPersistentDelReqSent: false,
                });
                this.$store.dispatch('harvesting/UPDATE_ACCOUNT_SELECTED_HARVESTING_NODE', {
                    accountAddress,
                    selectedHarvestingNode: this.command.formItems.nodeModel,
                });
            }
        });
        this.show = false;
    }

    private async ledgerAccMultisigDelHarvestKeyOnStop(values) {
        const { ledgerService, currentPath, ledgerAccount } = values;

        const lockFundsKeyUnLinkAggregateBondedTransaction = this.stagedTransactions[0];
        const keyUnLinkAggregateBondedTransaction = this.stagedTransactions[1];

        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedKeyUnLinkAggregateBondedTransaction = await ledgerService
            .signTransaction(currentPath, keyUnLinkAggregateBondedTransaction, this.generationHash, ledgerAccount.publicKey)
            .then((res) => res);

        Object.assign(lockFundsKeyUnLinkAggregateBondedTransaction, {
            hash: signedKeyUnLinkAggregateBondedTransaction.hash,
        });
        this.$store.dispatch('notification/ADD_SUCCESS', 'verify_device_information');
        const signedLockFundsKeyUnLinkAggregateBondedTransaction = await ledgerService
            .signTransaction(currentPath, lockFundsKeyUnLinkAggregateBondedTransaction, this.generationHash, ledgerAccount.publicKey)
            .then((res) => res);

        const signedKeyLinkTransactions: Observable<SignedTransaction>[] = [
            of(signedLockFundsKeyUnLinkAggregateBondedTransaction),
            of(signedKeyUnLinkAggregateBondedTransaction),
        ];
        // - notify about successful transaction announce
        this.onConfirmationSuccess();
        const service = new TransactionAnnouncerService(this.$store);
        this.command.announceHashAndAggregateBonded(service, signedKeyLinkTransactions).subscribe((res) => {
            if (res.success) {
                const accountAddress = this.command.currentSignerHarvestingModel.accountAddress;
                if (!!res.transaction?.innerTransactions) {
                    // @ts-ignore
                    res.transaction?.innerTransactions.forEach((val) => {
                        if (val.type === TransactionType.ACCOUNT_KEY_LINK) {
                            val.linkAction === LinkAction.Link && this.command.remotePrivateKeyTemp
                                ? this.command.saveRemoteKey(
                                      accountAddress,
                                      Crypto.encrypt(this.command.remotePrivateKeyTemp, this.command.password),
                                  )
                                : this.command.saveRemoteKey(accountAddress, null);
                        }
                        if (val.type === TransactionType.VRF_KEY_LINK) {
                            val.linkAction === LinkAction.Link && this.command.vrfPrivateKeyTemp
                                ? this.command.saveVrfKey(
                                      accountAddress,
                                      Crypto.encrypt(this.command.vrfPrivateKeyTemp, this.command.password),
                                  )
                                : this.command.saveVrfKey(accountAddress, null);
                        }
                        if (val.type === TransactionType.TRANSFER) {
                            this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                                accountAddress,
                                isPersistentDelReqSent: true,
                            });
                        }
                    });
                }
                if (!res.transaction?.innerTransactions.some((val) => val.type === TransactionType.TRANSFER)) {
                    this.$store.dispatch('harvesting/UPDATE_ACCOUNT_IS_PERSISTENT_DEL_REQ_SENT', {
                        accountAddress,
                        isPersistentDelReqSent: false,
                    });
                }
                this.$store.dispatch('harvesting/UPDATE_ACCOUNT_SELECTED_HARVESTING_NODE', {
                    accountAddress,
                    selectedHarvestingNode: this.command.formItems.nodeModel,
                });
            }
        });
        this.show = false;
    }

    private async ledgerAccDelegatedHarvesting(): Promise<void> {
        const values = await this.getLedgerAccDelHarvestOnSignerValues();
        if (values.dMode === LedgerHarvestingMode.DELEGATED_HARVESTING_START_OR_SWAP) {
            await this.ledgerAccDelHarvestOnStartOrSwap(values);
        } else if (values.dMode === LedgerHarvestingMode.DELEGATED_HARVESTING_STOP) {
            await this.ledgerAccDelHarvestKeyOnStop(values);
        } else if (values.dMode === LedgerHarvestingMode.MULTISIG_DELEGATED_HARVESTING_START_OR_SWAP) {
            await this.ledgerAccMultisigDelHarvestOnStartOrSwap(values);
        } else if (values.dMode === LedgerHarvestingMode.MULTISIG_DELEGATED_HARVESTING_STOP) {
            await this.ledgerAccMultisigDelHarvestKeyOnStop(values);
        }
    }
    // --> Delegated harvesting

    /**
     * Hook called when child component FormProfileUnlock emits
     * the 'success' event.
     *
     * This hook shall *sign transactions* with the \a account
     * that has been unlocked. Subsequently it will also announce
     * the signed transaction.
     *
     */
    public async onSigner(transactionSigner: TransactionSigner): Promise<void> {
        // - log about unlock success
        // - get transaction stage config

        if (
            AccountType.SEED === this.currentAccount.type ||
            AccountType.PRIVATE_KEY === this.currentAccount.type ||
            AccountType.OPT_IN === this.currentAccount.type ||
            AccountType.KEYSTORE === this.currentAccount.type
        ) {
            if (this.isOfflineMode) {
                const signedTransactions = await this.command
                    .sign(new TransactionAnnouncerService(this.$store), transactionSigner)
                    .toPromise();
                signedTransactions.forEach((signedTransactionObs) => {
                    signedTransactionObs.subscribe((signedTransaction) => {
                        this.$emit('transaction-signed', signedTransaction);
                    });
                });
            } else {
                const announcements = await this.command
                    .announce(new TransactionAnnouncerService(this.$store), transactionSigner)
                    .toPromise();
                announcements.forEach((announcement) => {
                    announcement.subscribe((res) => {
                        if (!res.success) {
                            this.errorNotificationHandler(res.error);
                        }
                    });
                });
            }
            // - notify about successful transaction announce
            this.onConfirmationSuccess();
            this.show = false;
        } else {
            try {
                if (!this.delegated) {
                    await this.ledgerAccountOnSigner();
                } else {
                    await this.ledgerAccDelegatedHarvesting();
                }
            } catch (error) {
                this.show = false;
                this.errorNotificationHandler(error);
            }
        }
    }

    /**
     * Hook called when child component FormProfileUnlock or
     * HardwareConfirmationButton emit the 'error' event.
     * @param {string} message
     * @return {void}
     */
    public onError(error: string) {
        this.$emit('error', error);
    }
    public onConfirmationSuccess() {
        this.$store.dispatch('notification/ADD_SUCCESS', 'success_transactions_signed');
        this.$emit('success');
    }
}
