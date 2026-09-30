import { ref } from 'vue'

import type { Card, DeckCard } from '../types/index.js'
import { resolveDeckCards } from '../utils/deck.js'
import { useApi } from './useApi.js'

export { resolveDeckCards }

const cachedCards = ref<Card[]>([])
const loadingCards = ref(false)

export function useDecks() {
  const api = useApi()

  /**
   * Charge toutes les cartes depuis l'API si elles ne sont pas déjà en cache.
   * Partagé entre tous les composants (decks, détail, formulaires).
   */
  const loadAllCards = async (): Promise<Card[]> => {
    if (cachedCards.value.length > 0) {
      return cachedCards.value
    }
    loadingCards.value = true
    try {
      const cards = await api.getCards()
      cachedCards.value = cards
      return cards
    } finally {
      loadingCards.value = false
    }
  }

  const resolveCards = (deckCards: DeckCard[] | undefined) => {
    return resolveDeckCards(deckCards, cachedCards.value)
  }

  return {
    cachedCards,
    loadingCards,
    loadAllCards,
    resolveDeckCards: resolveCards,
  }
}
