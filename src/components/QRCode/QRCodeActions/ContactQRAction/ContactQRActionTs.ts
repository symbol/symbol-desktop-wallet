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
import { ContactQR } from 'symbol-qr-library'
import { NetworkType } from 'symbol-sdk'
import { QRCodeDetailItem } from '@/components/QRCode/QRCodeActions/TemplateQRAction/TemplateQRActionTs'
// @ts-ignore
import TemplateQRAction from '@/components/QRCode/QRCodeActions/TemplateQRAction/TemplateQRAction.vue'

@Component({
  components: { TemplateQRAction },
})
export default class ContactQRActionTs extends Vue {
  @Prop({ default: null }) readonly qrCode!: ContactQR

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
        this.$t('qrcode_detail_item_type_contactqr').toString(),
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

    items.push(new QRCodeDetailItem(this.$t('qrcode_detail_item_contact_name').toString(), this.qrCode.name, true))
    items.push(
      new QRCodeDetailItem(this.$t('qrcode_detail_item_address').toString(), this.qrCode.account.address.plain(), true),
    )

    return items
  }

  public onSubmit() {
    this.onSuccess()
    this.$router.push({
      name: 'dashboard.transfer',
      params: { recipientAddress: this.qrCode.account.address.plain() },
    })
  }
}
