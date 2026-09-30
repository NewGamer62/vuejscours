<template>
  <div class="auth-page-container">
    <NCard class="auth-card" title="Connexion" :bordered="true">
      <NForm @submit.prevent="handleSignIn">
        <NFormItem label="Email" required style="width: 100%">
          <NInput v-model:value="email" round type="text" placeholder="Email" />
        </NFormItem>
        <NFormItem label="Mot de passe" required style="width: 100%">
          <NInput
            v-model:value="password"
            round
            type="password"
            show-password-on="mousedown"
            placeholder="Password"
          />
        </NFormItem>

        <NButton
          type="primary"
          round
          attr-type="submit"
          style="width: 100%"
          :loading="loading"
          :disabled="loading"
        >
          Se connecter
        </NButton>

        <div class="footer">
          <p>
            Pas encore de compte ?
            <RouterLink to="/sign-up"><span>S'inscrire</span></RouterLink>
          </p>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
/* Auteur : Noa Gaillard */
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const message = useMessage()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSignIn = async () => {
  loading.value = true
  try {
    await authStore.signIn({
      email: email.value,
      password: password.value,
    })
    router.push('/')
  } catch (_error) {
    // On préfixe par '_' pour indiquer à ESLint que la variable est ignorée volontairement
    // On évite le console.log pour respecter la règle "no-console"
    message.error('Échec de la connexion. Email ou mot de passe incorrect.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(80vh - 64px);
  padding: 0 16px;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  margin: 32px auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.footer span {
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}
.footer span:hover {
  color: violet;
}
</style>
