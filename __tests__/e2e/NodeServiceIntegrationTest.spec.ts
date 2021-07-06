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
import { defaultMainnetNetworkConfig } from '@/config';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { NodeService } from '@/services/NodeService';
import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { NetworkType, NodeInfo, NodeRepository, RepositoryFactory, RoleType } from 'symbol-sdk';
import { instance, mock, when } from 'ts-mockito';

const nodeService = new NodeService();
const realUrl = 'http://api-01.us-west-1.symboldev.network:3000';
const fakeNodeInfo = new NodeInfo(
    'Some Public Key',
    'Some Gen Hash',
    1234,
    NetworkType.TEST_NET,
    4567,
    [RoleType.ApiNode],
    'Some Host',
    'Some Friendly Name',
);

const mockRepoFactory = mock<RepositoryFactory>();

const mockNodeRepository = mock<NodeRepository>();
when(mockNodeRepository.getNodePeers()).thenReturn(of([fakeNodeInfo]));
when(mockNodeRepository.getNodeInfo()).thenReturn(of(fakeNodeInfo));

const nodeRepository = instance(mockNodeRepository);

when(mockRepoFactory.createNodeRepository()).thenReturn(nodeRepository);
when(mockRepoFactory.getEpochAdjustment()).thenReturn(of(1573430400));
when(mockRepoFactory.getGenerationHash()).thenReturn(of(defaultMainnetNetworkConfig.generationHash));
const repositoryFactory = instance(mockRepoFactory);

const fakeProfile: ProfileModel = {
    profileName: 'fakeName',
    generationHash: defaultMainnetNetworkConfig.generationHash,
    hint: 'fakeHint',
    networkType: defaultMainnetNetworkConfig.networkType,
    password: 'fakePassword',
    seed: 'fakeSeed',
    accounts: [],
    termsAndConditionsApproved: true,
    selectedNodeUrlToConnect: 'fakeNode',
};

describe('services/NodeService', () => {
    test('getNodes', async () => {
        const peers = await nodeService
            .getNodes(fakeProfile, defaultMainnetNetworkConfig, repositoryFactory, realUrl)
            .pipe(toArray())
            .toPromise();
        console.log(JSON.stringify(peers, null, 2));
    });
});
