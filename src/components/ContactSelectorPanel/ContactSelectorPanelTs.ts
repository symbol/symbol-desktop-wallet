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
import AmountDisplay from '@/components/AmountDisplay/AmountDisplay.vue';
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
// @ts-ignore
import FormLabel from '@/components/FormLabel/FormLabel.vue';
// child components
// @ts-ignore
import MosaicAmountDisplay from '@/components/MosaicAmountDisplay/MosaicAmountDisplay.vue';
// @ts-ignore
import NavigationLinks from '@/components/NavigationLinks/NavigationLinks.vue';
import { UIHelpers } from '@/core/utils/UIHelpers';
// @ts-ignore
import ModalBackupProfile from '@/views/modals/ModalBackupProfile/ModalBackupProfile.vue';
// @ts-ignore
import ModalContactCreation from '@/views/modals/ModalContactCreation/ModalContactCreation.vue';
// @ts-ignore
import ModalFormSubAccountCreation from '@/views/modals/ModalFormSubAccountCreation/ModalFormSubAccountCreation.vue';
// @ts-ignore
import ModalImportAddressBook from '@/views/modals/ModalImportAddressBook/ModalImportAddressBook.vue';
// internal dependencies
import { AddressBook, IContact } from 'symbol-address-book';
import { ValidationProvider } from 'vee-validate';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        MosaicAmountDisplay,
        ModalFormSubAccountCreation,
        ModalImportAddressBook,
        ErrorTooltip,
        FormLabel,
        ValidationProvider,
        AmountDisplay,
        ModalBackupProfile,
        ModalContactCreation,
        NavigationLinks,
    },
    computed: {
        ...mapGetters({
            addressBook: 'addressBook/getAddressBook',
            selectedContact: 'addressBook/getSelectedContact',
        }),
    },
})
export class ContactSelectorPanelTs extends Vue {
    /**
     * Address book
     * @see {Store.addressBook}
     * @var {AddressBook}
     */
    public addressBook: AddressBook;
    /**
     * Selected contact
     * @see {Store.addressBook}
     * @var {IContact}
     */
    public selectedContact: IContact;

    public hasAddAccountModal: boolean = false;

    public hasImportProfileModal: boolean = false;

    public get allContacts(): IContact[] {
        return this.addressBook.getAllContacts();
    }

    public set selectedContactId(id: string) {
        const newSelectedContact = this.addressBook.getContactById(id);
        this.$store.commit('addressBook/setSelectedContact', newSelectedContact);
    }
    public get selectedContactId() {
        return this.selectedContact.id;
    }

    public isActiveContact(contact: IContact): boolean {
        if (!this.selectedContact) {
            return false;
        }
        return this.selectedContact.id === contact.id;
    }

    public downloadAddressBook() {
        UIHelpers.downloadBytesAsFile(this.addressBook.toJSON(), `address-book.json`, 'application/json');
    }

    /// end-region computed properties getter/setter
}
