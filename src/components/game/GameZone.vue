<template>
  <div
    class="game-zone"
    :class="[
      isPlayer ? 'zone-player' : 'zone-opponent',
      { 'active-turn': isTurn },
    ]"
  >
    <!-- En-tête de zone : Joueur / Rôle et Score KOs (RG2) -->
    <div class="zone-header">
      <div class="player-info">
        <span class="player-title">
          {{ isPlayer ? '🛡️ Votre Plateau' : '⚔️ Plateau Adversaire' }}
        </span>
        <span v-if="username" class="player-name">({{ username }})</span>
        <NTag size="small" :type="role === 'hôte' ? 'primary' : 'info'" round>
          {{ role === 'hôte' ? 'Hôte' : 'Invité' }}
        </NTag>
        <NTag v-if="isTurn" size="small" type="success">
          En train de jouer
        </NTag>
      </div>

      <!-- Score du joueur : KOs infligés de 0 à 3 (RG2) -->
      <div class="score-display">
        <span class="score-label">KOs :</span>
        <div class="score-badges">
          <NTag
            v-for="index in 3"
            :key="index"
            size="small"
            :type="index <= board.score ? 'error' : 'default'"
            :bordered="false"
            class="ko-dot"
          >
            {{ index <= board.score ? '🏆 KO' : '○' }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- Zone de combat : Carte active ou Placeholder (RG2, RG3) -->
    <div class="battlefield">
      <!-- Carte active avec barre de HP (RG2) -->
      <div v-if="board.activeCard" class="active-card-container">
        <PokemonCard
          :card="board.activeCard"
          :current-hp="board.currentHp"
          size="md"
        />
      </div>

      <!-- RG3 : Placeholder affiché si aucune carte n'est active -->
      <div v-else class="card-placeholder">
        <div class="placeholder-frame">
          <span class="placeholder-icon">🎴</span>
          <span class="placeholder-title">Aucune carte active</span>
          <span class="placeholder-subtitle">
            {{
              isPlayer
                ? 'Cliquez sur une carte de votre main pour la placer sur le terrain'
                : 'En attente de la carte adverse...'
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main du joueur affichée à l'intérieur de sa zone (RG1 Page de jeu) -->
    <div v-if="$slots.default" class="zone-slot">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import PokemonCard from '@/components/cards/PokemonCard.vue'
import type { PlayerBoard } from '@/types'

interface Props {
  board: PlayerBoard
  username?: string
  role?: 'hôte' | 'invité'
  isPlayer?: boolean
  isTurn?: boolean
}

withDefaults(defineProps<Props>(), {
  username: '',
  role: 'hôte',
  isPlayer: false,
  isTurn: false,
})
</script>

<style scoped>
.game-zone {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e0e0e6;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.zone-opponent {
  background: #fafafc;
}

.zone-player {
  background: #ffffff;
}

.game-zone.active-turn {
  border-color: #18a058;
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.2);
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f4;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-title {
  font-weight: 700;
  font-size: 15px;
  color: #1f2225;
}

.player-name {
  font-size: 13px;
  color: #666666;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-weight: 600;
  font-size: 13px;
  color: #333333;
}

.score-badges {
  display: flex;
  gap: 4px;
}

.ko-dot {
  font-weight: bold;
}

.battlefield {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 270px;
  padding: 12px 0;
}

.active-card-container {
  display: flex;
  justify-content: center;
}

.card-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 220px;
  height: 260px;
}

.placeholder-frame {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
  border: 2px dashed #d0d0d8;
  border-radius: 12px;
  background: #f7f7fa;
  padding: 16px;
  box-sizing: border-box;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.placeholder-title {
  font-weight: 700;
  font-size: 14px;
  color: #666666;
  margin-bottom: 4px;
}

.placeholder-subtitle {
  font-size: 11px;
  color: #999999;
  line-height: 1.4;
}

.zone-slot {
  margin-top: 16px;
  border-top: 1px solid #f0f0f4;
  padding-top: 16px;
}
</style>
