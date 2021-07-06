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
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue';
// @ts-ignore
import MaxFeeSelector from '@/components/MaxFeeSelector/MaxFeeSelector.vue';
// @ts-ignore
import MosaicSelector from '@/components/MosaicSelector/MosaicSelector.vue';
// @ts-ignore
import NamespaceSelector from '@/components/NamespaceSelector/NamespaceSelector.vue';
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue';
import { AccountModel } from '@/core/database/entities/AccountModel';
import { MetadataModel } from '@/core/database/entities/MetadataModel';
import { MosaicModel } from '@/core/database/entities/MosaicModel';
import { NamespaceModel } from '@/core/database/entities/NamespaceModel';
import { AddressValidator } from '@/core/validation/validators';
import { MosaicService } from '@/services/MosaicService';
import { TransactionCommandMode } from '@/services/TransactionCommand';
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase';
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue';
import { Address, MetadataType, PublicAccount, RepositoryFactory, Transaction } from 'symbol-sdk';
// child components
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        ValidationObserver,
        ValidationProvider,
        ErrorTooltip,
        MaxFeeSelector,
        MosaicSelector,
        NamespaceSelector,
        MaxFeeAndSubmit,
        FormWrapper,
        FormRow,
        ModalTransactionConfirmation,
        SignerSelector,
    },
    computed: {
        ...mapGetters({
            knownAccounts: 'account/knownAccounts',
            ownedMosaics: 'mosaic/ownedMosaics',
            ownedNamespaces: 'namespace/ownedNamespaces',
            repositoryFactory: 'network/repositoryFactory',
            metadataTransactions: 'metadata/transactions',
            currentHeight: 'network/currentHeight',
        }),
    },
})
export class FormMetadataCreationTs extends FormTransactionBase {
    /**
     * Metadata type
     * @type {MetadataType}
     */
    @Prop({
        default: MetadataType.Account,
        required: true,
    })
    protected type: MetadataType;
    /**
     * update/edit check
     * @type {boolean}
     */
    @Prop({
        default: false,
    })
    public editMode: boolean;
    /**
     * Value for saved metadata
     * @type {MetadataModel}
     */
    @Prop({
        default: null,
    })
    public value: MetadataModel;
    /**
     * Value for mosaic and namespace selectboxes
     * @type {MetadataModel}
     */
    @Prop({
        default: null,
    })
    public metadataList: MetadataModel[];

    /**
     * chosen metaKeyValue
     * @type {MetadataModel}
     */
    protected chosenKeyValue: string = '';
    /**
     * Metadata type
     */
    protected MetadataType = MetadataType;

    /**
     * Repository factory for metadata transaction service
     */
    protected repositoryFactory: RepositoryFactory;

    /**
     * metadata transactions
     */
    protected metadataTransactions: Transaction[];

    private currentHeight: number;
    /**
     * Form fields
     * @var {Object}
     */
    public formItems = {
        signerAddress: '',
        targetAccount: '',
        targetId: '',
        targetName: '',
        metadataValue: '',
        scopedKey: '',
        maxFee: 0,
    };

    /**
     * Known accounts
     * @protected
     * @var {AccountModel[]}
     */
    protected knownAccounts: AccountModel[];

    /**
     * Current account owned mosaics
     * @protected
     * @type {MosaicModel[]}
     */
    protected ownedMosaics: MosaicModel[];

    /**
     * Current account owned namespaces
     * @protected
     * @type {NamespaceModel[]}
     */
    protected ownedNamespaces: NamespaceModel[];

    /**
     * Wheter target account is visible and editable
     */
    protected showTargetAccount = true;

    /**
     * Mosaic check
     * @return {boolean}
     */
    protected isMosaic(): boolean {
        return this.type === MetadataType.Mosaic;
    }

    /**
     * Reset the form with properties
     * @return {void}
     */
    protected resetForm() {
        this.formItems.signerAddress = this.selectedSigner ? this.selectedSigner.address.plain() : this.currentAccount.address;

        // - set default form values
        this.formItems.metadataValue = '';
        this.formItems.scopedKey = '';

        // - maxFee must be absolute
        this.formItems.maxFee = this.defaultFee;
        // for mosaics and namespaces, target account will be the signer account's itself (as hidden)
        if (this.type !== MetadataType.Account) {
            this.formItems.targetAccount = this.formItems.signerAddress;
            this.showTargetAccount = false;
        }
    }

    /**
     * get transaction command mode
     * @override
     * @see {FormTransactionBase}
     * @param transactions
     */
    protected getTransactionCommandMode(): TransactionCommandMode {
        const target = this.getTargetAddress().plain();
        if (this.selectedSigner.multisig) {
            return TransactionCommandMode.MULTISIGN;
        } else if (this.formItems.signerAddress === target) {
            return TransactionCommandMode.AGGREGATE;
        } else if (this.isMultisigAccount) {
            // multisig mode
        } else {
            return TransactionCommandMode.MULTISIGN;
        }
    }
    /**
     * number of required cosignatures for the tx
     * @override
     * @see {FormTransactionBase}
     */
    protected get requiredCosignatures(): number {
        if (!this.selectedSigner.multisig && this.formItems.signerAddress !== this.getTargetAddress().plain()) {
            return 1;
        }
        return this.currentSignerMultisigInfo ? this.currentSignerMultisigInfo.minApproval : this.selectedSigner.requiredCosignatures;
    }

    /**
     * get transactions
     * @see {FormTransactionBase}
     */
    public getTransactions() {
        return this.metadataTransactions;
    }

    /**
     * @override
     * @see {FormTransactionBase}
     */
    public async onSubmit() {
        await this.persistFormState();

        // - open signature modal
        this.command = this.createTransactionCommand();
        this.onShowConfirmationModal();
    }

    /**
     * Target account or public key label depends on MetadataType
     * @param {void}
     * @returns {string}
     */
    get targetLabel(): string {
        let title: string = '';
        switch (this.type) {
            case MetadataType.Mosaic:
                title = 'form_label_target_mosaic_id';
                break;

            case MetadataType.Namespace:
                title = 'form_label_target_namespace_id';
                break;
        }
        return title;
    }

    /**
     * Target id validator name
     * @return {string}
     */
    get targetIdValidatorName(): string {
        return this.isMosaic() ? 'mosaic_id' : 'namespace_id';
    }

    private get availableMosaics(): MosaicModel[] {
        return this.ownedMosaics.filter((entry) => {
            const expiration = MosaicService.getExpiration(entry, this.currentHeight, this.networkConfiguration.blockGenerationTargetTime);
            return expiration !== 'expired';
        });
    }

    get ownedTargetHexIds(): string[] {
        return this.type === MetadataType.Namespace
            ? this.ownedNamespaces.map(({ namespaceIdHex }) => namespaceIdHex)
            : this.availableMosaics
                  .filter(({ ownerRawPlain }) => ownerRawPlain === this.currentSignerAddress.plain())
                  .map(({ mosaicIdHex }) => mosaicIdHex);
    }

    private async persistFormState() {
        const targetAddress: Address = this.getTargetAddress();
        const metadataForm: {
            targetAddress: Address;
            scopedKey: string;
            metadataValue: string;
            targetId: string;
            maxFee: number;
        } = {
            targetAddress,
            scopedKey: this.formItems.scopedKey,
            metadataValue: this.formItems.metadataValue,
            targetId: this.formItems.targetId,
            maxFee: this.formItems.maxFee,
        };

        await this.$store.dispatch('metadata/SET_METADATA_FORM_STATE', metadataForm);
        await this.$store.dispatch('metadata/RESOLVE_METADATA_TRANSACTIONS', this.type);
    }

    private getTargetAddress(): Address {
        let targetAddress: Address;
        if (AddressValidator.validate(this.formItems.targetAccount)) {
            targetAddress = Address.createFromRawAddress(this.formItems.targetAccount);
        } else {
            const targetPublicAccount = PublicAccount.createFromPublicKey(this.formItems.targetAccount, this.networkType);
            targetAddress = targetPublicAccount.address;
        }

        return targetAddress;
    }

    /**
     * Whether form has any changes
     * @readonly
     * @return {boolean}
     */
    public get hasFormAnyChanges(): boolean {
        return (
            this.formItems.signerAddress.length > 0 ||
            this.formItems.targetAccount.length > 0 ||
            this.formItems.metadataValue.length > 0 ||
            this.formItems.scopedKey.length > 0
        );
    }

    /**
     * Get targeted mosaic or namespace name
     */
    public targetNameById(targetId: string): string {
        if (!targetId) {
            return '';
        }

        if (this.isMosaic()) {
            const targetMosaic = this.ownedMosaics.find((mosaic) => mosaic.mosaicIdHex === targetId);
            return targetMosaic?.name;
        } else {
            const targetNamespace = this.ownedNamespaces.find((namespace) => namespace.namespaceIdHex === targetId);
            return targetNamespace?.name;
        }
    }

    set chosenValue(newValue: string) {
        this.chosenKeyValue = newValue;
        const currentItem = this.metadataList.find((item) => item.metadataId === this.chosenKeyValue);
        this.updateFormItems(currentItem);
    }

    get chosenValue(): string {
        return this.chosenKeyValue;
    }

    private updateFormItems(selectedItem: MetadataModel) {
        if (selectedItem) {
            this.formItems.signerAddress = selectedItem.sourceAddress;
            this.formItems.targetAccount = selectedItem.targetAddress;
            this.formItems.targetName = this.targetNameById(selectedItem.targetId);
            this.formItems.targetId = this.type === MetadataType.Mosaic ? selectedItem.targetId : this.formItems.targetName;
            this.formItems.metadataValue = selectedItem.value;
            this.formItems.scopedKey = selectedItem.scopedMetadataKey;
        }
    }

    mounted() {
        if (this.editMode && this.value) {
            this.updateFormItems(this.value);
        }
    }
}
