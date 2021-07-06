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
// configuration
import { appConfig } from '@/config';
import { NetworkConfigurationModel } from '@/core/database/entities/NetworkConfigurationModel';

const { MIN_PASSWORD_LENGTH } = appConfig.constants;

export const createValidationRuleSet = (
    configuration: NetworkConfigurationModel | undefined,
): Record<
    string,
    | string
    | {
          required?: boolean;
          regex: string;
      }
> => {
    const standaloneValidationRules = {
        address: 'required|address|addressNetworkType:currentProfile',
        profilePassword: 'required|profilePassword',
        addressOrAlias: 'required|addressOrAlias|addressOrAliasNetworkType:currentProfile',

        confirmPassword: 'required|confirmPassword:@newPassword',
        divisibility: 'required|min_value:0|max_value:6|integer',
        generationHash: 'required|min:64|max:64',
        mosaicId: 'required|mosaicId',
        // remove symbol from regex when rest https://github.com/nemtech/catapult-rest/issues/631 fixed
        namespaceName: {
            required: true,
            regex: '^(?!symbol$)([a-z0-9]{1}[a-z0-9-_]{0,63})$',
        },
        subNamespaceName: {
            required: true,
            regex: '^[a-z0-9]{1}[a-z0-9-_]{0,63}$',
        },
        password: `required|min:${MIN_PASSWORD_LENGTH}|passwordRegex`,
        previousPassword: 'required|confirmLock:cipher',
        privateKey: 'min:64|max:64|privateKey',
        recipientPublicKey: 'required|publicKey',
        url: 'required|url',
        newAccountName: 'required|newAccountName',
        profileAccountName: 'required|profileAccountName',
        addressOrPublicKey: 'addressOrPublicKey',
        email: {
            regex: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$',
        },
        contactName: {
            required: true,
            regex: '^(?!\\s*$).+',
        },
    };
    const networkValidationRules = configuration
        ? {
              duration: `required|min_value:0|max_value:${configuration.maxMosaicDuration}`,
              supply: `required|integer|min_value: 1|max_value:${configuration.maxMosaicAtomicUnits}`,

              amount: `positiveDecimal|maxDecimals:${configuration.maxMosaicDivisibility}|maxRelativeAmount:${[
                  configuration.maxMosaicAtomicUnits,
                  configuration.maxMosaicDivisibility,
              ]}`,
              message: `maxMessage:${configuration.maxMessageSize}`,
              namespaceDuration: `required|min_value:${
                  configuration.minNamespaceDuration / configuration.blockGenerationTargetTime
              }|maxNamespaceDuration`,
          }
        : {};

    return { ...standaloneValidationRules, ...networkValidationRules };
};
