// external dependencies
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue';
// internal dependencies
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { NodeModel } from '@/core/database/entities/NodeModel';
import { ProfileModel } from '@/core/database/entities/ProfileModel';
import { NotificationType } from '@/core/utils/NotificationType';
import { URLHelpers } from '@/core/utils/URLHelpers';
import { AccountInfo, NetworkType, NodeInfo, RepositoryFactoryHttp, RoleType } from 'symbol-sdk';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        FormWrapper,
        FormRow,
    },
    computed: {
        ...mapGetters({
            repositoryFactory: 'network/repositoryFactory',
            peerNodes: 'network/peerNodes',
            networkType: 'network/networkType',
            currentProfile: 'profile/currentProfile',
            currentSignerAccountInfo: 'account/currentSignerAccountInfo',
            networkModel: 'network/networkModel',
        }),
    },
})
export class NetworkNodeSelectorTs extends Vue {
    @Prop({ default: () => [RoleType.PeerNode, RoleType.VotingNode] }) includeRoles: number[];

    @Prop()
    value: NodeModel;

    @Prop({
        default: false,
    })
    disabled: boolean;

    @Prop({
        default: false,
    })
    isAccountKeyLinked: boolean;
    @Prop({
        default: false,
    })
    isVrfKeyLinked: boolean;

    @Prop({
        default: false,
    })
    missingKeys: boolean;

    public peerNodes: NodeInfo[];
    public isFetchingNodeInfo = false;
    public networkType: NetworkType;
    /**
     * Form items
     */
    protected formNodeUrl = '';

    protected customNode = '';

    protected formNodePublicKey = '';

    public customNodeData = [];

    public filteredData = [];

    public showInputPublicKey = false;

    public currentProfile: ProfileModel;

    private hideList: boolean = false;
    private currentSignerAccountInfo: AccountInfo;
    public networkModel: NetworkModel;
    /**
     * Checks if the given node is eligible for harvesting
     * @protected
     * @returns {Promise<void>}
     */
    protected async fetchNodePublicKey(value) {
        if (!value) {
            return '';
        }

        // first check it in peer nodes
        const peerNode = this.filteredNodes.find((p) => p.host === value);
        if (peerNode && peerNode?.nodePublicKey) {
            const nodeModel = new NodeModel(
                value,
                peerNode.friendlyName,
                false,
                this.networkType,
                peerNode.publicKey,
                peerNode.nodePublicKey,
            );
            Vue.set(this, 'showInputPublicKey', false);
            this.$emit('input', nodeModel);
            return;
        }
        this.isFetchingNodeInfo = true;
        try {
            const nodeUrl = URLHelpers.getNodeUrl(value);
            const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
            const nodeRepository = repositoryFactory.createNodeRepository();
            const nodeInfo = await nodeRepository.getNodeInfo().toPromise();
            this.formNodeUrl = value;
            if (nodeInfo.nodePublicKey) {
                const nodeModel = new NodeModel(
                    value,
                    nodeInfo.friendlyName,
                    false,
                    this.networkType,
                    nodeInfo.publicKey,
                    nodeInfo.nodePublicKey,
                );
                Vue.set(this, 'showInputPublicKey', false);
                this.$emit('input', nodeModel);
                const unlockedAccounts = await nodeRepository.getUnlockedAccount().toPromise();
                let nodeOperatorAccount = false;
                const remotePublicKey = this.currentSignerAccountInfo.supplementalPublicKeys?.linked?.publicKey;

                if (unlockedAccounts) {
                    nodeOperatorAccount = unlockedAccounts?.some((publicKey) => publicKey === remotePublicKey);
                }
                if (this.isAccountKeyLinked && this.isVrfKeyLinked && (this.missingKeys || nodeOperatorAccount)) {
                    this.$store.dispatch('harvesting/FETCH_STATUS', [value, nodeModel]);
                }
            } else {
                Vue.set(this, 'showInputPublicKey', true);
            }
        } catch (error) {
            this.$store.dispatch('notification/ADD_ERROR', NotificationType.INVALID_NODE);
            console.log(error);
            Vue.set(this, 'showInputPublicKey', true);
            throw new Error('Node_connection_failed');
        } finally {
            this.isFetchingNodeInfo = false;
        }
    }

    public async created() {
        // add static hardcoded nodes to harvesting list
        const staticNodesUrls = this.networkModel.nodes.map((node) => node.url.replace(/http:|:3000|\//g, ''));

        // add selected nodes
        const currentNodeUrl = this.currentProfile.selectedNodeUrlToConnect.replace(/http:|:3000|\//g, '');
        staticNodesUrls.push(currentNodeUrl);

        await this.$store.dispatch('network/LOAD_PEER_NODES');

        // remove the duplicate item in array.
        this.customNodeData = [...new Set(this.filteredNodes.map((n) => n.host).concat(staticNodesUrls))];

        if (this.customNodeData.includes(currentNodeUrl) && !this.value.url) {
            this.fetchNodePublicKey(currentNodeUrl);
        }
    }

    @Watch('value', { immediate: true })
    protected valueWatcher(newVal: NodeModel) {
        if (newVal) {
            this.formNodeUrl = newVal.url;
            if (!this.formNodeUrl) {
                this.formNodePublicKey = newVal.nodePublicKey;
            }
            if (this.formNodePublicKey) {
                this.showInputPublicKey = !this.formNodeUrl;
            }
        } else {
            this.formNodeUrl = '';
        }
    }

    @Watch('formNodeUrl', { immediate: true })
    protected nodeWatcher(newInput: string) {
        this.hideList = false;
        this.customNode = newInput;
        if (newInput) {
            this.filteredData = this.customNodeData.filter((n) => n.toLowerCase().startsWith(newInput.toLowerCase()));
        }
        if (!this.formNodeUrl) {
            this.filteredData = this.customNodeData;
        }
    }

    public filterUrls(value, option) {
        return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    }

    public onChangeFormNodePublicKey(event) {
        const nodeModel = { nodePublicKey: event.target.value };
        this.$emit('input', nodeModel);
    }

    public onClear() {
        // @ts-ignore
        this.$refs.nodeUrlInput.$el.focus();
        this.$emit('input', { nodePublicKey: '' });
    }

    public async handleSelectCustomNode() {
        if (this.customNode !== '') {
            this.hideList = true;
            await this.fetchNodePublicKey(this.customNode);
            this.customNode = '';
        }
    }

    protected get filteredNodes() {
        if (this.includeRoles && this.includeRoles.length > 0) {
            // exclude ngl nodes that doesn't support harvesting
            return this.peerNodes.filter(
                (node) =>
                    node.roles?.some((role) => this.isIncluded(role)) &&
                    node.networkGenerationHashSeed === this.networkModel.generationHash,
            );
        }
        return this.peerNodes;
    }

    private isIncluded(role: RoleType) {
        return this.includeRoles?.some((includedRole) => includedRole === role);
    }
    get nodeExistsInList() {
        return this.filteredData.includes(this.customNode);
    }
}
