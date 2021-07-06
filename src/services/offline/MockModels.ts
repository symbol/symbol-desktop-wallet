import { NetworkCurrencyModel } from '@/core/database/entities/NetworkCurrencyModel';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import {
    AccountInfo,
    AccountNames,
    AccountType,
    Address,
    ChainInfo,
    Currency,
    FinalizedBlock,
    MosaicId,
    MultisigAccountGraphInfo,
    NamespaceId,
    NamespaceName,
    NetworkCurrencies,
    NodeInfo,
    RentalFees,
    StorageInfo,
    SupplementalPublicKeys,
    UInt64,
} from 'symbol-sdk';

export const OfflineUrl = 'http://mock.com:3000';

export const OfflineNodeInfo = (networkModel: NetworkModel): NodeInfo => {
    return new NodeInfo('pubkey', networkModel.generationHash, 3000, networkModel.networkType, 0, [], 'host', 'name');
};

export const OfflineChainInfo = new ChainInfo(
    UInt64.fromUint(1),
    UInt64.fromUint(1),
    UInt64.fromUint(1),
    new FinalizedBlock(UInt64.fromUint(1), '6E477727F5AAF578F1AAE9752788B21DF75DB91194937D76E9E7ADD89B835BA0', 1, 1),
);

export const OfflineAccountInfo = (address: Address) =>
    new AccountInfo(
        0,
        'recordId',
        address,
        UInt64.fromUint(0),
        '0000000000000000000000000000000000000000000000000000000000000000',
        UInt64.fromUint(0),
        AccountType.Unlinked,
        new SupplementalPublicKeys(),
        [],
        [],
        UInt64.fromUint(0),
        UInt64.fromUint(0),
    );

export const OfflineStorageInfo = new StorageInfo(0, 0, 0);

export const OfflineRentalFees = new RentalFees(UInt64.fromUint(1000), UInt64.fromUint(100000), UInt64.fromUint(500000));

export const OfflineAccountNames = (address: Address) => new AccountNames(address, []);

export const OfflineNamespaceNames = (namespaceId: NamespaceId) => new NamespaceName(namespaceId, 'mocknamespace');

export const OfflineMultisigAccountGraphInfo = new MultisigAccountGraphInfo(new Map());

export const OfflineNetworkCurrencies = (networkModel: NetworkModel): NetworkCurrencies => {
    const toCurrency = (currency: NetworkCurrencyModel) =>
        new Currency({
            namespaceId: NamespaceId.createFromEncoded(currency.namespaceIdHex),
            divisibility: currency.divisibility,
            transferable: currency.transferable,
            supplyMutable: currency.supplyMutable,
            restrictable: currency.restrictable,
            mosaicId: new MosaicId(currency.mosaicIdHex),
        });
    return new NetworkCurrencies(
        toCurrency(networkModel.networkCurrencies.networkCurrency),
        toCurrency(networkModel.networkCurrencies.harvestCurrency || networkModel.networkCurrencies.networkCurrency),
    );
};
