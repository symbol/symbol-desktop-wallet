<template>
  <div class="create-mnemonic-sec" @keyup.enter="submit">
    <p class="set-title">
      {{ $t('input_mnemonic') }}
    </p>
    <div class="create-mnemonic-col">
      <div class="create-mnemonic-left">
        <MnemonicInput :seed="importedMnemonic" @handle-words="setSeed" />
        <div class="button-container">
          <div class="flex-container mt-3">
            <button type="button" class="button-style back-button" @click="deleteProfileAndBack">
              {{ $t('return_password_setting') }}
            </button>
            <ImportQRButton valid-qr-types="[6]">
              <template v-slot:trigger="importQRButton">
                <button type="button" class="button-style back-button" @click="importQRButton.trigger">
                  {{ $t('from_qr_code') }}
                </button>
              </template>
            </ImportQRButton>
            <button
              type="submit"
              class="button-style validation-button"
              :disabled="!(wordsArray.length === 12 || wordsArray.length === 24)"
              @click="processVerification"
            >
              {{ $t('import_mnemonic') }}
            </button>
          </div>
        </div>
      </div>
      <div class="create-mnemonic-right">
        <p class="text">
          {{ $t('input_mnemonic_tips') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ImportMnemonicTs from './ImportMnemonicTs'

export default class ImportMnemonic extends ImportMnemonicTs {}
</script>
<style lang="less" scoped>
@import './ImportMnemonic.less';
</style>
