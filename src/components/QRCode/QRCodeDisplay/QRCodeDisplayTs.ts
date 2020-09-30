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
import { QRCode } from 'symbol-qr-library'
import { of, Observable } from 'rxjs'
import { PropType } from 'vue/types/options'
import { pluck, concatMap } from 'rxjs/operators'
import { UIHelpers } from '@/core/utils/UIHelpers'
// resources
// @ts-ignore
import failureIcon from '@/views/resources/img/monitor/failure.png'

@Component({
  subscriptions() {
    const qrCodeBase64$ = this.$watchAsObservable('qrCode', {
      immediate: true,
    }).pipe(
      pluck('newValue'),
      concatMap((args) => (args instanceof QRCode ? args.toBase64() : of(failureIcon))),
    )
    return { qrCodeBase64$ }
  },
})
export default class QRCodeDisplayTs extends Vue {
  @Prop({
    default: null,
    type: Object as PropType<QRCode>,
  })
  public qrCode: QRCode

  @Prop({
    default: '',
  })
  public header: string

  @Prop({
    default: 'symbol_wallet_qrcode.png',
  })
  public downloadName: string

  @Prop({
    default: 'qr_code',
  })
  public alt: string

  @Prop({
    default: false,
  })
  public showDownload: boolean

  /**
   * base64 representation of qrcode
   * @type Obervable<string>
   */
  public qrCodeBase64$: Observable<string>

  public copyAsText() {
    UIHelpers.copyToClipboard(this.qrCode?.toJSON())
  }
}
