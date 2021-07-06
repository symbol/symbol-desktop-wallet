//@ts-ignore
import AmountInput from '@/components/AmountInput/AmountInput.vue';
import { appConfig, defaultMainnetNetworkConfig } from '@/config';
import { StandardValidationRules } from '@/core/validation/StandardValidationRules';
import { MaxDecimalsValidator, MaxRelativeAmountValidator, PositiveDecimalNumberValidator } from '@/core/validation/validators';
import i18n from '@/language/index';
import { mosaicsMock } from '@MOCKS/mosaics';
import { createLocalVue, mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import { extend, validate, ValidationProvider } from 'vee-validate';
import VueI18n, { Values } from 'vue-i18n';
import Vuex from 'vuex';

StandardValidationRules.register();
appConfig.constants.DECIMAL_SEPARATOR = '.';
extend('maxDecimals', {
    validate: (value, args: any) => {
        const { maxDecimalNumber } = args;
        return MaxDecimalsValidator.validate(value, maxDecimalNumber);
    },
    message: (_fieldName: string, values: Values) => `${i18n.t('max_decimal_number_error', values)}`,
    params: ['maxDecimalNumber'],
});
extend('positiveDecimal', {
    validate: (value) => PositiveDecimalNumberValidator.validate(value),
    message: () => i18n.t('positive_decimal_error', { decimalSeparator: appConfig.constants.DECIMAL_SEPARATOR }).toString(),
});
extend('maxRelativeAmount', {
    validate: (value, { maxMosaicAtomicUnits, maxMosaicDivisibility }: any) => {
        const maxRelativeAmount =
            maxMosaicDivisibility === 0 ? maxMosaicAtomicUnits : maxMosaicAtomicUnits / Math.pow(10, maxMosaicDivisibility);
        return MaxRelativeAmountValidator.validate(value, maxRelativeAmount);
    },
    message: (_fieldName: string, values: Values) =>
        `${i18n.t('max_amount_error', {
            ...values,
            maxRelativeAmount: `${
                values['maxMosaicAtomicUnits'] === 0
                    ? values['maxMosaicAtomicUnits']
                    : values['maxMosaicAtomicUnits'] / Math.pow(10, values['maxMosaicDivisibility'])
            }`,
        })}`,
    params: ['maxMosaicAtomicUnits', 'maxMosaicDivisibility'],
});
const localVue = createLocalVue();
localVue.component('ValidationProvider', ValidationProvider);
localVue.use(Vuex);
localVue.use(VueI18n);
const mosaicModule = {
    namespaced: true,
    getters: {
        mosaics: () => {
            return mosaicsMock;
        },
    },
};
const networkModule = {
    namespaced: true,
    getters: {
        networkConfiguration: () => {
            return defaultMainnetNetworkConfig.networkConfiguration;
        },
        networkModel: () => {
            return defaultMainnetNetworkConfig;
        },
    },
};
const store = new Vuex.Store({
    modules: {
        mosaic: mosaicModule,
        network: networkModule,
    },
});
const options = {
    localVue,
    i18n,
    store,
    propsData: {
        mosaicHex: '519FC24B9223E0B4',
    },
    stubs: ['Tooltip'],
    sync: false,
};
const options2 = {
    localVue,
    i18n,
    store,
    propsData: {
        mosaicHex: '534CD11F6D984B4B',
    },
    stubs: ['Tooltip'],
    sync: false,
};
let wrapper;
let wrapper2;

describe('AmountInput', () => {
    beforeEach(() => {
        wrapper = mount(AmountInput, options);
        wrapper2 = mount(AmountInput, options2);
    });
    afterEach(() => {
        wrapper.destroy();
        wrapper2 = mount(AmountInput, options2);
    });
    test.skip('input correctly', async () => {
        wrapper.setProps({
            value: '10.12345678',
        });
        await flushPromises();
        expect((wrapper.vm as AmountInput).relativeValue).toBe('10.12345678');
    });
    test.skip('output correctly', async () => {
        wrapper.find('.input-style').setValue('10.1234567');
        await flushPromises();
        expect(wrapper.emitted().input[0]).toEqual(['10.1234567']);
    });
    test("divisibility of the mosaic '519FC24B9223E0B4' is 6", async () => {
        expect(wrapper.vm.networkConfiguration).toEqual(defaultMainnetNetworkConfig.networkConfiguration);
        const rule = wrapper.vm.validationRules.amount;
        expect(rule).toEqual('positiveDecimal|maxDecimals:6|maxRelativeAmount:8999999999000000,6');
        const falseResult = await validate('10.1234567', rule);
        expect(falseResult.valid).toBeFalsy();
        const rightResult = await validate('10.123456', rule);
        expect(rightResult.valid).toBeTruthy();

        const falseResultMaxRelativeAmount = await validate('89999999990', rule);
        expect(falseResultMaxRelativeAmount.valid).toBeFalsy();
        const rightResultMaxRelativeAmount = await validate('8999999999', rule);
        expect(rightResultMaxRelativeAmount.valid).toBeTruthy();
    });
    test("divisibility of the mosaic '534CD11F6D984B4B' is 5", async () => {
        wrapper2.setProps({
            mosaicHex: '534CD11F6D984B4B',
        });
        await flushPromises();
        const rule = wrapper2.vm.validationRules.amount;
        expect(wrapper2.vm.networkConfiguration).toEqual(defaultMainnetNetworkConfig.networkConfiguration);
        expect(rule).toEqual('positiveDecimal|maxDecimals:5|maxRelativeAmount:8999999999000000,5');
        const falseResult = await validate('10.123456', rule);
        expect(falseResult.valid).toBeFalsy();
        const rightResult = await validate('10.12345', rule);
        expect(rightResult.valid).toBeTruthy();

        const falseResultMaxRelativeAmount = await validate('899999999900', rule);
        expect(falseResultMaxRelativeAmount.valid).toBeFalsy();
        const rightResultMaxRelativeAmount = await validate('89999999990', rule);
        expect(rightResultMaxRelativeAmount.valid).toBeTruthy();
    });
});
