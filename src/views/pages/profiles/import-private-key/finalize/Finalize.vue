<template>
  <div class="finish-sec scroll" @keyup.enter="submit">
    <img src="@/views/resources/img/success.png" alt />
    <span class="set-title"> {{ $t('import_private_key_account_successfully') }}</span>
    <p class="text">
      {{ $t('import_private_key_account_successfully_title_tips') }}
    </p>
    <div class="finish-col">
      <div class="finish-left">
        <p class="text1">{{ $t('tips') }}:</p>
        <p class="text">
          {{ $t('import_private_key_finalize_tip_text1') }}
        </p>
        <p class="text">
          {{ $t('import_private_key_finalize_tip_text2') }}
        </p>

        <div class="buttons-container">
          <div class="flex-container mt-3">
            <button type="button" class="button-style back-button" @click="$router.back(-1)">
              {{ $t('back') }}
            </button>
            <button class="button-style validation-button" @click="$router.push({ name: 'dashboard' })">
              {{ $t('next') }}
            </button>
          </div>
        </div>
      </div>
      <div class="finish-right">
        <img src="@/views/resources/img/finish.png" alt />
      </div>
    </div>
  </div>
</template>

<script>
import FinalizeTs from './FinalizeTs'
import './Finalize.less'
export default class Finalize extends FinalizeTs {}
</script>
