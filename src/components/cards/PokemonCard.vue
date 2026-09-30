<template>
  <div
    class="pokemon-card"
    :class="[
      `size-${size}`,
      {
        selected: selected,
        disabled: disabled,
        selectable: selectable && !disabled,
      },
    ]"
    @click="handleClick"
  >
    <!-- Badge de sélection distinct (RG3) -->
    <div v-if="selected" class="selected-badge">✓</div>

    <!-- En-tête : Nom, Numéro Pokédex, Type avec couleur (RG1) -->
    <div class="card-header">
      <div class="card-title-group">
        <span class="card-name" :title="card.name">{{ card.name }}</span>
        <span class="pokedex-number">#{{ formattedPokedexNumber }}</span>
      </div>
      <span class="type-badge" :style="{ backgroundColor: typeColor }">
        {{ card.type }}
      </span>
    </div>

    <!-- Image de la carte (RG1) -->
    <div class="card-image-wrapper">
      <img
        v-if="card.imgUrl"
        :src="card.imgUrl"
        :alt="card.name"
        class="card-image"
        loading="lazy"
      />
      <span v-else class="card-image-placeholder">🎴</span>
    </div>

    <!-- Barre de HP courants si fournie (RG4) -->
    <div v-if="currentHp !== undefined" class="current-hp-section">
      <div class="hp-bar-info">
        <span class="hp-label">PV</span>
        <span class="hp-values">{{ currentHp }} / {{ card.hp }}</span>
      </div>
      <NProgress
        type="line"
        :percentage="hpPercentage"
        :color="currentHpColor"
        :show-indicator="false"
        class="hp-progress"
      />
    </div>

    <!-- Statistiques : HP et Attaque (RG1) -->
    <div class="card-stats">
      <div class="stat-item stat-hp">
        <span class="stat-label">PV</span>
        <span class="stat-value">{{ card.hp }}</span>
      </div>
      <div class="stat-item stat-attack">
        <span class="stat-label">ATK</span>
        <span class="stat-value">{{ card.attack }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useColors } from '@/composables/useColors'
import type { Card } from '@/types'

interface Props {
  card: Card
  size?: 'sm' | 'md'
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
  currentHp?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  selected: false,
  disabled: false,
  selectable: false,
  currentHp: undefined,
})

const emit = defineEmits<(e: 'click', card: Card) => void>()

const { getTypeColor, hpColor } = useColors()

const formattedPokedexNumber = computed(() => {
  return String(props.card?.pokedexNumber ?? 0).padStart(3, '0')
})

const typeColor = computed(() => {
  return getTypeColor(props.card.type)
})

const hpPercentage = computed(() => {
  if (props.currentHp === undefined) return 100
  const max = props.card.hp || 1
  return Math.max(0, Math.min(100, Math.round((props.currentHp / max) * 100)))
})

const currentHpColor = computed(() => {
  return hpColor(hpPercentage.value)
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click', props.card)
  }
}
</script>

<style scoped>
.pokemon-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e0e0e6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
  user-select: none;
  box-sizing: border-box;
}

/* RG2: Tailles sm et md */
.pokemon-card.size-md {
  padding: 12px;
  min-height: 250px;
}

.pokemon-card.size-sm {
  padding: 6px;
  min-height: 150px;
}

/* RG3: Rendu sélectionnable */
.pokemon-card.selectable {
  cursor: pointer;
}

.pokemon-card.selectable:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #2080f0;
}

/* RG3: Rendu sélectionné */
.pokemon-card.selected {
  border: 2px solid #18a058;
  box-shadow:
    0 0 0 2px rgba(24, 160, 88, 0.25),
    0 6px 16px rgba(24, 160, 88, 0.2);
  transform: translateY(-2px);
}

/* RG3: Rendu désactivé */
.pokemon-card.disabled {
  opacity: 0.45;
  filter: grayscale(40%);
  cursor: not-allowed;
  pointer-events: none;
}

.selected-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #18a058;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.card-title-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}

.card-name {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1f2225;
}

.size-md .card-name {
  font-size: 14px;
}

.size-sm .card-name {
  font-size: 11px;
}

.pokedex-number {
  font-size: 11px;
  color: #8c8c8c;
  font-family: monospace;
}

.size-sm .pokedex-number {
  font-size: 9px;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  text-transform: capitalize;
  flex-shrink: 0;
}

.size-md .type-badge {
  font-size: 11px;
}

.size-sm .type-badge {
  font-size: 9px;
  padding: 1px 5px;
}

.card-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7fa;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  flex: 1;
}

.size-md .card-image-wrapper {
  height: 120px;
}

.size-sm .card-image-wrapper {
  height: 65px;
}

.card-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.pokemon-card.selectable:hover .card-image {
  transform: scale(1.05);
}

.current-hp-section {
  margin-bottom: 6px;
}

.hp-bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 2px;
}

.size-sm .hp-bar-info {
  font-size: 9px;
}

.card-stats {
  display: flex;
  justify-content: space-around;
  background: #f9f9fc;
  border-radius: 6px;
  padding: 4px 6px;
  margin-top: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  font-weight: bold;
  color: #666666;
  background: #e8e8ed;
  padding: 1px 4px;
  border-radius: 4px;
}

.size-sm .stat-label {
  font-size: 8px;
  padding: 1px 2px;
}

.stat-value {
  font-weight: 700;
  color: #1f2225;
}

.size-md .stat-value {
  font-size: 13px;
}

.size-sm .stat-value {
  font-size: 10px;
}

.stat-hp .stat-value {
  color: #18a058;
}

.stat-attack .stat-value {
  color: #d03050;
}
</style>
