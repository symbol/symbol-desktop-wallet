<template>
  <div class="truncate-middle-ellipses-container">
    <Poptip :title="popTipTitle" word-wrap :width="popTipWidth" :content="text">
      <span>{{ leftPart }}</span>
      <span>{{ rightPart }}</span>
    </Poptip>
  </div>
</template>

<script lang="ts">
import LongTextDisplayTs from './LongTextDisplayTs'

export default class LongTextDisplay extends LongTextDisplayTs {}
</script>

<style lang="less" scoped>
@import './LongTextDisplay.less';
</style>
