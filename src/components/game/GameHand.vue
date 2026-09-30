<template>
  <div class="game-hand">
    <!-- En-tête : Décompte main (max 5) et deck restant (RG1) -->
    <div class="hand-header">
      <div class="hand-title-group">
        <span class="hand-title">🎴 Votre Main</span>
        <NTag size="small" :type="hand.length >= 5 ? 'warning' : 'default'">
          {{ hand.length }} / 5 cartes
        </NTag>
      </div>

      <div class="deck-info">
        <NTag size="small" type="info" round>
          📚 Deck : {{ deckCount }} cartes restantes
        </NTag>
      </div>
    </div>

    <!-- Instructions contextuelles selon RG2 -->
    <div class="hand-help">
      <NText v-if="!isMyTurn" depth="3" style="font-size: 12px">
        ⏳ Ce n'est pas votre tour.
      </NText>
      <NText v-else-if="hasActiveCard" depth="3" style="font-size: 12px">
        ⚠️ Vous avez déjà un Pokémon actif en jeu. Vous ne pouvez pas jouer de
        carte supplémentaire.
      </NText>
      <NText v-else type="success" style="font-size: 12px; font-weight: 600">
        ✨ C'est votre tour ! Cliquez sur un Pokémon pour l'envoyer au combat.
      </NText>
    </div>

    <!-- Affichage des cartes de la main (RG1, RG2) -->
    <div v-if="hand.length === 0" class="empty-hand">
      <NText depth="3"
        >Votre main est vide. Utilisez l'action « Piocher » pour tirer une carte
        !</NText
      >
    </div>

    <div v-else class="hand-cards">
      <div
        v-for="(card, index) in hand"
        :key="`${card.id}-${index}`"
        class="hand-card-wrapper"
        :class="{ playable: canPlayCard }"
      >
        <PokemonCard
          :card="card"
          size="sm"
          :selectable="canPlayCard"
          :disabled="!canPlayCard"
          @click="onCardClick(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import PokemonCard from '@/components/cards/PokemonCard.vue'
import type { Card } from '@/types'
import { canPlayCardFromHand } from '@/utils/game'

interface Props {
  hand: Card[]
  deckCount: number
  isMyTurn?: boolean
  hasActiveCard?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMyTurn: false,
  hasActiveCard: false,
})

const emit = defineEmits<(e: 'playCard', index: number) => void>()

// RG2 : Un clic sur une carte la joue uniquement si c'est le tour du joueur et qu'il n'a pas de carte active
const canPlayCard = computed<boolean>(() => {
  return canPlayCardFromHand(props.isMyTurn, props.hasActiveCard)
})

const onCardClick = (index: number) => {
  if (canPlayCard.value) {
    emit('playCard', index)
  }
}
</script>

<style scoped>
.game-hand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.hand-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hand-title {
  font-weight: 700;
  font-size: 14px;
  color: #1f2225;
}

.hand-help {
  min-height: 18px;
}

.empty-hand {
  padding: 16px;
  text-align: center;
  background: #f7f7fa;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.hand-cards {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 4px;
}

.hand-card-wrapper {
  flex: 0 0 130px;
  max-width: 130px;
  transition: transform 0.2s ease;
}

.hand-card-wrapper.playable:hover {
  transform: translateY(-6px);
}
</style>
