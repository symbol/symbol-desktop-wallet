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
// external dependencies
// @ts-ignore
import AccountActions from '@/components/AccountActions/AccountActions.vue';
// @ts-ignore
import AccountAddressDisplay from '@/components/AccountAddressDisplay/AccountAddressDisplay.vue';
// child components
// @ts-ignore
import AccountNameDisplay from '@/components/AccountNameDisplay/AccountNameDisplay.vue';
// @ts-ignore
import AddressQR from '@/components/AddressQR/AddressQR.vue';
// @ts-ignore
import FormInputEditable from '@/components/FormInputEditable/FormInputEditable.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
// @ts-ignore
import ModalConfirm from '@/views/modals/ModalConfirm/ModalConfirm.vue';
import { AddressBook, IContact } from 'symbol-address-book';
import { Address } from 'symbol-sdk';
import { Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        AccountNameDisplay,
        AddressQR,
        AccountActions,
        AccountAddressDisplay,
        FormInputEditable,
        ModalConfirm,
    },
    computed: {
        ...mapGetters({
            addressBook: 'addressBook/getAddressBook',
            selectedContact: 'addressBook/getSelectedContact',
        }),
        address: function () {
            return Address.createFromRawAddress(this.selectedContact.address).pretty();
        },
    },
})
export class ContactDetailPanelTs extends ValidatedComponent {
    public addressBook: AddressBook;

    public selectedContact: IContact;

    public showDeleteConfirmModal: boolean = false;

    public saveProperty(propName: string) {
        return (newVal: string) => {
            if (propName === 'address') {
                const plainAddress = Address.createFromRawAddress(this.selectedContact.address).plain();
                this.selectedContact[propName] = plainAddress;
                this.$forceUpdate();
            } else {
                this.selectedContact[propName] = newVal;
            }
            this.$store.dispatch('addressBook/UPDATE_CONTACT', { id: this.selectedContact.id, contact: this.selectedContact });
        };
    }

    public get showDeleteModal() {
        return this.showDeleteConfirmModal;
    }

    public set showDeleteModal(val: boolean) {
        this.showDeleteConfirmModal = val;
    }

    public removeContact() {
        this.$store.dispatch('addressBook/REMOVE_CONTACT', this.selectedContact.id);
        this.showDeleteConfirmModal = false;
    }
}
