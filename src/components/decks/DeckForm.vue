<template>
  <div class="deck-form-container">
    <NCard :bordered="false" class="form-card">
      <NForm @submit.prevent="handleSubmit">
        <!-- Champ nom du deck -->
        <NFormItem label="Nom du deck" required :feedback="nameError">
          <NInput
            v-model:value="deckName"
            placeholder="Ex: Mon Super Deck Eau"
            size="large"
            maxlength="50"
            show-count
            clearable
          />
        </NFormItem>

        <!-- RG2 : Compteur en temps réel du nombre de cartes sélectionnées -->
        <div class="counter-section">
          <NSpace align="center" justify="space-between" class="counter-row">
            <NSpace align="center">
              <NTag
                :type="
                  selectedCardIds.length === 10
                    ? 'success'
                    : selectedCardIds.length > 10
                      ? 'error'
                      : 'warning'
                "
                size="large"
                round
              >
                {{ selectedCardIds.length }} / 10 cartes sélectionnées
              </NTag>

              <NText depth="3" class="counter-hint">
                <span v-if="selectedCardIds.length === 10">
                  ✓ Le deck contient exactement 10 cartes.
                </span>
                <span v-else-if="selectedCardIds.length < 10">
                  Sélectionnez encore
                  {{ 10 - selectedCardIds.length }} carte(s).
                </span>
                <span v-else>
                  Veuillez retirer {{ selectedCardIds.length - 10 }} carte(s).
                </span>
              </NText>
            </NSpace>

            <NRadioGroup v-model:value="activeFilter" size="small">
              <NRadioButton value="all">
                Toutes les cartes ({{ cards.length }})
              </NRadioButton>
              <NRadioButton value="selected">
                Sélectionnées ({{ selectedCardIds.length }})
              </NRadioButton>
            </NRadioGroup>
          </NSpace>
        </div>

        <!-- Champ de recherche en temps réel (Issue 4) -->
        <div class="search-section">
          <NInput
            v-model:value="searchQuery"
            placeholder="Filtrer les cartes par nom..."
            clearable
            size="medium"
          >
            <template #prefix> 🔍 </template>
          </NInput>
        </div>

        <NDivider style="margin: 16px 0" />

        <!-- RG1 : Grille sélectionnable de toutes les cartes disponibles -->
        <NSpin :show="loadingCards">
          <!-- État de recherche sans résultat (Ticket 4) -->
          <div
            v-if="
              !loadingCards && cards.length > 0 && displayedCards.length === 0
            "
            class="empty-search-state"
          >
            <NEmpty
              :description="
                searchQuery.trim()
                  ? 'Aucune carte ne correspond à votre recherche.'
                  : 'Aucune carte sélectionnée.'
              "
            >
              <template v-if="searchQuery.trim()" #extra>
                <NButton size="small" secondary @click="searchQuery = ''">
                  Effacer la recherche
                </NButton>
              </template>
              <template v-else-if="activeFilter === 'selected'" #extra>
                <NButton size="small" secondary @click="activeFilter = 'all'">
                  Voir toutes les cartes
                </NButton>
              </template>
            </NEmpty>
          </div>

          <CardGrid
            v-else
            v-model:selected-card-ids="selectedCardIds"
            :cards="displayedCards"
            :max-selected="10"
            :selectable="true"
            size="md"
          />
        </NSpin>

        <NDivider style="margin: 24px 0" />

        <!-- Actions de validation du formulaire -->
        <div class="form-actions">
          <NSpace justify="end">
            <NButton secondary @click="emit('cancel')"> Annuler </NButton>

            <!-- RG3 : La soumission est bloquée si nom vide ou nb cartes != 10 -->
            <NButton
              type="primary"
              attr-type="submit"
              size="medium"
              :disabled="!canSubmit"
              :loading="loading"
            >
              {{ submitLabel }}
            </NButton>
          </NSpace>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import CardGrid from '@/components/cards/CardGrid.vue'
import { useDecks } from '@/composables/useDecks'
import type { Card } from '@/types'
import { filterCards } from '@/utils/deck.js'

interface Props {
  initialName?: string
  initialCardIds?: number[]
  submitLabel?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialName: '',
  initialCardIds: () => [],
  submitLabel: 'Enregistrer',
  loading: false,
})

const emit = defineEmits<{
  (e: 'submit', payload: { name: string; cards: number[] }): void
  (e: 'cancel'): void
}>()

const { loadAllCards } = useDecks()

const deckName = ref(props.initialName)
const selectedCardIds = ref<number[]>([...props.initialCardIds])
const cards = ref<Card[]>([])
const loadingCards = ref(true)
const searchQuery = ref('')
const activeFilter = ref<'all' | 'selected'>('all')

watch(
  () => props.initialName,
  (val) => {
    deckName.value = val
  },
)

watch(
  () => props.initialCardIds,
  (val) => {
    selectedCardIds.value = [...val]
  },
  { deep: true },
)

onMounted(async () => {
  loadingCards.value = true
  try {
    cards.value = await loadAllCards()
  } finally {
    loadingCards.value = false
  }
})

const nameError = computed(() => {
  if (deckName.value.length > 0 && !deckName.value.trim()) {
    return 'Le nom du deck ne peut pas être vide'
  }
  return undefined
})

const displayedCards = computed(() => {
  return filterCards(cards.value, searchQuery.value, {
    activeFilter: activeFilter.value,
    selectedCardIds: selectedCardIds.value,
  })
})

/**
 * RG3 : Bloqué si le nom est vide ou si le nombre de cartes sélectionnées est différent de 10.
 */
const isNameValid = computed(() => deckName.value.trim().length > 0)
const isCardsCountValid = computed(() => selectedCardIds.value.length === 10)
const canSubmit = computed(
  () => isNameValid.value && isCardsCountValid.value && !props.loading,
)

const handleSubmit = () => {
  if (!canSubmit.value) return
  emit('submit', {
    name: deckName.value.trim(),
    cards: selectedCardIds.value,
  })
}
</script>

<style scoped>
.deck-form-container {
  width: 100%;
}

.counter-section {
  margin: 16px 0;
}

.counter-row {
  flex-wrap: wrap;
  gap: 12px;
}

.counter-hint {
  font-size: 13px;
}

.search-section {
  margin: 12px 0;
}

.empty-search-state {
  padding: 48px 16px;
  display: flex;
  justify-content: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
