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

import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel';
import { Formatters } from '@/core/utils/Formatters';
import { TimeHelpers } from '@/core/utils/TimeHelpers';
import { NetworkConfiguration } from 'symbol-sdk';

/**
 * Helper class that retrieves properties from the SDK's NetworkConfiguration object when
 * available.
 *
 * This helper:
 * - It enumerates the network configuration properties the wallet uses
 * - It handles possible problems when the network configuration coming from the server is
 * incomplete.
 * - It defines common defaults when properties from unknown
 * - It parses configuration values to a format the wallet understands
 */
export class NetworkConfigurationHelpers {
    /**
     * @param defaults the defaults if the provided configuration is incomplete.
     */
    constructor(private readonly defaults: NetworkConfigurationModel | undefined) {}

    public maxMosaicDivisibility(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.mosaic &&
                Formatters.configurationNumberAsNumber(networkConfiguration.plugins.mosaic.maxMosaicDivisibility)) ||
            defaultValue ||
            this.getDefaults().maxMosaicDivisibility
        );
    }

    public maxNamespaceDepth(networkConfiguration: NetworkConfiguration | undefined, defaultValue: number | undefined = undefined): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.namespace &&
                Formatters.configurationNumberAsNumber(networkConfiguration.plugins.namespace.maxNamespaceDepth)) ||
            defaultValue ||
            this.getDefaults().maxNamespaceDepth
        );
    }

    public namespaceGracePeriodDuration(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.namespace &&
                TimeHelpers.durationStringToSeconds(networkConfiguration.plugins.namespace.namespaceGracePeriodDuration)) ||
            defaultValue ||
            this.getDefaults().namespaceGracePeriodDuration
        );
    }

    public maxCosignatoriesPerAccount(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.multisig &&
                Formatters.configurationNumberAsNumber(networkConfiguration.plugins.multisig.maxCosignatoriesPerAccount)) ||
            defaultValue ||
            this.getDefaults().maxCosignatoriesPerAccount
        );
    }

    public blockGenerationTargetTime(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.chain &&
                TimeHelpers.durationStringToSeconds(networkConfiguration.chain.blockGenerationTargetTime)) ||
            defaultValue ||
            this.getDefaults().blockGenerationTargetTime
        );
    }

    public lockedFundsPerAggregate(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: string | undefined = undefined,
    ): string {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.lockhash &&
                Formatters.configurationNumberAsString(networkConfiguration.plugins.lockhash.lockedFundsPerAggregate)) ||
            defaultValue ||
            this.getDefaults().lockedFundsPerAggregate
        );
    }

    public maxMosaicDuration(networkConfiguration: NetworkConfiguration | undefined, defaultValue: number | undefined = undefined): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.mosaic &&
                TimeHelpers.durationStringToSeconds(networkConfiguration.plugins.mosaic.maxMosaicDuration)) ||
            defaultValue ||
            this.getDefaults().maxMosaicDuration
        );
    }

    public epochAdjustment(networkConfiguration: NetworkConfiguration | undefined, defaultValue: number | undefined = undefined): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.mosaic &&
                TimeHelpers.durationStringToSeconds(networkConfiguration.network.epochAdjustment)) ||
            defaultValue ||
            this.getDefaults().epochAdjustment
        );
    }

    public minNamespaceDuration(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.namespace &&
                TimeHelpers.durationStringToSeconds(networkConfiguration.plugins.namespace.minNamespaceDuration)) ||
            defaultValue ||
            this.getDefaults().minNamespaceDuration
        );
    }

    public maxNamespaceDuration(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.namespace &&
                TimeHelpers.durationStringToSeconds(networkConfiguration.plugins.namespace.maxNamespaceDuration)) ||
            defaultValue ||
            this.getDefaults().maxNamespaceDuration
        );
    }

    public maxTransactionsPerAggregate(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.aggregate &&
                Formatters.configurationNumberAsNumber(networkConfiguration.plugins.aggregate.maxTransactionsPerAggregate)) ||
            defaultValue ||
            this.getDefaults().maxTransactionsPerAggregate
        );
    }

    public maxCosignedAccountsPerAccount(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.multisig &&
                Formatters.configurationNumberAsNumber(networkConfiguration.plugins.multisig.maxCosignedAccountsPerAccount)) ||
            defaultValue ||
            this.getDefaults().maxCosignedAccountsPerAccount
        );
    }

    public maxMessageSize(networkConfiguration: NetworkConfiguration | undefined, defaultValue: number | undefined = undefined): number {
        return (
            (networkConfiguration &&
                networkConfiguration.plugins &&
                networkConfiguration.plugins.transfer &&
                Formatters.configurationNumberAsNumber(networkConfiguration.plugins.transfer.maxMessageSize)) ||
            defaultValue ||
            this.getDefaults().maxMessageSize
        );
    }

    public maxMosaicAtomicUnits(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.chain &&
                Formatters.configurationNumberAsNumber(networkConfiguration.chain.maxMosaicAtomicUnits)) ||
            defaultValue ||
            this.getDefaults().maxMosaicAtomicUnits
        );
    }

    public currencyMosaicId(networkConfiguration: NetworkConfiguration | undefined, defaultValue: string | undefined = undefined): string {
        return (
            (networkConfiguration &&
                networkConfiguration.chain &&
                Formatters.configurationStringAsString(networkConfiguration.chain.currencyMosaicId)) ||
            defaultValue ||
            this.getDefaults().currencyMosaicId
        );
    }

    public harvestingMosaicId(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: string | undefined = undefined,
    ): string {
        return (
            (networkConfiguration &&
                networkConfiguration.chain &&
                Formatters.configurationStringAsString(networkConfiguration.chain.harvestingMosaicId)) ||
            defaultValue ||
            this.getDefaults().harvestingMosaicId
        );
    }

    public defaultDynamicFeeMultiplier(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration &&
                networkConfiguration.chain &&
                Formatters.configurationNumberAsNumber(networkConfiguration.chain.defaultDynamicFeeMultiplier)) ||
            defaultValue ||
            this.getDefaults().defaultDynamicFeeMultiplier
        );
    }

    public totalChainImportance(
        networkConfiguration: NetworkConfiguration | undefined,
        defaultValue: number | undefined = undefined,
    ): number {
        return (
            (networkConfiguration?.chain && Formatters.configurationNumberAsNumber(networkConfiguration.chain.totalChainImportance)) ||
            defaultValue ||
            this.getDefaults().totalChainImportance
        );
    }

    private getDefaults(): NetworkConfigurationModel {
        if (!this.defaults) {
            throw new Error('Network default could not be loaded!!!');
        }
        return this.defaults;
    }
}
