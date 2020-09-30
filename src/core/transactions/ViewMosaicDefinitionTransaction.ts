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
import { MosaicDefinitionTransaction, MosaicFlags, MosaicId } from 'symbol-sdk'
// internal dependencies
import { TransactionView } from './TransactionView'
import { TransactionDetailItem } from '@/core/transactions/TransactionDetailItem'
import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel'
import { TimeHelpers } from '@/core/utils/TimeHelpers'

export class ViewMosaicDefinitionTransaction extends TransactionView<MosaicDefinitionTransaction> {
  /**
   * Displayed items
   */
  protected resolveDetailItems(): TransactionDetailItem[] {
    const mosaicId: MosaicId = this.transaction.mosaicId
    const divisibility: number = this.transaction.divisibility
    const mosaicFlags: MosaicFlags = this.transaction.flags
    const duration = this.transaction.duration.toString()
    const networkConfiguration: NetworkConfigurationModel = this.$store.getters['network/networkConfiguration']
    const blockGenerationTargetTime = networkConfiguration.blockGenerationTargetTime
    return [
      { key: 'mosaic_id', value: mosaicId.toHex() },
      {
        key: 'table_header_divisibility',
        value: `${divisibility}`,
      },
      {
        key: 'duration',
        value:
          duration === '0'
            ? 'unlimited'
            : TimeHelpers.durationToRelativeTime(parseInt(duration), blockGenerationTargetTime),
      },
      {
        key: 'table_header_transferable',
        value: mosaicFlags.transferable,
      },
      {
        key: 'table_header_supply_mutable',
        value: mosaicFlags.supplyMutable,
      },
      {
        key: 'table_header_restrictable',
        value: mosaicFlags.restrictable,
      },
      {
        key: 'estimated_rental_fee',
        value: {
          amount: this.$store.getters['network/rentalFeeEstimation'].effectiveMosaicRentalFee.compact(),
          color: 'red',
        },
        isMosaic: true,
      },
    ]
  }
}
