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

import { NetworkCurrencyModel } from '@/core/database/entities/NetworkCurrencyModel';

/**
 * The model storing the known network currencies.
 */
export class NetworkCurrenciesModel {
    /**
     *
     * @param networkCurrency the network main currency, example symbol.xym
     * @param harvestCurrency or undefined if the harvest currency is the network currency.
     */
    constructor(public networkCurrency: NetworkCurrencyModel, public harvestCurrency?: NetworkCurrencyModel) {}
}
