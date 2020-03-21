/**
 * Copyright 2020 NEM Foundation (https://nem.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// external dependencies
import {Component, Prop, Vue} from 'vue-property-decorator'
import {mapGetters} from 'vuex'
// internal dependencies
import {WalletModel} from '@/core/database/entities/WalletModel'
import {NamespaceModel} from '@/core/database/entities/NamespaceModel'

@Component({
  computed: mapGetters({
    namespaces: 'namespace/namespaces',
  }),
})
export class WalletAliasDisplayTs extends Vue {
  @Prop({default: null}) wallet: WalletModel

  /**
   * NamespaceModel
   */
  protected namespaces: NamespaceModel[]

  get walletAliases(): string[] {
    if (!this.namespaces || !this.wallet) return []


    // get the current wallet address
    const address = this.wallet.address

    // return the current wallet aliases
    return this.namespaces
      .filter(
        ({aliasTargetAddressRawPlain}) => aliasTargetAddressRawPlain && aliasTargetAddressRawPlain === address)
      .map(({name, namespaceIdHex}) => name || namespaceIdHex)
  }
}
