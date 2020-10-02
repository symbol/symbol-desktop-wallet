<template>
  <div class="create-profile-wrapper radius">
    <div class="inner-container">
      <p class="create-profile-box">
        {{ $t('generate_a_new_profile') }}
      </p>
      <div class="step-bar-container">
        <img :src="$route.meta.icon" />
        <div class="step-text-container">
          <span v-for="(text, index) in StepBarTitleList" :key="index" :class="getStepClassName(index)">{{
            $t(text)
          }}</span>
        </div>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import AccessLedgerTs from './AccessLedgerTs'
export default class AccessLedger extends AccessLedgerTs {}
</script>
<style lang="less" scoped>
@import './AccessLedger.less';
</style>
