import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { OfflineRentalFees } from '@/services/offline/MockModels';
import { Observable, of } from 'rxjs';
import { NetworkConfiguration, NetworkName, NetworkRepository, NetworkType, RentalFees, TransactionFees } from 'symbol-sdk';

export class OfflineNetworkRepository implements NetworkRepository {
    constructor(private readonly networkModel: NetworkModel) {}

    getNetworkName(): Observable<NetworkName> {
        throw new Error(`OfflineNetworkRepository: getNetworkName not implemented`);
    }

    getNetworkProperties(): Observable<NetworkConfiguration> {
        throw new Error(`OfflineNetworkRepository: getNetworkProperties not implemented`);
    }

    getNetworkType(): Observable<NetworkType> {
        return of(this.networkModel.networkType);
    }

    getRentalFees(): Observable<RentalFees> {
        return of(OfflineRentalFees);
    }

    getTransactionFees(): Observable<TransactionFees> {
        return of(this.networkModel.transactionFees);
    }
}
