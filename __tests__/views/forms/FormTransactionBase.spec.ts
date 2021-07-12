import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import { WalletsModel1 } from '@MOCKS/Accounts';
import { TransactionCommandMode } from '@/services/TransactionCommand';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

const accountModule = {
    namespaced: true,
    getters: {
        isCosignatoryMode: () => true,
        currentAccount: () => [WalletsModel1],
        currentSignerMultisigInfo: () => {
            return {
                minApproval: 0,
            };
        },
    },
};

const store = new Vuex.Store({
    modules: {
        account: accountModule,
    },
});
store.commit = jest.fn();
store.dispatch = jest.fn();

const options = {
    localVue,
    store,
};

let wrapper;
let vm;

beforeEach(() => {
    wrapper = shallowMount(FormTransactionBase, options);
    vm = wrapper.vm;
});

describe('FormTransactionBase', () => {
    it('getTransactionCommandMode should return AGGREGATE given minApproval equal 1', () => {
        // arrange
        wrapper.setData({
            currentSignerMultisigInfo: {
                minApproval: 1,
            },
        });

        // act
        const mode = vm.getTransactionCommandMode([]);

        // assert
        expect(mode).toBe(TransactionCommandMode.AGGREGATE);
    });

    it('getTransactionCommandMode should return MULTISIGN given minApproval equal 2', () => {
        // arrange
        wrapper.setData({
            currentSignerMultisigInfo: {
                minApproval: 2,
            },
        });

        // act
        const mode = vm.getTransactionCommandMode([]);

        // assert
        expect(mode).toBe(TransactionCommandMode.MULTISIGN);
    });
});
