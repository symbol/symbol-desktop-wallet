<template>
    <div class="main-container">
        <div class="login-button">
            <button class="trigger-accountlink pointer" @click="onLoginClick">
                <img class="navbar-icon" :src="loginIcon" />
                <span class="color">{{ $t('go_to_login_offline') }}</span>
            </button>
        </div>
        <div class="left-container">
            <div class="title-container">
                <div class="wrapper">
                    <div class="title"><Icon type="ios-cloud-download-outline" /> {{ $t('connect_to_new_network_title') }}</div>
                    <div class="description-text">
                        <p class="mt">{{ $t('connect_to_new_network_text1') }}</p>
                        <p class="mt">{{ $t('connect_to_new_network_text2') }}</p>
                        <p class="mt">{{ $t('connect_to_new_network_text3') }}</p>
                        <p class="mt">{{ $t('connect_to_new_network_text4') }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-container">
            <div class="network-form-container">
                <div id="main-container">
                    <div v-if="completed">
                        Network has been created:
                        <br />
                        <br />
                        <button class="button-style inverted-button pl-2 pr-2" type="button" @click="osCreateProfileClick">
                            {{ $t('create_a_new_profile') }}
                        </button>
                        <br />
                        Think how to render the following if required:
                        <br />
                        <pre>
                        {{ JSON.stringify(result.networkModel, null, 2) }}
                        </pre>
                        <br />
                        <br />
                    </div>
                    <div v-if="!completed">
                        <FormWrapper class="general-settings-container" :whitelisted="true">
                            <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
                                <form class="form-container mt-3" onsubmit="event.preventDefault()" autocomplete="off">
                                    <FormRow>
                                        <template v-slot:label> {{ $t('network_name') }}: </template>
                                        <template v-slot:inputs>
                                            <ValidationProvider
                                                v-slot="{ errors }"
                                                vid="nodeUrl"
                                                :name="$t('network_name')"
                                                :rules="'required'"
                                                tag="div"
                                                class="inputs-container items-container"
                                            >
                                                <ErrorTooltip :errors="errors">
                                                    <input v-model="formItems.name" class="input-size" :placeholder="$t('input_here')" />
                                                </ErrorTooltip>
                                            </ValidationProvider>
                                        </template>
                                    </FormRow>
                                    <FormRow>
                                        <template v-slot:label> {{ $t('node_url') }}: </template>
                                        <template v-slot:inputs>
                                            <ValidationProvider
                                                v-slot="{ errors }"
                                                vid="nodeUrl"
                                                :name="$t('node_url')"
                                                :rules="'required|url'"
                                                tag="div"
                                                class="inputs-container items-container"
                                            >
                                                <ErrorTooltip :errors="errors">
                                                    <input v-model="formItems.nodeUrl" class="input-size" :placeholder="$t('input_here')" />
                                                </ErrorTooltip>
                                            </ValidationProvider>
                                        </template>
                                    </FormRow>
                                    <FormRow>
                                        <template v-slot:label> {{ $t('explorer_url') }}: </template>
                                        <template v-slot:inputs>
                                            <ValidationProvider
                                                v-slot="{ errors }"
                                                vid="nodeUrl"
                                                :name="$t('explorer_url')"
                                                :rules="'url'"
                                                tag="div"
                                                class="inputs-container items-container"
                                            >
                                                <ErrorTooltip :errors="errors">
                                                    <input
                                                        v-model="formItems.explorerUrl"
                                                        class="input-size"
                                                        :placeholder="$t('input_here')"
                                                    />
                                                </ErrorTooltip>
                                            </ValidationProvider>
                                        </template>
                                    </FormRow>

                                    <FormRow>
                                        <template v-slot:label> {{ $t('faucet_url') }}: </template>
                                        <template v-slot:inputs>
                                            <ValidationProvider
                                                v-slot="{ errors }"
                                                vid="nodeUrl"
                                                :name="$t('faucet_url')"
                                                :rules="'url'"
                                                tag="div"
                                                class="inputs-container items-container"
                                            >
                                                <ErrorTooltip :errors="errors">
                                                    <input
                                                        v-model="formItems.faucetUrl"
                                                        class="input-size"
                                                        :placeholder="$t('input_here')"
                                                    />
                                                </ErrorTooltip>
                                            </ValidationProvider>
                                        </template>
                                    </FormRow>

                                    <div class="form-row form-submit">
                                        <div class="align-right">
                                            <button
                                                class="button-style inverted-button pl-2 pr-2"
                                                type="submit"
                                                :disabled="submitting || completed"
                                                @click="handleSubmit(onSubmit)"
                                            >
                                                {{ $t('confirm') }}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </ValidationObserver>
                        </FormWrapper>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import ConnectToNewNetworkTs from './ConnectToNewNetworkTs';
export default class ConnectToNewNetwork extends ConnectToNewNetworkTs {}
</script>
<style lang="less" scoped>
@import './ConnectToNewNetwork.less';
</style>
