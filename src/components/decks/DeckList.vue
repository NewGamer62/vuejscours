<template>
  <div class="deck-list-container">
    <!-- En-tête : Titre et bouton de création de deck (RG4) -->
    <div class="list-header">
      <div>
        <NH2 style="margin: 0"> Mes Decks </NH2>
        <NText depth="3">
          Gérez vos decks de 10 cartes pour combattre en ligne
        </NText>
      </div>

      <!-- RG4 : Un bouton de création de deck est visible -->
      <NButton
        type="primary"
        size="medium"
        @click="router.push('/decks/create')"
      >
        Créer un deck
      </NButton>
    </div>

    <NDivider style="margin: 16px 0 24px" />

    <!-- État de chargement (R2) -->
    <NSpin :show="loading">
      <!-- État d'erreur -->
      <NAlert
        v-if="error"
        type="error"
        :title="error"
        style="margin-bottom: 16px"
      >
        <template #default>
          <NButton size="small" @click="fetchDecks"> Réessayer </NButton>
        </template>
      </NAlert>

      <!-- État vide -->
      <div v-else-if="decks.length === 0 && !loading" class="empty-state">
        <NEmpty description="Vous n'avez pas encore créé de deck">
          <template #extra>
            <NButton type="primary" @click="router.push('/decks/create')">
              Créer mon premier deck
            </NButton>
          </template>
        </NEmpty>
      </div>

      <!-- RG1 & RG2 : Liste des decks affichés responsive -->
      <NGrid
        v-else
        responsive="screen"
        cols="1 s:1 m:2 l:3 xl:3"
        :x-gap="16"
        :y-gap="16"
      >
        <NGi v-for="deck in decks" :key="deck.id">
          <NCard hoverable class="deck-card">
            <template #header>
              <div class="deck-card-header">
                <span class="deck-name" :title="deck.name">{{
                  deck.name
                }}</span>
                <NTag
                  :type="deck.cards?.length === 10 ? 'success' : 'warning'"
                  size="small"
                  round
                >
                  {{ deck.cards?.length || 0 }} / 10 cartes
                </NTag>
              </div>
            </template>

            <!-- Aperçu miniature des cartes du deck (RG1 Issue 6) -->
            <div class="deck-cards-preview">
              <div
                v-for="card in getPreviewCards(deck)"
                :key="card.id"
                class="mini-card-thumb"
                :title="`${card.name} (#${card.pokedexNumber})`"
              >
                <img
                  v-if="card.imgUrl"
                  :src="card.imgUrl"
                  :alt="card.name"
                  class="mini-card-image"
                  loading="lazy"
                />
                <span v-else class="mini-card-placeholder">?</span>
              </div>
            </div>

            <!-- RG2 : Actions pour chaque deck (détail, modifier, supprimer) -->
            <template #action>
              <div class="deck-actions">
                <NButton
                  secondary
                  size="small"
                  @click="router.push(`/decks/${deck.id}`)"
                >
                  Voir le détail
                </NButton>

                <NButton
                  secondary
                  type="info"
                  size="small"
                  @click="router.push(`/decks/${deck.id}/edit`)"
                >
                  Modifier
                </NButton>

                <NPopconfirm
                  positive-text="Supprimer"
                  negative-text="Annuler"
                  @positive-click="handleDeleteDeck(deck.id)"
                >
                  <template #trigger>
                    <NButton
                      secondary
                      type="error"
                      size="small"
                      :loading="deletingDeckId === deck.id"
                    >
                      Supprimer
                    </NButton>
                  </template>
                  Voulez-vous vraiment supprimer le deck "{{ deck.name }}" ?
                </NPopconfirm>
              </div>
            </template>
          </NCard>
        </NGi>
      </NGrid>
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useDecks } from '@/composables/useDecks'
import type { Card, Deck } from '@/types'

const router = useRouter()
const message = useMessage()
const api = useApi()
const { loadAllCards, resolveDeckCards } = useDecks()

const decks = ref<Deck[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deletingDeckId = ref<number | null>(null)

/**
 * RG1 : Les decks de l'utilisateur sont chargés et affichés au chargement du composant.
 */
const fetchDecks = async () => {
  loading.value = true
  error.value = null
  try {
    const [, fetchedDecks] = await Promise.all([
      loadAllCards(),
      api.getMyDecks(),
    ])
    decks.value = fetchedDecks
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la récupération des decks'
    error.value = errorMsg
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDecks()
})

const getPreviewCards = (deck: Deck): Card[] => {
  return resolveDeckCards(deck.cards)
}

/**
 * RG2 & RG3 : Supprimer le deck et rafraîchir automatiquement la liste après suppression.
 */
const handleDeleteDeck = async (deckId: number) => {
  deletingDeckId.value = deckId
  try {
    await api.deleteDeck(deckId)
    message.success('Deck supprimé avec succès !')
    // RG3 : La liste se rafraîchit automatiquement après la suppression d'un deck
    await fetchDecks()
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Erreur lors de la suppression du deck'
    message.error(errorMsg)
  } finally {
    deletingDeckId.value = null
  }
}
</script>

<style scoped>
.deck-list-container {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.deck-card {
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.deck-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.deck-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.deck-name {
  font-weight: 700;
  font-size: 16px;
  color: #1f2225;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deck-cards-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 52px;
  align-items: center;
}

.mini-card-thumb {
  width: 44px;
  height: 52px;
  border-radius: 6px;
  border: 1px solid #e0e0e6;
  background: #f7f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mini-card-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.mini-card-placeholder {
  font-size: 14px;
  color: #8c8c8c;
}

.deck-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 639px) {
  .deck-actions {
    justify-content: stretch;
  }

  .deck-actions > *,
  .deck-actions :deep(.n-button) {
    flex: 1 1 auto;
    text-align: center;
  }
}

.empty-state {
  padding: 48px 0;
}
</style>
