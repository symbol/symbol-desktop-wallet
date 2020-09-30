<template>
  <div class="create-mnemonic-sec" @keyup.enter="$router.push({ name: 'profiles.createProfile.verifyMnemonic' })">
    <p class="set-title">
      {{ $t('backup_mnemonic_words') }}
    </p>
    <div class="create-mnemonic-col">
      <div class="create-mnemonic-left">
        <MnemonicDisplay :words="mnemonicWordsList">
          <div slot class="mnemonic-container">
            <div v-if="!showMnemonic" class="show-mnemonic">
              <img src="@/views/resources/img/invisible.png" />
              <button class="button-style validation-button" @click="showMnemonic = true">
                {{ $t('display_mnemonic') }}
              </button>
            </div>
            <div v-else>
              <div class="mnemonic-list">
                <span v-for="(m, index) in mnemonicWordsList" :key="index">{{ m }}</span>
                <ButtonCopyToClipboard v-model="waitingCopyString" class="copy-button" />
              </div>
              <div class="mnemonic-qrcode">
                <img id="qrImg" :src="qrBase64" alt="Mnemonic QR code" />
                <span>
                  <a :href="qrBase64" :download="'qr_account_mnemonic_' + currentProfile.profileName">
                    {{ $t('button_download_qr') }}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </MnemonicDisplay>
        <div class="form-line-container button-container">
          <div class="flex-container mt-3">
            <button
              type="button"
              class="button-style back-button"
              @click="$router.push({ name: 'profiles.createProfile.info' })"
            >
              {{ $t('back') }}
            </button>
            <button
              type="submit"
              class="button-style validation-button"
              @click="$router.push({ name: 'profiles.createProfile.verifyMnemonic' })"
            >
              {{ $t('verify_backup_mnemonics') }}
            </button>
          </div>
        </div>
      </div>
      <div class="create-mnemonic-right">
        <Alert type="warning" show-icon>
          {{ $t('do_not_disclose_title') }}
          <template slot="desc">
            {{ $t('do_not_disclose') }}
          </template>
        </Alert>
        <Alert type="success" show-icon>
          {{ $t('please_backup_mnemonic_passphrase_title') }}
          <template slot="desc">
            {{ $t('please_backup_mnemonic_passphrase') }}

            <div class="mnemonic-backup-options-desc">
              <span>
                <p>
                  <Icon type="md-download" />
                  {{ $t('mnemonic_backup_options_download_desc') }}
                </p>
              </span>
              <span>
                <p>
                  <Icon type="md-copy" />
                  {{ $t('mnemonic_backup_options_copy_desc') }}
                </p>
              </span>
            </div>
          </template>
        </Alert>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ShowMnemonicTs from './ShowMnemonicTs'
export default class ShowMnemonic extends ShowMnemonicTs {}
</script>
<style lang="less" scoped>
@import './ShowMnemonic.less';
</style>
