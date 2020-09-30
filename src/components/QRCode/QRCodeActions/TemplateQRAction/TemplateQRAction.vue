<template>
  <div>
    <div class="preview-container">
      <slot name="qrcode-details">
        <QRCodeDisplay :qr-code="qrCode" show-download="true" header="uploaded_qr_code" />
        <div class="qrcode-details">
          <div v-for="(item, index) in detailItems" :key="index" class="qrcode-details-row">
            <slot name="detailItem" :item="item">
              <div class="qrcode-details-row-inner">
                <div class="qrcode-details-row-label">{{ item.label }}:</div>
                <div class="qrcode-details-row-value">{{ item.value }}</div>
              </div>
            </slot>
          </div>
          <slot name="other-details"> </slot>
        </div>
      </slot>
      <slot name="qrcode-action">
        <div></div>
        <div class="qrcode-action">
          <div class="qrcode-action-desc">
            <span> {{ $t(actionDesc) }} </span>
          </div>
          <div class="qrcode-action-button">
            <button v-if="showActionButton" type="submit" class="button-style validation-button" @click="onSubmit">
              {{ $t(actionButtonText) }}
            </button>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import TemplateQRActionTs from './TemplateQRActionTs'

export default class TemplateQRAction extends TemplateQRActionTs {}
</script>

<style lang="less" scoped>
@import './TemplateQRAction.less';
</style>
