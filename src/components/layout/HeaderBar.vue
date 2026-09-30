<script setup lang="ts">
/* Auteur : Noa Gaillard */
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const handleSignOut = () => {
  authStore.signOut()
  // RG6 : Redirection vers la page de connexion
  router.push('/sign-in')
}
</script>

<template>
  <header v-if="authStore.isAuthenticated" class="header-bar">
    <span class="username">{{ authStore.user?.username }}</span>

    <nav class="header-nav">
      <RouterLink to="/">Accueil</RouterLink>
      <NButton quaternary type="error" @click="handleSignOut">
        Déconnexion
      </NButton>
    </nav>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 10px 20px;
  background: #eee;
  box-sizing: border-box;
}

.header-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.username {
  font-weight: 600;
  color: #333333;
}
</style>
