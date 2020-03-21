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
import {MosaicId, Address} from 'symbol-sdk'
import {Component, Vue} from 'vue-property-decorator'
import {mapGetters} from 'vuex'

// internal dependencies
import {WalletModel} from '@/core/database/entities/WalletModel'
import {UIHelpers} from '@/core/utils/UIHelpers'
// child components
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue'
// @ts-ignore
import MosaicBalanceList from '@/components/MosaicBalanceList/MosaicBalanceList.vue'
import {MosaicModel} from '@/core/database/entities/MosaicModel'
import {NetworkCurrencyModel} from '@/core/database/entities/NetworkCurrencyModel'

@Component({
  components: {
    MosaicAmountDisplay,
    MosaicBalanceList,
  },
  computed: {
    ...mapGetters({
      currentWallet: 'wallet/currentWallet',
      currentSignerAddress: 'wallet/currentSignerAddress',
      balanceMosaics: 'mosaic/balanceMosaics',
      isCosignatoryMode: 'wallet/isCosignatoryMode',
      networkCurrency: 'mosaic/networkCurrency',
      networkMosaicId: 'mosaic/networkMosaic',
    }),
  },
})
export class AccountBalancesPanelTs extends Vue {
  /**
   * Currently active wallet
   * @var {WalletModel}
   */
  public currentWallet: WalletModel

  /**
   * Currently active signer
   * @var {any}
   */
  public currentSignerAddress: Address

  /**
   * Currently active wallet's balances
   * @var {Mosaic[]}
   */
  public balanceMosaics: MosaicModel[]

  /**
   * Whether currently active wallet is in cosignatory mode
   * @var {boolean}
   */
  public isCosignatoryMode: boolean

  /**
   * Networks currency mosaic
   * @var {MosaicId}
   */
  public networkCurrency: NetworkCurrencyModel

  public networkMosaicId: MosaicId


  /**
   * UI Helpers
   * @var {UIHelpers}
   */
  public uiHelpers = UIHelpers

  public async created() {
    this.$store.dispatch('mosaic/LOAD_MOSAICS')
  }

  /**
   * Network mosaic divisibility
   * @readonly
   * @protected
   * @type {number}
   */
  protected get divisibility(): number {
    return this.networkCurrency && this.networkCurrency.divisibility || 0
  }

  public get absoluteBalance() {
    const networkMosaicData = this.balanceMosaics.filter(m => m.isCurrencyMosaic).find(i => i)
    return networkMosaicData && networkMosaicData.balance || 0
  }

  public get networkMosaicBalance(): number {
    const balance = this.absoluteBalance
    if (balance === 0 || !this.divisibility) return 0
    return balance / Math.pow(10, this.divisibility)
  }

}
