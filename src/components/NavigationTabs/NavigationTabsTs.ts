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

// external dependencies
import { Component, Vue, Prop } from 'vue-property-decorator';
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { mapGetters } from 'vuex';
// internal dependencies
import { TabEntry } from '@/router/TabEntry';

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
    @Prop({ default: '' }) parentRouteName: string;
    @Prop() customTabEntries: TabEntry[];

    public get tabEntries(): TabEntry[] {
        if (this.customTabEntries && this.customTabEntries.length > 0) {
            return this.customTabEntries;
        }

        // @ts-ignore
        const getTabEntries = this.$router.getTabEntries(this.parentRouteName);
        if (this.isLedger) {
            return getTabEntries.filter((entry) => {
                return entry.title !== 'page_title_account_backup';
            });
        } else {
            return getTabEntries;
        }
    }

    public currentAccount: AccountModel;

    public get isLedger(): boolean {
        return (
            this.currentAccount &&
            (this.currentAccount.type === AccountType.LEDGER || this.currentAccount.type === AccountType.LEDGER_OPT_IN)
        );
    }

    @Prop({ default: 'horizontal' }) direction: 'horizontal' | 'vertical';
}
