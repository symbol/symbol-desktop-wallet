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
import { AccountRestriction, Address, MosaicId, RepositoryFactory } from 'symbol-sdk';
import Vue from 'vue';
// internal dependencies
import { AwaitLock } from './AwaitLock';

const Lock = AwaitLock.create();

interface RestrictionState {
    initialized: boolean;
    accountRestrictions: AccountRestriction[];
    isFetchingRestrictions: boolean;
}

const initialState: RestrictionState = {
    initialized: false,
    accountRestrictions: [],
    isFetchingRestrictions: false,
};

export default {
    namespaced: true,
    state: initialState,
    getters: {
        getInitialized: (state) => state.initialized,
        accountAddressRestrictions: (state: RestrictionState) =>
            state.accountRestrictions.filter((r) => r.values && r.values[0] instanceof Address),
        accountMosaicRestrictions: (state) => state.accountRestrictions.filter((r) => r.values && r.values[0] instanceof MosaicId),
        accountOperationRestrictions: (state) =>
            state.accountRestrictions.filter((r) => r.values && !(r.values[0] instanceof Address) && !(r.values[0] instanceof MosaicId)),
        isFetchingRestrictions: (state) => state.isFetchingRestrictions,
    },
    mutations: {
        setInitialized: (state, initialized) => {
            state.initialized = initialized;
        },
        accountRestrictions: (state, accountRestrictions) => {
            Vue.set(state, 'accountRestrictions', accountRestrictions);
        },
        isFetchingRestrictions: (state, isFetchingRestrictions) => Vue.set(state, 'isFetchingRestrictions', isFetchingRestrictions),
    },
    actions: {
        async initialize({ commit, getters }) {
            const callback = async () => {
                // update store
                commit('setInitialized', true);
            };

            // acquire async lock until initialized
            await Lock.initialize(callback, { getters });
        },
        async uninitialize({ commit, getters }) {
            const callback = async () => {
                commit('setInitialized', false);
            };
            await Lock.uninitialize(callback, { getters });
        },
        RESET_ACCOUNT_RESTRICTIONS({ commit }) {
            commit('accountRestrictions', []);
        },
        LOAD_ACCOUNT_RESTRICTIONS({ commit, rootGetters }) {
            const repositoryFactory: RepositoryFactory = rootGetters['network/repositoryFactory'];
            const restrictionAccountRepository = repositoryFactory.createRestrictionAccountRepository();

            const currentSignerAddress: Address = rootGetters['account/currentSignerAddress'];
            if (!currentSignerAddress) {
                return;
            }
            commit('isFetchingRestrictions', true);

            restrictionAccountRepository
                .getAccountRestrictions(currentSignerAddress)
                .subscribe({
                    next: ({ restrictions }) => commit('accountRestrictions', restrictions),
                    error: () => {
                        commit('accountRestrictions', []);
                    },
                })
                .add(() => commit('isFetchingRestrictions', false));
        },
    },
};
