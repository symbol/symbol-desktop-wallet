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
import { CosignatureQR } from 'symbol-qr-library'
import { NetworkType, TransferTransaction, Address, AggregateTransaction, Transaction } from 'symbol-sdk'

import { QRCodeDetailItem } from '@/components/QRCode/QRCodeActions/TemplateQRAction/TemplateQRActionTs'
// @ts-ignore
import TemplateQRAction from '@/components/QRCode/QRCodeActions/TemplateQRAction/TemplateQRAction.vue'
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue'
// @ts-ignore
import MaxFeeSelector from '@/components/MaxFeeSelector/MaxFeeSelector.vue'
// @ts-ignore
import TransactionDetails from '@/components/TransactionDetails/TransactionDetails.vue'

@Component({
  components: { TemplateQRAction, MosaicAmountDisplay, MaxFeeSelector, TransactionDetails },
})
export default class CosignatureQRActionTs extends Vue {
  @Prop({ default: null }) readonly qrCode!: CosignatureQR

  @Prop({ default: null }) readonly onSuccess: () => void

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
        this.$t('qrcode_detail_item_type_cosignatureqr').toString(),
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

    return items
  }

  public onSubmit() {
    this.onSuccess()
    this.$router.push({
      name: 'dashboard.index',
      // @ts-ignore
      params: { transaction: this.qrCode.transaction, action: 'transaction-details' },
    })
  }
}
