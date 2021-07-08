<template>
    <div class="show-mnemonic">
        <div v-for="(word, index) in wordsArray" :key="index" class="input-already">
            {{ word }}
        </div>
        <div class="mnemonic-input-container">
            <input
                v-model="userInput"
                v-focus
                class="mnemonic-input"
                type="text"
                maxlength="50"
                @paste.prevent="handlePaste($event)"
                @keyup.space="addWord"
                @keydown.delete="deleteWord"
            />
        </div>
        <ButtonCopyToClipboard v-if="showCopyButton" v-model="waitingCopyString" class="right-bottom-button copy" />

        <Button v-else type="text" class="right-bottom-button paste" @click="handleClickPaste()">
            {{ $t('mnemonic_paste') }}
        </Button>
    </div>
</template>
<script lang="ts">
import { MnemonicInputTs } from './MnemonicInputTs';
export default class MnemonicInput extends MnemonicInputTs {}
</script>
<style lang="less" scoped>
@import './MnemonicInput.less';
</style>
