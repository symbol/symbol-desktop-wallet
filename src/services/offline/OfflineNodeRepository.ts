import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { OfflineNodeInfo, OfflineStorageInfo } from '@/services/offline/MockModels';
import { Observable, of } from 'rxjs';
import { NodeHealth, NodeInfo, NodeRepository, NodeTime, ServerInfo, StorageInfo } from 'symbol-sdk';

export class OfflineNodeRepository implements NodeRepository {
    constructor(private readonly networkModel: NetworkModel) {}

    getNodeHealth(): Observable<NodeHealth> {
        throw new Error(`OfflineNodeRepository: getNodeHealth not implemented`);
    }

    getNodeInfo(): Observable<NodeInfo> {
        return of(OfflineNodeInfo(this.networkModel));
    }

    getNodePeers(): Observable<NodeInfo[]> {
        return of([]);
    }

    getNodeTime(): Observable<NodeTime> {
        throw new Error(`OfflineNodeRepository: getNodeTime not implemented`);
    }

    getServerInfo(): Observable<ServerInfo> {
        throw new Error(`OfflineNodeRepository: getServerInfo not implemented`);
    }

    getStorageInfo(): Observable<StorageInfo> {
        return of(OfflineStorageInfo);
    }

    getUnlockedAccount(): Observable<string[]> {
        throw new Error(`OfflineNodeRepository: getUnlockedAccount not implemented`);
    }
}
