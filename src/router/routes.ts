import type { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean;
    requiresAuth?: boolean;
    requiresRegister?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/Login.vue'),
        meta: { public: true },
      },
      {
        path: 'registers',
        name: 'register-select',
        component: () => import('pages/RegisterSelectPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'pos',
        name: 'pos',
        component: () => import('pages/PosPage.vue'),
        meta: { requiresAuth: true, requiresRegister: true },
      },
      {
        path: 'token-pairing',
        name: 'token-pairing',
        component: () => import('pages/TokenPairingPage.vue'),
        meta: { public: true },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
