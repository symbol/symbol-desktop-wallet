<template>
    <div class="account-selector-panel">
        <div v-auto-scroll="'active-background'" class="account-switch-body-container scroll">
            <div v-if="seedAccounts.length > 0" class="account-type-title">Seed accounts</div>
            <div
                v-for="item in seedAccounts"
                :key="item.id"
                :class="['account-tile', isActiveAccount(item) ? 'active-background' : 'inactive-background', 'pointer']"
                @click="currentAccountIdentifier = item.id"
            >
                <div class="mosaic_data">
                    <span class="img_container">
                        <img v-if="isActiveAccount(item)" src="@/views/resources/img/symbol/XYMCoin.png" alt />
                        <img v-else src="@/views/resources/img/symbol/XYMCoin.png" class="grayed-xym-logo" />
                    </span>
                    <span class="mosaic_name">{{ item.name }}</span>

                    <span class="mosaic_value">
                        <span :class="['amount', 'overflow_ellipsis', 'green']">
                            <MosaicAmountDisplay :absolute-amount="balances[item.address]" />
                        </span>
                    </span>
                </div>
            </div>
            <div v-if="optInAccounts.length > 0" class="account-type-title">Opt In accounts</div>
            <div
                v-for="item in optInAccounts"
                :key="item.id"
                :class="['account-tile', isActiveAccount(item) ? 'active-background' : 'inactive-background', 'pointer']"
                @click="currentAccountIdentifier = item.id"
            >
                <div class="mosaic_data">
                    <span class="img_container">
                        <img v-if="isActiveAccount(item)" src="@/views/resources/img/symbol/XYMCoin.png" alt />
                        <img v-else src="@/views/resources/img/symbol/XYMCoin.png" class="grayed-xym-logo" />
                    </span>
                    <span class="mosaic_name">{{ item.name }}</span>

                    <span class="mosaic_value">
                        <span :class="['amount', 'overflow_ellipsis', 'green']">
                            <MosaicAmountDisplay :absolute-amount="balances[item.address]" />
                        </span>
                    </span>
                </div>
            </div>
            <div v-if="ledgerAccount.length > 0" class="account-type-title">Ledger accounts</div>
            <div
                v-for="item in ledgerAccount"
                :key="item.id"
                :class="['account-tile', isActiveAccount(item) ? 'active-background' : 'inactive-background', 'pointer']"
                @click="currentAccountIdentifier = item.id"
            >
                <div class="mosaic_data">
                    <span class="img_container">
                        <img v-if="isActiveAccount(item)" src="@/views/resources/img/symbol/XYMCoin.png" alt />
                        <img v-else src="@/views/resources/img/symbol/XYMCoin.png" class="grayed-xym-logo" />
                    </span>
                    <span class="mosaic_name">{{ item.name }}</span>

                    <span class="mosaic_value">
                        <span :class="['amount', 'overflow_ellipsis', 'green']">
                            <MosaicAmountDisplay :absolute-amount="balances[item.address]" />
                        </span>
                    </span>
                </div>
            </div>
            <div v-if="ledgerOptInAccount.length > 0" class="account-type-title">Ledger Opt In accounts</div>
            <div
                v-for="item in ledgerOptInAccount"
                :key="item.id"
                :class="['account-tile', isActiveAccount(item) ? 'active-background' : 'inactive-background', 'pointer']"
                @click="currentAccountIdentifier = item.id"
            >
                <div class="mosaic_data">
                    <span class="img_container">
                        <img v-if="isActiveAccount(item)" src="@/views/resources/img/symbol/XYMCoin.png" alt />
                        <img v-else src="@/views/resources/img/symbol/XYMCoin.png" class="grayed-xym-logo" />
                    </span>
                    <span class="mosaic_name">{{ item.name }}</span>

                    <span class="mosaic_value">
                        <span :class="['amount', 'overflow_ellipsis', 'green']">
                            <MosaicAmountDisplay :absolute-amount="balances[item.address]" />
                        </span>
                    </span>
                </div>
            </div>
            <div v-if="trezorAccount.length > 0" class="account-type-title">Trezor accounts</div>
            <div
                v-for="item in trezorAccount"
                :key="item.id"
                :class="['account-tile', isActiveAccount(item) ? 'active-background' : 'inactive-background', 'pointer']"
                @click="currentAccountIdentifier = item.id"
            >
                <div class="mosaic_data">
                    <span class="img_container">
                        <img v-if="isActiveAccount(item)" src="@/views/resources/img/symbol/XYMCoin.png" alt />
                        <img v-else src="@/views/resources/img/symbol/XYMCoin.png" class="grayed-xym-logo" />
                    </span>
                    <span class="mosaic_name">{{ item.name }}</span>

                    <span class="mosaic_value">
                        <span :class="['amount', 'overflow_ellipsis', 'green']">
                            <MosaicAmountDisplay :absolute-amount="balances[item.address]" />
                        </span>
                    </span>
                </div>
            </div>
            <div v-if="pkAccounts.length > 0" class="account-type-title">Private key accounts</div>
            <div
                v-for="item in pkAccounts"
                :key="item.id"
                :class="['account-tile', isActiveAccount(item) ? 'active-background' : 'inactive-background', 'pointer']"
                @click="currentAccountIdentifier = item.id"
            >
                <div class="mosaic_data">
                    <span class="img_container">
                        <img v-if="isActiveAccount(item)" src="@/views/resources/img/symbol/XYMCoin.png" alt />
                        <img v-else src="@/views/resources/img/symbol/XYMCoin.png" class="grayed-xym-logo" />
                    </span>
                    <span class="mosaic_name">{{ item.name }}</span>

                    <span class="mosaic_value">
                        <span :class="['amount', 'overflow_ellipsis', 'green']">
                            <MosaicAmountDisplay :absolute-amount="balances[item.address]" />
                        </span>
                    </span>
                </div>
            </div>
        </div>

        <div class="account-switch-footer-container">
            <span type="button" class="add-account pointer button" @click="hasAddAccountModal = true">
                <img src="@/views/resources/img/newicons/Add.svg" class="icon-left-button" />
                {{ $t('button_add_account') }}
            </span>

            <div v-if="!isPrivateKeyProfile" class="account-switch-header-right-container" @click="hasBackupProfileModal = true">
                <!-- <span type="button" class="back-up pointer button" @click="hasAddAccountModal = true"> -->
                <span type="button" class="back-up pointer button">
                    <img src="@/views/resources/img/newicons/Download.svg" class="icon-left-button" />
                    {{ $t('backup_profile') }}
                </span>
            </div>
            <ModalFormSubAccountCreation v-if="hasAddAccountModal" :visible="hasAddAccountModal" @close="hasAddAccountModal = false" />

            <ModalBackupProfile v-if="hasBackupProfileModal" :visible="hasBackupProfileModal" @close="hasBackupProfileModal = false" />
        </div>
    </div>
</template>

<script lang="ts">
import { AccountSelectorPanelTs } from './AccountSelectorPanelTs';
import './AccountSelectorPanel.less';

export default class AccountSelectorPanel extends AccountSelectorPanelTs {}
</script>

<style lang="less" scoped>
.walletMethod {
    text-align: center;
}

.button-add-account {
    height: 0.35rem !important;
    padding: 0 0.3rem;
    margin: auto;
}
</style>
