<template>
  <div>
    <TemplateQRAction
      :qr-code="qrCode"
      :detail-items="detailItems"
      :action-desc="$t('contact_qr_action_desc')"
      :on-submit="onSubmit"
    />
  </div>
</template>

<script lang="ts">
import ContactQRActionTs from './ContactQRActionTs'

export default class ContactQRAction extends ContactQRActionTs {}
</script>
