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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { Transaction } from 'symbol-sdk'

// child components
// @ts-ignore
import FormProfileUnlock from '@/views/forms/FormProfileUnlock/FormProfileUnlock.vue'
import { CSVHelpers } from '@/core/utils/CSVHelpers'

@Component({
  components: { FormProfileUnlock },
  computed: {
    ...mapGetters({
      confirmedTransactions: 'transaction/confirmedTransactions',
      partialTransactions: 'transaction/partialTransactions',
      unconfirmedTransactions: 'transaction/unconfirmedTransactions',
    }),
  },
})
export class ModalTransactionExportTs extends Vue {
  @Prop({
    default: false,
  })
  visible: boolean

  public hasTransactionExportInfo: boolean = false

  /**
   * List of confirmed transactions (per-request)
   */
  public confirmedTransactions: Transaction[]

  /**
   * List of unconfirmed transactions (per-request)
   */
  public unconfirmedTransactions: Transaction[]

  /**
   * List of confirmed transactions (per-request)
   */
  public partialTransactions: Transaction[]

  /**
   * Visibility state
   * @type {boolean}
   */
  get show(): boolean {
    return this.visible
  }

  /**
   * Emits close event
   */
  set show(val) {
    if (!val) {
      this.$emit('close')
    }
  }

  /**
   * Hook called when the account has been unlocked
   * @return {boolean}
   */
  public onAccountUnlocked(): boolean {
    this.hasTransactionExportInfo = true
    return true
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

  /**
   * The download transactions csv
   * @return {void}
   */
  public onDownloadTx() {
    const transactions = this.getTransactions()
    CSVHelpers.exportCSV(transactions, 'transactions')
  }

  /**
   * Transactions list
   */
  private getTransactions() {
    return [...this.unconfirmedTransactions, ...this.partialTransactions, ...this.confirmedTransactions]
  }
}
