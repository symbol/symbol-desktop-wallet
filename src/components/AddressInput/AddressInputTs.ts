// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { NetworkType } from 'symbol-sdk';
// child components
import { ValidationProvider } from 'vee-validate';
import { Component, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        ValidationProvider,
        ErrorTooltip,
        FormRow,
    },
    computed: {
        ...mapGetters({
            networkType: 'network/networkType',
        }),
    },
})
export default class AddressInputTs extends ValidatedComponent {
    /**
     * Value bound to parent v-model
     * @type {string}
     */
    @Prop({ default: '' }) value: string;

    /**
     * Field label
     * @type {string}
     */
    @Prop({ default: null }) label: string;

    /**
     * Current network type
     * @var {NetworkType}
     */
    public networkType: NetworkType;

    /// region computed properties getter/setter
    public get rawValue(): string {
        return this.value;
    }

    public set rawValue(input: string) {
        this.$emit('input', input);
    }
    /// end-region computed properties getter/setter
}
