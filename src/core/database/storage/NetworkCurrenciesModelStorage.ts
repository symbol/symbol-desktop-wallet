/*
 * Copyright 2020 NEM Foundation (https://nem.io)
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

import { NetworkCurrenciesModel } from '@/core/database/entities/NetworkCurrenciesModel'
import { VersionedNetworkBasedObjectStorage } from '@/core/database/backends/VersionedNetworkBasedObjectStorage'
import { NetworkCurrencyModel } from '../entities/NetworkCurrencyModel'

export class NetworkCurrenciesModelStorage extends VersionedNetworkBasedObjectStorage<NetworkCurrenciesModel> {
  /**
   * Singleton instance as we want to run the migration just once
   */
  public static INSTANCE = new NetworkCurrenciesModelStorage()

  private constructor() {
    super('networkCurrencyCache', [
      {
        description: 'Reset networkCurrencyCache for 0.9.6.3 network (id changes)',
        migrate: (from: any) => {
          const xymMosaic96x = new NetworkCurrencyModel(
            '5E62990DCAC5BE8A',
            'E74B99BA41F4AFEE',
            'symbol.xym',
            6,
            true,
            false,
            false,
            'XYM',
          )
          // reset table for new cache
          return new NetworkCurrenciesModel(xymMosaic96x, xymMosaic96x)
        },
      },
      {
        description: 'Reset networkCurrencyCache for 0.10.x network (id changes)',
        migrate: (from: any) => {
          const xymMosaic96x = new NetworkCurrencyModel(
            '5B66E76BECAD0860',
            'E74B99BA41F4AFEE',
            'symbol.xym',
            6,
            true,
            false,
            false,
            'XYM',
          )
          // reset table for new cache
          return new NetworkCurrenciesModel(xymMosaic96x, xymMosaic96x)
        },
      },
    ])
  }
}
