/*
 * Copyright 2020 NEM (https://nem.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */
//@ts-ignore
import AccountLinks from '@/components/AccountLinks/AccountLinks.vue';
// @ts-ignore
import AccountSelectorField from '@/components/AccountSelectorField/AccountSelectorField.vue';
// child components
// @ts-ignore
import AppLogo from '@/components/AppLogo/AppLogo.vue';
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue';
//@ts-ignore
import LogoutButton from '@/components/LogoutButton/LogoutButton.vue';
// @ts-ignore
import PageNavigator from '@/components/PageNavigator/PageNavigator.vue';
// @ts-ignore
import PeerSelector from '@/components/PeerSelector/PeerSelector.vue';
//@ts-ignore
import Settings from '@/components/Settings/Settings.vue';
// @ts-ignore
import WindowControls from '@/components/WindowControls/WindowControls.vue';
import { AccountModel } from '@/core/database/entities/AccountModel';
import { HarvestingModel } from '@/core/database/entities/HarvestingModel';
// internal dependencies
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { URLInfo } from '@/core/utils/URLInfo';
import i18n from '@/language';
import { AccountService } from '@/services/AccountService';
import { HarvestingStatus } from '@/store/Harvesting';
import { ConnectingToNodeInfo } from '@/store/Network';
// @ts-ignore
//import DebugConsoleButton from '@/components/DebugConsoleButton/DebugConsoleButton.vue';
import ModalDebugConsole from '@/views/modals/ModalDebugConsole/ModalDebugConsole.vue';
import { officialIcons } from '@/views/resources/Images';
import { NetworkType } from 'symbol-sdk';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
//@ts-ignore
const ImportQRButton = () => import('@/components/QRCode/ImportQRButton/ImportQRButton.vue');

@Component({
    components: {
        AppLogo,
        ErrorTooltip,
        PageNavigator,
        WindowControls,
        PeerSelector,
        LanguageSelector,
        AccountSelectorField,
        ModalDebugConsole,
        Settings,
        ImportQRButton,
        AccountLinks,
        LogoutButton,
    },
    computed: {
        ...mapGetters({
            currentPeer: 'network/currentPeer',
            isConnected: 'network/isConnected',
            networkType: 'network/networkType',
            generationHash: 'network/generationHash',
            currentProfile: 'profile/currentProfile',
            isCosignatoryMode: 'account/isCosignatoryMode',
            currentAccount: 'account/currentAccount',
            explorerBaseUrl: 'app/explorerUrl',
            faucetBaseUrl: 'app/faucetUrl',
            connectingToNodeInfo: 'network/connectingToNodeInfo',
            pollingTrials: 'harvesting/pollingTrials',
            harvestingStatus: 'harvesting/status',
            currentSignerHarvestingModel: 'harvesting/currentSignerHarvestingModel',
        }),
    },
})
export class PageLayoutTs extends Vue {
    /**
     * Currently active profile
     * @see {Store.Profile}
     * @var {string}
     */
    public currentProfile: ProfileModel;

    /**
     * Currently active peer
     * @see {Store.Network}
     * @var {Object}
     */
    public currentPeer: URLInfo;

    /**
     * Whether the connection is up
     * @see {Store.Network}
     * @var {boolean}
     */
    public isConnected: boolean;

    /**
     * Current networkType
     * @see {Store.Network}
     * @var {NetworkType}
     */
    public networkType: NetworkType;

    /**
     * Current generationHash
     * @see {Store.Network}
     * @var {string}
     */
    public generationHash: string;
    private harvestingStatus: string;
    private pollingTrials: number;
    private currentSignerHarvestingModel: HarvestingModel;
    /**
     * Whether cosignatory mode is active
     * @see {Store.Account}
     * @var {boolean}
     */
    public isCosignatoryMode: boolean;

    /**
     * Whether currently displaying debug console
     * @var {boolean}
     */
    public isDisplayingDebugConsole: boolean = false;

    /**
     * Currently active account
     * @see {Store.Account}
     * @var {AccountModel}
     */
    public currentAccount: AccountModel;
    /**
     * Explorer base url
     * @var {string}
     */
    public explorerBaseUrl: string;
    /**
     * Faucet base url
     * @var {string}
     */
    public faucetBaseUrl: string;

    public connectingToNodeInfo: ConnectingToNodeInfo;

    /// region computed properties getter/setter
    /**
     * Holds alert message
     * @var {Object}
     */
    get alert(): { show: boolean; message: string; showRetry?: boolean } {
        if (!this.currentPeer || !this.isConnected) {
            let message = '';
            let showRetry = false;
            if (this.connectingToNodeInfo.isTryingToConnect) {
                message = i18n.t('current_node_is_not_available', [
                    this.connectingToNodeInfo.progressCurrentNodeIndex,
                    this.connectingToNodeInfo.progressTotalNumOfNodes,
                ]) as string;
            } else {
                message = i18n.t('nodes_unavailable_check_network_and', [
                    this.connectingToNodeInfo.progressCurrentNodeIndex,
                    this.connectingToNodeInfo.progressTotalNumOfNodes,
                ]) as string;
                showRetry = true;
            }

            return {
                show: true,
                message,
                showRetry,
            };
        }

        if (this.currentProfile && this.currentProfile.networkType !== this.networkType) {
            this.$store.dispatch('network/SET_NETWORK_IS_NOT_MATCHING_PROFILE', true);
            return {
                show: true,
                message: 'account_network_type_does_not_match_current_network_type',
            };
        }

        if (this.currentProfile && this.currentProfile.generationHash !== this.generationHash) {
            this.$store.dispatch('network/SET_NETWORK_IS_NOT_MATCHING_PROFILE', true);
            return {
                show: true,
                message: 'account_network_does_not_match_current_network_type',
            };
        }
        if (
            this.$route.fullPath === '/delegatedHarvesting' &&
            this.harvestingStatus === HarvestingStatus.FAILED &&
            (this.pollingTrials === 20 || this.currentSignerHarvestingModel?.delegatedHarvestingRequestFailed)
        ) {
            return {
                show: true,
                message: 'delegated_harvesting_request_failed',
            };
        }

        return { show: false, message: '' };
    }

    get info(): { show: boolean; message: string } {
        if (this.isCosignatoryMode && !this.currentAccount.isMultisig) {
            return { show: true, message: 'info_active_cosignatory_mode' };
        }

        return { show: false, message: '' };
    }

    get hasDebugConsoleModal(): boolean {
        return this.isDisplayingDebugConsole;
    }

    set hasDebugConsoleModal(f: boolean) {
        this.isDisplayingDebugConsole = f;
    }

    public get explorerUrl(): string | undefined {
        if (!this.explorerBaseUrl) {
            return undefined;
        }
        return this.currentAccount
            ? this.explorerBaseUrl.replace(/\/+$/, '') + '/accounts/' + this.currentAccount.address
            : this.explorerBaseUrl;
    }

    public get faucetUrl(): string | undefined {
        if (!this.faucetBaseUrl) {
            return undefined;
        }
        return this.currentAccount ? this.faucetBaseUrl + '?recipient=' + this.currentAccount.address : this.faucetBaseUrl;
    }

    public get faucetIcon() {
        return officialIcons.faucet;
    }

    public get explorerIcon() {
        return officialIcons.voting;
    }

    /// end-region computed properties getter/setter

    public async onChangeAccount(accountId: string) {
        const service = new AccountService();
        const account = service.getAccount(accountId);
        if (!account) {
            console.log('Wallet not found: ', accountId);
            return;
        }

        await this.$store.dispatch('account/SET_CURRENT_ACCOUNT', account);
    }

    @Watch('isConnected', { immediate: true })
    private watchIsConnected() {
        // should we check already tried and max attemps is not exceeded, maybe later?
        if (!this.isConnected) {
            this.reconnect();
        }
    }

    public reconnect() {
        if (this.$route.fullPath !== '/login') {
            this.$store.dispatch('network/CONNECT', { waitBetweenTrials: true });
        }
    }
}
