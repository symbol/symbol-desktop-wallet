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

import { Formatters } from '@/core/utils/Formatters';

export interface LanguageConfig {
    label: string;
    value: string;
}

export interface AppConfig {
    languages: LanguageConfig[];
    articlesFeedUrl: string;
    constants: {
        EVENTS_THROTTLING_TIME: number;
        MAX_REMOTE_ACCOUNT_CHECKS: number;
        SEED_ACCOUNT_NAME_PREFIX: string;
        ANNOUNCE_TRANSACTION_TIMEOUT: number;
        MAX_LISTENER_RECONNECT_TRIES: number;
        MAX_PASSWORD_LENGTH: number;
        MIN_PASSWORD_LENGTH: number;
        DECIMAL_SEPARATOR: string;
    };
    title: string;
    marketServerUrl: string;
}

const defaultAppConfig: AppConfig = {
    title: 'Symbol Wallet',
    constants: {
        EVENTS_THROTTLING_TIME: 6000,
        MAX_LISTENER_RECONNECT_TRIES: 20,
        MAX_PASSWORD_LENGTH: 64,
        MAX_REMOTE_ACCOUNT_CHECKS: 10,
        MIN_PASSWORD_LENGTH: 8,
        SEED_ACCOUNT_NAME_PREFIX: 'SeedWallet-',
        ANNOUNCE_TRANSACTION_TIMEOUT: 240000,
        DECIMAL_SEPARATOR: navigator.languages
            ? Formatters.getDecimalSeparator(navigator.languages[0])
            : Number('1.1').toLocaleString().substring(1, 2),
    },
    languages: [
        { value: 'en-US', label: 'English' },
        { value: 'zh-CN', label: '中文' },
        { value: 'ja-JP', label: '日本語' },
        { value: 'ru-RU', label: 'Русский' },
    ],
    marketServerUrl: 'http://app.nemcn.io',
    articlesFeedUrl: 'https://nemgrouplimited.github.io/symbol-news/',
};
const resolvedAppConfig: AppConfig = window['appConfig'] || defaultAppConfig;
console.log('appConfig resolved!', resolvedAppConfig);
export const appConfig = resolvedAppConfig;
