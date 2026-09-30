/* Auteur : Noa Gaillard */
import { createRouter, createWebHistory } from 'vue-router'

import DeckCreatePage from '@/pages/DeckCreatePage.vue'
import DeckDetailPage from '@/pages/DeckDetailPage.vue'
import DeckEditPage from '@/pages/DeckEditPage.vue'
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
    { path: '/decks', redirect: '/' },
    { path: '/decks/create', component: DeckCreatePage },
    { path: '/decks/new', redirect: '/decks/create' },
    { path: '/decks/:id', component: DeckDetailPage },
    { path: '/decks/:id/edit', component: DeckEditPage },
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
