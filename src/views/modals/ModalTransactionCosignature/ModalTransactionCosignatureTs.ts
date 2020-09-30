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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import {
  Account,
  AggregateTransaction,
  AggregateTransactionCosignature,
  CosignatureTransaction,
  NetworkType,
  TransactionStatus,
} from 'symbol-sdk'
import { mapGetters } from 'vuex'

import { AccountModel, AccountType } from '@/core/database/entities/AccountModel'
import {
  AccountTransactionSigner,
  TransactionAnnouncerService,
  TransactionSigner,
} from '@/services/TransactionAnnouncerService'
// child components
// @ts-ignore
import TransactionDetails from '@/components/TransactionDetails/TransactionDetails.vue'
// @ts-ignore
import FormProfileUnlock from '@/views/forms/FormProfileUnlock/FormProfileUnlock.vue'
// @ts-ignore
import HardwareConfirmationButton from '@/components/HardwareConfirmationButton/HardwareConfirmationButton.vue'
import { CosignatureQR } from 'symbol-qr-library'
// @ts-ignore
import QRCodeDisplay from '@/components/QRCode/QRCodeDisplay/QRCodeDisplay.vue'

@Component({
  components: {
    TransactionDetails,
    FormProfileUnlock,
    HardwareConfirmationButton,
    QRCodeDisplay,
  },
  computed: {
    ...mapGetters({
      currentAccount: 'account/currentAccount',
      networkType: 'network/networkType',
      generationHash: 'network/generationHash',
    }),
  },
})
export class ModalTransactionCosignatureTs extends Vue {
  @Prop({
    default: false,
  })
  visible: boolean

  @Prop({
    default: null,
  })
  transactionHash: string

  /**
   * Aggregate transaction fetched by transactionHash
   */
  transaction: AggregateTransaction = null

  /**
   * Currently active account
   * @see {Store.Account}
   * @var {AccountModel}
   */
  public currentAccount: AccountModel

  public networkType: NetworkType

  public generationHash: string

  /**
   * Whether transaction has expired
   */
  public expired: boolean = false

  /// region computed properties
  /**
   * Visibility state
   * @type {boolean}
   */
  public get show(): boolean {
    return this.visible
  }

  /**
   * Emits close event
   */
  public set show(val) {
    if (!val) {
      this.$emit('close')
    }
  }

  /**
   * Returns whether current account is a hardware wallet
   * @return {boolean}
   */
  public get isUsingHardwareWallet(): boolean {
    // XXX should use "stagedTransaction.signer" to identify account
    return AccountType.TREZOR === this.currentAccount.type
  }

  public get needsCosignature(): boolean {
    //IS THIS CORRECT? Multisig accounts cannot sign?
    const currentPubAccount = AccountModel.getObjects(this.currentAccount).publicAccount
    return !this.transaction?.signedByAccount(currentPubAccount)
  }

  public get cosignatures(): AggregateTransactionCosignature[] {
    return this.transaction?.cosignatures
  }

  public get hasMissSignatures(): boolean {
    //merkleComponentHash ==='000000000000...' present that the transaction is still lack of signature
    return (
      this.transaction?.transactionInfo != null &&
      this.transaction?.transactionInfo.merkleComponentHash !== undefined &&
      this.transaction?.transactionInfo.merkleComponentHash.startsWith('000000000000')
    )
  }

  public get cosignatureQrCode(): CosignatureQR {
    // @ts-ignore
    return new CosignatureQR(this.transaction, this.networkType, this.generationHash)
  }

  @Watch('transactionHash', { immediate: true })
  public async fetchTransaction() {
    try {
      // first get the last status
      const transactionStatus: TransactionStatus = (await this.$store.dispatch('transaction/FETCH_TRANSACTION_STATUS', {
        transactionHash: this.transactionHash,
      })) as TransactionStatus

      if (transactionStatus.group != 'failed') {
        // fetch the transaction by using the status
        this.transaction = (await this.$store.dispatch('transaction/LOAD_TRANSACTION_DETAILS', {
          group: transactionStatus.group,
          transactionHash: this.transactionHash,
        })) as AggregateTransaction
      } else {
        this.expired = true
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Hook called when child component FormProfileUnlock emits
   * the 'success' event.
   *
   * This hook shall *sign transactions* with the \a account
   * that has been unlocked. Subsequently it will also announce
   * the signed transaction.
   *
   * @param {Password} password
   * @return {void}
   */
  public onAccountUnlocked({ account }: { account: Account }) {
    // - log about unlock success
    this.$store.dispatch('diagnostic/ADD_INFO', 'Account ' + account.address.plain() + ' unlocked successfully.')
    return this.onSigner(new AccountTransactionSigner(account))
  }

  public async onSigner(transactionSigner: TransactionSigner) {
    // - sign cosignature transaction
    const cosignature = CosignatureTransaction.create(this.transaction)
    const signCosignatureTransaction = await transactionSigner.signCosignatureTransaction(cosignature).toPromise()
    const res = await new TransactionAnnouncerService(this.$store)
      .announceAggregateBondedCosignature(signCosignatureTransaction)
      .toPromise()
    if (res.success) {
      this.$emit('success')
      this.show = false
    } else {
      this.$store.dispatch('notification/ADD_ERROR', res.error, { root: true })
    }
  }

  /**
   * Hook called when child component FormProfileUnlock or
   * HardwareConfirmationButton emit the 'error' event.
   * @param {string} message
   * @return {void}
   */
  public onError(error: string) {
    this.$emit('error', error)
  }
}
