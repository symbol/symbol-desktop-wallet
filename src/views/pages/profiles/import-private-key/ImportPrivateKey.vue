<template>
  <div class="import-account-wrapper radius">
    <div class="inner-container">
      <p class="create-account-box">
        {{ $t('import_private_key') }}
      </p>
      <div class="step-bar-container">
        <img :src="$route.meta.icon" />
        <div class="step-text-container">
          <span v-for="(text, index) in StepBarTitleList" :key="index" :class="getStepClassName(index)">
            {{ $t(text) }}
          </span>
        </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import ImportPrivateKeyTs from './ImportPrivateKeyTs'
export default class ImportPrivateKey extends ImportPrivateKeyTs {}
</script>
<style lang="less" scoped>
@import './ImportPrivateKey.less';
</style>
