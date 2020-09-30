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
import { QrcodeCapture, QrcodeDropZone, QrcodeStream } from 'vue-qrcode-reader'
import { QRCodeType } from 'symbol-qr-library'

@Component({
  components: { QrcodeCapture, QrcodeDropZone, QrcodeStream },
})
export default class UploadQRCodeTs extends Vue {
  @Prop({ default: true })
  public uploadEnabled: boolean

  @Prop({ default: true })
  public scanEnabled: boolean

  @Prop({ default: true })
  readonly showExplanation: boolean

  @Prop({ default: [QRCodeType.AddContact, QRCodeType.RequestTransaction, QRCodeType.ExportObject] })
  readonly validQrTypes!: QRCodeType[]

  @Prop({ default: 'upload_file_message' })
  readonly uploadFileMessage!: string

  /**
   * Whether scan tab is active
   */
  scanActive: boolean = false

  /**
   * Preview uploaded image data
   */
  image: string = null

  /**
   * Uploaded file name
   */
  imageFileName = ''

  /**
   * QR Code type identified
   */
  qrType: number = 0

  /**
   * Invalid qr type
   */
  invalidType: boolean = false

  public $refs!: {
    qrcodeCapture: QrcodeCapture
  }

  /**
   * Uploaded qr image decode hook
   *
   * @param json
   */
  public onDecode(json) {
    const jsonObj = JSON.parse(json)
    this.qrType = jsonObj.type
    if (this.validQrTypes.includes(this.qrType)) {
      this.$emit('uploadComplete', json)
    } else {
      this.invalidType = true
    }
  }

  /**
   * Handles Tab Click(Upload/Scan)
   * @param name of the tab clicked
   */
  public onTabClick(name) {
    this.scanActive = name === 'scan'
  }

  /**
   * Hook for handling file before upload completes
   * It intercepts the upload process and pass the file to qrcodeCapture component
   * @param file uploaded
   */
  public onBeforeUpload(file) {
    this.reset()
    const evt = {
      target: {
        files: [file],
      },
    }
    this.$refs.qrcodeCapture.onChangeInput(evt) // to pass the evt to qrcode image decoder
    this.imageFileName = file.name
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = (event) => {
      // called once readAsDataURL is completed
      this.image = event.target.result as string
    }

    return false //return false now since we have the file passed to qrcodeCapture component
  }

  private reset() {
    this.invalidType = false
  }
}
