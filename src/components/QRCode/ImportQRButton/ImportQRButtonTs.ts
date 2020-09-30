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

import { QRCodeType } from 'symbol-qr-library'
//@ts-ignore
import ModalImportQR from '@/views/modals/ModalImportQR/ModalImportQR.vue'

@Component({
  components: { ModalImportQR },
})
export default class ImportQRButtonTs extends Vue {
  @Prop({ default: [QRCodeType.AddContact, QRCodeType.RequestTransaction] })
  readonly validQrTypes!: QRCodeType[]

  /**
   * Whether Modal is visible
   * @type boolean
   */
  private visible: boolean = false

  public onClick() {
    this.visible = true
  }

  public onClose() {
    this.visible = false
  }
}
