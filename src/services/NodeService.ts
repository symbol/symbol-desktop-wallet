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
import { NodeModel } from '@/core/database/entities/NodeModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { NodeModelStorage } from '@/core/database/storage/NodeModelStorage';
import { ObservableHelpers } from '@/core/utils/ObservableHelpers';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NodeInfo, RepositoryFactory } from 'symbol-sdk';

/**
 * The service in charge of loading and caching anything related to Node and Peers from Rest.
 * The cache is done by storing the payloads in SimpleObjectStorage.
 */
export class NodeService {
    /**
     * The peer information local cache.
     *
     * NodeModelStorage is broken. It stores flat and it only has a network type reference.
     * It cannot handles nodes with same network type but different network!
     *
     * https://github.com/nemgrouplimited/symbol-desktop-wallet/issues/1406
     */
    private readonly storage = NodeModelStorage.INSTANCE;

    public getKnowNodesOnly(profile: ProfileModel, networkModel: NetworkModel): NodeModel[] {
        if (profile.generationHash != networkModel.generationHash) {
            throw new Error('Invalid generation hash in profile and network objects!');
        }
        if (profile.networkType != networkModel.networkType) {
            throw new Error('Invalid network type in profile and network objects!');
        }
        return _.uniqBy(this.loadNodes(profile).concat(this.loadStaticNodes(networkModel)), 'url').filter(
            (n) => n.networkType === profile.networkType,
        );
    }

    public getNodes(
        profile: ProfileModel,
        networkModel: NetworkModel,
        repositoryFactory: RepositoryFactory,
        repositoryFactoryUrl: string,
    ): Observable<NodeModel[]> {
        const storedNodes = this.getKnowNodesOnly(profile, networkModel);
        const nodeRepository = repositoryFactory.createNodeRepository();
        return nodeRepository.getNodeInfo().pipe(
            map((dto: NodeInfo) =>
                this.createNodeModel(repositoryFactoryUrl, dto.friendlyName, undefined, networkModel, dto.publicKey, dto.nodePublicKey),
            ),
            ObservableHelpers.defaultLast(this.createNodeModel(repositoryFactoryUrl, undefined, undefined, networkModel)),
            map((currentNode) => _.uniqBy([currentNode, ...storedNodes], (p) => p.url.toLowerCase())),
            tap((p) => this.saveNodes(profile, p)),
        );
    }

    private loadStaticNodes(networkModel: NetworkModel): NodeModel[] {
        return networkModel.nodes.map((n) => {
            return this.createNodeModel(n.url, n.friendlyName, true, networkModel);
        });
    }

    private createNodeModel(
        url: string,
        friendlyName: string | undefined = undefined,
        isDefault: boolean | undefined = undefined,
        networkModel: NetworkModel,
        publicKey?: string,
        nodePublicKey?: string,
    ): NodeModel {
        return new NodeModel(
            url,
            friendlyName || '',
            isDefault || !!networkModel.nodes.find((n) => n.url === url),
            networkModel.networkType,
            publicKey,
            nodePublicKey,
        );
    }

    private loadNodes(profile: ProfileModel): NodeModel[] {
        const allProfileNodes = this.storage.get() || {};
        return allProfileNodes[profile.profileName] || [];
    }

    public saveNodes(profile: ProfileModel, nodes: NodeModel[]) {
        const allProfileNodes = this.storage.get() || {};
        allProfileNodes[profile.profileName] = nodes;
        this.storage.set(allProfileNodes);
    }

    public reset() {
        this.storage.remove();
    }
}
