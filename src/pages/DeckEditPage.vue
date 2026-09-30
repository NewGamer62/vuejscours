<template>
  <div class="deck-edit-page">
    <NSpin :show="loading">
      <div v-if="error" class="error-container">
        <NAlert type="error" :title="error" />
        <NButton style="margin-top: 16px" @click="router.push('/')">
          ← Retour à l'accueil
        </NButton>
      </div>

      <div v-else-if="deck">
        <div class="page-top-bar">
          <NButton text @click="router.push(`/decks/${deck.id}`)">
            ← Annuler et revenir au deck
          </NButton>
          <NH1 style="margin: 8px 0 20px">
            Modifier le deck : {{ deck.name }}
          </NH1>
        </div>

        <!-- RG3 : Le formulaire d'édition est pré-rempli avec le nom et les cartes du deck -->
        <DeckForm
          :initial-name="deck.name"
          :initial-card-ids="initialCardIds"
          submit-label="Enregistrer les modifications"
          :loading="submitting"
          @submit="handleUpdate"
          @cancel="router.push(`/decks/${deck.id}`)"
        />
      </div>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DeckForm from '@/components/decks/DeckForm.vue'
import { useApi } from '@/composables/useApi'
import { useDecks } from '@/composables/useDecks'
import type { Deck, DeckPayload } from '@/types'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const api = useApi()
const { loadAllCards } = useDecks()

const deck = ref<Deck | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)

const deckId = computed(() => route.params.id as string)

/**
 * RG3 : Récupération des IDs des 10 cartes pour pré-remplir le formulaire.
 */
const initialCardIds = computed<number[]>(() => {
  if (!deck.value?.cards) return []
  return deck.value.cards.map((c) => c.cardId)
})

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [, fetchedDeck] = await Promise.all([
      loadAllCards(),
      api.getDeck(deckId.value),
    ])
    deck.value = fetchedDeck
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Erreur lors du chargement du deck'
    error.value = errorMsg
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
})

/**
 * RG4 : La soumission met à jour le deck et redirige vers la page de détail.
 */
const handleUpdate = async (payload: DeckPayload) => {
  submitting.value = true
  try {
    await api.updateDeck(deckId.value, {
      name: payload.name,
      cards: payload.cards,
    })
    message.success('Deck mis à jour avec succès !')
    // RG4 : Redirection vers la page de détail du deck
    router.push(`/decks/${deckId.value}`)
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la mise à jour du deck'
    message.error(errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.deck-edit-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}

.page-top-bar {
  margin-bottom: 16px;
}

.error-container {
  padding: 32px 0;
}
</style>
