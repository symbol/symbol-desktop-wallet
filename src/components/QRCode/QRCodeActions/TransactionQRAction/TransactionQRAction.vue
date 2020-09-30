<template>
  <div>
    <TemplateQRAction
      :qr-code="qrCode"
      :detail-items="detailItems"
      action-desc="transaction_qr_action_desc"
      :on-submit="onSubmit"
    >
      <template v-slot:detailItem="slotProps">
        <div class="qrcode-details-row-inner">
          <div class="qrcode-details-row-label">{{ slotProps.item.label }}:</div>
          <div v-if="slotProps.item.label == $t('amount')" class="qrcode-details-row-value">
            <MosaicAmountDisplay
              :id="tran.mosaics[0].id"
              :absolute-amount="tran.mosaics[0].amount.toString()"
              :show-ticker="true"
            />
          </div>
          <div v-else-if="slotProps.item.label == $t('fee')" class="qrcode-details-row-value">
            <MaxFeeSelector v-model="slotProps.item.value" display-only="true" />
          </div>
          <div v-else class="qrcode-details-row-value">{{ slotProps.item.value }}</div>
        </div>
      </template>
    </TemplateQRAction>
  </div>
</template>

<script lang="ts">
import TransactionQRActionTs from './TransactionQRActionTs'

export default class TransactionQRAction extends TransactionQRActionTs {}
</script>
