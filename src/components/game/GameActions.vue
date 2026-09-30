<template>
  <div class="game-actions" :class="{ 'my-turn-active': isMyTurn }">
    <div class="actions-container">
      <!-- RG3 : Indicateur clair du tour -->
      <div class="turn-indicator">
        <NTag
          :type="isMyTurn ? 'success' : 'default'"
          size="large"
          round
          class="turn-tag"
        >
          <span class="turn-text">
            {{ isMyTurn ? '🟢 C’est votre tour !' : '⏳ Tour de l’adversaire' }}
          </span>
        </NTag>
      </div>

      <!-- RG4, RG5, RG6 : Boutons d'action avec conditions de désactivation -->
      <div class="action-buttons-group">
        <!-- Bouton Piocher (RG4, RG6) -->
        <NButton
          type="info"
          size="medium"
          :disabled="!canDraw"
          @click="emit('draw')"
        >
          📥 Piocher
        </NButton>

        <!-- Bouton Attaquer (RG5, RG6) -->
        <NButton
          type="error"
          size="medium"
          :disabled="!canAttack"
          @click="emit('attack')"
        >
          ⚔️ Attaquer
        </NButton>

        <!-- Bouton Fin de tour (RG6) -->
        <NButton
          type="warning"
          size="medium"
          :disabled="!canEndTurn"
          @click="emit('endTurn')"
        >
          🛑 Fin de tour
        </NButton>
      </div>
    </div>

    <!-- RG7 : Message en temps réel informant des événements -->
    <div class="event-feed">
      <div class="event-feed-inner">
        <span class="event-feed-label">📢 Direct :</span>
        <span class="event-feed-text">
          {{
            lastEventMessage || 'Partie en cours. Préparez votre stratégie !'
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import {
  canAttack as checkCanAttack,
  canDrawCard,
  canEndTurn as checkCanEndTurn,
} from '@/utils/game'

interface Props {
  isMyTurn?: boolean
  handCount: number
  deckCount: number
  hasMyActiveCard?: boolean
  hasOpponentActiveCard?: boolean
  lastEventMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  isMyTurn: false,
  hasMyActiveCard: false,
  hasOpponentActiveCard: false,
  lastEventMessage: '',
})

const emit = defineEmits<(e: 'draw' | 'attack' | 'endTurn') => void>()

// RG4 & RG6 : Piocher désactivé si main pleine (>=5), deck vide, ou pas son tour
const canDraw = computed<boolean>(() => {
  return canDrawCard(props.isMyTurn, props.handCount, props.deckCount)
})

// RG5 & RG6 : Attaquer désactivé si l'un des deux joueurs n'a pas de carte active, ou pas son tour
const canAttack = computed<boolean>(() => {
  return checkCanAttack(
    props.isMyTurn,
    props.hasMyActiveCard,
    props.hasOpponentActiveCard,
  )
})

// RG6 : Tous les boutons désactivés si ce n'est pas le tour du joueur
const canEndTurn = computed<boolean>(() => {
  return checkCanEndTurn(props.isMyTurn)
})
</script>

<style scoped>
.game-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e0e0e6;
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.game-actions.my-turn-active {
  border-color: #18a058;
  background: #fbfdfc;
  box-shadow: 0 4px 14px rgba(24, 160, 88, 0.15);
}

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.turn-indicator {
  display: flex;
  align-items: center;
}

.turn-tag {
  font-weight: 700;
  padding: 0 16px;
}

.turn-text {
  font-size: 14px;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.event-feed {
  background: #f4f4f7;
  border-radius: 6px;
  padding: 8px 12px;
  border-left: 3px solid #2080f0;
}

.event-feed-inner {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
}

.event-feed-label {
  font-weight: 700;
  color: #2080f0;
  white-space: nowrap;
}

.event-feed-text {
  color: #333333;
  line-height: 1.4;
}
</style>
