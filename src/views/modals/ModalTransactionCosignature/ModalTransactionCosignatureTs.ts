/**
 * Copyright 2020 NEM Foundation (https://nem.io)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Component, Prop, Vue} from 'vue-property-decorator'
import {
  Account,
  AggregateTransaction,
  AggregateTransactionCosignature,
  CosignatureSignedTransaction,
} from 'symbol-sdk'
import {mapGetters} from 'vuex'

import {AccountModel, AccountType} from '@/core/database/entities/AccountModel'
import {TransactionService} from '@/services/TransactionService'
import {BroadcastResult} from '@/core/transactions/BroadcastResult'

// child components
// @ts-ignore
import TransactionDetails from '@/components/TransactionDetails/TransactionDetails.vue'
// @ts-ignore
import FormProfileUnlock from '@/views/forms/FormProfileUnlock/FormProfileUnlock.vue'
// @ts-ignore
import HardwareConfirmationButton from '@/components/HardwareConfirmationButton/HardwareConfirmationButton.vue'

@Component({
  components: {
    TransactionDetails,
    FormProfileUnlock,
    HardwareConfirmationButton,
  },
  computed: {...mapGetters({
    currentAccount: 'account/currentAccount',
  })},
})
export class ModalTransactionCosignatureTs extends Vue {
  @Prop({
    default: false,
  }) visible: boolean

  @Prop({
    default: null,
  }) transaction: AggregateTransaction

  /**
   * Currently active account
   * @see {Store.Account}
   * @var {AccountModel}
   */
  public currentAccount: AccountModel

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
    const currentPubAccount = AccountModel.getObjects(this.currentAccount).publicAccount
    return !this.transaction.signedByAccount(currentPubAccount)
  }

  public get cosignatures(): AggregateTransactionCosignature[] {
    return this.transaction.cosignatures
  }
  /// end-region computed properties

  /**
   * Hook called when child component HardwareConfirmationButton emits
   * the 'success' event.
   *
   * This hook shall *only announce* said \a transactions
   * which were signed using a hardware device.
   *
   * @param {CosignatureSignedTransaction[]} transactions
   * @return {void}
   */
  public async onTransactionsSigned(transactions: CosignatureSignedTransaction[]) {
    const service = new TransactionService(this.$store)

    // - log about transaction signature success
    this.$store.dispatch('diagnostic/ADD_INFO', 'Co-signed ' + transactions.length + ' Transaction(s) with Hardware Wallet')

    // - broadcast signed transactions
    const results: BroadcastResult[] = await service.announceCosignatureTransactions(transactions)

    // - notify about errors
    const errors = results.filter(result => false === result.success)
    if (errors.length) {
      return errors.map(result => this.$store.dispatch('notification/ADD_ERROR', result.error))
    }

    this.$emit('success')
    this.show = false
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
  public async onAccountUnlocked({account}: {account: Account}) {
    // - log about unlock success
    this.$store.dispatch('diagnostic/ADD_INFO', 'Account ' + account.address.plain() + ' unlocked successfully.')

    // - sign cosignature transaction
    const service = new TransactionService(this.$store)
    const cosignature = service.cosignPartialTransaction(account, this.transaction)

    // - broadcast signed transactions
    const results: BroadcastResult[] = await service.announceCosignatureTransactions([cosignature])

    // - notify about errors
    const errors = results.filter(result => false === result.success)
    if (errors.length) {
      return errors.map(result => this.$store.dispatch('notification/ADD_ERROR', result.error))
    }

    this.$emit('success', account.publicAccount)
    this.show = false
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
