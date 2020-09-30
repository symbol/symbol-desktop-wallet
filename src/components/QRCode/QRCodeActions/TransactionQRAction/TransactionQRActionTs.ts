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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { TransactionQR } from 'symbol-qr-library'
import { NetworkType, TransferTransaction, Address } from 'symbol-sdk'

import { QRCodeDetailItem } from '@/components/QRCode/QRCodeActions/TemplateQRAction/TemplateQRActionTs'
// @ts-ignore
import TemplateQRAction from '@/components/QRCode/QRCodeActions/TemplateQRAction/TemplateQRAction.vue'
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue'
// @ts-ignore
import MaxFeeSelector from '@/components/MaxFeeSelector/MaxFeeSelector.vue'
@Component({
  components: { TemplateQRAction, MosaicAmountDisplay, MaxFeeSelector },
})
export default class TransactionQRActionTs extends Vue {
  @Prop({ default: null }) readonly qrCode!: TransactionQR

  @Prop({ default: null }) readonly onSuccess: () => void

  /**
   * TransferTransaction read from QR
   */
  tran: TransferTransaction

  /**
   * Get QR Code detail items
   *
   * @returns QRCodeDetailItem[]
   */
  public get detailItems(): QRCodeDetailItem[] {
    const items: QRCodeDetailItem[] = []
    items.push(
      new QRCodeDetailItem(
        this.$t('qrcode_detail_item_type').toString(),
        this.$t('qrcode_detail_item_type_transactionqr').toString(),
        true,
      ),
    )
    items.push(
      new QRCodeDetailItem(
        this.$t('qrcode_detail_item_network_type').toString(),
        NetworkType[this.qrCode.networkType],
        true,
      ),
    )
    this.tran = (this.qrCode.transaction as unknown) as TransferTransaction
    items.push(new QRCodeDetailItem(this.$t('to').toString(), (this.tran.recipientAddress as Address).plain(), true))
    items.push(new QRCodeDetailItem(this.$t('mosaic_id').toString(), this.tran.mosaics[0].id.id.toHex(), true))
    items.push(new QRCodeDetailItem(this.$t('amount').toString(), this.tran.mosaics[0].amount.toString(), true))
    items.push(new QRCodeDetailItem(this.$t('message').toString(), this.tran.message.payload, true))
    items.push(new QRCodeDetailItem(this.$t('fee').toString(), this.tran.maxFee.toString(), true))
    return items
  }

  public onSubmit() {
    const tran = (this.qrCode.transaction as unknown) as TransferTransaction
    this.onSuccess()
    this.$router.push({
      name: 'dashboard.transfer',
      // @ts-ignore
      params: { transaction: tran, recipientAddress: (tran.recipientAddress as Address).plain() },
    })
  }
}
