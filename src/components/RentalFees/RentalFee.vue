<template>
  <div>
    <FormRow>
      <template v-slot:label> {{ $t('estimated_rental_fee') }}: </template>
      <template v-slot:inputs>
        <div class="inputs-container display-grid">
          <div class="display-value">
            <MosaicAmountDisplay :absolute-amount="rentalFeeAmount || 0" :color="'red'" :show-ticker="true" />
          </div>
        </div>
      </template>
    </FormRow>
  </div>
</template>
<script lang="ts">
import { RentalFeeTs } from './RentalFeeTs'
export default class RentalFee extends RentalFeeTs {}
</script>
