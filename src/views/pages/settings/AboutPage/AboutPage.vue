<template>
    <div class="about-container">
        <div class="form-container">
            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_app_release') }}
                </div>
                <div class="value">{{ configs.package.description }} v{{ configs.package.version }}</div>
            </div>
            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_app_url') }}
                </div>
                <div class="value">
                    <a :href="configs.package.homepage" target="_blank">{{ configs.package.homepage }}</a>
                </div>
            </div>
            <!-- <div class="form-row"></div> -->

            <div class="subtitle">
                {{ $t('about_network') }}
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_default_node') }}
                </div>
                <div class="value">
                    <a :href="nodeLink + '/node/info'" target="_blank">{{ nodeLink }}</a>
                </div>
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_network_type') }}
                </div>
                <div class="value">
                    <span>{{ networkTypeName }}</span>
                </div>
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_generation_hash') }}
                </div>
                <div class="value">
                    {{ generationHash }}
                </div>
            </div>
            <!-- <div class="form-row about-list"></div> -->

            <div class="subtitle">
                {{ $t('about_dependencies') }}
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_sdk_version') }}
                </div>
                <div class="value">
                    {{ configs.packageLock.dependencies['symbol-sdk'].version }}
                </div>
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_typescript_version') }}
                </div>
                <div class="value">
                    {{ configs.packageLock.dependencies['typescript'].version }}
                </div>
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_rxjs_version') }}
                </div>
                <div class="value">
                    {{ configs.packageLock.dependencies['rxjs'].version }}
                </div>
            </div>

            <div class="form-row about-list">
                <div class="label">
                    {{ $t('about_vue_version') }}
                </div>
                <div class="value">
                    {{ configs.packageLock.dependencies['vue'].version }}
                </div>
            </div>
            <!-- <div class="form-row"></div> -->
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// child components
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue';
import FormLabel from '@/components/FormLabel/FormLabel.vue';
// configuration
import { appConfig } from '@/config';
import { feesConfig } from '@/config';
import packageConfig from '@/../package.json';
import packageLockConfig from '@/../package-lock.json';
import { mapGetters } from 'vuex';
import { NetworkModel } from '@/core/database/entities/NetworkModel';
import { URLInfo } from '@/core/utils/URLInfo';
import { NetworkTypeHelper } from '@/core/utils/NetworkTypeHelper';

@Component({
    components: {
        FormWrapper,
        FormLabel,
    },
    computed: {
        ...mapGetters({
            networkModel: 'network/networkModel',
            currentPeer: 'network/currentPeer',
        }),
    },
})
export default class AboutPage extends Vue {
    private networkModel: NetworkModel;

    public currentPeer: URLInfo;

    public configs = {
        package: packageConfig,
        packageLock: packageLockConfig,
        app: appConfig,
        fees: feesConfig,
    };

    public get networkTypeName(): string {
        return NetworkTypeHelper.getNetworkTypeName(this.networkModel.networkType);
    }

    public get generationHash(): string {
        return this.networkModel.generationHash;
    }

    public get nodeLink(): string {
        return `${this.currentPeer}`;
    }
}
</script>

<style lang="less" scoped>
@import '../../../resources/css/variables.less';
.about-container {
    display: block;
    width: 100%;
    clear: both;
    min-height: 1rem;
    padding-left: 6%;
    padding-top: 0.8rem;
    padding-bottom: 0.4rem;

    .form-row {
        width: 100%;
        display: grid;
        grid-template-columns: 20% 80%;
        font-size: @smallFont;
        color: @primary;
        min-height: unset;
    }

    .subtitle {
        font-size: @normalFont;
        font-weight: @bold;
        color: @primary;
        margin-top: 50px;
    }
}
</style>
