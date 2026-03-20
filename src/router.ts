/* Auteur : Noa Gaillard */
import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import SignInPage from '@/pages/SignInPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/sign-in', component: SignInPage },
    { path: '/sign-up', component: SignUpPage },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const publicPages = ['/sign-in', '/sign-up']
  const isPublic = publicPages.includes(to.path)

  if (!isPublic && !authStore.isAuthenticated) {
    return next('/sign-in')
  }

  if (isPublic && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router
