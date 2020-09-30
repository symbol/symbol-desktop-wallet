<template>
  <div>
    <div v-if="askForPassword" class="qrcode-password-container">
      <div class="qrcode-password-info">
        {{ $t('qrcode_password_info') }}
      </div>
      <FormWrapper :whitelisted="true">
        <form action="processSubmit" onsubmit="event.preventDefault()" class="form-line-container mt-3">
          <FormRow>
            <template v-slot:label> {{ $t('form_label_password') }}: </template>
            <template v-slot:inputs>
              <div class="row-75-25 inputs-container">
                <ValidationProvider
                  ref="provider"
                  v-slot="{ errors }"
                  vid="password"
                  :name="$t('password')"
                  rules="required"
                  slim
                >
                  <ErrorTooltip :errors="errors">
                    <input
                      v-model="formItems.password"
                      v-focus
                      type="password"
                      class="input-size input-style"
                      :placeholder="$t('please_enter_your_account_password')"
                    />
                  </ErrorTooltip>
                </ValidationProvider>
                <button class="button-style validation-button right-side-button" type="submit" @click="generateQRCode">
                  {{ $t('confirm') }}
                </button>
              </div>
            </template>
          </FormRow>
        </form>
      </FormWrapper>
    </div>
  </div>
</template>

<script lang="ts">
import QRCodePasswordTs from './QRCodePasswordTs'

export default class QRCodePassword extends QRCodePasswordTs {}
</script>

<style lang="less" scoped>
@import './QRCodePassword.less';
</style>
