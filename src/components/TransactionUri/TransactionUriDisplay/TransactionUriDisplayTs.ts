import { Transaction, TransactionMapping } from 'symbol-sdk';
import { Vue, Component, Prop } from 'vue-property-decorator';

import { TransactionURI } from 'symbol-uri-scheme';
// @ts-ignore
import ButtonCopyToClipboard from '@/components/ButtonCopyToClipboard/ButtonCopyToClipboard.vue';

// @ts-ignore
import LongTextDisplay from '@/components/LongTextDisplay/LongTextDisplay.vue';

@Component({
    components: { ButtonCopyToClipboard, LongTextDisplay },
})
export default class TransactionUriDisplayTs extends Vue {
    @Prop({ default: null }) readonly transaction?: Transaction;

    public get transactionURI() {
        if (this.transaction && this.transaction.deadline) {
            return new TransactionURI(this.transaction?.serialize(), TransactionMapping.createFromPayload).build();
        }
    }
}
