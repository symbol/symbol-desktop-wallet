import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { OfflineNetworkCurrencies, OfflineUrl } from '@/services/offline/MockModels';
import { OfflineAccountRepository } from '@/services/offline/OfflineAccountRepository';
import { OfflineChainRepository } from '@/services/offline/OfflineChainRepository';
import { OfflineListener } from '@/services/offline/OfflineListener';
import { OfflineMetadataRepository } from '@/services/offline/OfflineMetadataRepository';
import { OfflineMosaicRepository } from '@/services/offline/OfflineMosaicRepository';
import { OfflineMultisigRepository } from '@/services/offline/OfflineMultisigRepository';
import { OfflineNamespaceRepository } from '@/services/offline/OfflineNamespaceRepository';
import { OfflineNetworkRepository } from '@/services/offline/OfflineNetworkRepository';
import { OfflineNodeRepository } from '@/services/offline/OfflineNodeRepository';
import { OfflineTransactionRepository } from '@/services/offline/OfflineTransactionRepository';
import { Observable, of } from 'rxjs';
import {
    AccountRepository,
    BlockHttp,
    BlockRepository,
    ChainRepository,
    FinalizationHttp,
    FinalizationRepository,
    HashLockHttp,
    HashLockRepository,
    IListener,
    MetadataRepository,
    MosaicRepository,
    MultisigRepository,
    NamespaceRepository,
    NetworkCurrencies,
    NetworkRepository,
    NetworkType,
    NodeRepository,
    ReceiptHttp,
    ReceiptRepository,
    RepositoryFactory,
    RestrictionAccountHttp,
    RestrictionAccountRepository,
    RestrictionMosaicHttp,
    RestrictionMosaicRepository,
    SecretLockHttp,
    SecretLockRepository,
    TransactionRepository,
    TransactionStatusHttp,
    TransactionStatusRepository,
} from 'symbol-sdk';

export class OfflineRepositoryFactory implements RepositoryFactory {
    constructor(private readonly networkModel: NetworkModel) {}

    createAccountRepository(): AccountRepository {
        return new OfflineAccountRepository();
    }

    createBlockRepository(): BlockRepository {
        console.log(`Requesting offline block repository that's not implemented`);
        return new BlockHttp(OfflineUrl);
    }

    createChainRepository(): ChainRepository {
        return new OfflineChainRepository();
    }

    createFinalizationRepository(): FinalizationRepository {
        console.log(`Requesting offline finalization repository that's not implemented`);
        return new FinalizationHttp(OfflineUrl);
    }

    createHashLockRepository(): HashLockRepository {
        console.log(`Requesting offline hashlock repository that's not implemented`);
        return new HashLockHttp(OfflineUrl);
    }

    createListener(): IListener {
        return new OfflineListener();
    }

    createMetadataRepository(): MetadataRepository {
        return new OfflineMetadataRepository();
    }

    createMosaicRepository(): MosaicRepository {
        return new OfflineMosaicRepository();
    }

    createMultisigRepository(): MultisigRepository {
        return new OfflineMultisigRepository();
    }

    createNamespaceRepository(): NamespaceRepository {
        return new OfflineNamespaceRepository();
    }

    createNetworkRepository(): NetworkRepository {
        return new OfflineNetworkRepository(this.networkModel);
    }

    createNodeRepository(): NodeRepository {
        return new OfflineNodeRepository(this.networkModel);
    }

    createReceiptRepository(): ReceiptRepository {
        console.log(`Requesting offline receipt repository that's not implemented`);
        return new ReceiptHttp(OfflineUrl);
    }

    createRestrictionAccountRepository(): RestrictionAccountRepository {
        console.log(`Requesting offline account restriction repository that's not implemented`);
        return new RestrictionAccountHttp(OfflineUrl);
    }

    createRestrictionMosaicRepository(): RestrictionMosaicRepository {
        console.log(`Requesting offline account repository that's not implemented`);
        return new RestrictionMosaicHttp(OfflineUrl);
    }

    createSecretLockRepository(): SecretLockRepository {
        console.log(`Requesting offline secretlock repository that's not implemented`);
        return new SecretLockHttp(OfflineUrl);
    }

    createTransactionRepository(): TransactionRepository {
        return new OfflineTransactionRepository();
    }

    createTransactionStatusRepository(): TransactionStatusRepository {
        console.log(`Requesting offline transactionstatus repository that's not implemented`);
        return new TransactionStatusHttp(OfflineUrl);
    }

    getCurrencies(): Observable<NetworkCurrencies> {
        return of(OfflineNetworkCurrencies(this.networkModel));
    }

    getEpochAdjustment(): Observable<number> {
        console.log(`Requesting offline epoch adjustment and it's not implemented`);
        return undefined;
    }

    getGenerationHash(): Observable<string> {
        return of(this.networkModel.generationHash);
    }

    getNetworkType(): Observable<NetworkType> {
        return of(this.networkModel.networkType);
    }

    getNodePublicKey(): Observable<string | undefined> {
        console.log(`Requesting offline node public key and it's not implemented`);
        return undefined;
    }
}
