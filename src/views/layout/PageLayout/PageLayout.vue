<template>
    <div class="wrap">
        <div v-if="alert.show">
            <Alert class="alert warning_alert" type="error">
                <Icon type="ios-warning-outline" />
                {{ $t(`${alert.message}`) }}
                <a v-if="alert.showRetry" @click="reconnect">{{ ` ${'(' + $t('click_to_retry') + ')'}` }}</a>
            </Alert>
        </div>
        <div v-else-if="info.show">
            <Alert class="alert success_alert" type="success">
                <Icon type="ios-bulb-outline" />
                {{ $t(`${info.message}`) }}
            </Alert>
        </div>

        <div style="display: flex; width: 100%; height: 100%;">
            <PageNavigator v-if="!$route.matched.map(({ name }) => name).includes('profiles')" />
            <div class="general_view" style="width: 100%;">
                <div class="top_window level">
                    <div class="level-left">
                        <!--<AppLogo class="level-item" />-->
                    </div>

                    <!--OCA99: These are window controls for electron. Disabling them for now. Not sure if they should be here.-->
                    <!--<WindowControls />-->

                    <div class="level-right">
                        <ImportQRButton v-if="!!currentAccount" class="level-item navbar-item" valid-qr-types="[1, 3, 4, 8, 9]" />
                        <AccountLinks
                            v-if="faucetUrl"
                            :account="currentAccount"
                            :link="faucetUrl"
                            :icon="faucetIcon"
                            :title="$t('accounts_links_faucet')"
                            class="level-item navbar-item"
                        />
                        <AccountLinks
                            v-if="explorerUrl"
                            :account="currentAccount"
                            :link="explorerUrl"
                            :icon="explorerIcon"
                            :title="$t('accounts_links_explorer')"
                            class="level-item navbar-item"
                        />
                        <AccountSelectorField class="level-item navbar-item" :enable-min-width="true" @input="onChangeAccount" />
                        <Settings class="level-item navbar-item" />
                        <LogoutButton />
                    </div>
                </div>
                <transition name="fade" mode="out-in">
                    <div class="main-outer-container">
                        <router-view />
                    </div>
                </transition>
                <div class="footer">
                    <span class="footer-phrase">{{ $t('copyright') }}</span>
                </div>
            </div>
        </div>

        <ModalDebugConsole
            v-if="hasDebugConsoleModal"
            :visible="hasDebugConsoleModal"
            :title="$t('modal_title_debug_console')"
            @close="hasDebugConsoleModal = false"
        />
    </div>
</template>

<script lang="ts">
import { PageLayoutTs } from './PageLayoutTs';
export default class PageLayout extends PageLayoutTs {}
</script>
<style lang="less" scoped>
@import './PageLayout.less';
</style>
