<template>
    <div class="transaction-row-inner-container">
        <div class="transaction-details-row-label-container">
            <span> {{ $t(label) }}: </span>
        </div>
        <div class="transaction-details-row-value-container">
            <span v-if="label === 'hash' || label === 'inner_transaction_hash'">
                <a class="url_text" target="_blank" :href="explorerUrl">{{ item.value }}</a>
            </span>
            <span v-else-if="item.isMosaic">
                <MosaicAmountDisplay
                    :id="item.value.id"
                    :color="item.value.color"
                    :absolute-amount="item.value.amount"
                    :show-ticker="true"
                />
            </span>
            <span v-else-if="item.isPaidFee">
                <PaidFeeDisplay :transaction="item.value" />
            </span>
            <span v-else-if="item.isAddress">
                <AddressDisplay :address="item.value" :show-address="true" />
            </span>
            <span v-else-if="item.isMessage">
                <MessageDisplay
                    :message="item.value.message"
                    :incoming="item.value.incoming"
                    :recipient="item.value.recipient"
                    :unannounced="item.value.unannounced"
                    :signer="item.value.signer"
                />
            </span>
            <span v-else>{{ item.value }}</span>
        </div>
    </div>
</template>

<script lang="ts">
// external dependencies
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

// child components
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue';
// @ts-ignore
import AddressDisplay from '@/components/AddressDisplay/AddressDisplay.vue';
// @ts-ignore
import PaidFeeDisplay from '@/components/PaidFeeDisplay/PaidFeeDisplay.vue';
// @ts-ignore
import MessageDisplay from '@/components/MessageDisplay/MessageDisplay.vue';
import { TransactionDetailItem } from '@/core/transactions/TransactionDetailItem';

@Component({
    components: { MosaicAmountDisplay, AddressDisplay, PaidFeeDisplay, MessageDisplay },
    computed: mapGetters({ explorerBaseUrl: 'app/explorerUrl' }),
})
export default class TransactionDetailRow extends Vue {
    @Prop({ required: true }) item: TransactionDetailItem;

    private get label(): string {
        return (this.item && this.item.key) || '';
    }
    /**
     * Explorer base path
     */
    protected explorerBaseUrl: string;

    /**
     * Returns the explorer url
     */
    public get explorerUrl() {
        return this.explorerBaseUrl.replace(/\/+$/, '') + '/transactions/' + this.item.value;
    }
}
</script>

<style lang="less" scoped>
/* @TODO TransactionDetails.less shouldn't be here */
@import '../TransactionDetails.less';
</style>
