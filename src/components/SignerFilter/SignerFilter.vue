<template>
  <div>
    <Select v-model="selectedSigner" size="large" prefix="ios-home" @input="onSignerChange">
      <Icon slot="prefix" type="ios-people" size="24" />
      <OptionGroup label="Multisig accounts">
        <Option v-for="item in signers" :key="item.address.plain()" :value="item.address.plain()">
          {{ item.label }}
          {{ item.multisig ? $t('label_postfix_multisig') : '' }}
        </Option>
      </OptionGroup>
    </Select>
  </div>
</template>
<script lang="ts">
// @ts-ignore
import { SignerFilterTs } from './SignerFilterTs'
export default class SignerFilter extends SignerFilterTs {}
</script>
