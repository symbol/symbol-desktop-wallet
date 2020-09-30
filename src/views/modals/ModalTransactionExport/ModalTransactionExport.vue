<template>
  <div class="container">
    <Modal v-model="show" class-name="modal-container" :title="$t('modal_title_backup_transaction')" :transfer="false">
      <div class="form-unlock">
        <FormProfileUnlock v-if="!hasTransactionExportInfo" @success="onAccountUnlocked" @error="onError" />
      </div>
      <div v-if="hasTransactionExportInfo" class="body">
        <div class="explain">
          <span class="subtitle">{{ $t('accounts_backup_transactions') }}</span>
          <p>{{ $t('accounts_backup_transactions_description') }}</p>
        </div>
        <button class="button-style validation-button download-button" type="button" @click="onDownloadTx">
          <Icon :type="'md-download'" size="20" />
          <span>&nbsp;{{ $t('button_download_qr') }}</span>
        </button>
      </div>

      <div slot="footer" class="modal-footer">
        <button type="submit" class="centered-button button-style back-button float-right" @click="show = false">
          {{ $t('close') }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { ModalTransactionExportTs } from './ModalTransactionExportTs'

export default class ModalTransactionExport extends ModalTransactionExportTs {}
</script>

<style lang="less" scoped>
@import './ModalTransactionExport.less';
</style>
