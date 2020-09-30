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
import { Parser } from 'json2csv'
import FileSaver from 'file-saver'
import store from '@/store/index.ts'
import { TransactionViewFactory } from '@/core/transactions/TransactionViewFactory'
import { TransactionView } from '@/core/transactions/TransactionView'
import { AggregateTransaction, Transaction, TransactionType } from 'symbol-sdk'
import * as _ from 'lodash'

export class CSVHelpers {
  protected static views: TransactionView<Transaction>[] = []
  private static transactionsArray = []

  /**
   * returns object of a parsed aggregate transaction
   * @param transaction aggregate transaction
   * returns new array with parsed aggregate transaction objects
   */
  private static constructAggregateTransactionsObject(transaction: AggregateTransaction) {
    let merged = {}
    const result = {}
    this.views = [
      TransactionViewFactory.getView(store, transaction),
      ...transaction.innerTransactions.map((tx) => TransactionViewFactory.getView(store, tx)),
    ]
    this.views.forEach((value) => {
      let mergedRow = {}
      mergedRow = value.headerItems.concat(value.detailItems)
      merged = _.defaults(merged, mergedRow)
    })

    const mergedArray = Object.entries(merged)
    for (let i = 0; i < mergedArray.length; i++) {
      if (mergedArray[i][1]['key'] == 'paid_fee') {
        result[mergedArray[i][1]['key']] = mergedArray[i][1]['value'].maxFee.compact().toString()
      } else if (mergedArray[i][1]['key'] == 'transfer_target') {
        result[mergedArray[i]['key']] = mergedArray[i][1]['value'].address
      } else {
        result[mergedArray[i][1]['key']] = mergedArray[i][1]['value']
      }
    }
    return result
  }

  /**
   * Constructs transaction object
   * @param transaction a transaction
   * returns object of a parsed transaction
   */
  private static constructTransactionsObject(transaction: Transaction) {
    this.views = [TransactionViewFactory.getView(store, transaction)]
    const result = {}
    const value = this.views[0].headerItems.concat(this.views[0].detailItems)
    for (let i = 0; i < value.length; i++) {
      if (value[i].key == 'paid_fee') {
        result[value[i].key] = value[i].value.maxFee.compact().toString()
      } else if (value[i].key == 'transfer_target') {
        result[value[i].key] = value[i].value.address
      } else if (value[i].key.startsWith('Mosaic')) {
        result[value[i].key] = value[i].value.amount + ' (' + value[i].value.mosaicHex + ')'
      } else {
        result[value[i].key] = value[i].value
      }
    }
    return result
  }

  /**
   * Export to csv file
   * @param data array of parssed transactions
   * returns new array with parsed transaction objects
   */

  private static prepareTransactions(data: []): any[] {
    this.transactionsArray = []
    data.forEach((transaction) => {
      let result = {}
      if (
        transaction['type'] == TransactionType.AGGREGATE_BONDED ||
        transaction['type'] == TransactionType.AGGREGATE_COMPLETE
      ) {
        console.log(transaction)
        result = this.constructAggregateTransactionsObject(transaction)
      } else {
        result = this.constructTransactionsObject(transaction)
      }
      this.transactionsArray.push(result)
    })
    return this.transactionsArray
  }

  /**
   * Export to csv file
   * @param data The json data
   * @param filename Prefix the name of the CSV file
   */
  public static exportCSV(data: any, filename: string) {
    const json2csvParser = new Parser()
    const parsedTransactions = this.prepareTransactions(data)
    const csvData = json2csvParser.parse(parsedTransactions)
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/plain;charset=utf-8;' })
    const exportFilename = `${filename}-${Date.now()}.csv`
    return FileSaver.saveAs(blob, exportFilename)
  }
}
