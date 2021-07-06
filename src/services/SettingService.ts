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
import { appConfig, feesConfig } from '@/config';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { SettingsModel } from '@/core/database/entities/SettingsModel';
import { SettingsModelStorage } from '@/core/database/storage/SettingsModelStorage';
import i18n from '@/language';

/**
 * Service in charge of loading and storing the SettingsModel from local storage.
 */
export class SettingService {
    /**
     * The the local storage that keeps the SettingsModel objects indexed by profileName.
     */
    private readonly storage = SettingsModelStorage.INSTANCE;

    public getProfileSettings(profileName: string, networkModel: NetworkModel): SettingsModel {
        const storedData = this.storage.get() || {};
        return {
            ...this.createDefaultSettingsModel(profileName, networkModel),
            ...(storedData[profileName] || {}),
        };
    }

    public changeProfileSettings(profileName: string, newConfigs: any, networkModel: NetworkModel): SettingsModel {
        const storedData = this.storage.get() || {};
        storedData[profileName] = {
            ...this.getProfileSettings(profileName, networkModel),
            ...newConfigs,
        };
        this.storage.set(storedData);
        return storedData[profileName];
    }

    public createDefaultSettingsModel(profileName: string, networkModel: NetworkModel): SettingsModel {
        const browserLocale = i18n.locale;
        const explorerUrl = networkModel.explorerUrl;
        const language = appConfig.languages.find((l) => l.value == browserLocale) ? browserLocale : appConfig.languages[0].value;
        return new SettingsModel(profileName, language, feesConfig.slowest, '', explorerUrl);
    }

    public deleteProfileSettings(profileName: string): void {
        const storedData = this.storage.get();
        if (!storedData) {
            return;
        }
        delete storedData[profileName];
        this.storage.set(storedData);
    }
}
