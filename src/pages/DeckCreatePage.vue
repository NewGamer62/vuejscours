<template>
  <div class="deck-create-page">
    <div class="page-top-bar">
      <NButton text @click="router.push('/')"> ← Retour à l'accueil </NButton>
      <NH1 style="margin: 8px 0 20px"> Créer un nouveau deck </NH1>
    </div>

    <!-- Formulaire de création (RG1, RG2, RG3) -->
    <DeckForm
      submit-label="Créer le deck"
      :loading="submitting"
      @submit="handleCreate"
      @cancel="router.push('/')"
    />
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import DeckForm from '@/components/decks/DeckForm.vue'
import { useApi } from '@/composables/useApi'
import type { DeckPayload } from '@/types'

const router = useRouter()
const message = useMessage()
const api = useApi()

const submitting = ref(false)

/**
 * RG4 : L'utilisateur est redirigé vers la page d'accueil après création du deck.
 */
const handleCreate = async (payload: DeckPayload) => {
  submitting.value = true
  try {
    await api.createDeck({
      name: payload.name,
      cards: payload.cards,
    })
    message.success('Deck créé avec succès !')
    // RG4 : Redirection vers la page d'accueil
    router.push('/')
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Erreur lors de la création du deck'
    message.error(errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.deck-create-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}

.page-top-bar {
  margin-bottom: 16px;
}
</style>
