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
/// region custom types
import { NetworkType } from 'symbol-sdk';

export class NetworkTypeHelper {
    public static getNetworkTypeName(networkType: NetworkType): string {
        switch (networkType) {
            case NetworkType.MAIN_NET:
                return 'MAINNET';
            case NetworkType.TEST_NET:
                return 'TESTNET';
            case NetworkType.MIJIN:
                return 'MIJIN';
            case NetworkType.MIJIN_TEST:
                return 'MIJIN_TEST';
            case NetworkType.PRIVATE:
                return 'PRIVATE';
            case NetworkType.PRIVATE_TEST:
                return 'PRIVATE';
        }
        return 'UNKNOWN';
    }
}
