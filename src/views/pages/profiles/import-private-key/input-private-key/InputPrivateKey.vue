<template>
  <div class="input-private-key-container">
    <div class="left-container">
      <ValidationObserver v-slot="{ handleSubmit }" ref="observer" slim>
        <form onsubmit="event.preventDefault()">
          <div class="input-private-key-form">
            <div class="row">
              <div class="title">
                <h1>{{ $t('enter_your_private_key') }}</h1>
              </div>
            </div>
            <div class="row">
              <FormRow :no-label="true">
                <template v-slot:inputs>
                  <ValidationProvider
                    v-slot="{ errors }"
                    ref="privateKey"
                    vid="privateKey"
                    :name="$t('private_key')"
                    :rules="validationRules.privateKey"
                    tag="div"
                    class="inputs-container items-container"
                  >
                    <ErrorTooltip :errors="errors">
                      <input v-model="privateKey" class="input-size input-style" type="password" />
                    </ErrorTooltip>
                  </ValidationProvider>
                </template>
              </FormRow>
            </div>
            <div class="related-info">
              <div class="row">
                <div class="related-info-label">{{ $t('address') }}:</div>
                <div class="related-info-value">{{ address }}</div>
              </div>
              <div class="row">
                <div class="related-info-label">{{ $t('public_key') }}:</div>
                <div class="related-info-value">{{ publicKey }}</div>
              </div>
              <div class="row">
                <div class="related-info-label">{{ $t('current_profile_network') }}:</div>
                <div class="related-info-value">
                  <div>{{ currentProfileNetwork }}</div>
                  <div v-if="accountNetwork && currentProfileNetwork !== accountNetwork" class="text-warning">
                    <i18n path="network_type_of_account_doesn't_math_current_profiles'">
                      <template v-slot:networkTypeText>
                        {{ accountNetwork }}
                      </template>
                    </i18n>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="buttons-container">
            <div class="flex-container mt-3">
              <button type="button" class="button-style back-button" @click="$router.back(-1)">
                {{ $t('back') }}
              </button>
              <button
                type="submit"
                class="button-style validation-button"
                @click="handleSubmit(createAccountByPrivate)"
              >
                {{ $t('import_private_key') }}
              </button>
            </div>
          </div>
        </form>
      </ValidationObserver>
    </div>
    <div class="right-container">
      <div class="title">
        <h1>{{ $t('tips') }}</h1>
      </div>
      <div class="content">
        <p>{{ $t('import_private_key_input_tip1') }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import InputPrivateKeyTs from './InputPrivateKeyTs'
export default class InputPrivateKey extends InputPrivateKeyTs {}
</script>
<style lang="less" scoped>
@import './InputPrivateKey.less';
</style>
