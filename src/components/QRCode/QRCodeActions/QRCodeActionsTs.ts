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

// @ts-ignore
import QRCodeDisplay from '@/components/QRCode/QRCodeDisplay/QRCodeDisplay.vue'
// @ts-ignore
import ContactQRAction from '@/components/QRCode/QRCodeActions/ContactQRAction/ContactQRAction.vue'
// @ts-ignore
import MnemonicQRAction from '@/components/QRCode/QRCodeActions/MnemonicQRAction/MnemonicQRAction.vue'
// @ts-ignore
import TransactionQRAction from '@/components/QRCode/QRCodeActions/TransactionQRAction/TransactionQRAction.vue'
// @ts-ignore
import CosignatureQRAction from '@/components/QRCode/QRCodeActions/CosignatureQRAction/CosignatureQRAction.vue'

@Component({
  components: { QRCodeDisplay, ContactQRAction, MnemonicQRAction, TransactionQRAction, CosignatureQRAction },
})
export default class QRCodeActionsTs extends Vue {
  @Prop({ default: null }) readonly qrCode: QRCode

  @Prop({ default: true }) readonly showPreview: boolean

  @Prop({ default: null }) readonly onSuccess: () => void
}
