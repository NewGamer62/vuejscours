<template>
  <NForm @submit.prevent="handleSignUp">
    <NFormItem label="Nom utilisateur" required style="width: 100%">
      <NInput
        v-model:value="username"
        round
        type="text"
        placeholder="Nom de l'utilisateur"
      />
    </NFormItem>
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
      S'inscrire
    </NButton>
    <div class="footer">
      <p>
        Déjà un compte ?
        <RouterLink to="/sign-in"><span>Se connecter</span></RouterLink>
      </p>
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const message = useMessage()

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSignUp = async () => {
  loading.value = true
  try {
    await authStore.signUp({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    router.push('/')
  } catch (_error) {
    message.error("L'inscription a échoué. Veuillez vérifier vos informations.")
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.footer {
  display: flex;
  justify-content: center;
}

.footer span {
  text-decoration: none;
  transition: all 0.3s;
}
.footer span:hover {
  color: violet;
}
</style>
