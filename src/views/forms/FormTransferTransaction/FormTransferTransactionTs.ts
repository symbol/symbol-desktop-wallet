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
import {
  Address,
  Deadline,
  Message,
  Mosaic,
  MosaicId,
  NamespaceId,
  PlainMessage,
  RawUInt64,
  Transaction,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
// internal dependencies
import { Formatters } from '@/core/utils/Formatters'
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase'
import { AddressValidator, AliasValidator } from '@/core/validation/validators'
import { MosaicInputsManager } from './MosaicInputsManager'
import { ITransactionEntry } from '@/views/pages/dashboard/invoice/DashboardInvoicePageTs'
// child components
import { ValidationObserver } from 'vee-validate'
// @ts-ignore
import AmountInput from '@/components/AmountInput/AmountInput.vue'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import MessageInput from '@/components/MessageInput/MessageInput.vue'
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue'
// @ts-ignore
import MosaicAttachmentInput from '@/components/MosaicAttachmentInput/MosaicAttachmentInput.vue'
// @ts-ignore
import MosaicSelector from '@/components/MosaicSelector/MosaicSelector.vue'
// @ts-ignore
import RecipientInput from '@/components/RecipientInput/RecipientInput.vue'
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue'
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue'
// @ts-ignore
import ModalTransactionUriImport from '@/views/modals/ModalTransactionUriImport/ModalTransactionUriImport.vue'
// @ts-ignore
import TransactionUriDisplay from '@/components/TransactionUri/TransactionUriDisplay/TransactionUriDisplay.vue'

// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'
import { MosaicService } from '@/services/MosaicService'
import { MosaicModel } from '@/core/database/entities/MosaicModel'
import { FilterHelpers } from '@/core/utils/FilterHelpers'

export interface MosaicAttachment {
  mosaicHex: string
  amount: number // Relative amount
  id?: MosaicId
  name?: string
  uid?: number
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
  },
  computed: {
    ...mapGetters({
      currentHeight: 'network/currentHeight',
      balanceMosaics: 'mosaic/balanceMosaics',
    }),
  },
})
export class FormTransferTransactionTs extends FormTransactionBase {
  @Prop({
    default: null,
  })
  recipient: Address

  @Prop({
    default: null,
  })
  message: Message

  @Prop({
    default: false,
  })
  disableSubmit: boolean

  @Prop({
    default: false,
  })
  hideSigner: boolean

  @Prop({
    default: false,
  })
  showTransactionActions: boolean

  /// end-region component properties

  /**
   * Formatters helpers
   * @var {Formatters}
   */
  public formatters = Formatters

  /**
   * Form items
   * @var {any}
   */
  public formItems = {
    signerAddress: '',
    attachedMosaics: [],
    recipientRaw: '',
    recipient: null,
    selectedMosaicHex: '',
    relativeAmount: 0,
    messagePlain: '',
    maxFee: 0,
  }

  public currentHeight: number

  protected mosaicInputsManager

  private balanceMosaics: MosaicModel[]

  /**
   * Whether ModalTransactionUriImport is visible
   */
  private isImportTransactionUriModalVisible = false

  /**
   * Transaction imported via transaction URI
   */
  private importedTransaction: Transaction

  /**
   * Holds the just in time transactions
   */
  public transactions: TransferTransaction[] = []

  /**
   * Reset the form with properties
   * @return {void}
   */
  protected resetForm() {
    // - reset attached mosaics
    this.formItems.attachedMosaics = []

    // - set default form values
    this.formItems.signerAddress = this.selectedSigner
      ? this.selectedSigner.address.plain()
      : this.currentAccount.address
    this.formItems.selectedMosaicHex = this.networkMosaic.toHex()
    // default currentAccount Address to recipientRaw
    if (this.$route.path.indexOf('invoice') > -1) {
      this.formItems.recipientRaw = this.currentAccount.address || ''
    } else {
      this.formItems.recipientRaw = !!this.recipient ? this.recipient.plain() : ''
    }
    this.formItems.recipient = !!this.recipient ? this.recipient : null

    const currentMosaics = this.currentMosaicList()

    const attachedMosaics: MosaicAttachment[] = [
      {
        id: new MosaicId(this.networkCurrency.mosaicIdHex),
        mosaicHex: this.networkCurrency.mosaicIdHex,
        name: this.networkCurrency.namespaceIdFullname,
        amount: 0,
        uid: Math.floor(Math.random() * 10e6), // used to index dynamic inputs
      },
    ]

    this.formItems.messagePlain = this.message ? Formatters.hexToUtf8(this.message.payload) : ''
    // - maxFee must be absolute
    this.formItems.maxFee = this.defaultFee
    // - initialize mosaics input manager
    this.mosaicInputsManager = MosaicInputsManager.initialize(currentMosaics)

    // transaction details passed via router
    if (this.$route.params.transaction || this.importedTransaction) {
      // @ts-ignore
      this.setTransactions([!!this.importedTransaction ? this.importedTransaction : this.$route.params.transaction])
      Vue.nextTick(() => {
        this.formItems.attachedMosaics.forEach((attachedMosaic, index) => {
          this.mosaicInputsManager.setSlot(attachedMosaic.mosaicHex, attachedMosaic.uid)
        })
      })
    } else {
      // - set attachedMosaics and allocate slots
      Vue.nextTick(() => {
        attachedMosaics.forEach((attachedMosaic, index) => {
          this.mosaicInputsManager.setSlot(attachedMosaic.mosaicHex, attachedMosaic.uid)
          Vue.set(this.formItems.attachedMosaics, index, attachedMosaic)
        })
      })
    }
    this.triggerChange()
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
      )
      // skip if mosaic is expired
      return expiration !== 'expired'
    })
  }

  /**
   * Getter for TRANSFER transactions that will be staged
   * @see {FormTransactionBase}
   * @return {TransferTransaction[]}
   */
  protected getTransactions(): TransferTransaction[] {
    const mosaicsInfo = this.$store.getters['mosaic/mosaics'] as MosaicModel[]
    const mosaics = this.formItems.attachedMosaics
      .filter(({ uid }) => uid) // filter out null values
      .map(
        (spec: MosaicAttachment): Mosaic => {
          const info = mosaicsInfo.find((i) => i.mosaicIdHex === spec.mosaicHex)
          const div = info ? info.divisibility : 0
          // - format amount to absolute
          return new Mosaic(
            new MosaicId(RawUInt64.fromHex(spec.mosaicHex)),
            UInt64.fromUint(spec.amount * Math.pow(10, div)),
          )
        },
      )
    return [
      TransferTransaction.create(
        Deadline.create(),
        this.instantiatedRecipient,
        mosaics.length ? mosaics : [],
        PlainMessage.create(this.formItems.messagePlain || ''),
        this.networkType,
        UInt64.fromUint(this.formItems.maxFee),
      ),
    ]
  }

  /**
   * Setter for TRANSFER transactions that will be staged
   * @see {FormTransactionBase}
   * @param {TransferTransaction[]} transactions
   * @throws {Error} If not overloaded in derivate component
   */
  protected setTransactions(transactions: TransferTransaction[]) {
    // - this form creates only 1 transaction
    const transaction = transactions.shift()

    // - populate recipient
    this.formItems.recipientRaw =
      transaction.recipientAddress instanceof NamespaceId
        ? transaction.recipientAddress.fullName
        : transaction.recipientAddress.plain()

    // - populate attached mosaics
    this.formItems.attachedMosaics = this.mosaicsToAttachments(transaction.mosaics)

    // - populate message
    this.formItems.messagePlain = transaction.message.payload

    // - populate maxFee
    this.formItems.maxFee = transaction.maxFee.compact()
  }

  /// region computed properties getter/setter
  /**
   * Recipient used in the transaction
   * @readonly
   * @protected
   * @type {(Address | NamespaceId)}
   */
  protected get instantiatedRecipient(): Address | NamespaceId {
    const { recipientRaw } = this.formItems
    if (AddressValidator.validate(recipientRaw)) {
      return Address.createFromRawAddress(recipientRaw)
    } else if (AliasValidator.validate(recipientRaw)) {
      return new NamespaceId(recipientRaw)
    } else {
      return null
    }
  }

  /// end-region computed properties getter/setter

  /**
   * Hook called when the child component MosaicAttachmentDisplay triggers
   * the event 'delete'
   * @return {void}
   */
  public onDeleteMosaic(id: MosaicId) {
    const updatedAttachedMosaics = [...this.formItems.attachedMosaics].filter(
      ({ mosaicHex }) => mosaicHex !== id.toHex(),
    )

    // fixes reactivity on attachedMosaics (observer resolution)
    Vue.set(this.formItems, 'attachedMosaics', updatedAttachedMosaics)
  }

  /**
   * Hook called when the child component ButtonAdd triggers
   * the event 'click'
   * @return {void}
   */
  protected onMosaicInputChange(payload: { mosaicAttachment: MosaicAttachment; inputIndex: number }): void {
    const { mosaicAttachment, inputIndex } = payload

    // set slot
    this.mosaicInputsManager.setSlot(mosaicAttachment.mosaicHex, inputIndex)

    // update formItems
    const newAttachedMosaics = [...this.formItems.attachedMosaics]
    const indexToUpdate = newAttachedMosaics.findIndex(({ uid }) => uid == inputIndex)
    newAttachedMosaics[indexToUpdate] = mosaicAttachment
    Vue.set(this.formItems, 'attachedMosaics', newAttachedMosaics)
    this.triggerChange()
  }

  /**
   * Handle deletion of a mosaic input
   * @protected
   * @param {number} inputIndex
   */
  protected onDeleteMosaicInput(index: number): void {
    // unset mosaic input slot
    this.mosaicInputsManager.unsetSlot(index)

    // update formItems, set input uid to null
    const indexToUpdate = this.formItems.attachedMosaics.findIndex(({ uid }) => uid == index)
    Vue.set(this.formItems.attachedMosaics, indexToUpdate, { uid: null })
    // delete the last one in order to re-render the list
    this.formItems.attachedMosaics.pop()
    this.triggerChange()
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
        const info = this.balanceMosaics.find((m) => mosaic.id.toHex() === m.mosaicIdHex)
        if (!info) {
          return null
        }
        // amount will be converted to RELATIVE
        return {
          id: new MosaicId(info.mosaicIdHex), // XXX resolve mosaicId from namespaceId
          mosaicHex: info.mosaicIdHex, // XXX resolve mosaicId from namespaceId
          name: info.name,
          amount: mosaic.amount.compact() / Math.pow(10, info.divisibility),
          uid: Math.floor(Math.random() * 10e6), // used to index dynamic inputs
        }
      })
      .filter((a) => a)
  }

  /**
   *  Hook called when adding a new mosaic attachment input
   * @protected
   */
  protected addMosaicAttachmentInput(): void {
    if (!this.mosaicInputsManager.hasFreeSlots()) {
      return
    }

    // generate id and prepare mosaic for slot
    const uid = Math.floor(Math.random() * 10e6)
    const [mosaicToAffectToNewInput] = this.mosaicInputsManager.getMosaicsBySlot(uid)

    // update inputs manager and form items
    this.mosaicInputsManager.setSlot(mosaicToAffectToNewInput, uid)
    this.formItems.attachedMosaics.push({
      mosaicHex: mosaicToAffectToNewInput,
      amount: 0,
      uid,
    })

    this.triggerChange()
  }

  /**
   * Handler when changing message
   */
  onChangeMessage() {
    this.triggerChange()
  }

  /**
   * Handler when changing recipient
   */
  onChangeRecipient() {
    // filter tags
    this.formItems.recipientRaw = FilterHelpers.stripFilter(this.formItems.recipientRaw)
    this.triggerChange()
  }

  /**
   * Handler when changing max fee
   */
  onChangeMaxFee() {
    if (this.formItems.recipientRaw && this.formItems.recipientRaw !== '') {
      this.triggerChange()
    }
  }

  triggerChange() {
    if (this.formItems.recipientRaw && this.formItems.recipientRaw !== '') {
      this.transactions = this.getTransactions()
      // avoid error
      if (this.transactions) {
        const data: ITransactionEntry[] = []
        this.transactions.map((item: TransferTransaction) => {
          data.push({
            transaction: item,
            attachments: this.mosaicsToAttachments(item.mosaics),
          })
        })

        this.$emit('onTransactionsChange', data)
      }
    } else {
      this.transactions = null
    }
  }

  /**
   * Resetting the form when choosing a multisig signer and changing multisig signer
   * Is necessary to make the mosaic inputs reactive
   */
  @Watch('selectedSigner')
  onSelectedSignerChange() {
    if (this.isMultisigMode) this.resetForm()
  }

  /**
   * ModalTransactionUriImport modal page close event handler
   */
  onImportTransactionURIModalClose() {
    this.isImportTransactionUriModalVisible = false
  }

  /**
   * Import transactionURI complete event handler
   * @param transaction transaction to be imported
   */
  onImportTransaction(transaction: Transaction) {
    this.importedTransaction = transaction
    this.resetForm()
  }
}
