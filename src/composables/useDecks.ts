import { ref } from 'vue'

import type { Card, DeckCard } from '../types/index.js'
import { createCardCache, resolveDeckCards } from '../utils/deck.js'
import { useApi } from './useApi.js'

export { resolveDeckCards }

const cachedCards = ref<Card[]>([])
const loadingCards = ref(false)
let cardCache: ReturnType<typeof createCardCache> | null = null

/**
 * Réinitialise le cache de cartes partagé (utile pour les tests ou la réinitialisation).
 */
export function clearCardCache(): void {
  cachedCards.value = []
  loadingCards.value = false
  if (cardCache) {
    cardCache.clear()
  }
}

export function useDecks() {
  const api = useApi()

  const getOrCreateCache = () => {
    if (!cardCache) {
      cardCache = createCardCache(async () => {
        loadingCards.value = true
        try {
          const cards = await api.getCards()
          cachedCards.value = cards
          return cards
        } finally {
          loadingCards.value = false
        }
      })
    }
    return cardCache
  }

  /**
   * Charge toutes les cartes depuis l'API si elles ne sont pas déjà en cache.
   * Déduplique les requêtes concurrentes en vol (in-flight) et partage le résultat entre tous les composants.
   */
  const loadAllCards = async (): Promise<Card[]> => {
    const cache = getOrCreateCache()
    loadingCards.value = true
    try {
      const cards = await cache.loadAllCards()
      cachedCards.value = cards
      return cards
    } finally {
      loadingCards.value = cache.isLoading()
    }
  }

  const resolveCards = (deckCards: (DeckCard | number)[] | undefined) => {
    return resolveDeckCards(deckCards, cachedCards.value)
  }

  return {
    cachedCards,
    loadingCards,
    loadAllCards,
    resolveDeckCards: resolveCards,
    clearCardCache,
  }
}
