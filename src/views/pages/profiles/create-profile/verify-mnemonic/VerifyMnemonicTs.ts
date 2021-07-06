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
// internal dependencies
// child components
// @ts-ignore
import MnemonicVerification from '@/components/MnemonicVerification/MnemonicVerification.vue';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { NotificationType } from '@/core/utils/NotificationType';
import { MnemonicPassPhrase } from 'symbol-hd-wallets';
import { NetworkType } from 'symbol-sdk';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        MnemonicVerification,
    },
    computed: {
        ...mapGetters({
            currentMnemonic: 'temporary/mnemonic',
            currentProfile: 'profile/currentProfile',
        }),
    },
})
export default class VerifyMnemonicTs extends Vue {
    /**
     * Temporary Mnemonic pass phrase
     * @var {MnemonicPassPhrase}
     */
    public currentMnemonic: MnemonicPassPhrase;
    public currentProfile: ProfileModel;
    /// region computed properties getter/setter
    get mnemonicWordsList(): string[] {
        if (this.currentMnemonic) {
            return this.currentMnemonic.plain.split(' ');
        }
        this.$store.dispatch('notification/ADD_ERROR', NotificationType.NO_MNEMONIC_INFO);
        this.$router.push({ name: 'profiles.createProfile.info' });
    }

    get canSkip(): boolean {
        return (
            this.currentProfile.networkType == NetworkType.MIJIN_TEST ||
            this.currentProfile.networkType == NetworkType.PRIVATE_TEST ||
            this.currentProfile.networkType == NetworkType.TEST_NET
        );
    }
    /// end-region computed properties getter/setter
}
