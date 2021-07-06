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

import { getNetworkConfigs } from '@/config';
import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel';
import { NetworkModel, RestNode } from '@/core/database/entities/NetworkModel';
import { NetworkModelStorage } from '@/core/database/storage/NetworkModelStorage';
import { NetworkConfigurationHelpers } from '@/core/utils/NetworkConfigurationHelpers';
import { NetworkTypeHelper } from '@/core/utils/NetworkTypeHelper';
import { URLHelpers } from '@/core/utils/URLHelpers';
import { MosaicService } from '@/services/MosaicService';
import { OfflineUrl } from '@/services/offline/MockModels';
import { OfflineRepositoryFactory } from '@/services/offline/OfflineRepositoryFactory';
import * as _ from 'lodash';
import { combineLatest, defer, EMPTY, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { NetworkConfiguration, RepositoryFactory, RepositoryFactoryHttp, RoleType } from 'symbol-sdk';

export interface AddNetworkParams {
    name?: string;
    nodeUrl: string;
    explorerUrl?: string;
    faucetUrl?: string;
}

export interface NetworkModelResult {
    networkModel: NetworkModel;
    repositoryFactory: RepositoryFactory;
    url: string;
}

/**
 * The service in charge of loading Network information from the storage.
 */
export class NetworkService {
    /**
     * The network information.
     */
    private readonly storage = NetworkModelStorage.INSTANCE;

    constructor() {
        getNetworkConfigs().forEach((staticConfig) => {
            if (!this.storage.get(staticConfig.generationHash)) {
                this.storage.set(staticConfig.generationHash, staticConfig);
            }
        });
    }

    /**
     * The best default Url. It uses the stored configuration if possible.
     */
    public getDefaultNetworkModel(): NetworkModel {
        const storedNetworkModel = this.storage.getLatest();
        if (!storedNetworkModel) {
            throw new Error('Default Network Model could not be found!!!');
        }
        return storedNetworkModel;
    }

    /**
     * The best default Url. It uses the stored configuration if possible.
     */
    public getAllNetworkModels(): Record<string, NetworkModel> {
        return this.storage.getAll();
    }

    /**
     * This method adds a new network when the user provides a url.
     * the next available url will be used.
     *
     * @param params the minimal params to create a connection
     */
    public addNewNetwork(params: AddNetworkParams): Observable<NetworkModelResult> {
        const url = params.nodeUrl;
        const repositoryFactory = NetworkService.createRepositoryFactory(url);
        return repositoryFactory.getGenerationHash().pipe(
            mergeMap((generationHash) => {
                // A way to update!
                // const storedNetwork = this.storage.get(generationHash);
                // if (storedNetwork) {
                //     throw new Error(`The network with ${generationHash} already exist. Should you create a new Profile?`);
                // }
                const networkRepository = repositoryFactory.createNetworkRepository();
                const nodeRepository = repositoryFactory.createNodeRepository();
                const networkTypeObservable = repositoryFactory.getNetworkType();
                const networkPropertiesObservable = networkRepository
                    .getNetworkProperties()
                    .pipe(map((d) => this.toNetworkConfigurationModel(d, undefined)));
                const networkCurrenciesObservable = new MosaicService().getNetworkCurrencies(repositoryFactory);
                const nodeInfoObservable = nodeRepository.getNodeInfo();
                const transactionFeesObservable = repositoryFactory.createNetworkRepository().getTransactionFees();
                const peersObservable = repositoryFactory.createNodeRepository().getNodePeers();
                return combineLatest([
                    networkTypeObservable,
                    networkPropertiesObservable,
                    nodeInfoObservable,
                    transactionFeesObservable,
                    peersObservable,
                    networkCurrenciesObservable,
                ]).pipe(
                    map(([networkType, networkProperties, nodeInfo, transactionFees, peers, networkCurrencies]) => {
                        const nodes: RestNode[] = [
                            { friendlyName: nodeInfo.friendlyName, url: url },
                            ...peers
                                .filter((p) => p.roles.includes(RoleType.ApiNode))
                                .map((p) => {
                                    return {
                                        friendlyName: p.friendlyName,
                                        url: `http://${p.host}:3000`,
                                    };
                                }),
                        ];
                        return {
                            networkModel: new NetworkModel(
                                params.name || `${NetworkTypeHelper.getNetworkTypeName(networkType)} Network`,
                                networkType,
                                generationHash,
                                networkProperties,
                                _.uniqBy(nodes, (i) => i.url.toLowerCase()),
                                transactionFees,
                                networkCurrencies,
                                params.explorerUrl,
                                params.faucetUrl,
                            ),
                            url,
                            repositoryFactory,
                        };
                    }),
                    tap((p) => this.storage.set(generationHash, p.networkModel)),
                );
            }),
        );
    }

    public getNetworkModelBasic(generationHash: string | undefined, nodeUrl: string | undefined): NetworkModel {
        if (generationHash) {
            const networkModel = this.storage.get(generationHash);
            if (!networkModel) {
                throw new Error(`There is not stored Network Model with hash ${generationHash}`);
            }
            return networkModel;
        }
        if (nodeUrl) {
            const networkModel = Object.values(this.storage.getAll()).find((model) =>
                model.nodes.find((n) => n.url.toLowerCase() == nodeUrl.toLowerCase()),
            );
            if (!networkModel) {
                throw new Error(`There is not stored Network Model with url ${nodeUrl}`);
            }
            return networkModel;
        }

        throw new Error(`Generation hash or nodeUrl must be provided!`);
    }

    /**
     * This method get the network data from the provided URL. If the server in the candidateUrl is down,
     * the next available url will be used.
     *
     * @param nodeUrl
     * @param defaultGenerationHash the generation hash if it's known.
     * @param isOffline
     */
    public getNetworkModel(
        nodeUrl: string,
        defaultGenerationHash: string | undefined = undefined,
        isOffline: boolean = false,
    ): Observable<NetworkModelResult> {
        if (isOffline) {
            if (!defaultGenerationHash) {
                throw new Error('defaultGenerationHash must be provided when requesting offline model;');
            }
            const storedNetwork = this.storage.get(defaultGenerationHash);
            if (!storedNetwork) {
                throw new Error(`There is not stored Network Model with the name ${defaultGenerationHash} `);
            }
            return of({
                networkModel: storedNetwork,
                repositoryFactory: new OfflineRepositoryFactory(storedNetwork),
                url: OfflineUrl,
            });
        }
        return from(this.createRepositoryFactory(nodeUrl)).pipe(
            mergeMap(({ url, repositoryFactory }) => {
                return repositoryFactory.getGenerationHash().pipe(
                    mergeMap((generationHash) => {
                        const storedNetwork = this.storage.get(generationHash);
                        if (!storedNetwork) {
                            return throwError(new Error(`${generationHash} is not a known network!`));
                        }
                        // NOTE, the original node list is not update at network store because the user already has its own store for that.
                        // See NodeService. Note, I think how nodes are retrieved can be simplified a lot...
                        const networkTypeObservable = repositoryFactory.getNetworkType();
                        const generationHashObservable = repositoryFactory.getGenerationHash();
                        const transactionFeesObservable = repositoryFactory.createNetworkRepository().getTransactionFees();
                        return combineLatest([networkTypeObservable, generationHashObservable, transactionFeesObservable]).pipe(
                            map(([networkType, generationHash, transactionFees]) => {
                                if (networkType !== storedNetwork.networkType) {
                                    throw new Error(`Invalid networkType from ${url}`);
                                }
                                if (generationHash !== storedNetwork.generationHash) {
                                    throw new Error(`Invalid generationHash from ${url}`);
                                }
                                return {
                                    networkModel: {
                                        ...storedNetwork,
                                        transactionFees,
                                    },
                                    url,
                                    repositoryFactory,
                                };
                            }),
                            tap((p) => this.storage.set(generationHash, p.networkModel)),
                        );
                    }),
                );
            }),
        );
    }

    private createRepositoryFactory(url: string): Observable<{ url: string; repositoryFactory: RepositoryFactory }> {
        // console.log(`Testing ${url}`);
        const repositoryFactory = NetworkService.createRepositoryFactory(url);
        return defer(() => {
            return repositoryFactory.getGenerationHash();
        }).pipe(
            map(() => {
                // console.log(`Peer ${url} seems OK`);
                return { url, repositoryFactory };
            }),
            catchError((e) => {
                console.log(`Peer ${url} seems down. Ignoring. Error: ${e.message}`, e);
                return EMPTY;
            }),
        );
    }

    private toNetworkConfigurationModel(
        dto: NetworkConfiguration,
        defaultNetworkModel: NetworkConfigurationModel | undefined,
    ): NetworkConfigurationModel {
        const helper = new NetworkConfigurationHelpers(defaultNetworkModel);
        const fromDto: NetworkConfigurationModel = {
            epochAdjustment: helper.epochAdjustment(dto),
            maxMosaicDivisibility: helper.maxMosaicDivisibility(dto),
            namespaceGracePeriodDuration: helper.namespaceGracePeriodDuration(dto),
            lockedFundsPerAggregate: helper.lockedFundsPerAggregate(dto),
            maxCosignatoriesPerAccount: helper.maxCosignatoriesPerAccount(dto),
            blockGenerationTargetTime: helper.blockGenerationTargetTime(dto),
            maxNamespaceDepth: helper.maxNamespaceDepth(dto),
            maxMosaicDuration: helper.maxMosaicDuration(dto),
            minNamespaceDuration: helper.minNamespaceDuration(dto),
            maxNamespaceDuration: helper.maxNamespaceDuration(dto),
            maxTransactionsPerAggregate: helper.maxTransactionsPerAggregate(dto),
            maxCosignedAccountsPerAccount: helper.maxCosignedAccountsPerAccount(dto),
            maxMessageSize: helper.maxMessageSize(dto),
            maxMosaicAtomicUnits: helper.maxMosaicAtomicUnits(dto),
            currencyMosaicId: helper.currencyMosaicId(dto),
            harvestingMosaicId: helper.harvestingMosaicId(dto),
            defaultDynamicFeeMultiplier: helper.defaultDynamicFeeMultiplier(dto),
            totalChainImportance: helper.totalChainImportance(dto),
        };
        return { ...defaultNetworkModel, ...fromDto };
    }

    /**
     * It creates the RepositoryFactory used to build the http repository/clients and listeners.
     * @param url the url.
     */
    public static createRepositoryFactory(url: string): RepositoryFactory {
        return new RepositoryFactoryHttp(url, {
            websocketUrl: URLHelpers.httpToWsUrl(url) + '/ws',
            websocketInjected: WebSocket,
        });
    }
}
