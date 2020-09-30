<template>
  <div>
    <Modal v-model="show" class="modal-importqr-container" :title="$t('import_qr_code')" :footer-hide="true">
      <ModalWizardDisplay
        :items="wizardSteps.items"
        :icons="wizardSteps.icons"
        :current-item-index="wizardSteps.currentStepInx"
      />

      <div class="wizard-steps-container">
        <!-- Step1: Upload -->
        <div v-if="wizardSteps.currentStepInx === 0" id="stepUplad">
          <UploadQRCode :valid-qr-types="validQrTypes" @uploadComplete="onUploadComplete" />
        </div>
        <!-- Step2: Preview -->
        <div v-if="wizardSteps.currentStepInx === 1" id="stepPreview">
          <QRCodePassword :qrcode-json="qrcodeJson" @qrCodeGenerated="onQrCodeGenerated" />
          <QRCodeActions v-if="!!qrCode" :qr-code="qrCode" show-preview="true" :on-success="() => (show = false)" />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { ModalImportQRTs } from './ModalImportQRTs'

export default class ModalImportQR extends ModalImportQRTs {}
</script>

<style lang="less" scoped>
@import './ModalImportQR.less';
</style>
