import { DerivationPathValidator } from '@/core/validation/validators';
import { NetworkType } from 'symbol-sdk/dist/src/model/network/NetworkType';
const TrezorConnect = window['TrezorConnect'];

export class TrezorService {
    /**
     * constructor
     * @param networkType network type
     */
    constructor(public readonly networkType: NetworkType) {
        if (!TrezorConnect) {
            throw 'Failed to load Trezor connection script';
        }
        // Change connectSrc when in Trezor production
        TrezorConnect.init({
            connectSrc: 'http://localhost:8088/',
            lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
            manifest: {
                email: 'developer@xyz.com',
                appUrl: 'http://your.application.com',
            },
        });
    }

    public async getAccounts(paths: string[], display: boolean): Promise<string[]> {
        // Example:
        // Symbol Get multiple public key:
        // TrezorConnect.symbolGetPublicKey({
        //     bundle: [
        //         { path: "m/44'/4343'/0'/0'/0'", showOnTrezor: false }, // account 1
        //         { path: "m/44'/4343'/1'/0'/0'", showOnTrezor: false }, // account 2
        //         { path: "m/44'/4343'/2'/0'/0'", showOnTrezor: false }  // account 3
        //     ]
        // });
        // Result:
        // Success
        // {
        //     success: true,
        //     payload: [
        //         { publicKey: string }, // account 1
        //         { publicKey: string }, // account 2
        //         { publicKey: string }, // account 3
        //     ]
        // }
        // Fail
        // {
        //     success: false,
        //     payload: {
        //         error: string // error message
        //     }
        // }

        for (const path of paths) {
            if (!DerivationPathValidator.validate(path, this.networkType)) {
                const errorMessage = 'Invalid derivation path: ' + path;
                throw new Error(errorMessage);
            }
        }
        const param = {
            bundle: paths.map((path) => ({ path, showOnTrezor: !!display })),
        };
        const { success, payload } = await TrezorConnect.symbolGetPublicKey(param);
        if (!success) {
            throw payload.error;
        }
        const result = payload.map((elm) => elm.publicKey);
        return result;
    }

    public async getAccount(path: string, display: boolean): Promise<string> {
        // Example:
        // Symbol Get single public key:
        // TrezorConnect.symbolGetPublicKey(
        //     { path: "m/44'/4343'/0'/0'/0'", showOnTrezor: false }
        // );
        // Result:
        // Success
        // {
        //     success: true,
        //     payload: {
        //         publicKey: string
        //     }
        // }
        // Fail
        // {
        //     success: false,
        //     payload: {
        //         error: string // error message
        //     }
        // }

        if (!DerivationPathValidator.validate(path, this.networkType)) {
            const errorMessage = 'Invalid derivation path: ' + path;
            throw new Error(errorMessage);
        }
        const param = { path, showOnTrezor: !!display };
        const { success, payload } = await TrezorConnect.symbolGetPublicKey(param);
        if (!success) {
            throw payload.error;
        }
        const result = payload.publicKey;
        return result;
    }
}
