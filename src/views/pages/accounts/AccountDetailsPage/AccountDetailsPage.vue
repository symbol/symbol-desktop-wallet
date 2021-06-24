<template>
    <div v-show="currentAccount" class="main-wrapper">
        <div v-if="isOptinAccount" class="alert_container">
            <Alert type="error">
                {{ $t('opt_in_account_notification') }}
            </Alert>
        </div>
        <div class="account-detail-outer-container">
            <div class="account-detail-inner-container">
                <div class="left-container">
                    <AccountContactQR :account="currentAccount" />
                </div>
                <div class="right-container">
                    <div class="account-details-grid">
                        <div class="detail-row">
                            <AccountNameDisplay v-if="currentAccount" :account="currentAccount" :editable="true" />
                        </div>

                        <div class="detail-row">
                            <ImportanceScoreDisplay v-if="currentAccount" :address="currentAccount.address" />
                        </div>

                        <div class="detail-row">
                            <AccountAddressDisplay v-if="currentAccount" :address="currentAccount.address" />
                        </div>

                        <div class="detail-row">
                            <AccountPublicKeyDisplay :account="currentAccount" />
                        </div>

                        <div v-if="!(isLedger || isTrezor)" class="detail-row">
                            <ProtectedPrivateKeyDisplay :account="currentAccount" />
                        </div>

                        <!-- default account flag -->
                        <div v-if="currentAccount && defaultAccount === currentAccount.id" class="detail-row">
                            <div class="account-detail-row">
                                <span class="label">{{ $t('accounts_flags_default_account') }}:</span>
                                <div class="value">
                                    <span>{{ $t('accounts_flags_default_account_explain') }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- simple/multisig flag -->
                        <div v-if="currentAccount && currentAccount.isMultisig" class="detail-row">
                            <div class="account-detail-row">
                                <span class="label">{{ $t('accounts_flags_default_account') }}</span>
                                <div class="value">
                                    <span>{{ $t('accounts_flags_default_account_explain') }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="!!accountMetadataList.length" class="detail-row">
                            <AccountMetadataDisplay
                                :metadata-list="accountMetadataList"
                                :visible="!!accountMetadataList.length"
                                @on-view-metadata="showMetadataDetailModal = true"
                                @on-edit-metadata="openEditModal"
                            />
                        </div>

                        <div class="graph-row">
                            <AccountAliasDisplay :account="currentAccount" />

                            <AccountMultisigGraph
                                v-if="currentAccount && currentAccount.isMultisig"
                                :account="currentAccount"
                                :visible="currentAccount.isMultisig"
                            />
                            <div class="bottom-buttons-container">
                                <button
                                    v-if="isLedger"
                                    type="button"
                                    class="centered-button button-style button solid-button buttonC"
                                    @click="showAddressLedger"
                                >
                                    {{ $t('show_on_ledger') }}
                                </button>
                                <button
                                    v-if="isTrezor"
                                    type="button"
                                    class="centered-button button-style button solid-button buttonC"
                                    @click="showAddressTrezor"
                                >
                                    {{ $t('show_on_trezor') }}
                                </button>
                                <button
                                    type="button"
                                    class="centered-button button-style button danger-button buttonD"
                                    :disabled="knownAccounts.length <= 1"
                                    @click="deleteAccountConfirmation"
                                >
                                    {{ $t('delete_account') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalConfirm
                v-model="showConfirmationModal"
                :title="$t('delete_account_confirmation_title')"
                :message="$t('delete_account_confirmation_message', { accountName: currentAccount.name })"
                :danger="true"
                :show-checkbox="true"
                :checkbox-label="$t('delete_account_confirmation_checkbox')"
                @confirmed="deleteAccount"
            />
            <ModalFormProfileUnlock
                v-if="hasAccountUnlockModal"
                :visible="hasAccountUnlockModal"
                :on-success="onAccountUnlocked"
                @close="hasAccountUnlockModal = false"
            />
            <ModalMetadataDisplay
                v-if="showMetadataDetailModal"
                :visible="showMetadataDetailModal"
                :metadata-list="accountMetadataList"
                @close="showMetadataDetailModal = false"
            />
            <ModalMetadataUpdate
                v-if="showUpdateMetadataModal && metadataEntry"
                :visible="showUpdateMetadataModal"
                :value="metadataEntry"
                :edit-mode="showUpdateMetadataModal"
                @close="showUpdateMetadataModal = false"
            />
        </div>
    </div>
    <!--<div class="account-detail-inner-container">
            <div class="left-container">
                <div class="title-row">
                    <span>{{ $t('accounts_subtitle_account_links') }}</span>
                </div>

                <AccountLinks :account="currentAccount" />
            </div>
        </div>-->
</template>

<script lang="ts">
import { AccountDetailsPageTs } from './AccountDetailsPageTs';
export default class AccountDetailsPage extends AccountDetailsPageTs {}
</script>

<style lang="less" scoped>
@import './AccountDetailsPage.less';

.title {
    color: @primary;
    font-size: 18px;
}

.bottom-buttons-container {
    margin-left: auto;
    margin-right: 1em;
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    grid-template-areas: 'a b c d';
}
.bottom-buttons-container button {
    margin: 0 0.5em;
}

.bottom-buttons-container .buttonC {
    margin-left: 0;
    margin-right: 1em;
    grid-area: c;
}

.bottom-buttons-container .buttonD {
    grid-area: d;
}

.overflow-elipsis {
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.alert_container {
    margin: 0 1rem;
}

.main-wrapper {
    height: 100%;
}
</style>
