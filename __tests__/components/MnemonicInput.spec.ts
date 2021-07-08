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
import { shallowMount } from '@vue/test-utils';
// @ts-ignore
import MnemonicInput from '@/components/MnemonicInput/MnemonicInput.vue';
// @ts-ignore
import ButtonCopyToClipboard from '@/components/ButtonCopyToClipboard/ButtonCopyToClipboard.vue';
import i18n from '@/language/index';

let wrapper;
let vm;

const focus = jest.fn();
beforeEach(() => {
    wrapper = shallowMount(MnemonicInput, {
        i18n,
        directives: {
            focus,
        },
    });
    vm = wrapper.vm;
});

describe('MnemonicInput', () => {
    test('show PASTE button given words array length less than 24.', async () => {
        // arrange
        await wrapper.setData({
            wordsArray: Array.from({ length: 1 }, () => 'seed'),
        });

        // assert
        expect(vm.showCopyButton).toBe(false);
        expect(wrapper.findComponent(ButtonCopyToClipboard).exists()).toBe(false);
        expect(wrapper.find('.paste').exists()).toBe(true);
        wrapper.destroy();
    });

    test('show COPY button given words array length in 24.', async () => {
        // arrange
        await wrapper.setData({
            wordsArray: Array.from({ length: 24 }, () => 'seed'),
        });

        // assert
        expect(vm.showCopyButton).toBe(true);
        expect(wrapper.findComponent(ButtonCopyToClipboard).exists()).toBe(true);
        expect(wrapper.find('.paste').exists()).toBe(false);
        wrapper.destroy();
    });
});
