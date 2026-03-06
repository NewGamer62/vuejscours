import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './pages/HomePage.vue'

export const ROUTES = {
  HOME: '/',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
