<template>
    <div class="finish-sec" @keyup.enter="$router.push({ name: 'dashboard' })">
        <div class="finish-col">
            <div class="finish-left">
                <p class="text1">
                    {{ $t('terms_and_conditions') }}
                </p>

                <div class="checkbox">
                    <Checkbox v-model="marked">
                        <span class="checkbox-label">
                            {{ $t('i_accept') }}
                            <a href="#/terms">{{ $t('terms_and_conditions') }}</a>
                            &
                            <a href="#/privacy">{{ $t('privacy_policy') }}</a
                            >.
                        </span>
                    </Checkbox>
                </div>
                <div class="jump-btn">
                    <button
                        class="solid-button button-style create-account-style"
                        @click="$router.push({ name: 'profiles.accessTrezor.walletSelection' })"
                    >
                        {{ $t('back') }}
                    </button>
                    <button class="inverted-button solid-button button-style create-account-style" :disabled="!marked" @click="finish">
                        {{ $t('finish') }}
                    </button>
                </div>
            </div>
            <Spin v-if="isLoading" size="large" fix class="absolute" />
        </div>
    </div>
</template>

<script>
import FinalizeTs from './FinalizeTs';

export default class Finalize extends FinalizeTs {}
</script>
<style lang="less" scoped>
@import './Finalize.less';
</style>
