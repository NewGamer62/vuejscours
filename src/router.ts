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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const publicPages = ['/sign-in', '/sign-up']
  const isPublic = publicPages.includes(to.path)

  // RG2 : Rediriger vers connexion si non authentifié sur route privée
  if (!isPublic && !authStore.isAuthenticated) {
    return next('/sign-in')
  }

  // RG3 : Rediriger vers accueil si déjà connecté sur login/inscription
  if (isPublic && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router
