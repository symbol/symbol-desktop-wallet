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
import { AggregateTransaction, Transaction } from 'symbol-sdk'

// child components
// @ts-ignore
import DetailView from './DetailView.vue'
// @ts-ignore
import TransactionDetailsHeader from '@/components/TransactionDetailsHeader/TransactionDetailsHeader.vue'
import { TransactionViewFactory } from '@/core/transactions/TransactionViewFactory'
import { TransactionView } from '@/core/transactions/TransactionView'

//@ts-ignore
@Component({
  components: { DetailView, TransactionDetailsHeader },
})
export class TransactionDetailsTs extends Vue {
  /**
   * Transaction to render
   * @type {Transaction}
   */
  @Prop({ default: null }) transaction: Transaction

  /**
   * Set if the transaction type is aggregate
   * @var {AggregateTransaction}
   */
  aggregateTransaction: AggregateTransaction = null

  public get views(): TransactionView<Transaction>[] {
    if (!this.transaction) return []

    if (this.aggregateTransaction) {
      return [
        this.getView(this.aggregateTransaction),
        ...this.aggregateTransaction.innerTransactions.map((tx) => this.getView(tx)),
      ]
    }
    return [this.getView(this.transaction)]
  }

  @Watch('transaction', { immediate: true })
  public async refreshAggregateTransaction() {
    if (this.transaction instanceof AggregateTransaction) {
      if ((this.transaction as AggregateTransaction).innerTransactions?.length > 0) {
        this.aggregateTransaction = this.transaction as AggregateTransaction
      } else if (!!this.transaction.transactionInfo) {
        this.aggregateTransaction = await this.$store.dispatch('transaction/LOAD_TRANSACTION_DETAILS', {
          group: TransactionView.getTransactionStatus(this.transaction),
          transactionHash: this.transaction.transactionInfo?.hash,
        })
      }
    }
  }

  private getView(transaction: Transaction): TransactionView<Transaction> {
    return TransactionViewFactory.getView(this.$store, transaction)
  }
}
