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
import App from '@/app/App.vue';
import { AppStore } from '@/app/AppStore';
// internal dependencies
import { UIBootstrapper } from '@/app/UIBootstrapper';
import { VeeValidateSetup } from '@/core/validation/VeeValidateSetup';
import clickOutsideDirective from '@/directives/clickOutside';
import i18n from '@/language/index.ts';
import router from '@/router/AppRouter';
// @ts-ignore
import { library } from '@fortawesome/fontawesome-svg-core';
// @ts-ignore
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
// @ts-ignore
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import iView from 'view-design';
import locale from 'view-design/dist/locale/en-US';
import 'view-design/dist/styles/iview.css';
import Vue from 'vue';
import infiniteScroll from 'vue-infinite-scroll';
import moment from 'vue-moment';
import VueNumber from 'vue-number-animation';
import Router from 'vue-router';
import VueRx from 'vue-rx';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { PluginOptions } from 'vue-toastification/dist/types/src/types';

/// region UI plugins
Vue.use(iView, { locale });
Vue.use(moment as any);
Vue.use(Router);
Vue.use(VueRx);
Vue.use(VueNumber);
VeeValidateSetup.initialize();
Vue.use(infiniteScroll);
const toastDefaultOptions: PluginOptions = {
    closeButton: false,
    timeout: 3000,
    transition: 'Vue-Toastification__fade',
    transitionDuration: 300,
};
Vue.use(Toast, toastDefaultOptions);
library.add(faFileCsv);
Vue.component('font-awesome-icon', FontAwesomeIcon);
/// end-region UI plugins

/// directives
Vue.directive('click-outside', clickOutsideDirective);
/// end-region directives

const app = new Vue({
    router,
    store: AppStore,
    i18n,
    created: function () {
        // This will execute following processes:
        // - configure Electron
        // - configure Vue directives
        UIBootstrapper.configure(this);
    },
    render: (h) => h(App),
});

app.$mount('#app');
export default app;
