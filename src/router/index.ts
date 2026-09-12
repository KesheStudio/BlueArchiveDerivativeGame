import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@views/AboutView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@views/NotFound.vue'),
  },
  {
    path: '/gameplayer',
    name: 'Gameplayer',
    component: () => import("@views/gameplay/GamePlayer.vue"),
    children:[

    ]
  },
  {
    path: '/gameplayer/blueArchiveKill',
    name: 'BlueArchiveKill',
    meta:{
      CN_NAME:"BA杀"
    },
    component:() => import('@views/gameplay/BlueArchiveKill.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router