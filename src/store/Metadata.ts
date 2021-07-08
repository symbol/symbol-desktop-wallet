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

import { Address, Deadline, MetadataType, Transaction, UInt64 } from 'symbol-sdk';
import * as _ from 'lodash';
import Vue from 'vue';

// internal dependencies
import { AwaitLock } from './AwaitLock';
import { MetadataService } from '@/services/MetadataService';
import { MetadataModel } from '@/core/database/entities/MetadataModel';

const Lock = AwaitLock.create();

interface MetadataFormState {
    targetAddress: Address;
    metadataValue: string;
    targetId: string;
    scopedKey: string;
    maxFee: number;
}

interface MetadataState {
    initialized: boolean;
    accountMetadataList: MetadataModel[];
    mosaicMetadataList: MetadataModel[];
    namespaceMetadataList: MetadataModel[];
    isFetchingMetadata: boolean;
    transactions: Transaction[];
    metadataType: MetadataType;
    metadataForm: MetadataFormState;
}

const metadataState: MetadataState = {
    initialized: false,
    accountMetadataList: [],
    mosaicMetadataList: [],
    namespaceMetadataList: [],
    isFetchingMetadata: false,
    transactions: [],
    metadataType: MetadataType.Account,
    metadataForm: {
        targetAddress: null,
        metadataValue: '',
        targetId: '',
        scopedKey: '',
        maxFee: 0,
    },
};

export default {
    namespaced: true,
    state: metadataState,
    getters: {
        getInitialized: (state: MetadataState) => state.initialized,
        accountMetadataList: (state: MetadataState) => state.accountMetadataList,
        mosaicMetadataList: (state: MetadataState) => state.mosaicMetadataList,
        namespaceMetadataList: (state: MetadataState) => state.namespaceMetadataList,
        isFetchingMetadata: (state: MetadataState) => state.isFetchingMetadata,
        metadataType: (state: MetadataState) => state.metadataType,
        metadataForm: (state: MetadataState) => state.metadataForm,
        transactions: (state: MetadataState) => state.transactions,
    },
    mutations: {
        setInitialized: (state: MetadataState, initialized) => {
            state.initialized = initialized;
        },
        metadataList: (state: MetadataState, metadataList: MetadataModel[]) => {
            const uniqueMetadataList = _.uniqBy(metadataList, (n) => n.metadataId);
            Vue.set(
                state,
                'accountMetadataList',
                uniqueMetadataList.filter((metadata) => metadata.metadataType === MetadataType.Account),
            );
            Vue.set(
                state,
                'mosaicMetadataList',
                uniqueMetadataList.filter((metadata) => metadata.metadataType === MetadataType.Mosaic),
            );
            Vue.set(
                state,
                'namespaceMetadataList',
                uniqueMetadataList.filter((metadata) => metadata.metadataType === MetadataType.Namespace),
            );
        },
        isFetchingMetadata: (state: MetadataState, isFetchingMetadata: boolean) => Vue.set(state, 'isFetchingMetadata', isFetchingMetadata),
        metadataType: (state: MetadataState, metadataType: MetadataType) => {
            Vue.set(state, 'metadataType', metadataType);
        },
        metadataForm: (state: MetadataState, metadataForm: MetadataFormState) => {
            Vue.set(state, 'metadataForm', metadataForm);
        },
        transactions: (state: MetadataState, transactions: Transaction[]) => {
            Vue.set(state, 'transactions', transactions);
        },
    },
    actions: {
        async initialize({ commit, getters }) {
            const callback = async () => {
                // Placeholder for initialization if necessary.
                commit('setInitialized', true);
            };
            // aquire async lock until initialized
            await Lock.initialize(callback, { getters });
        },

        async uninitialize({ commit, getters }) {
            const callback = async () => {
                commit('setInitialized', false);
            };
            await Lock.uninitialize(callback, { getters });
        },

        async SET_METADATA_FORM_STATE({ commit }, metadataForm: MetadataFormState) {
            commit('metadataForm', metadataForm);
        },

        async SIGNER_CHANGED({ dispatch }) {
            await dispatch('LOAD_METADATA_LIST');
        },

        async LOAD_METADATA_LIST({ commit, rootGetters }) {
            const repositoryFactory = rootGetters['network/repositoryFactory'];
            const generationHash = rootGetters['network/generationHash'];
            const metadataService = new MetadataService();
            const currentSignerAddress: Address = rootGetters['account/currentSignerAddress'];
            if (!currentSignerAddress) {
                return;
            }
            commit('isFetchingMetadata', true);
            metadataService
                .getMetadataList(repositoryFactory, generationHash, currentSignerAddress)
                .subscribe((metadataList: MetadataModel[]) => {
                    //wait till value change
                    setTimeout(() => {
                        commit('metadataList', metadataList);
                    }, 2000);
                })
                .add(() => commit('isFetchingMetadata', false));
        },

        async RESOLVE_METADATA_TRANSACTIONS({ commit, rootGetters, dispatch }, metadataType: MetadataType) {
            const currentSignerAddress = rootGetters['account/currentSignerAddress'];
            const repositoryFactory = rootGetters['network/repositoryFactory'];
            const networkType = rootGetters['network/networkType'];
            const metadataForm: MetadataFormState = rootGetters['metadata/metadataForm'];

            if (!currentSignerAddress) {
                return;
            }
            await dispatch('network/SET_TRANSACTION_DEADLINE', { root: true });
            const deadline = rootGetters['network/simpleTransactionDeadline'] as Deadline;

            const metadataService = new MetadataService();
            const metadataTransaction = await metadataService
                .metadataTransactionObserver(
                    repositoryFactory,
                    deadline,
                    networkType,
                    currentSignerAddress,
                    metadataForm.targetAddress,
                    metadataForm.scopedKey,
                    metadataForm.metadataValue,
                    metadataForm.targetId,
                    metadataType,
                    UInt64.fromUint(metadataForm.maxFee),
                )
                .toPromise();
            commit('transactions', [metadataTransaction]);
        },
    },
};
