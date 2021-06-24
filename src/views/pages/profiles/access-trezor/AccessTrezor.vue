<template>
    <div class="create-profile-wrapper radius">
        <div class="explanation-box">
            <div class="text-wrapper">
                <div v-if="getCurrentStep() === 0">
                    <div class="right-hints-section">
                        <p class="text1">
                            {{ $t('profile_description') }}
                        </p>
                        <p class="text">
                            {{ $t('profile_description_tips1') }}
                        </p>
                    </div>
                </div>
                <div v-if="getCurrentStep() === 1" class="selected-accounts-container">
                    <div class="right-hints-section">
                        <p class="text1">
                            {{ $t('profile_import') }}
                        </p>
                        <div class="accounts-container">
                            <div class="accounts-container-title">
                                {{ $t('select_accounts') }}
                            </div>
                            <div v-if="selectedAccounts.length" class="address-list-container radius">
                                <div class="address-list">
                                    <div class="table-title">
                                        <span class="address-id">{{ $t('id') }}</span>
                                        <span class="address-value">{{ $t('address') }}</span>
                                    </div>
                                    <div v-if="!!addressesList.length" class="address-list-body">
                                        <div
                                            v-for="index in selectedAccounts"
                                            :key="index"
                                            class="table-item pointer"
                                            @click="onRemoveAddress(index)"
                                        >
                                            <div class="address-item">
                                                <span class="address-id"> {{ index + 1 }} </span>
                                                <div class="table-item-content">
                                                    <div class="row">
                                                        <span class="address-value overflow_ellipsis">{{
                                                            formatters.miniAddress(addressesList[index])
                                                        }}</span>
                                                    </div>
                                                    <div class="row balance-row">
                                                        <div class="row">
                                                            <span class="address-balance">{{ $t('balance') }}: </span>
                                                            <span
                                                                v-if="addressMosaicMap[addressesList[index].plain()]"
                                                                class="address-balance"
                                                            >
                                                                <MosaicAmountDisplay
                                                                    :absolute-amount="addressMosaicMap[addressesList[index].plain()]"
                                                                />
                                                            </span>
                                                            <span v-else class="address-balance">
                                                                0
                                                            </span>
                                                        </div>
                                                        <span class="remove-icon"
                                                            ><img src="@/views/resources/img/Invisible@2x.png"
                                                        /></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="address-list-container">
                                <Spin
                                    v-if="
                                        (selectedAccounts.length && !addressesList.length)
                                    "
                                    size="large"
                                    fix
                                    class="absolute"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="getCurrentStep() === 2">
                    <img src="@/views/resources/img/icons/Incoming.svg" style="width: 30%;" />
                    <p class="text text-big">
                        {{ $t('creation_successful') }}
                    </p>
                </div>
            </div>
        </div>
        <div class="form-box">
            <div class="steps">
                <div class="step-group">
                    <div v-for="(text, index) in StepBarTitleList" :key="index" :class="['single-step', getStepClassName(index)]">
                        {{ $t(text) }}
                    </div>
                </div>
            </div>
            <div class="form">
                <router-view />
            </div>
        </div>

        <div class="inner-container" style="display: none;">
            <p class="create-profile-box">
                {{ $t('generate_a_new_profile') }}
            </p>
            <div class="step-bar-container">
                <img :src="$route.meta.icon" />
                <div class="step-text-container">
                    <span v-for="(text, index) in StepBarTitleList" :key="index" :class="getStepClassName(index)">{{ $t(text) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import AccessTrezorTs from './AccessTrezorTs';
export default class AccessTrezor extends AccessTrezorTs {}
</script>
<style lang="less" scoped>
@import './AccessTrezor.less';
</style>
