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
  TransferTransaction,
  UInt64,
  PersistentHarvestingDelegationMessage,
  AccountKeyLinkTransaction,
  LinkAction,
  Transaction,
  PublicAccount,
} from 'symbol-sdk'
import { Component, Prop } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

// internal dependencies
import { Formatters } from '@/core/utils/Formatters'
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase'

// child components
import { ValidationObserver } from 'vee-validate'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue'
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue'
// @ts-ignore
import MaxFeeSelector from '@/components/MaxFeeSelector/MaxFeeSelector.vue'
// @ts-ignore
import NetworkNodeSelector from '@/components/NetworkNodeSelector/NetworkNodeSelector.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'

@Component({
  components: {
    FormWrapper,
    ModalTransactionConfirmation,
    SignerSelector,
    ValidationObserver,
    MaxFeeSelector,
    FormRow,
    NetworkNodeSelector,
  },
  computed: {
    ...mapGetters({
      currentHeight: 'network/currentHeight',
    }),
  },
})
export class FormPersistentDelegationRequestTransactionTs extends FormTransactionBase {
  @Prop({ required: true }) remoteAccount: PublicAccount
  @Prop({ default: null }) signerAddress: string
  @Prop({ default: true }) withLink: boolean

  /**
   * Formatters helpers
   */
  public formatters = Formatters

  /**
   * Form items
   */
  public formItems = {
    nodePublicKey: '',
    vrfPublicKey: '',
    signerAddress: '',
    maxFee: 0,
  }

  /**
   * Reset the form with properties
   * @return {void}
   */
  protected resetForm() {
    // - set default form values
    this.formItems.signerAddress =
      this.signerAddress || (this.selectedSigner ? this.selectedSigner.address.plain() : this.currentAccount.address)
    this.formItems.nodePublicKey = ''
    this.formItems.vrfPublicKey = ''
    // - maxFee must be absolute
    this.formItems.maxFee = this.defaultFee
  }

  /**
   * Getter for PERSISTENT DELEGATION REQUEST transactions that will be staged
   * @see {FormTransactionBase}
   * @return {TransferTransaction[]}
   */
  protected getTransactions(): Transaction[] {
    const maxFee = UInt64.fromUint(this.formItems.maxFee)
    const message = PersistentHarvestingDelegationMessage.create(
      this.remoteAccount.publicKey,
      this.formItems.vrfPublicKey,
      this.formItems.nodePublicKey,
      this.networkType,
    )

    const linkTx = AccountKeyLinkTransaction.create(
      Deadline.create(),
      this.remoteAccount.publicKey,
      LinkAction.Link,
      this.networkType,
      maxFee,
    )
    const transferTx = TransferTransaction.create(
      Deadline.create(),
      this.instantiatedRecipient,
      [],
      message,
      this.networkType,
      maxFee,
    )

    if (this.withLink === true) {
      return [linkTx, transferTx]
    }

    return [transferTx]
  }

  /**
   * Setter for TRANSFER transactions that will be staged
   * @see {FormTransactionBase}
   * @throws {Error} If not overloaded in derivate component
   */
  protected setTransactions() {
    throw new Error('This transaction can not be staged')
  }

  /**
   * Recipient used in the transaction
   * @readonly
   * @protected
   * @type {Address}
   */
  protected get instantiatedRecipient(): Address {
    return Address.createFromPublicKey(this.formItems.nodePublicKey, this.networkType)
  }

  public onSubmit() {
    if (!this.formItems.nodePublicKey.length) {
      this.$refs.observer.setErrors({ endpoint: this.$t('invalid_node').toString() })
      return
    }

    // - open signature modal
    this.command = this.createTransactionCommand()
    return (this.command as unknown) as Promise<void>
  }
}
