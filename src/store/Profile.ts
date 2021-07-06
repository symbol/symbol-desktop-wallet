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
import { AccountModel } from '@/core/database/entities/AccountModel';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { ProfileService } from '@/services/ProfileService';
import { SettingService } from '@/services/SettingService';
import { IListener } from 'symbol-sdk';
import Vue from 'vue';
// internal dependencies
import { $eventBus } from '../events';
import { AwaitLock } from './AwaitLock';

/// region globals
const Lock = AwaitLock.create();

/// end-region globals

interface ProfileState {
    initialized: boolean;
    currentProfile: ProfileModel;
    isAuthenticated: boolean;
    isSettingsVisible: boolean;
    isNetworkSettingsSelected: boolean;
}

const profileState: ProfileState = {
    initialized: false,
    currentProfile: null,
    isAuthenticated: false,
    isSettingsVisible: false,
    isNetworkSettingsSelected: false,
};
export default {
    namespaced: true,
    state: profileState,
    getters: {
        getInitialized: (state: ProfileState) => state.initialized,
        currentProfile: (state: ProfileState) => state.currentProfile,
        isAuthenticated: (state: ProfileState) => state.isAuthenticated,
        isSettingsVisible: (state: ProfileState) => state.isSettingsVisible,
        isPrivateKeyProfile: (state: ProfileState): boolean => {
            return state.currentProfile ? !state.currentProfile.seed : false;
        },
        isNetworkSettingsSelected: (state: ProfileState) => state.isNetworkSettingsSelected,
    },
    mutations: {
        setInitialized: (state: ProfileState, initialized: boolean) => {
            state.initialized = initialized;
        },
        currentProfile: (state: ProfileState, currentProfile: ProfileModel) => Vue.set(state, 'currentProfile', currentProfile),
        setAuthenticated: (state: ProfileState, isAuthenticated: boolean) => Vue.set(state, 'isAuthenticated', isAuthenticated),
        toggleSettings: (state: ProfileState) => {
            state.isSettingsVisible = !state.isSettingsVisible;
        },
        toggleNetworkSettings: (state: ProfileState, networkTabSelector: boolean) => {
            state.isNetworkSettingsSelected = networkTabSelector;
        },
    },
    actions: {
        async initialize({ commit, getters }) {
            const callback = async () => {
                commit('setInitialized', true);
            };
            // aquire async lock until initialized
            await Lock.initialize(callback, { getters });
        },
        async uninitialize({ commit, dispatch, getters }) {
            const callback = async () => {
                await dispatch('RESET_STATE');
                commit('setInitialized', false);
            };
            await Lock.uninitialize(callback, { getters });
        },
        /// region scoped actions
        RESET_STATE({ commit }) {
            commit('currentProfile', null);
            commit('setAuthenticated', false);
        },
        async LOG_OUT({ dispatch, rootGetters }): Promise<void> {
            const currentAccount = rootGetters['account/currentAccount'];
            if (currentAccount) {
                await dispatch('account/uninitialize', { address: currentAccount.address }, { root: true });
            }
            await dispatch('network/UNSUBSCRIBE', undefined, { root: true });
            await dispatch('account/SET_KNOWN_ACCOUNTS', [], { root: true });
            await dispatch('account/RESET_CURRENT_ACCOUNT', undefined, {
                root: true,
            });

            await dispatch('network/RESET_STATE', undefined, {
                root: true,
            });
            const currentListener: IListener = rootGetters['network/listener'];
            if (currentListener && currentListener.isOpen()) {
                currentListener.close();
            }
            await dispatch('RESET_STATE');
        },
        async SET_CURRENT_PROFILE({ commit, dispatch, rootGetters }, currentProfile: ProfileModel) {
            // update state
            commit('currentProfile', currentProfile);
            commit('setAuthenticated', true);

            dispatch('diagnostic/ADD_DEBUG', 'Changing current profile to ' + currentProfile.profileName, { root: true });
            const generationHash = currentProfile.generationHash;
            const allNetworkModels: Record<string, NetworkModel> = rootGetters['network/allNetworkModels'];
            const settings = new SettingService().getProfileSettings(currentProfile.profileName, allNetworkModels[generationHash]);

            dispatch('app/SET_SETTINGS', settings, { root: true });

            dispatch('addressBook/LOAD_ADDRESS_BOOK', null, { root: true });

            dispatch('network/SET_NETWORK_TYPE', currentProfile.networkType, { root: true });

            dispatch('diagnostic/ADD_DEBUG', 'Using profile settings ' + Object.values(settings), { root: true });

            // reset store + re-initialize
            await dispatch('initialize');
            $eventBus.$emit('onProfileChange', currentProfile.profileName);
        },

        ADD_ACCOUNT({ dispatch, getters }, accountModel: AccountModel) {
            const currentProfile: ProfileModel = getters['currentProfile'];
            if (!currentProfile) {
                return;
            }
            dispatch(
                'diagnostic/ADD_DEBUG',
                'Adding account to profile: ' + currentProfile.profileName + ' with: ' + accountModel.address,
                {
                    root: true,
                },
            );
            if (!currentProfile.accounts.includes(accountModel.id)) {
                new ProfileService().updateAccounts(currentProfile, [...currentProfile.accounts, accountModel.id]);
            }
            return dispatch('SET_CURRENT_PROFILE', currentProfile);
        },
        /// end-region scoped actions
    },
};
