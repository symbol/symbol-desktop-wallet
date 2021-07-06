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
// @ts-ignore
import QRCodeDisplay from '@/components/QRCode/QRCodeDisplay/QRCodeDisplay.vue';
// @ts-ignore
import TransactionDetails from '@/components/TransactionDetails/TransactionDetails.vue';
import { getNetworkConfigs } from '@/config';
// @ts-ignore
import FormOfflineCosignTransaction from '@/views/forms/FormOfflineCosignTransaction/FormOfflineCosignTransaction.vue';
// @ts-ignore
import FormOfflineTransferTransaction from '@/views/forms/FormOfflineTransferTransaction/FormOfflineTransferTransaction.vue';
// @ts-ignore
import ModalImportQR from '@/views/modals/ModalImportQR/ModalImportQR.vue';
// @ts-ignore
import ModalTransactionDetails from '@/views/modals/ModalTransactionDetails/ModalTransactionDetails.vue';
import _ from 'lodash';
import { CosignatureQR, CosignatureSignedTransactionQR, QRCode } from 'symbol-qr-library';
import { AggregateTransaction, Convert, CosignatureSignedTransaction, NetworkType, Transaction, TransactionMapping } from 'symbol-sdk';
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapGetters } from 'vuex';

@Component({
    components: {
        FormOfflineTransferTransaction,
        QRCodeDisplay,
        ModalImportQR,
        FormOfflineCosignTransaction,
        ModalTransactionDetails,
        TransactionDetails,
    },
    computed: {
        ...mapGetters({
            networkType: 'network/networkType',
            generationHash: 'network/generationHash',
        }),
    },
})
export default class OfflineCosignTransactionTs extends Vue {
    public networkType: NetworkType;

    public generationHash: string;

    public importedQrCode: CosignatureQR = null;

    public importedPayload: string = '';

    public qrCode: CosignatureSignedTransactionQR = null;

    public qrCodeJson: string = '';

    public step: number = 0;

    public isImportQRModalOpen: boolean = false;

    public aggregateTransaction: AggregateTransaction;

    public validTx: boolean = false;

    public transactionDetailsVisible = true;

    public aggregateTransactionView: AggregateTransaction = null;

    /**
     * Hook called when the child component ModalTransactionConfirmation triggers
     * the event 'signed'
     */
    public onSignedOfflineTransaction(signedTransaction: CosignatureSignedTransaction) {
        this.qrCode = new CosignatureSignedTransactionQR(signedTransaction, this.networkType, this.generationHash);
        this.qrCodeJson = JSON.stringify(this.qrCode.singedTransaction);
        this.step = 2;
    }

    public getStepClassName(index: number) {
        return this.step == index ? 'active' : this.step > index ? 'done' : '';
    }

    public onQRCodeGenerated(json: string) {
        try {
            const obj = JSON.parse(json);
            if (!obj.network_id) {
                return;
            } else {
                this.$store.dispatch('network/CONNECT', { networkType: obj.network_id, isOffline: true });
            }
        } catch (e) {
            return;
        }
    }

    public onConfirmImport(qrCode: QRCode) {
        this.importedQrCode = qrCode as CosignatureQR;
        this.calculateAggregateTransaction();
        this.step = 1;
    }

    public async calculateAggregateTransaction() {
        let transaction: AggregateTransaction;
        if (this.importedQrCode) {
            transaction = this.importedQrCode.transaction as AggregateTransaction;
        } else if (this.importedPayload) {
            try {
                transaction = TransactionMapping.createFromPayload(this.importedPayload) as AggregateTransaction;
            } catch (e) {
                this.validTx = false;
                this.aggregateTransaction = undefined;
            }
        }
        if (transaction) {
            const networkConfig = getNetworkConfigs().find((config) => config.networkType === transaction.networkType);
            if (!networkConfig) {
                throw new Error(`There is no network configuration for network type ${transaction.networkType}`);
            }
            const hash = Transaction.createTransactionHash(
                transaction.serialize(),
                Array.from(Convert.hexToUint8(networkConfig.generationHash)),
            );
            await this.$store.dispatch('network/CONNECT', { isOffline: true });
            this.aggregateTransactionView = _.cloneDeep(transaction);
            this.transactionDetailsVisible = true;
            // @ts-ignore
            transaction.transactionInfo = { hash: hash };
            this.aggregateTransaction = transaction;
            this.validTx = true;
        } else {
            this.validTx = false;
            this.aggregateTransaction = undefined;
        }
    }

    public get isDisabled() {
        return !this.validTx;
    }

    public onImportPayloadClick() {
        if (!this.aggregateTransaction) {
            this.$store.dispatch('notification/ADD_ERROR', 'payload_not_valid');
        } else {
            this.step = 1;
        }
    }
}
