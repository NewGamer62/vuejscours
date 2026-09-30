<template>
  <div class="deck-detail-page">
    <NSpin :show="loading">
      <!-- Erreur de chargement -->
      <div v-if="error" class="error-container">
        <NAlert type="error" :title="error" />
        <NButton style="margin-top: 16px" @click="router.push('/')">
          ← Retour à l'accueil
        </NButton>
      </div>

      <!-- Détail du deck -->
      <div v-else-if="deck" class="deck-content">
        <div class="page-top-bar">
          <NButton text @click="router.push('/')">
            ← Retour à l'accueil
          </NButton>
        </div>

        <div class="detail-header">
          <div>
            <!-- RG1 : Affiche le nom du deck -->
            <NH1 style="margin: 4px 0">
              {{ deck.name }}
            </NH1>
            <NText depth="3">
              {{ resolvedCards.length }} cartes dans ce deck
            </NText>
          </div>

          <NSpace>
            <NButton secondary @click="router.push('/')"> Accueil </NButton>

            <!-- RG2 : Bouton permettant d'accéder au formulaire d'édition -->
            <NButton
              type="primary"
              @click="router.push(`/decks/${deck.id}/edit`)"
            >
              Modifier le deck
            </NButton>
          </NSpace>
        </div>

        <NDivider style="margin: 20px 0 24px" />

        <!-- RG1 : Affiche les 10 cartes du deck en lecture seule -->
        <CardGrid :cards="resolvedCards" :selectable="false" size="md" />
      </div>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '@/components/cards/CardGrid.vue'
import { useApi } from '@/composables/useApi'
import { useDecks } from '@/composables/useDecks'
import type { Card, Deck } from '@/types'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const api = useApi()
const { loadAllCards, resolveDeckCards } = useDecks()

const deck = ref<Deck | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const deckId = computed(() => route.params.id as string)

const resolvedCards = computed<Card[]>(() => {
  if (!deck.value) return []
  return resolveDeckCards(deck.value.cards)
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
</script>

<style scoped>
.deck-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 0;
}

@media (min-width: 640px) {
  .deck-detail-page {
    padding: 24px 0;
  }
}

.page-top-bar {
  margin-bottom: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 639px) {
  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .detail-header :deep(.n-space) {
    width: 100%;
    justify-content: space-between;
  }
}

.error-container {
  padding: 32px 0;
}
</style>
