<template>
  <div>
    <slot name="trigger" :trigger="onClick">
      <div class="trigger-importqr pointer" @click="onClick">
        <Icon type="md-arrow-down" />
        <span>{{ $t('import_qr_code') }}</span>
      </div>
    </slot>
    <ModalImportQR v-if="visible" :visible="visible" :valid-qr-types="validQrTypes" @close="onClose" />
  </div>
</template>

<script lang="ts">
import ImportQRButtonTs from './ImportQRButtonTs'

export default class ImportQRButton extends ImportQRButtonTs {}
</script>

<style lang="less" scoped>
@import './ImportQRButton.less';
</style>
