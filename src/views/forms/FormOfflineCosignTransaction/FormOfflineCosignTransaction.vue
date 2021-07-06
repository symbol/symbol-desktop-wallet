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
        <!-- Transaction signer selector -->
        <AccountSignerSelector />
        <HardwareConfirmationButton v-if="isUsingHardwareWallet" @success="onSigner" @error="onError" />
        <FormProfileUnlock v-else @success="onAccountUnlocked" @error="onError" />
        <!-- force mosaic list reactivity -->
    </div>
</template>

<script lang="ts">
import { FormOfflineCosignTransactionTs } from './FormOfflineCosignTransactionTs';
export default class FormOfflineCosignTransaction extends FormOfflineCosignTransactionTs {}
</script>

<style lang="less" scoped>
.save-button {
    text-align: center;
    width: 120px;
}

/deep/.multisig_ban_container {
    padding-left: 0.7rem;
}

/deep/.form-row-inner-container {
    grid-template-columns: 1.9rem 8rem !important;
}

/deep/.form-label {
    padding-left: 0.7rem;
}
</style>
