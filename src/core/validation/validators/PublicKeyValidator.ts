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
import { NetworkType, PublicAccount } from 'symbol-sdk';
// internal dependencies
import { staticImplements, Validator } from './Validator';

@staticImplements<Validator>()
export class PublicKeyValidator {
    /**
     * Executes the validator
     * @static
     * @param value the value to be validated
     * @param networkType: network TYpe
     * @returns {boolean}
     */
    public static validate(value: any, networkType: NetworkType): boolean {
        try {
            PublicAccount.createFromPublicKey(value, networkType);
            return value;
        } catch (error) {
            return false;
        }
    }
}
