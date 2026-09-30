<template>
  <div class="game-lobby">
    <NCard title="⚔️ Arène Multijoueur (Temps Réel)" class="lobby-card">
      <template #header-extra>
        <NTag :type="gameStore.isConnected ? 'success' : 'error'" size="small">
          {{ gameStore.isConnected ? 'Connecté au serveur' : 'Déconnecté' }}
        </NTag>
      </template>

      <!-- Message d'erreur s'il y a lieu -->
      <NAlert
        v-if="gameStore.errorMessage"
        type="error"
        closable
        style="margin-bottom: 16px"
        @close="gameStore.errorMessage = null"
      >
        {{ gameStore.errorMessage }}
      </NAlert>

      <!-- Étape 1 : Sélection du deck -->
      <div class="deck-selection-section">
        <div class="section-title">
          <NText strong>1. Choisissez votre Deck pour combattre</NText>
          <NText depth="3" style="font-size: 13px">
            (Un deck valide de 10 cartes est obligatoire)
          </NText>
        </div>

        <NSpin :show="loadingDecks">
          <div
            v-if="validDecks.length === 0 && !loadingDecks"
            class="no-deck-warning"
          >
            <NAlert type="warning" title="Aucun deck valide (10 cartes)">
              Vous devez posséder un deck complet de 10 cartes pour pouvoir
              lancer ou rejoindre une partie.
              <template #action>
                <NButton
                  size="small"
                  type="primary"
                  @click="router.push('/decks/create')"
                >
                  Créer un deck
                </NButton>
              </template>
            </NAlert>
          </div>

          <div v-else class="deck-selector-row">
            <NSelect
              v-model:value="selectedDeckId"
              :options="deckOptions"
              placeholder="Sélectionnez un deck de 10 cartes..."
              style="max-width: 380px"
            />
            <NTag v-if="selectedDeck" type="info" size="medium">
              10 cartes prêtes
            </NTag>
          </div>
        </NSpin>
      </div>

      <NDivider style="margin: 20px 0" />

      <!-- Étape 2 : Création de room et statut d'attente (RG3) -->
      <div class="lobby-actions-section">
        <div class="actions-header">
          <div>
            <NText strong
              >2. Créez votre partie ou rejoignez un adversaire</NText
            >
          </div>

          <div class="action-buttons">
            <NButton
              v-if="gameStore.gameStatus !== 'waiting'"
              type="primary"
              :disabled="!selectedDeckId || !gameStore.isConnected"
              @click="handleCreateRoom"
            >
              ➕ Créer une partie
            </NButton>

            <NButton v-else type="warning" @click="handleCancelWaiting">
              Annuler l'attente
            </NButton>

            <NButton
              secondary
              :loading="isRefreshing"
              :disabled="!gameStore.isConnected"
              @click="handleRefreshRooms"
            >
              🔄 Rafraîchir
            </NButton>
          </div>
        </div>

        <!-- Alerte en attente d'adversaire -->
        <NAlert
          v-if="gameStore.gameStatus === 'waiting'"
          type="info"
          title="Partie créée en attente d'un adversaire"
          style="margin-top: 16px"
        >
          <div class="waiting-box">
            <NSpin size="small" style="margin-right: 8px" />
            <span>
              Partie <strong>#{{ gameStore.currentRoomId }}</strong> en attente.
              Le duel démarrera automatiquement dès qu'un joueur vous rejoindra
              !
            </span>
          </div>
        </NAlert>
      </div>

      <NDivider style="margin: 20px 0" />

      <!-- Étape 3 : Liste des rooms disponibles (RG2, RG4) -->
      <div class="rooms-list-section">
        <div class="rooms-header">
          <NText strong
            >Parties disponibles ({{ availableRooms.length }})</NText
          >
        </div>

        <div v-if="availableRooms.length === 0" class="empty-rooms">
          <NEmpty description="Aucune partie en attente pour le moment.">
            <template #extra>
              <NText depth="3"
                >Créez une room ci-dessus pour défier un adversaire !</NText
              >
            </template>
          </NEmpty>
        </div>

        <div v-else class="rooms-grid">
          <div v-for="room in availableRooms" :key="room.id" class="room-card">
            <div class="room-info">
              <span class="room-title">
                ⚔️ Partie #{{ room.id }}
                <span v-if="room.name"> - {{ room.name }}</span>
              </span>
              <span class="room-host">
                Hôte :
                <strong>{{
                  room.hostUsername || room.host?.username || 'Adversaire'
                }}</strong>
              </span>
            </div>

            <div class="room-actions">
              <NTag size="small" type="info">1 / 2 joueurs</NTag>
              <NButton
                type="primary"
                size="small"
                :disabled="
                  !selectedDeckId ||
                  !gameStore.isConnected ||
                  gameStore.gameStatus === 'waiting'
                "
                @click="handleJoinRoom(room.id)"
              >
                Rejoindre
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { useGameStore } from '@/stores/game.store'
import type { Deck, Room } from '@/types'

const router = useRouter()
const api = useApi()
const gameStore = useGameStore()

const userDecks = ref<Deck[]>([])
const loadingDecks = ref(false)
const selectedDeckId = ref<number | null>(null)
const isRefreshing = ref(false)

// Filtrer uniquement les decks complets avec 10 cartes (RG3/RG4)
const validDecks = computed(() => {
  return userDecks.value.filter((d) => d.cards && d.cards.length === 10)
})

const deckOptions = computed(() => {
  return validDecks.value.map((deck) => ({
    label: `${deck.name} (10 cartes)`,
    value: deck.id,
  }))
})

const selectedDeck = computed(() => {
  return validDecks.value.find((d) => d.id === selectedDeckId.value)
})

// Filtrer les rooms disponibles (en attente d'un 2e joueur)
const availableRooms = computed<Room[]>(() => {
  return gameStore.rooms.filter((room) => {
    // Si la room est en cours ou terminée, ne pas l'afficher
    if (room.status && room.status !== 'waiting') return false
    // Si la room a déjà 2 joueurs, ne pas l'afficher
    if (room.playerCount && room.playerCount >= 2) return false
    if (room.players && room.players.length >= 2) return false
    return true
  })
})

const fetchDecks = async () => {
  loadingDecks.value = true
  try {
    const decks = await api.getMyDecks()
    userDecks.value = decks
    // Sélectionner automatiquement le premier deck valide s'il existe
    const firstValid = decks.find((d) => d.cards && d.cards.length === 10)
    if (firstValid && !selectedDeckId.value) {
      selectedDeckId.value = firstValid.id
    }
  } catch {
    // Échec de récupération des decks
  } finally {
    loadingDecks.value = false
  }
}

const handleCreateRoom = () => {
  if (!selectedDeckId.value) return
  gameStore.createRoom(selectedDeckId.value)
}

const handleJoinRoom = (roomId: string | number) => {
  if (!selectedDeckId.value) return
  gameStore.joinRoom(roomId, selectedDeckId.value)
}

const handleCancelWaiting = () => {
  gameStore.resetGame()
  gameStore.fetchRooms()
}

const handleRefreshRooms = () => {
  isRefreshing.value = true
  gameStore.fetchRooms()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

onMounted(() => {
  // RG1 : Connexion Socket.io
  gameStore.connect()
  // RG2 : Chargement des rooms et des decks
  gameStore.fetchRooms()
  fetchDecks()
})
</script>

<style scoped>
.game-lobby {
  margin-bottom: 32px;
}

.lobby-card {
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.deck-selection-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.deck-selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.waiting-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rooms-list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-rooms {
  padding: 24px 0;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fbfbfd;
  border: 1px solid #e0e0e6;
  border-radius: 8px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.room-card:hover {
  border-color: #2080f0;
  box-shadow: 0 2px 8px rgba(32, 128, 240, 0.1);
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.room-title {
  font-weight: 700;
  font-size: 14px;
  color: #1f2225;
}

.room-host {
  font-size: 12px;
  color: #666666;
}

.room-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
