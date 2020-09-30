<template>
  <div class="transaction-uri-container">
    <Poptip
      :title="$t('transaction_uri')"
      trigger="hover"
      word-wrap
      width="600"
      :content="$t('transaction_uri_explanation')"
    >
      <div class="info-icon">
        <Icon type="md-link" />
      </div>
    </Poptip>

    <LongTextDisplay
      :text="transactionURI"
      :pop-tip-title="$t('transaction_uri')"
      pop-tip-width="600"
      right-part-size="10"
    />

    <ButtonCopyToClipboard :value="transactionURI" type="icon" />
  </div>
</template>

<script lang="ts">
import TransactionUriDisplayTs from './TransactionUriDisplayTs'

export default class TransactionUriDisplay extends TransactionUriDisplayTs {}
</script>

<style lang="less" scoped>
@import './TransactionUriDisplay.less';
</style>
