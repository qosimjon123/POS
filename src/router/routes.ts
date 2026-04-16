import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login.vue') },
      {
        path: 'registers',
        name: 'register-select',
        component: () => import('pages/RegisterSelectPage.vue'),
      },
      { path: 'pos', name: 'pos', component: () => import('pages/PosPage.vue') },
      {
        path: 'token-pairing',
        name: 'token-pairing',
        component: () => import('pages/TokenPairingPage.vue'),
      },
      {
        path: 'pos-ui-playground',
        name: 'pos-ui-playground',
        component: () => import('pages/pos-ui-playground/PosUiPlaygroundHub.vue'),
      },
      {
        path: 'pos-ui-playground/view/:slug',
        name: 'pos-ui-playground-stub',
        component: () => import('pages/pos-ui-playground/PosUiPlaygroundStub.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
