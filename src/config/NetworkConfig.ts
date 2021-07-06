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

import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { NamespaceId, NetworkType } from 'symbol-sdk';

// DO NOT USE THIS CONST. See NetworkModel
export const defaultTestnetNetworkConfig: NetworkModel = {
    explorerUrl: 'http://explorer.testnet.symboldev.network/',
    faucetUrl: 'http://faucet.testnet.symboldev.network/',
    name: 'Symbol Testnet',
    networkType: NetworkType.TEST_NET,
    generationHash: '3B5E1FA6445653C971A50687E75E6D09FB30481055E3990C84B25E9222DC1155',
    transactionFees: {
        averageFeeMultiplier: 84587,
        medianFeeMultiplier: 100,
        highestFeeMultiplier: 1136363,
        lowestFeeMultiplier: 0,
        minFeeMultiplier: 100,
    },
    networkCurrencies: {
        networkCurrency: {
            mosaicIdHex: '091F837E059AE13C',
            namespaceIdHex: new NamespaceId('symbol.xym').toHex(),
            namespaceIdFullname: 'symbol.xym',
            ticker: 'XYM',
            divisibility: 6,
            transferable: true,
            supplyMutable: false,
            restrictable: false,
        },
    },
    networkConfiguration: {
        maxMosaicDivisibility: 6,
        namespaceGracePeriodDuration: 86400,
        lockedFundsPerAggregate: '10000000',
        maxCosignatoriesPerAccount: 25,
        blockGenerationTargetTime: 30,
        maxNamespaceDepth: 3,
        maxMosaicDuration: 315360000,
        minNamespaceDuration: 2592000,
        maxNamespaceDuration: 157680000,
        maxTransactionsPerAggregate: 100,
        maxCosignedAccountsPerAccount: 25,
        maxMessageSize: 1024,
        maxMosaicAtomicUnits: 8999999999000000,
        currencyMosaicId: '091F837E059AE13C',
        harvestingMosaicId: '091F837E059AE13C',
        defaultDynamicFeeMultiplier: 100,
        epochAdjustment: 1616694977,
        totalChainImportance: 7842928625000000,
    },
    nodes: [
        { friendlyName: 'ngl-dual-001', url: 'http://ngl-dual-001.testnet.symboldev.network:3000' },
        { friendlyName: 'ngl-dual-101', url: 'http://ngl-dual-101.testnet.symboldev.network:3000' },
        { friendlyName: 'ngl-dual-201', url: 'http://ngl-dual-201.testnet.symboldev.network:3000' },
        { friendlyName: 'ngl-dual-301', url: 'http://ngl-dual-301.testnet.symboldev.network:3000' },
        { friendlyName: 'ngl-dual-401', url: 'http://ngl-dual-401.testnet.symboldev.network:3000' },
        { friendlyName: 'ngl-dual-501', url: 'http://ngl-dual-501.testnet.symboldev.network:3000' },
        { friendlyName: 'ngl-dual-601', url: 'http://ngl-dual-601.testnet.symboldev.network:3000' },
    ],
};

// DO NOT USE THIS CONST. See NetworkModel
export const defaultMainnetNetworkConfig: NetworkModel = {
    name: 'Symbol Mainnet',
    explorerUrl: 'http://explorer.symbolblockchain.io/',
    faucetUrl: 'http://faucet.mainnet.symboldev.network/',
    networkType: NetworkType.MAIN_NET,
    generationHash: '57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6',
    transactionFees: {
        averageFeeMultiplier: 84587,
        medianFeeMultiplier: 100,
        highestFeeMultiplier: 1136363,
        lowestFeeMultiplier: 0,
        minFeeMultiplier: 100,
    },
    networkCurrencies: {
        networkCurrency: {
            mosaicIdHex: '6BED913FA20223F8',
            namespaceIdHex: new NamespaceId('symbol.xym').toHex(),
            namespaceIdFullname: 'symbol.xym',
            ticker: 'xym',
            divisibility: 6,
            transferable: true,
            supplyMutable: false,
            restrictable: false,
        },
    },
    networkConfiguration: {
        maxMosaicDivisibility: 6,
        namespaceGracePeriodDuration: 2592000,
        lockedFundsPerAggregate: '10000000',
        maxCosignatoriesPerAccount: 25,
        blockGenerationTargetTime: 30,
        maxNamespaceDepth: 3,
        maxMosaicDuration: 315360000,
        minNamespaceDuration: 2592000,
        maxNamespaceDuration: 157680000,
        maxTransactionsPerAggregate: 100,
        maxCosignedAccountsPerAccount: 25,
        maxMessageSize: 1024,
        maxMosaicAtomicUnits: 8999999999000000,
        currencyMosaicId: '6BED913FA20223F8',
        harvestingMosaicId: '6BED913FA20223F8',
        defaultDynamicFeeMultiplier: 100,
        epochAdjustment: 1615853185,
        totalChainImportance: 7842928625000000,
    },
    nodes: [
        { friendlyName: 'ngl-dual-001', url: 'http://ngl-dual-001.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-002', url: 'http://ngl-dual-002.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-003', url: 'http://ngl-dual-003.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-004', url: 'http://ngl-dual-004.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-005', url: 'http://ngl-dual-005.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-101', url: 'http://ngl-dual-101.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-102', url: 'http://ngl-dual-102.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-103', url: 'http://ngl-dual-103.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-104', url: 'http://ngl-dual-104.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-105', url: 'http://ngl-dual-105.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-201', url: 'http://ngl-dual-201.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-202', url: 'http://ngl-dual-202.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-203', url: 'http://ngl-dual-203.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-204', url: 'http://ngl-dual-204.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-205', url: 'http://ngl-dual-205.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-301', url: 'http://ngl-dual-301.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-302', url: 'http://ngl-dual-302.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-303', url: 'http://ngl-dual-303.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-304', url: 'http://ngl-dual-304.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-305', url: 'http://ngl-dual-305.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-401', url: 'http://ngl-dual-401.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-402', url: 'http://ngl-dual-402.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-403', url: 'http://ngl-dual-403.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-404', url: 'http://ngl-dual-404.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-405', url: 'http://ngl-dual-405.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-501', url: 'http://ngl-dual-501.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-502', url: 'http://ngl-dual-502.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-503', url: 'http://ngl-dual-503.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-504', url: 'http://ngl-dual-504.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-505', url: 'http://ngl-dual-505.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-601', url: 'http://ngl-dual-601.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-602', url: 'http://ngl-dual-602.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-603', url: 'http://ngl-dual-603.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-604', url: 'http://ngl-dual-604.symbolblockchain.io:3000' },
        { friendlyName: 'ngl-dual-605', url: 'http://ngl-dual-605.symbolblockchain.io:3000' },
    ],
};

// A special build can inject a new configuration using the 'window.networkConfig' global var.
const networkConfig: Record<string, NetworkModel> = window['networkConfig'] || {};

// If the user hasn't provided with any custom networkConfiguration, add the public as default.
if (!Object.keys(networkConfig).length) {
    networkConfig[defaultMainnetNetworkConfig.generationHash] = defaultMainnetNetworkConfig;
    networkConfig[defaultTestnetNetworkConfig.generationHash] = defaultTestnetNetworkConfig;
}

// DO NOT USE THIS METHOD. See NetworkModel
export function getNetworkConfigs(): NetworkModel[] {
    return Object.values(networkConfig);
}
