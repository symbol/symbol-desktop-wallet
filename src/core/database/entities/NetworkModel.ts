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
import { NetworkCurrenciesModel } from '@/core/database/entities/NetworkCurrenciesModel';
import { NetworkType, TransactionFees } from 'symbol-sdk';

export class RestNode {
    constructor(public readonly friendlyName: string, public readonly url: string) {}
}
/**
 * Stored POJO that holds network information.
 *
 * The stored data is cached from rest.
 *
 * The object is serialized and deserialized to/from JSON. no method or complex attributes can be fined.
 *
 */
export class NetworkModel {
    constructor(
        public readonly name: string,
        public readonly networkType: NetworkType,
        public readonly generationHash: string,
        public readonly networkConfiguration: NetworkConfigurationModel,
        public readonly nodes: RestNode[],
        public readonly transactionFees: TransactionFees,
        public readonly networkCurrencies: NetworkCurrenciesModel,
        public readonly explorerUrl: string | undefined,
        public readonly faucetUrl: string | undefined,
    ) {}
}
