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
import { Account, PublicAccount, Address, NetworkType, Password, SimpleWallet, Crypto } from 'symbol-sdk';
import { ExtendedKey, MnemonicPassPhrase, Network, Wallet } from 'symbol-hd-wallets';
// internal dependencies
import { DerivationPathLevels, DerivationService } from './DerivationService';
import { DerivationPathValidator } from '@/core/validation/validators';
import { AccountModel, AccountType } from '@/core/database/entities/AccountModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { SimpleObjectStorage } from '@/core/database/backends/SimpleObjectStorage';
import { AccountModelStorage } from '@/core/database/storage/AccountModelStorage';
import { LedgerService } from '@/services/LedgerService';
import { TrezorService } from '@/services/TrezorService';
import { NodeModel } from '@/core/database/entities/NodeModel';

export class AccountService {
    private readonly storage = AccountModelStorage.INSTANCE;

    /**
     * Default account derivation path
     * @var {string}
     */
    private static readonly DEFAULT_ACCOUNT_PATH_MAIN_NET = `m/44'/4343'/0'/0'/0'`;
    private static readonly DEFAULT_ACCOUNT_PATH_TEST_NET = `m/44'/1'/0'/0'/0'`;

    public getAccounts(): AccountModel[] {
        return Object.values(this.getAccountsById());
    }

    public getAccount(id: string): AccountModel | undefined {
        return this.getAccountsById()[id];
    }

    public getAccountsById(): Record<string, AccountModel> {
        return this.storage.get() || {};
    }

    public saveAccount(account: AccountModel): AccountModel {
        const accounts = this.getAccountsById();
        accounts[account.id] = account;
        this.storage.set(accounts);
        return account;
    }

    public deleteAccount(account: AccountModel): void {
        const accounts = this.getAccountsById();
        delete accounts[account.id];
        this.storage.set(accounts);
    }

    public deleteAccounts(profileName: string): void {
        const accounts = this.getAccountsById();
        Object.values(accounts)
            .filter((account) => account.profileName === profileName)
            .forEach((account) => delete accounts[account.id]);
        this.storage.set(accounts);
    }

    public updateName(account: AccountModel, name: string): AccountModel {
        return this.saveAccount(Object.assign(account, { name }));
    }

    public updateIsMultisig(account: AccountModel, isMultisig: boolean): AccountModel {
        return this.saveAccount(Object.assign(account, { isMultisig }));
    }

    public updateRemoteAccount(account: AccountModel, encRemoteAccountPrivateKey: string): AccountModel {
        return this.saveAccount(Object.assign(account, { encRemoteAccountPrivateKey }));
    }

    public updateSignedPersistentDelReqTxs(account: AccountModel, signedPersistentDelReqTxs): AccountModel {
        return this.saveAccount(Object.assign(account, { signedPersistentDelReqTxs }));
    }

    public updateIsPersistentDelReqSent(account: AccountModel, isPersistentDelReqSent: boolean): AccountModel {
        return this.saveAccount(Object.assign(account, { isPersistentDelReqSent }));
    }

    public updateSelectedHarvestingNode(account: AccountModel, selectedHarvestingNode: NodeModel): AccountModel {
        return this.saveAccount(Object.assign(account, { selectedHarvestingNode }));
    }

    /**
     * Derive \a path using \a mnemonic pass phrase
     */
    public getAccountByPath(mnemonic: MnemonicPassPhrase, networkType: NetworkType, path: string): Account {
        if (!DerivationPathValidator.validate(path, networkType)) {
            const errorMessage = 'Invalid derivation path: ' + path;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        // create hd extended key
        const extendedKey = ExtendedKey.createFromSeed(mnemonic.toSeed().toString('hex'), Network.SYMBOL);

        // create account
        const account = new Wallet(extendedKey);
        return Account.createFromPrivateKey(account.getChildAccountPrivateKey(path), networkType);
    }

    /**
     * Get extended key around \a mnemonic for \a networkTypw
     * @param {MnemonicPassPhrase} mnemonic
     * @param curve
     * @return {ExtendedKey}
     */
    public getExtendedKeyFromMnemonic(mnemonic: MnemonicPassPhrase, curve = Network.SYMBOL): ExtendedKey {
        return ExtendedKey.createFromSeed(mnemonic.toSeed().toString('hex'), curve);
    }

    /**
     * Generate \a count accounts using \a mnemonic
     * @param {MnemonicPassPhrase} mnemonic
     * @param {NetworkType} networkType
     * @param {number} count
     * @param curve
     * @return {Account[]}
     */
    public generateAccountsFromMnemonic(
        mnemonic: MnemonicPassPhrase,
        networkType: NetworkType,
        count: number = 10,
        curve = Network.SYMBOL,
    ): Account[] {
        const derivationService = new DerivationService(networkType);

        // create hd extended key
        const xkey = this.getExtendedKeyFromMnemonic(mnemonic, curve);

        const default_path = AccountService.getAccountPathByNetworkType(networkType);
        // increment derivation path \a count times
        const paths = [...Array(count).keys()].map((index) => {
            if (index == 0) {
                return default_path;
            }

            return derivationService.incrementPathLevel(default_path, DerivationPathLevels.Profile, index);
        });

        const wallets = paths.map((path) => new Wallet(xkey.derivePath(path)));
        return wallets.map((wallet) => Account.createFromPrivateKey(wallet.getAccountPrivateKey(), networkType));
    }

    /**
     * Generate accounts using a mnemonic and an array of paths
     * @param {MnemonicPassPhrase} mnemonic
     * @param {NetworkType} networkType
     * @param {string[]} paths
     * @param curve
     * @returns {Account[]}
     */
    public generateAccountsFromPaths(
        mnemonic: MnemonicPassPhrase,
        networkType: NetworkType,
        paths: string[],
        curve = Network.SYMBOL,
    ): Account[] {
        // create hd extended key
        const xkey = this.getExtendedKeyFromMnemonic(mnemonic, curve);
        const wallets = paths.map((path) => new Wallet(xkey.derivePath(path)));

        return wallets.map((wallet) => Account.createFromPrivateKey(wallet.getAccountPrivateKey(), networkType));
    }

    /**
     * Get list of addresses using \a mnemonic
     * @return {Address[]}
     */
    public getAddressesFromMnemonic(
        mnemonic: MnemonicPassPhrase,
        networkType: NetworkType,
        count: number = 10,
        curve = Network.SYMBOL,
    ): Address[] {
        const accounts = this.generateAccountsFromMnemonic(mnemonic, networkType, count, curve);
        return accounts.map((acct) => acct.address);
    }

    public getKnownAccounts(knownAccounts: string[]): AccountModel[] {
        // search in known accounts
        return this.getAccounts().filter((wlt) => knownAccounts.includes(wlt.id));
    }

    /**
     * Create a account instance from mnemonic
     * @return {AccountModel}
     */
    public getDefaultAccount(
        currentProfile: ProfileModel,
        mnemonic: MnemonicPassPhrase,
        password: Password,
        networkType: NetworkType,
    ): AccountModel {
        const default_path = AccountService.getAccountPathByNetworkType(networkType);
        const account = this.getAccountByPath(mnemonic, networkType, default_path);

        const simpleWallet = SimpleWallet.createFromPrivateKey('Seed Account 1', password, account.privateKey, networkType);

        return {
            id: SimpleObjectStorage.generateIdentifier(),
            profileName: currentProfile.profileName,
            name: simpleWallet.name,
            node: '',
            type: AccountType.SEED,
            address: simpleWallet.address.plain(),
            publicKey: account.publicKey,
            encryptedPrivateKey: simpleWallet.encryptedPrivateKey,
            path: default_path,
            isMultisig: false,
        };
    }

    /**
     * Create a child account instance from mnemonic and path
     * @return {AccountModel}
     */
    public getChildAccountByPath(
        currentProfile: ProfileModel,
        password: Password,
        mnemonic: MnemonicPassPhrase,
        nextPath: string,
        networkType: NetworkType,
        childAccountName: string,
    ): AccountModel {
        // - derive account
        const account = this.getAccountByPath(mnemonic, networkType, nextPath);

        const simpleWallet = SimpleWallet.createFromPrivateKey(childAccountName, password, account.privateKey, networkType);

        return {
            id: SimpleObjectStorage.generateIdentifier(),
            profileName: currentProfile.profileName,
            name: childAccountName,
            node: '',
            type: AccountType.SEED,
            address: simpleWallet.address.plain(),
            publicKey: account.publicKey,
            encryptedPrivateKey: simpleWallet.encryptedPrivateKey,
            path: nextPath,
            isMultisig: false,
        };
    }

    /**
     * Create a sub account by private key
     * @param currentProfile
     * @param password
     * @param childAccountName
     * @param privateKey
     * @param networkType
     * @return {AccountModel}
     */
    public getSubAccountByPrivateKey(
        currentProfile: ProfileModel,
        password: Password,
        childAccountName: string,
        privateKey: string,
        networkType: NetworkType,
    ): AccountModel {
        const account = Account.createFromPrivateKey(privateKey, networkType);
        const simpleWallet = SimpleWallet.createFromPrivateKey(childAccountName, password, account.privateKey, networkType);

        return {
            id: SimpleObjectStorage.generateIdentifier(),
            profileName: currentProfile.profileName,
            name: childAccountName,
            node: '',
            type: AccountType.PRIVATE_KEY,
            address: simpleWallet.address.plain(),
            publicKey: account.publicKey,
            encryptedPrivateKey: simpleWallet.encryptedPrivateKey,
            path: '',
            isMultisig: false,
        };
    }

    /**
     * Returns a AccountModel with an updated SimpleWallet
     * @param {AccountModel} account
     * @param {Password} oldPassword
     * @param {Password} newPassword
     */
    public updateWalletPassword(account: AccountModel, oldPassword: Password, newPassword: Password): AccountModel {
        if (account.type !== AccountType.SEED && account.type !== AccountType.PRIVATE_KEY && account.type !== AccountType.OPT_IN) {
            return account;
        }

        const privateKey = Crypto.decrypt(account.encryptedPrivateKey, oldPassword.value);

        // Encrypt the private key with the new password
        const newSimpleWallet = SimpleWallet.createFromPrivateKey(
            account.name,
            newPassword,
            privateKey,
            AccountModel.getObjects(account).address.networkType,
        );
        // Update the account model
        return {
            ...account,
            encryptedPrivateKey: newSimpleWallet.encryptedPrivateKey,
        };
    }

    /**
     * Get list of address from Ledger device
     * @param {NetworkType} networkType
     * @param {number} count
     * @param curve
     * @return {Promise<Address[]>}
     */
    public async getLedgerAccounts(networkType: NetworkType, count: number = 10, curve = Network.SYMBOL): Promise<Address[]> {
        const isOptinLedgerWallet = curve === Network.BITCOIN;
        const derivationService = new DerivationService(networkType);

        const default_path = AccountService.getAccountPathByNetworkType(networkType);
        // increment derivation path \a count times
        const paths = [...Array(count).keys()].map((index) => {
            if (index == 0) {
                return default_path;
            }

            return derivationService.incrementPathLevel(default_path, DerivationPathLevels.Profile, index);
        });
        const publicKeys: string[] = [];
        for (const path of paths) {
            const publicKey = await this.getLedgerPublicKeyByPath(networkType, path, false, isOptinLedgerWallet);
            publicKeys.push(publicKey.toUpperCase());
        }
        return publicKeys.map((publicKey) => PublicAccount.createFromPublicKey(publicKey, networkType).address);
    }

    /**
     * Get list of public key from Ledger device
     * @param {NetworkType} networkType
     * @param {number} count
     * @param curve
     * @return {Promise<string[]>}
     */
    public async getLedgerPublicKey(networkType: NetworkType, count: number = 10, curve = Network.SYMBOL): Promise<string[]> {
        const isOptinLedgerWallet = curve === Network.BITCOIN;
        const derivationService = new DerivationService(networkType);

        const default_path = AccountService.getAccountPathByNetworkType(networkType);
        // increment derivation path \a count times
        const paths = [...Array(count).keys()].map((index) => {
            if (index == 0) {
                return default_path;
            }

            return derivationService.incrementPathLevel(default_path, DerivationPathLevels.Profile, index);
        });
        const publicKeys: string[] = [];
        for (const path of paths) {
            const publicKey = await this.getLedgerPublicKeyByPath(networkType, path, false, isOptinLedgerWallet);
            publicKeys.push(publicKey.toUpperCase());
        }
        return publicKeys.map((publicKey) => PublicAccount.createFromPublicKey(publicKey, networkType).publicKey);
    }

    /**
     * Derive an public key from Ledger device using a path
     * @param {NetworkType} networkType
     * @param {string} paths
     * @param {boolean} ledgerDisplay
     * @param {boolean} isOptinLedgerWallet
     * @return {Promise<string>}
     */
    public async getLedgerPublicKeyByPath(
        networkType: NetworkType,
        path: string,
        ledgerDisplay: boolean,
        isOptinLedgerWallet: boolean,
    ): Promise<string> {
        if (!DerivationPathValidator.validate(path, networkType)) {
            const errorMessage = 'Invalid derivation path: ' + path;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        const ledgerService = new LedgerService(networkType);
        const accountResult = await ledgerService.getAccount(path, ledgerDisplay, isOptinLedgerWallet);
        const { publicKey } = accountResult;
        return publicKey;
    }

    /**
     * Derive an account instance of Ledger device using a path
     * @param {ProfileModel} currentProfile
     * @param {NetworkType} networkType
     * @param {string} paths
     * @param {boolean} ledgerDisplay
     * @param {boolean} isOptinLedgerWallet
     * @return {Promise<AccountModel>}
     */
    public async getLedgerAccountByPath(
        currentProfile: ProfileModel,
        networkType: NetworkType,
        path: string,
        ledgerDisplay: boolean,
        isOptinLedgerWallet: boolean,
    ): Promise<AccountModel> {
        const publicKey = await this.getLedgerPublicKeyByPath(networkType, path, ledgerDisplay, isOptinLedgerWallet);
        const address = PublicAccount.createFromPublicKey(publicKey.toUpperCase(), networkType).address;
        return {
            id: SimpleObjectStorage.generateIdentifier(),
            profileName: currentProfile.profileName,
            name: currentProfile.profileName,
            node: '',
            type: isOptinLedgerWallet ? AccountType.LEDGER_OPT_IN : AccountType.LEDGER,
            address: address.plain(),
            publicKey: publicKey.toUpperCase(),
            encryptedPrivateKey: '',
            path: path,
            isMultisig: false,
        };
    }

    /**
     * Derive accounts of ledger using an array of paths
     * @param {NetworkType} networkType
     * @param {string[]} paths
     * @param curve
     * @param {boolean} ledgerDisplay
     * @returns {Promise<AccountModel[]>}
     */
    public async generateLedgerAccountsPaths(
        networkType: NetworkType,
        paths: string[],
        curve = Network.SYMBOL,
        ledgerDisplay: boolean = false,
    ): Promise<AccountModel[]> {
        const isOptinLedgerWallet = curve === Network.BITCOIN;
        const accounts = [];
        for (const path of paths) {
            const publicKey = await this.getLedgerPublicKeyByPath(networkType, path, ledgerDisplay, isOptinLedgerWallet);
            const account = PublicAccount.createFromPublicKey(publicKey.toUpperCase(), networkType);
            accounts.push(account);
        }
        return accounts;
    }

    /**
     * Create a account instance of Ledger from default path
     * @param {ProfileModel} currentProfile
     * @param {NetworkType} networkType
     * @param {boolean} isOptinLedgerWallet
     * @return {Promise<AccountModel>}
     */
    public async getDefaultLedgerAccount(
        currentProfile: ProfileModel,
        networkType: NetworkType,
        isOptinLedgerWallet: boolean,
    ): Promise<AccountModel> {
        const defaultPath = AccountService.getAccountPathByNetworkType(networkType);
        return await this.getLedgerAccountByPath(currentProfile, networkType, defaultPath, false, isOptinLedgerWallet);
    }

    /**
     * Get list of accounts from Trezor device
     * @param {NetworkType} networkType
     * @param {number} count
     * @return {Promise<string[]>}
     */
    public async getTrezorAccounts(networkType: NetworkType, count: number = 10): Promise<PublicAccount[]> {
        const derivationService = new DerivationService(networkType);

        const default_path = AccountService.getAccountPathByNetworkType(networkType);
        // increment derivation path \a count times
        const paths = [...Array(count).keys()].map((index) => {
            if (index == 0) {
                return default_path;
            }

            return derivationService.incrementPathLevel(default_path, DerivationPathLevels.Profile, index);
        });
        const publicKeys: string[] = await this.getTrezorPublicKeyByPaths(networkType, paths, false);

        return publicKeys.map((publicKey) => PublicAccount.createFromPublicKey(publicKey, networkType));
    }

    /**
     * Derive Trezor public keys from Trezor device by paths
     * @param {NetworkType} networkType
     * @param {string} paths
     * @param {boolean} trezorDisplay
     * @return {Promise<string>}
     */
    public async getTrezorPublicKeyByPaths(networkType: NetworkType, paths: string[], trezorDisplay: boolean): Promise<string[]> {
        for (const path of paths) {
            if (!DerivationPathValidator.validate(path, networkType)) {
                const errorMessage = 'Invalid derivation path: ' + path;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        }

        const trezorService = new TrezorService(networkType);
        const result = await trezorService.getAccounts(paths, trezorDisplay);
        return result;
    }

    /**
     * Derive an account instance of Trezor device using a path
     * @param {ProfileModel} currentProfile
     * @param {NetworkType} networkType
     * @param {string} paths
     * @param {boolean} trezorDisplay
     * @return {Promise<AccountModel>}
     */
    public async getTrezorAccountByPath(
        currentProfile: ProfileModel,
        networkType: NetworkType,
        path: string,
        trezorDisplay: boolean,
    ): Promise<AccountModel> {
        const publicKey = await this.getTrezorPublicKeyByPath(networkType, path, trezorDisplay);
        const address = PublicAccount.createFromPublicKey(publicKey.toUpperCase(), networkType).address;
        return {
            id: SimpleObjectStorage.generateIdentifier(),
            profileName: currentProfile.profileName,
            name: currentProfile.profileName,
            node: '',
            type: AccountType.TREZOR,
            address: address.plain(),
            publicKey: publicKey.toUpperCase(),
            encryptedPrivateKey: '',
            path: path,
            isMultisig: false,
        };
    }

    /**
     * Derive an public key from Trezor device using a path
     * @param {NetworkType} networkType
     * @param {string} paths
     * @param {boolean} trezorDisplay
     * @return {Promise<string>}
     */
    public async getTrezorPublicKeyByPath(networkType: NetworkType, path: string, trezorDisplay: boolean): Promise<string> {
        if (!DerivationPathValidator.validate(path, networkType)) {
            const errorMessage = 'Invalid derivation path: ' + path;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const trezorService = new TrezorService(networkType);
        const result = await trezorService.getAccount(path, trezorDisplay);
        return result;
    }

    /**
     * Return account path by network type
     * @param networkType Symbol network type
     */
    public static getAccountPathByNetworkType(networkType: NetworkType) {
        if (networkType === NetworkType.MAIN_NET) {
            return AccountService.DEFAULT_ACCOUNT_PATH_MAIN_NET;
        }
        return AccountService.DEFAULT_ACCOUNT_PATH_TEST_NET;
    }
}
