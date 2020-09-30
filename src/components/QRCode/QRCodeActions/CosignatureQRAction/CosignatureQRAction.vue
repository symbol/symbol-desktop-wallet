<template>
  <div>
    <TemplateQRAction
      :qr-code="qrCode"
      :detail-items="detailItems"
      action-desc="cosignature_qr_action_desc"
      :on-submit="onSubmit"
    >
      <template v-slot:other-details>
        <TransactionDetails :transaction="qrCode.transaction" />
      </template>
    </TemplateQRAction>
  </div>
</template>

<script lang="ts">
import CosignatureQRActionTs from './CosignatureQRActionTs'

export default class CosignatureQRAction extends CosignatureQRActionTs {}
</script>
