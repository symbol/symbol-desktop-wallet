// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue';
//@ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
//@ts-ignore
import PeerSelector from '@/components/PeerSelector/PeerSelector.vue';
import { ValidatedComponent } from '@/components/ValidatedComponent/ValidatedComponent';
import { NodeModel } from '@/core/database/entities/NodeModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { NotificationType } from '@/core/utils/NotificationType';
import { URLHelpers } from '@/core/utils/URLHelpers';
import { NetworkService } from '@/services/NetworkService';
import { NetworkType } from 'symbol-sdk';
//@ts-ignore
import { validate, ValidationObserver, ValidationProvider } from 'vee-validate';
import { Component } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        ValidationObserver,
        ValidationProvider,
        ErrorTooltip,
        FormRow,
        PeerSelector,
    },
    computed: {
        ...mapGetters({
            knowNodes: 'network/knowNodes',
            currentProfile: 'profile/currentProfile',
        }),
    },
})
export class FormNodeEditTs extends ValidatedComponent {
    /**
     * Current profile
     */
    public currentProfile: ProfileModel;
    public isGettingNodeInfo: boolean = false;
    public formItems = {
        nodeUrl: '',
        networkType: '',
        networkHash: '',
    };
    public $refs!: {
        observer: InstanceType<typeof ValidationObserver>;
    };
    public knowNodes: NodeModel[];
    public nodeDelay: number = 0;

    public onSubmit() {
        this.addPeer();
    }
    /**
     * Add a new peer to storage
     * @return {void}
     */
    public addPeer() {
        // validate and parse input
        const nodeUrl = URLHelpers.getNodeUrl(this.formItems.nodeUrl);

        // return if node already exists in the database
        if (this.knowNodes.find((node) => node.url === nodeUrl)) {
            this.$store.dispatch('notification/ADD_ERROR', NotificationType.NODE_EXISTS_ERROR);
            return;
        }

        // read network type from node pre-saving
        try {
            // hide loading overlay
            this.$store.dispatch('network/ADD_KNOWN_PEER', nodeUrl);
            this.$store.dispatch('notification/ADD_SUCCESS', NotificationType.OPERATION_SUCCESS);
            this.$store.dispatch('diagnostic/ADD_DEBUG', 'PeerSelector added peer: ' + nodeUrl);

            // reset the form input
            this.formItems.nodeUrl = '';
            this.$refs.observer.reset();
        } catch (e) {
            // hide loading overlay
            this.$store.dispatch('diagnostic/ADD_ERROR', 'PeerSelector unreachable host with URL: ' + nodeUrl);
            this.$store.dispatch('notification/ADD_ERROR', this.$t(NotificationType.ERROR_PEER_UNREACHABLE));
        }
    }
    public async getInfoFromUrl(url: string) {
        if (this.$refs.observer.fields && this.$refs.observer.fields.nodeUrl.invalid) {
            this.formItems.networkHash = '';
            this.formItems.networkType = '';
            return;
        }
        const networkService = new NetworkService();
        this.isGettingNodeInfo = true;
        try {
            const networkModel = (await networkService.getNetworkModel(url).toPromise())?.networkModel;
            if (!networkModel) {
                return this.$store.dispatch('notification/ADD_WARNING', this.$t(NotificationType.INVALID_NODE));
            }
            if (NetworkType[this.currentProfile.networkType] !== NetworkType[networkModel.networkType]) {
                return this.$store.dispatch('notification/ADD_WARNING', this.$t(NotificationType.NETWORK_TYPE_INVALID));
            }
            this.formItems.networkType = NetworkType[networkModel.networkType];
            this.formItems.networkHash = networkModel.generationHash;
        } finally {
            this.isGettingNodeInfo = false;
        }
    }
    public customNodeData = [];
    public async handleInput(value: string) {
        this.formItems.networkType && (this.formItems.networkType = '');
        this.formItems.networkHash && (this.formItems.networkHash = '');
        const isValidUrl = await validate(value, this.validationRules.url);
        if (!isValidUrl) {
            this.customNodeData = [];
            return;
        }
        let associationValue: string = /.+\u003a\d{2,}/.test(value) ? value : value + ':3000';
        associationValue = /https?\:\/\/.+/.test(associationValue) ? associationValue : 'http://' + associationValue;
        this.customNodeData = !value ? [] : [associationValue];
    }
}
