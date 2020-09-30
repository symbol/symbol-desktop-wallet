<template>
  <div class="copy-button-container v-h-centered" @click="copyToClipboard">
    <slot v-if="type === 'button'">
      <Button type="button">
        {{ $t('mnemonic_copy') }}
      </Button>
    </slot>
    <img v-else-if="type === 'image'" src="@/views/resources/img/account/copyIcon.png" class="copy-icon" />
    <Tooltip v-else-if="type === 'icon'" :content="$t(tooltipText)">
      <Icon type="md-copy" />
    </Tooltip>
  </div>
</template>
<script lang="ts">
import { ButtonCopyToClipboardTs } from './ButtonCopyToClipboardTs'
export default class ButtonCopyToClipboard extends ButtonCopyToClipboardTs {}
</script>
<style lang="less" scoped>
@import './ButtonCopyToClipboard.less';
</style>
