<template>
  <div class="upload-qrcode-container">
    <div class="upload-qrcode-left-pane">
      <Tabs @on-click="onTabClick">
        <TabPane
          v-if="uploadEnabled == true"
          name="upload"
          :label="$t('upload_qr_tab_upload_image')"
          icon="md-cloud-upload"
        >
          <Upload :multiple="false" action="no action" type="drag" :before-upload="onBeforeUpload">
            <div>
              <div v-if="imageFileName" class="upload-qrcode-preview">
                <div>
                  <img :src="image" />
                  <span>{{ imageFileName }}</span>
                </div>
              </div>

              <Icon v-if="!imageFileName" type="ios-cloud-upload"></Icon>
              <p>{{ $t(uploadFileMessage) }}</p>
            </div>
          </Upload>
          <qrcode-capture
            id="qrcodeCapture"
            ref="qrcodeCapture"
            name="qrcodeCapture"
            style="visibility: hidden;"
            @decode="onDecode"
          />
        </TabPane>
        <TabPane v-if="scanEnabled == true" name="scan" :label="$t('upload_qr_tab_scan')" icon="md-camera">
          <qrcode-stream v-if="scanActive" @decode="onDecode"></qrcode-stream>
        </TabPane>
      </Tabs>
    </div>
    <div v-if="showExplanation" class="upload-qrcode-right-pane">
      <div class="upload-qrcode-explanation">
        <span>{{ $t('upload_qr_code_explanation') }}</span>
      </div>
      <div class="upload-qrcode-valid-qrcodes">
        <ul>
          <li v-if="validQrTypes.includes(1)" :class="qrType == 1 ? 'selected' : ''">
            {{ $t('upload_qr_code_explanation_type_contactqr') }}
          </li>
          <li v-if="validQrTypes.includes(3)" :class="qrType == 3 ? 'selected' : ''">
            {{ $t('upload_qr_code_explanation_type_transactionqr') }}
          </li>
          <li v-if="validQrTypes.includes(4)" :class="qrType == 4 ? 'selected' : ''">
            {{ $t('upload_qr_code_explanation_type_cosignatureqr') }}
          </li>
          <li v-if="validQrTypes.includes(6)" :class="qrType == 6 ? 'selected' : ''">
            {{ $t('upload_qr_code_explanation_type_mnemonicqr') }}
          </li>
          <li v-if="invalidType" class="selected">
            {{ $t('upload_qr_code_invalid_type_message', { type: qrType == 0 ? 'unknown' : qrType }) }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import UploadQRCodeTs from './UploadQRCodeTs'

export default class UploadQRCode extends UploadQRCodeTs {}
</script>

<style lang="less" scoped>
@import './UploadQRCode.less';
</style>
