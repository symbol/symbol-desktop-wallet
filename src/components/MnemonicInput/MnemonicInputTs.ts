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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

// internal dependencies

// @ts-ignore
import ButtonCopyToClipboard from '@/components/ButtonCopyToClipboard/ButtonCopyToClipboard.vue';
import { Formatters } from '@/core/utils/Formatters';
@Component({
    components: { ButtonCopyToClipboard },
})
export class MnemonicInputTs extends Vue {
    /**
     * @description: initial seed data
     */
    @Prop({ default: '' })
    public seed: string;

    /**
     * @description: wordsArray
     */
    public wordsArray: Array<string> = [];

    /**
     * @description: status of isEditing
     */
    public isEditing: boolean = false;

    /**
     * @description: isNeedPressDelTwice
     */
    public isNeedPressDelTwice = true;

    /**
     * @description: watch the inputform
     */
    public inputWord: string = '';

    public get userInput(): string {
        return this.inputWord;
    }
    public set userInput(input: string) {
        // avoid cache
        this.inputWord = input;
        // add the limit
        if (this.wordsArray.length >= 24) {
            this.inputWord = '';
            this.initInput();
        } else {
            // control the keyboard input rules
            this.inputWord = input.replace(/[^a-zA-Z]/g, '');
            // determine if the input is editing status
            if (!this.isEditing && !!this.inputWord) {
                this.isEditing = true;
            }
        }
    }
    public get waitingCopyString(): string {
        return Formatters.splitArrayByDelimiter(this.wordsArray);
    }

    /**
     * @description: show copy button if words array is max.
     */
    public get showCopyButton(): boolean {
        return this.wordsArray.length >= 24;
    }

    /**
     * @description: add word to the wordsArray
     */
    addWord() {
        if (this.inputWord.length >= 2 && this.inputWord.length <= 50) {
            if (this.wordsArray.length < 24) {
                this.handleWordsArray(this.inputWord);
                this.inputWord = '';
                this.initInput();
            }
        }
    }

    /**
     * @description: delete the word
     */
    deleteWord() {
        if (this.inputWord) {
            this.isNeedPressDelTwice = true;
        } else {
            if (this.isEditing) {
                if (this.isNeedPressDelTwice) {
                    this.isNeedPressDelTwice = false;
                    return;
                }
                this.handleWordsArray();
                this.initInput();
            } else {
                this.handleWordsArray();
                this.initInput();
            }
        }
    }

    /**
     * @description: add one word  or reduce one word
     */
    handleWordsArray(item?) {
        if (!!item) {
            this.wordsArray.push(item);
        } else {
            this.wordsArray.pop();
        }
        // transform to lower case
        this.wordsArray.forEach((item: string, index) => {
            this.wordsArray[index] = item.toLowerCase();
        });
        this.$emit('handle-words', this.wordsArray);
    }

    handlePaste(e: ClipboardEvent) {
        this.handleSeed(e.clipboardData.getData('text').toString());
    }

    /**
     * @description: use for button click to paste.
     */
    async handleClickPaste() {
        const text = await navigator.clipboard.readText();
        this.handleSeed(text);
    }

    /**
     * @description handles seed data changes
     * @param seed imported/pasted seed data
     */
    @Watch('seed', { immediate: true })
    private handleSeed(seed: string) {
        if (!seed) {
            return;
        }
        const pasteDataArr: Array<string> = seed.trim().split(/\s+/g);
        pasteDataArr.forEach((pasteData) => {
            if (!!pasteData && this.wordsArray.length < 24) {
                this.handleWordsArray(pasteData);
            }
        });
    }
    /**
     * @description: init input
     */
    initInput() {
        this.isNeedPressDelTwice = true;
        this.isEditing = false;
    }
}
