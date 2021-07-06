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

import { IStorage } from '@/core/database/backends/IStorage';
import { NetworkBasedEntryModel, NetworkBasedModel } from '@/core/database/entities/NetworkBasedModel';

/**
 * A storage save the data per generation hash
 */
export class NetworkBasedObjectStorage<E> {
    /**
     * @param delegate the delegate that will store the data that stores the generation model.
     */
    public constructor(private readonly delegate: IStorage<NetworkBasedModel<E>>) {}

    private getStoredData(): NetworkBasedModel<E> {
        return this.delegate.get() || {};
    }

    /**
     * It gets all the entries indexed by generation hash
     * @return all the known entries.
     */
    public getAll(): Record<string, E> {
        return Object.fromEntries(
            Object.entries(this.getStoredData())
                .filter(([k, v]) => k && v && v.data)
                .map(([key, value]) => [key, value.data]),
        );
    }
    /**
     * it gets the stored value for the specific generation hash.
     *
     * @param generationHash the generation hash
     * @return the stored value for the provided network hash or undefined
     */
    public get(generationHash: string): E | undefined {
        if (!generationHash) {
            return undefined;
        }
        const map = this.getStoredData();
        return (map[generationHash] && map[generationHash].data) || undefined;
    }

    /**
     * It gets the latest stored entry according to the timestamp.
     * @return the entry if available.
     */
    public getLatest(): E | undefined {
        const map = this.getStoredData();
        const latest = Object.values(map).reduce(
            (prev, current) => (prev && prev.timestamp > current.timestamp ? prev : current),
            undefined,
        );
        return (latest && latest.data) || undefined;
    }

    /**
     * Stores the value for the provided generation hash.
     *
     * @param generationHash the generation hash
     * @param value to be stored
     */
    public set(generationHash: string, value: E): void {
        if (!generationHash) {
            throw Error('Generation hash must be provided!');
        }
        const map = this.getStoredData();
        map[generationHash] = new NetworkBasedEntryModel(generationHash, value);
        this.delegate.set(map);
    }

    /**
     * Deletes the stored value for the given generation hash
     * @param generationHash the generation hash.
     */
    public remove(generationHash: string): void {
        const map = this.getStoredData();
        delete map[generationHash];
        this.delegate.set(map);
    }
}
