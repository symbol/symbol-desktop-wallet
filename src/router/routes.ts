/*
 * Copyright 2020 NEM Foundation (https://nem.io)
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
import {
  createStepImage,
  importStepImage,
  officialIcons,
  importPrivateKeyStepImage,
  accessLedgerStepImage,
} from '@/views/resources/Images'
import { AppRoute } from './AppRoute'

export const routes: AppRoute[] = [
  {
    path: '/',
    name: 'home',
    meta: { protected: false },
    redirect: { name: 'profiles.login' },
    // @ts-ignore
    component: () => import('@/views/layout/PageLayout/PageLayout.vue'),
    /// region PageLayout children
    children: [
      {
        path: '/profiles',
        name: 'profiles',
        // @ts-ignore
        component: () => import('@/views/layout/RouterPage.vue'),
        meta: {
          protected: false,
          hideFromMenu: true,
        },
        children: [
          {
            path: 'create',
            name: 'profiles.importProfile.importStrategy',
            meta: { protected: false },
            // @ts-ignore
            component: () => import('@/views/pages/profiles/import-profile/import-strategy/ImportStrategy.vue'),
          },
          {
            path: 'create',
            name: 'profiles.createProfile',
            meta: { protected: false },
            // @ts-ignore
            component: () => import('@/views/pages/profiles/create-profile/CreateProfile.vue'),
            children: [
              {
                path: 'info',
                name: 'profiles.createProfile.info',
                meta: {
                  protected: false,
                  icon: createStepImage.createStepImage1,
                  nextPage: 'profiles.createProfile.generateMnemonic',
                },
                // @ts-ignore
                component: () => import('@/views/forms/FormProfileCreation/FormProfileCreation.vue'),
              },
              {
                path: 'generateMnemonic',
                name: 'profiles.createProfile.generateMnemonic',
                meta: {
                  protected: false,
                  icon: createStepImage.createStepImage2,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/create-profile/generate-mnemonic/GenerateMnemonic.vue'),
              },
              {
                path: 'showMnemonic',
                name: 'profiles.createProfile.showMnemonic',
                meta: {
                  protected: false,
                  icon: createStepImage.createStepImage3,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/create-profile/show-mnemonic/ShowMnemonic.vue'),
              },
              {
                path: 'verifyMnemonic',
                name: 'profiles.createProfile.verifyMnemonic',
                meta: {
                  protected: false,
                  icon: createStepImage.createStepImage4,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/create-profile/verify-mnemonic/VerifyMnemonic.vue'),
              },
              {
                path: 'finishCreate',
                name: 'profiles.createProfile.finalize',
                meta: {
                  protected: false,
                  icon: createStepImage.createStepImage5,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/create-profile/finalize/Finalize.vue'),
              },
            ],
          },
          {
            path: 'import',
            name: 'profiles.importProfile',
            meta: { protected: false },
            // @ts-ignore
            component: () => import('@/views/pages/profiles/import-profile/ImportProfile.vue'),
            children: [
              {
                path: 'inputAccountInfo',
                name: 'profiles.importProfile.info',
                meta: {
                  protected: false,
                  icon: importStepImage.importStepImage1,
                  nextPage: 'profiles.importProfile.importMnemonic',
                },
                // @ts-ignore
                component: () => import('@/views/forms/FormProfileCreation/FormProfileCreation.vue'),
              },
              {
                path: 'importMnemonic',
                name: 'profiles.importProfile.importMnemonic',
                meta: {
                  protected: false,
                  icon: importStepImage.importStepImage2,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/import-profile/import-mnemonic/ImportMnemonic.vue'),
              },
              {
                path: 'walletChoose',
                name: 'profiles.importProfile.walletSelection',
                meta: {
                  protected: false,
                  icon: importStepImage.importStepImage3,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/import-profile/account-selection/AccountSelection.vue'),
              },
              {
                path: 'finishImport',
                name: 'profiles.importProfile.finalize',
                meta: {
                  protected: false,
                  icon: importStepImage.importStepImage4,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/import-profile/finalize/Finalize.vue'),
              },
            ],
          },
          {
            path: 'importPrivateKey',
            name: 'profiles.importPrivateKey',
            meta: {
              protected: false,
            },
            // @ts-ignore
            component: () => {
              // @ts-ignore
              return import('@/views/pages/profiles/import-private-key/ImportPrivateKey.vue')
            },
            children: [
              {
                path: 'fillInfo',
                name: 'profiles.importPrivateKey.fillInfo',
                meta: {
                  protected: false,
                  nextPage: 'profiles.importPrivateKey.input',
                  icon: importPrivateKeyStepImage.importPrivateKeyStepImage1,
                },
                // @ts-ignore
                component: () => import('@/views/forms/FormCreatePrivateKeyWallet/FormCreatePrivateKeyWallet.vue'),
              },
              {
                path: 'input',
                name: 'profiles.importPrivateKey.input',
                meta: {
                  protected: false,
                  icon: importPrivateKeyStepImage.importPrivateKeyStepImage2,
                },

                component: () => {
                  // @ts-ignore
                  return import('@/views/pages/profiles/import-private-key/input-private-key/InputPrivateKey.vue')
                },
              },
              {
                path: 'finalize',
                name: 'profiles.importPrivateKey.finalize',
                meta: {
                  protected: false,
                  icon: importPrivateKeyStepImage.importPrivateKeyStepImage3,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/import-private-key/finalize/Finalize.vue'),
              },
            ],
          },
          {
            path: 'accessLedger',
            name: 'profiles.accessLedger',
            meta: { protected: false },
            // @ts-ignore
            component: () => import('@/views/pages/profiles/access-ledger/AccessLedger.vue'),
            children: [
              {
                path: 'info',
                name: 'profiles.accessLedger.info',
                meta: {
                  protected: false,
                  isLedger: true,
                  icon: accessLedgerStepImage.accessLedgerStepImage1,
                },
                // @ts-ignore
                component: () => import('@/views/forms/FormProfileCreation/FormProfileCreation.vue'),
              },
              {
                path: 'finishCreate',
                name: 'profiles.accessLedger.finalize',
                meta: {
                  protected: false,
                  isLedger: true,
                  icon: accessLedgerStepImage.accessLedgerStepImage2,
                },
                // @ts-ignore
                component: () => import('@/views/pages/profiles/access-ledger/finalize/Finalize.vue'),
              },
            ],
          },
        ],
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        meta: {
          protected: true,
          clickable: true,
          title: 'sidebar_item_home',
          icon: officialIcons.dashboard,
        },
        redirect: '/home',
        // @ts-ignore
        component: () => import('@/views/pages/dashboard/Dashboard.vue'),
        children: [
          {
            path: '/home/:action?',
            name: 'dashboard.index',
            meta: {
              protected: true,
              title: 'page_title_dashboard',
            },
            // @ts-ignore
            component: () => import('@/views/pages/dashboard/home/DashboardHomePage.vue'),
          },
          {
            path: '/transfer/:recipientAddress?',
            name: 'dashboard.transfer',
            meta: {
              protected: true,
              title: 'page_title_transfer',
            },
            // @ts-ignore
            component: () => import('@/views/pages/dashboard/transfer/DashboardTransferPage.vue'),
            props: true,
          },
          {
            path: '/invoice',
            name: 'dashboard.invoice',
            meta: {
              protected: true,
              title: 'page_title_invoice',
            },
            // @ts-ignore
            component: () => import('@/views/pages/dashboard/invoice/DashboardInvoicePage.vue'),
          },
          // {
          //   path: '/harvesting',
          //   name: 'dashboard.harvesting',
          //   meta: {
          //     protected: true,
          //     title: 'page_title_harvesting',
          //   },
          //   // @ts-ignore
          //   component: () => import('@/views/pages/dashboard/harvesting/DashboardHarvestingPage.vue'),
          // }
        ],
      },
      {
        path: '/accounts',
        name: 'accounts',
        redirect: '/details',
        meta: {
          protected: true,
          clickable: true,
          title: 'sidebar_item_accounts',
          icon: officialIcons.wallet,
        },
        // @ts-ignore
        component: () => import('@/views/pages/accounts/Accounts.vue'),
        children: [
          {
            path: '/details',
            name: 'accounts.details',
            meta: {
              protected: true,
              title: 'page_title_account_details',
            },
            // @ts-ignore
            component: () => import('@/views/pages/accounts/AccountDetailsPage/AccountDetailsPage.vue'),
          },
          {
            path: '/backup',
            name: 'accounts.backup',
            meta: {
              protected: true,
              title: 'page_title_account_backup',
            },
            // @ts-ignore
            component: () => import('@/views/pages/accounts/AccountBackupPage/AccountBackupPage.vue'),
          },
          // {
          //   path: 'harvesting',
          //   name: 'wallet.harvesting',
          //   meta: {
          //     protected: true,
          //     title: 'page_title_account_harvesting',
          //   },
          //   // @ts-ignore
          //   component: () => import('@/views/pages/accounts/AccountHarvestingPage/AccountHarvestingPage.vue'),
          // },
        ],
      },
      {
        path: '/mosaics',
        name: 'mosaics',
        redirect: '/mosaicList',
        meta: {
          protected: true,
          clickable: true,
          title: 'sidebar_item_mosaics',
          icon: officialIcons.mosaic,
        },
        // @ts-ignore
        component: () => import('@/views/pages/mosaics/MosaicsDashboardPage/MosaicsDashboardPage.vue'),
        children: [
          {
            path: '/mosaicList',
            name: 'mosaics.list',
            meta: {
              protected: true,
              title: 'page_title_mosaics',
            },
            // @ts-ignore
            component: () => import('@/views/pages/mosaics/MosaicListPage/MosaicListPage.vue'),
          },
          {
            path: '/createMosaic',
            name: 'mosaics.create',
            meta: {
              protected: true,
              title: 'page_title_mosaics_create',
            },
            // @ts-ignore
            component: () => import('@/views/pages/mosaics/CreateMosaicPage/CreateMosaicPage.vue'),
          },
        ],
      },
      {
        path: '/namespaces',
        name: 'namespaces',
        meta: {
          protected: true,
          clickable: true,
          title: 'sidebar_item_namespaces',
          icon: officialIcons.namespace,
        },
        redirect: '/namespaceList',
        // @ts-ignore
        component: () => import('@/views/pages/namespaces/NamespacesDashboardPage/NamespacesDashboardPage.vue'),
        children: [
          {
            path: '/namespaceList',
            name: 'namespaces.list',
            meta: {
              protected: true,
              title: 'page_title_namespaces',
            },
            // @ts-ignore
            component: () => import('@/views/pages/namespaces/NamespaceListPage/NamespaceListPage.vue'),
          },
          {
            path: '/createNamespace',
            name: 'namespaces.createRootNamespace',
            meta: {
              protected: true,
              title: 'page_title_namespaces_create',
            },
            // @ts-ignore
            component: () => import('@/views/pages/namespaces/CreateNamespacePage/CreateNamespacePage.vue'),
          },
          {
            path: '/createSubNamespace',
            name: 'namespaces.createSubNamespace',
            meta: {
              protected: true,
              title: 'create_sub_namespace',
            },
            // @ts-ignore
            component: () => import('@/views/pages/namespaces/createSubNamespace/CreateSubNamespace.vue'),
          },
        ],
      },
      {
        path: '/multisig',
        name: 'multisig',
        meta: {
          protected: true,
          clickable: true,
          title: 'sidebar_item_multisig',
          icon: officialIcons.multisig,
        },
        redirect: '/multisigManagement',
        // @ts-ignore
        component: () => import('@/views/pages/multisig/MultisigDashboardPage/MultisigDashboardPage.vue'),
        children: [
          {
            path: '/multisigManagement',
            name: 'multisig.management',
            meta: {
              protected: true,
              title: 'page_title_multisig_manage',
            },
            // @ts-ignore
            component: () => import('@/views/pages/multisig/ManageAccountPage/ManageAccountPage.vue'),
          },
        ],
      },
      {
        path: '/communityPanel',
        name: 'community',
        redirect: '/information',
        meta: {
          protected: true,
          clickable: true,
          title: 'sidebar_item_community',
          icon: officialIcons.news,
        },
        // @ts-ignore
        component: () => import('@/views/pages/community/Community.vue'),
        children: [
          {
            path: '/information',
            name: 'community.index',
            meta: { protected: true },
            // @ts-ignore
            component: () => import('@/views/pages/community/information/Information.vue'),
          },
        ],
      },
    ],
    /// end-region PageLayout children
  },
  {
    path: '/login',
    name: 'profiles.login',
    meta: { protected: false },
    // @ts-ignore
    component: () => import('@/views/pages/profiles/LoginPage.vue'),
  },
]
