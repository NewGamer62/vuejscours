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
            <div
              v-if="getPreviewCards(deck).length === 0"
              class="deck-cards-empty"
            >
              <NText depth="3" italic>Aucune carte dans ce deck</NText>
            </div>
            <div v-else class="deck-cards-preview">
              <NTooltip
                v-for="(card, index) in getPreviewCards(deck)"
                :key="`${deck.id}-${card.id}-${index}`"
                trigger="hover"
                placement="top"
              >
                <template #trigger>
                  <div class="mini-card-thumb">
                    <img
                      v-if="card.imgUrl"
                      :src="card.imgUrl"
                      :alt="card.name"
                      class="mini-card-image"
                      loading="lazy"
                    />
                    <span v-else class="mini-card-placeholder">?</span>
                  </div>
                </template>
                <div class="mini-card-tooltip">
                  <div class="tooltip-header">
                    <span class="tooltip-card-name">{{ card.name }}</span>
                    <span class="tooltip-card-num">
                      #{{ formatPokedex(card.pokedexNumber) }}
                    </span>
                  </div>
                  <div class="tooltip-details">
                    <span
                      class="tooltip-type-badge"
                      :style="{ backgroundColor: getTypeColor(card.type) }"
                    >
                      {{ card.type }}
                    </span>
                    <span v-if="card.hp" class="tooltip-stat"
                      >PV {{ card.hp }}</span
                    >
                    <span v-if="card.attack" class="tooltip-stat"
                      >ATK {{ card.attack }}</span
                    >
                  </div>
                </div>
              </NTooltip>
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
import { useColors } from '@/composables/useColors'
import { useDecks } from '@/composables/useDecks'
import type { Card, Deck } from '@/types'

const router = useRouter()
const message = useMessage()
const api = useApi()
const { loadAllCards, resolveDeckCards } = useDecks()
const { getTypeColor } = useColors()

const formatPokedex = (num?: number): string => {
  return String(num ?? 0).padStart(3, '0')
}

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

.deck-cards-empty {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafc;
  border-radius: 8px;
  border: 1px dashed #e0e0e6;
  padding: 8px;
}

.deck-cards-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 244px;
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
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.mini-card-thumb:hover {
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  border-color: #2080f0;
}

.mini-card-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  pointer-events: none;
}

.mini-card-placeholder {
  font-size: 14px;
  color: #8c8c8c;
}

.mini-card-tooltip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.tooltip-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.tooltip-card-name {
  font-weight: 700;
  color: #ffffff;
}

.tooltip-card-num {
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.tooltip-details {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tooltip-type-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #ffffff;
  text-transform: capitalize;
}

.tooltip-stat {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
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
