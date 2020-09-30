<template>
  <div class="transaction-list-outer-container">
    <div class="transaction-list-inner-container">
      <div class="transaction-list-tabs-container">
        <TransactionListFilters />
        <TransactionTable
          :transactions="getCurrentPageTransactions()"
          :empty-message="getEmptyMessage()"
          @click="onClickTransaction"
        />
      </div>
      <div class="transaction-list-pagination-container">
        <button
          class="centered-button button-style validation-button left download-transaction"
          @click="downloadTransaction"
        >
          {{ $t('button_download_qr') }}
        </button>
        <Page :total="totalCountItems" class="page_content" @on-change="onPageChange" />
      </div>
    </div>

    <ModalTransactionDetails
      v-if="hasDetailModal"
      :visible="hasDetailModal"
      :transaction="activeTransaction"
      @close="onCloseDetailModal"
    />

    <ModalTransactionCosignature
      v-if="hasCosignatureModal"
      :visible="hasCosignatureModal"
      :transaction-hash="aggregateTransactionHash"
      @close="onCloseCosignatureModal"
    />
    <ModalTransactionExport
      v-if="hasTransactionExportModal"
      :visible="hasTransactionExportModal"
      @close="hasTransactionExportModal = false"
    />
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { TransactionListTs } from './TransactionListTs'
export default class TransactionList extends TransactionListTs {}
</script>
<style lang="less" scoped>
@import './TransactionList.less';
</style>
