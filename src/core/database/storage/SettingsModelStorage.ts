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

import { VersionedObjectStorage } from '@/core/database/backends/VersionedObjectStorage'
import { SettingsModel } from '@/core/database/entities/SettingsModel'
import networkConfig from '../../../../config/network.conf.json'

export class SettingsModelStorage extends VersionedObjectStorage<Record<string, SettingsModel>> {
  /**
   * Singleton instance as we want to run the migration just once
   */
  public static INSTANCE = new SettingsModelStorage()

  private constructor() {
    super('settings', [
      {
        description: 'Update settings to 0.9.5.1 network',
        migrate: () => undefined,
      },
      {
        description: 'Update settings for 0.9.6.3 network (address changes)',
        migrate: (from: any) => {
          // update all pre-0.9.6.x settings
          const profiles = Object.keys(from)

          const modified: any = from
          profiles.map((name: string) => {
            modified[name] = {
              ...modified[name],
              explorerUrl: networkConfig.explorerUrl,
            }
          })

          return modified
        },
      },
      {
        description: 'Update settings for 0.10.x network (address changes)',
        migrate: (from: any) => {
          // update all pre-0.10.x settings
          const settings = Object.keys(from)

          const modified: any = from
          settings.map((name: string) => {
            modified[name] = {
              ...modified[name],
              explorerUrl: networkConfig.explorerUrl,
              faucetUrl: networkConfig.faucetUrl,
            }
          })

          return modified
        },
      },
    ])
  }
}
