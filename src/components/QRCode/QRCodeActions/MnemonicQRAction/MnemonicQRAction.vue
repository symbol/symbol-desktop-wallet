<template>
  <div>
    <TemplateQRAction
      :qr-code="qrCode"
      :detail-items="detailItems"
      :action-desc="$t('mnemonic_qr_action_desc')"
      :on-submit="onSubmit"
    />
  </div>
</template>

<script lang="ts">
import MnemonicQRActionTs from './MnemonicQRActionTs'

export default class MnemonicQRAction extends MnemonicQRActionTs {}
</script>
