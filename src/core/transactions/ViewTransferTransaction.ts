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
import { TransferTransaction } from 'symbol-sdk'
// internal dependencies
import { TransactionView } from './TransactionView'
import { AttachedMosaic } from '@/services/MosaicService'
import i18n from '@/language'
import { TransactionDetailItem } from '@/core/transactions/TransactionDetailItem'
import { MosaicService } from '@/services/MosaicService'
import { MosaicModel } from '@/core/database/entities/MosaicModel'

export class ViewTransferTransaction extends TransactionView<TransferTransaction> {
  public get isIncoming() {
    const currentSignerAddress = this.$store.getters['account/currentSignerAddress']
    return (
      this.transaction.recipientAddress &&
      currentSignerAddress &&
      this.transaction.recipientAddress.equals(currentSignerAddress)
    )
  }

  /**
   * Displayed sender
   * @var {string}
   */
  private get sender(): string {
    if (this.transaction.signer) return this.transaction.signer.address.pretty()
    const currentSignerAddress = this.$store.getters['account/currentSignerAddress']
    return currentSignerAddress ? currentSignerAddress.pretty() : ''
  }

  /**
   * get available mosaics to check if any of them is expired
   * @var {MosaicModel[]}
   */
  private get availableMosaics(): MosaicModel[] {
    const currentHeight = this.$store.getters['network/currentHeight']
    const networkConfiguration = this.$store.getters['network/networkConfiguration']
    const balanceMosaics = this.$store.getters['mosaic/balanceMosaics']
    return balanceMosaics.filter((entry) => {
      const expiration = MosaicService.getExpiration(
        entry,
        currentHeight,
        networkConfiguration.blockGenerationTargetTime,
      )
      return expiration !== 'expired'
    })
  }

  /**
   * Displayed items
   */
  protected resolveDetailItems(): TransactionDetailItem[] {
    const transaction = this.transaction
    const attachedMosaics = transaction.mosaics.map((transactionMosaic) => {
      return {
        id: transactionMosaic.id,
        mosaicHex: transactionMosaic.id.toHex(),
        amount: transactionMosaic.amount.compact(),
      } as AttachedMosaic
    })
    const message = this.transaction.message
    const incoming = this.isIncoming
    const mosaicItems = attachedMosaics.map((mosaic, index, self) => {
      const color = incoming ? 'green' : 'red'
      const mosaicLabel = i18n.t('mosaic')
      // check if mosaic not expired yet
      return this.availableMosaics.some((entry) => entry.mosaicIdHex == mosaic.mosaicHex)
        ? {
            key: `${mosaicLabel} (${index + 1}/${self.length})`,
            value: { ...mosaic, color },
            isMosaic: true,
          }
        : {
            key: `${mosaicLabel} (${index + 1}/${self.length}) ${i18n.t('mosaic_expired')}`,
            value: { ...mosaic, color },
            isMosaic: true,
          }
    })

    return [
      { key: 'sender', value: this.sender },
      { key: 'transfer_target', value: this.transaction.recipientAddress, isAddress: true },
      ...mosaicItems,
      { key: 'message', value: message.payload || '-' },
    ]
  }
}
