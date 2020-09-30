<template>
  <div class="split-button-container">
    <button type="submit" :class="'split-main-button ' + className" @click="() => $emit('click')">
      {{ $t(label) }}
    </button>
    <dropdown trigger="click" placement="bottom-end">
      <i-button icon="md-arrow-dropdown" :class="'split-dropdown-button ' + dropdownClassName" />
      <dropdown-menu slot="list">
        <dropdown-item v-for="(item, index) in dropdownActions" :key="index">
          <div @click="item.action"><Icon v-if="!!item.icon" :type="item.icon" />{{ $t(item.label) }}</div>
        </dropdown-item>
      </dropdown-menu>
    </dropdown>
  </div>
</template>

<script lang="ts">
import SplitButtonTs from './SplitButtonTs'

export default class SplitButton extends SplitButtonTs {}
</script>

<style lang="less" scoped>
@import './SplitButton.less';
</style>
