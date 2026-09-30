<template>
  <div class="card-grid-container">
    <NEmpty v-if="cards.length === 0" description="Aucune carte disponible" />

    <NGrid v-else responsive="screen" :cols="gridCols" :x-gap="12" :y-gap="12">
      <NGi v-for="card in cards" :key="card.id">
        <PokemonCard
          :card="card"
          :size="size"
          :selected="isCardSelected(card.id)"
          :disabled="isCardDisabled(card.id)"
          :selectable="selectable"
          :current-hp="currentHps?.[card.id]"
          @click="handleCardClick(card)"
        />
      </NGi>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '@/types'

import PokemonCard from './PokemonCard.vue'

interface Props {
  cards: Card[]
  selectedCardIds?: number[]
  modelValue?: number[]
  maxSelected?: number
  selectable?: boolean
  size?: 'sm' | 'md'
  currentHps?: Record<number, number>
}

const props = withDefaults(defineProps<Props>(), {
  selectedCardIds: undefined,
  modelValue: undefined,
  maxSelected: undefined,
  selectable: false,
  size: 'md',
  currentHps: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue' | 'update:selectedCardIds', ids: number[]): void
  (e: 'cardClick', card: Card): void
}>()

const activeSelectedIds = computed<number[]>(() => {
  return props.selectedCardIds ?? props.modelValue ?? []
})

const isMaxReached = computed<boolean>(() => {
  if (!props.selectable || props.maxSelected === undefined) return false
  return activeSelectedIds.value.length >= props.maxSelected
})

const isCardSelected = (cardId: number): boolean => {
  return activeSelectedIds.value.includes(cardId)
}

/**
 * RG6 : Dans la grille, les cartes non sélectionnées sont désactivées quand le maximum est atteint.
 */
const isCardDisabled = (cardId: number): boolean => {
  if (!props.selectable) return false
  if (isMaxReached.value && !isCardSelected(cardId)) {
    return true
  }
  return false
}

/**
 * RG5 : Dans la grille, un clic sur une carte la sélectionne ou la désélectionne.
 */
const handleCardClick = (card: Card) => {
  emit('cardClick', card)
  if (!props.selectable) return

  const current = [...activeSelectedIds.value]
  const index = current.indexOf(card.id)

  if (index !== -1) {
    // Déjà sélectionnée -> désélectionner
    current.splice(index, 1)
    emit('update:modelValue', current)
    emit('update:selectedCardIds', current)
  } else {
    // Non sélectionnée -> sélectionner si sous le maximum
    if (props.maxSelected === undefined || current.length < props.maxSelected) {
      current.push(card.id)
      emit('update:modelValue', current)
      emit('update:selectedCardIds', current)
    }
  }
}

const gridCols = computed(() => {
  if (props.size === 'sm') {
    return '2 s:3 m:4 l:5 xl:6'
  }
  return '1 s:2 m:3 l:4 xl:5'
})
</script>

<style scoped>
.card-grid-container {
  width: 100%;
}
</style>
