<template>
  <div class="select-container">
    <Select v-if="!displayOnly" v-model="chosenMaxFee" :placeholder="$t('fee')" class="select-size select-style">
      <Option v-for="{ maxFee, label } in fees" :key="maxFee" :value="maxFee">
        {{ label }}
      </Option>
    </Select>
    <div v-else>
      {{ fees.find((i) => i.maxFee == chosenMaxFee).label }}
    </div>
  </div>
</template>

<script lang="ts">
import { MaxFeeSelectorTs } from './MaxFeeSelectorTs'
export default class MaxFeeSelector extends MaxFeeSelectorTs {}
</script>
