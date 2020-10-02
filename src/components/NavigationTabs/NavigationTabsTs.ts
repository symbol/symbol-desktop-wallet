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

// external dependencies
import { Component, Vue, Prop } from 'vue-property-decorator'
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel'
import { mapGetters } from 'vuex'
// internal dependencies
import { TabEntry } from '@/router/TabEntry'

@Component({
  computed: {
    ...mapGetters({
      currentAccount: 'account/currentAccount',
    }),
  },
})
export class NavigationTabsTs extends Vue {
  /**
   * Parent route name
   * @var {string}
   */
  @Prop({ default: '' }) parentRouteName: string

  public get tabEntries(): TabEntry[] {
    // @ts-ignore
    return this.$router.getTabEntries(this.parentRouteName)
  }

  public currentAccount: AccountModel

  public get isLedger(): boolean {
    return this.currentAccount.type == AccountType.fromDescriptor('Ledger')
  }

  public get entries(): TabEntry[] {
    let entry
    if (this.isLedger) {
      entry = this.tabEntries.filter((entry) => {
        return entry.title != 'page_title_account_backup'
      })
      return entry
    } else {
      // @ts-ignore
      return this.$router.getTabEntries(this.parentRouteName)
    }
  }
  @Prop({ default: 'horizontal' }) direction: 'horizontal' | 'vertical'
}
