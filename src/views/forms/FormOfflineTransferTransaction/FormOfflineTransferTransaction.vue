<template>
    <div class="FormTransferTransaction">
        <FormRow class-name="emphasis">
            <template v-slot:label>
                <div>{{ $t('profile_name') }}:</div>
            </template>
            <template v-slot:inputs>
                <div class="inputs-container select-container">
                    <Select
                        v-model="formItems.currentProfileName"
                        :placeholder="$t('address')"
                        class="select-size select-style"
                        @on-change="onProfileNameChange"
                    >
                        <OptionGroup
                            v-for="pair in profilesClassifiedByGenerationHash"
                            :key="pair.generationHash"
                            :label="getGenerationHashLabel(pair.generationHash)"
                        >
                            <Option v-for="profile in pair.profiles" :key="profile.profileName" :value="profile.profileName">
                                {{ profile.profileName }}
                            </Option>
                        </OptionGroup>
                    </Select>
                </div>
            </template>
        </FormRow>
        <FormTransferTransaction v-if="loaded" :hide-encryption="true" submit-button-text="sign" @txSigned="onSignedOfflineTransaction" />

        <!-- force mosaic list reactivity -->
    </div>
</template>

<script lang="ts">
import { FormOfflineTransferTransactionTs } from './FormOfflineTransferTransactionTs';
export default class FormOfflineTransferTransaction extends FormOfflineTransferTransactionTs {}
</script>

<style lang="less" scoped>
.save-button {
    text-align: center;
    width: 120px;
}

/deep/.multisig_ban_container {
    padding-left: 0.7rem;
}
</style>
