<template>
  <div class="game-page-container">
    <!-- Si aucune partie n'est en cours, inviter à retourner au lobby -->
    <div
      v-if="gameStore.gameStatus === 'idle' && !gameStore.gameState"
      class="no-game-state"
    >
      <NCard
        title="Aucune partie active"
        style="max-width: 500px; margin: 40px auto; text-align: center"
      >
        <NEmpty description="Vous n'êtes actuellement dans aucune partie.">
          <template #extra>
            <NButton type="primary" @click="router.push('/')">
              Aller à l'accueil / Lobby
            </NButton>
          </template>
        </NEmpty>
      </NCard>
    </div>

    <!-- RG1 : La page affiche trois zones dans l'ordre strict : adversaire, barre d'actions, joueur -->
    <div v-else class="game-board">
      <!-- 1. ZONE ADVERSAIRE (RG1) -->
      <section class="zone-section opponent-section">
        <GameZone
          :board="gameStore.opponentBoard"
          :username="opponentUsername"
          :role="opponentRole"
          :is-player="false"
          :is-turn="!gameStore.isMyTurn && gameStore.gameStatus === 'playing'"
        />
      </section>

      <!-- 2. BARRE D'ACTIONS (RG1) -->
      <section class="zone-section actions-section">
        <GameActions
          :is-my-turn="gameStore.isMyTurn"
          :hand-count="gameStore.myBoard.hand.length"
          :deck-count="gameStore.myBoard.deckCount"
          :has-my-active-card="Boolean(gameStore.myBoard.activeCard)"
          :has-opponent-active-card="
            Boolean(gameStore.opponentBoard.activeCard)
          "
          :last-event-message="gameStore.lastEventMessage"
          @draw="handleDraw"
          @attack="handleAttack"
          @end-turn="handleEndTurn"
        />
      </section>

      <!-- 3. ZONE JOUEUR (contenant la main à l'intérieur) (RG1) -->
      <section class="zone-section player-section">
        <GameZone
          :board="gameStore.myBoard"
          :username="myUsername"
          :role="gameStore.playerRole"
          :is-player="true"
          :is-turn="gameStore.isMyTurn && gameStore.gameStatus === 'playing'"
        >
          <!-- Main du joueur affichée à l'intérieur de sa zone (RG1) -->
          <GameHand
            :hand="gameStore.myBoard.hand"
            :deck-count="gameStore.myBoard.deckCount"
            :is-my-turn="gameStore.isMyTurn"
            :has-active-card="Boolean(gameStore.myBoard.activeCard)"
            @play-card="handlePlayCard"
          />
        </GameZone>
      </section>
    </div>

    <!-- Modal de fin de partie (RG8, RG9) -->
    <EndGameModal
      :show="gameStore.gameStatus === 'ended'"
      :is-victory="gameStore.isVictory"
      :reason="gameStore.lastEventMessage"
      @leave="handleLeaveGame"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import EndGameModal from '@/components/game/EndGameModal.vue'
import GameActions from '@/components/game/GameActions.vue'
import GameHand from '@/components/game/GameHand.vue'
import GameZone from '@/components/game/GameZone.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useGameStore } from '@/stores/game.store'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const myUsername = computed(() => {
  return authStore.user?.username || gameStore.myBoard.username || 'Moi'
})

const opponentUsername = computed(() => {
  return gameStore.opponentBoard.username || 'Adversaire'
})

const opponentRole = computed<'hôte' | 'invité'>(() => {
  return gameStore.playerRole === 'hôte' ? 'invité' : 'hôte'
})

const handleDraw = () => {
  gameStore.drawCards()
}

const handleAttack = () => {
  gameStore.attack()
}

const handleEndTurn = () => {
  gameStore.endTurn()
}

const handlePlayCard = (cardIndex: number) => {
  gameStore.playCard(cardIndex)
}

const handleLeaveGame = () => {
  gameStore.resetGame()
  router.push('/')
}
</script>

<style scoped>
.game-page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px 4px;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .game-page-container {
    padding: 16px;
  }
}

.game-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .game-board {
    gap: 16px;
  }
}

.zone-section {
  width: 100%;
  box-sizing: border-box;
}
</style>
