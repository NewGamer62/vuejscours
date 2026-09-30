import assert from 'node:assert/strict'
import test from 'node:test'

import { useColors } from '../src/composables/useColors.ts'
import {
  createCardCache,
  filterCards,
  isCardDisabled,
  normalizeSearchText,
  resolveDeckCards,
  toggleCardSelection,
  validateDeck,
} from '../src/utils/deck.ts'

test('useColors: getTypeColor returns correct color for Pokemon types', () => {
  const { getTypeColor } = useColors()
  assert.strictEqual(getTypeColor('Fire'), '#F08030')
  assert.strictEqual(getTypeColor('Water'), '#6890F0')
  assert.strictEqual(getTypeColor('Grass'), '#78C850')
  assert.strictEqual(getTypeColor('Electric'), '#F8D030')
  assert.strictEqual(getTypeColor('Normal'), '#A8A878')
  assert.strictEqual(getTypeColor('Fairy'), '#EE99AC')
})

test('useColors: hpColor returns correct color based on percentage', () => {
  const { hpColor, COLORS } = useColors()
  assert.strictEqual(hpColor(100), COLORS.success)
  assert.strictEqual(hpColor(51), COLORS.success)
  assert.strictEqual(hpColor(50), COLORS.warning)
  assert.strictEqual(hpColor(26), COLORS.warning)
  assert.strictEqual(hpColor(25), COLORS.error)
  assert.strictEqual(hpColor(10), COLORS.error)
  assert.strictEqual(hpColor(0), COLORS.error)
})

test('resolveDeckCards: correctly maps cardId to full Card data', () => {
  const allCards = [
    {
      id: 1,
      name: 'Bulbizarre',
      hp: 60,
      attack: 40,
      type: 'Grass',
      pokedexNumber: 1,
      imgUrl: 'https://example.com/1.png',
    },
    {
      id: 2,
      name: 'Salamèche',
      hp: 50,
      attack: 52,
      type: 'Fire',
      pokedexNumber: 4,
      imgUrl: 'https://example.com/4.png',
    },
    {
      id: 3,
      name: 'Carapuce',
      hp: 55,
      attack: 48,
      type: 'Water',
      pokedexNumber: 7,
      imgUrl: 'https://example.com/7.png',
    },
  ]

  const deckCards = [
    { id: 101, deckId: 10, cardId: 2 },
    { id: 102, deckId: 10, cardId: 3 },
  ]

  const resolved = resolveDeckCards(deckCards, allCards)
  assert.strictEqual(resolved.length, 2)
  assert.strictEqual(resolved[0].name, 'Salamèche')
  assert.strictEqual(resolved[0].type, 'Fire')
  assert.strictEqual(resolved[1].name, 'Carapuce')
  assert.strictEqual(resolved[1].type, 'Water')
})

test('resolveDeckCards: handles embedded card object', () => {
  const customCard = {
    id: 99,
    name: 'Pikachu',
    hp: 45,
    attack: 55,
    type: 'Electric',
    pokedexNumber: 25,
    imgUrl: 'https://example.com/25.png',
  }

  const deckCards = [{ id: 1, deckId: 1, cardId: 99, card: customCard }]
  const resolved = resolveDeckCards(deckCards, [])
  assert.strictEqual(resolved.length, 1)
  assert.strictEqual(resolved[0].name, 'Pikachu')
  assert.strictEqual(resolved[0].type, 'Electric')
})

test('resolveDeckCards: provides fallback when card is not found', () => {
  const deckCards = [{ id: 1, deckId: 1, cardId: 999 }]
  const resolved = resolveDeckCards(deckCards, [])
  assert.strictEqual(resolved.length, 1)
  assert.strictEqual(resolved[0].id, 999)
  assert.strictEqual(resolved[0].name, 'Carte #999')
})

test('resolveDeckCards: handles undefined and empty deckCards', () => {
  assert.deepStrictEqual(resolveDeckCards(undefined, []), [])
  assert.deepStrictEqual(resolveDeckCards([], []), [])
})

test('validateDeck: RG3 constraints (name required, exactly 10 cards)', () => {
  // Empty name
  assert.strictEqual(
    validateDeck('', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).isValid,
    false,
  )
  assert.strictEqual(
    validateDeck('   ', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).isValid,
    false,
  )

  // Card count != 10
  assert.strictEqual(validateDeck('Mon deck', [1, 2, 3, 4, 5]).isValid, false)
  assert.strictEqual(
    validateDeck('Mon deck', [1, 2, 3, 4, 5, 6, 7, 8, 9]).isValid,
    false,
  )
  assert.strictEqual(
    validateDeck('Mon deck', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).isValid,
    false,
  )

  // Valid deck
  const result = validateDeck('Mon deck', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.strictEqual(result.isValid, true)
  assert.strictEqual(result.errors.length, 0)
})

test('Card grid selection logic: RG5 and RG6', () => {
  let selected = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const maxSelected = 10

  // 9 cards: 10th card is NOT disabled
  assert.strictEqual(isCardDisabled(10, selected, maxSelected), false)

  // Click on 10th card selects it (RG5)
  selected = toggleCardSelection(10, selected, maxSelected)
  assert.strictEqual(selected.length, 10)
  assert.ok(selected.includes(10))

  // 10 cards reached: unselected card 11 is disabled (RG6)
  assert.strictEqual(
    isCardDisabled(11, selected, maxSelected),
    true,
    'Card 11 must be disabled',
  )
  assert.strictEqual(
    isCardDisabled(10, selected, maxSelected),
    false,
    'Selected card 10 must NOT be disabled',
  )

  // Trying to add card 11 beyond max does nothing
  const attempted = toggleCardSelection(11, selected, maxSelected)
  assert.strictEqual(attempted.length, 10)

  // Clicking an already selected card deselects it (RG5)
  selected = toggleCardSelection(10, selected, maxSelected)
  assert.strictEqual(selected.length, 9)
  assert.strictEqual(selected.includes(10), false)

  // Once deselected, card 11 is re-enabled
  assert.strictEqual(isCardDisabled(11, selected, maxSelected), false)
})

const sampleCards = [
  {
    id: 1,
    name: 'Bulbizarre',
    hp: 60,
    attack: 40,
    type: 'Grass',
    pokedexNumber: 1,
    imgUrl: 'https://example.com/1.png',
  },
  {
    id: 4,
    name: 'Salamèche',
    hp: 50,
    attack: 52,
    type: 'Fire',
    pokedexNumber: 4,
    imgUrl: 'https://example.com/4.png',
  },
  {
    id: 7,
    name: 'Carapuce',
    hp: 55,
    attack: 48,
    type: 'Water',
    pokedexNumber: 7,
    imgUrl: 'https://example.com/7.png',
  },
  {
    id: 25,
    name: 'Pikachu',
    hp: 45,
    attack: 55,
    type: 'Electric',
    pokedexNumber: 25,
    imgUrl: 'https://example.com/25.png',
  },
  {
    id: 145,
    name: 'Électhor',
    hp: 90,
    attack: 90,
    type: 'Electric',
    pokedexNumber: 145,
    imgUrl: 'https://example.com/145.png',
  },
  {
    id: 150,
    name: 'Mewtwo',
    hp: 100,
    attack: 110,
    type: 'Psychic',
    pokedexNumber: 150,
    imgUrl: 'https://example.com/150.png',
  },
]

test('normalizeSearchText: removes diacritics, converts to lowercase, and trims', () => {
  assert.strictEqual(normalizeSearchText('Salamèche'), 'salameche')
  assert.strictEqual(normalizeSearchText('Électhor'), 'electhor')
  assert.strictEqual(normalizeSearchText('  PIKACHU  '), 'pikachu')
  assert.strictEqual(normalizeSearchText(''), '')
  assert.strictEqual(normalizeSearchText(null), '')
})

test('filterCards: case-insensitive search (RG2)', () => {
  const lower = filterCards(sampleCards, 'pikachu')
  assert.strictEqual(lower.length, 1)
  assert.strictEqual(lower[0].name, 'Pikachu')

  const upper = filterCards(sampleCards, 'PIKACHU')
  assert.strictEqual(upper.length, 1)
  assert.strictEqual(upper[0].name, 'Pikachu')

  const mixed = filterCards(sampleCards, 'pIkAcHu')
  assert.strictEqual(mixed.length, 1)
  assert.strictEqual(mixed[0].name, 'Pikachu')
})

test('filterCards: accent-insensitive search (RG2)', () => {
  // Without accent in query matching accented name
  const salameche = filterCards(sampleCards, 'salameche')
  assert.strictEqual(salameche.length, 1)
  assert.strictEqual(salameche[0].name, 'Salamèche')

  const electhor = filterCards(sampleCards, 'electhor')
  assert.strictEqual(electhor.length, 1)
  assert.strictEqual(electhor[0].name, 'Électhor')

  // With accent in query matching accented name
  const electhorAccented = filterCards(sampleCards, 'Électhor')
  assert.strictEqual(electhorAccented.length, 1)
  assert.strictEqual(electhorAccented[0].name, 'Électhor')
})

test('filterCards: partial string search (RG2)', () => {
  const bizarre = filterCards(sampleCards, 'bizarre')
  assert.strictEqual(bizarre.length, 1)
  assert.strictEqual(bizarre[0].name, 'Bulbizarre')

  const car = filterCards(sampleCards, 'cara')
  assert.strictEqual(car.length, 1)
  assert.strictEqual(car[0].name, 'Carapuce')

  const thor = filterCards(sampleCards, 'thor')
  assert.strictEqual(thor.length, 1)
  assert.strictEqual(thor[0].name, 'Électhor')
})

test('filterCards: empty query, whitespace, and nullish return all cards', () => {
  assert.strictEqual(filterCards(sampleCards, '').length, sampleCards.length)
  assert.strictEqual(filterCards(sampleCards, '   ').length, sampleCards.length)
  assert.strictEqual(filterCards(sampleCards, null).length, sampleCards.length)
  assert.strictEqual(
    filterCards(sampleCards, undefined).length,
    sampleCards.length,
  )
})

test('filterCards: non-matching query returns empty array', () => {
  const result = filterCards(sampleCards, 'dracaufeu')
  assert.deepStrictEqual(result, [])

  const noMatch = filterCards(sampleCards, 'xyz999')
  assert.deepStrictEqual(noMatch, [])
})

test('filterCards: activeFilter "selected" filters to selectedCardIds', () => {
  const selectedResult = filterCards(sampleCards, '', {
    activeFilter: 'selected',
    selectedCardIds: [4, 25],
  })
  assert.strictEqual(selectedResult.length, 2)
  assert.deepStrictEqual(
    selectedResult.map((c) => c.id).sort((a, b) => a - b),
    [4, 25],
  )

  // Combined: activeFilter 'selected' AND query
  const combined = filterCards(sampleCards, 'sala', {
    activeFilter: 'selected',
    selectedCardIds: [4, 25],
  })
  assert.strictEqual(combined.length, 1)
  assert.strictEqual(combined[0].id, 4)
  assert.strictEqual(combined[0].name, 'Salamèche')
})

test('filterCards: selection preservation when filtering (RG3)', () => {
  // Suppose user has already selected 4 cards
  const userSelectedCardIds = [1, 4, 25, 145]

  // User filters view to search for Pikachu
  const displayed = filterCards(sampleCards, 'pikachu')
  assert.strictEqual(displayed.length, 1)
  assert.strictEqual(displayed[0].name, 'Pikachu')

  // RG3 requirement: userSelectedCardIds remains completely intact
  assert.strictEqual(userSelectedCardIds.length, 4)
  assert.deepStrictEqual(userSelectedCardIds, [1, 4, 25, 145])

  // Even if a non-matching card is searched, selection is preserved
  const emptyDisplay = filterCards(sampleCards, 'nonexistent')
  assert.strictEqual(emptyDisplay.length, 0)
  assert.deepStrictEqual(userSelectedCardIds, [1, 4, 25, 145])

  // Deselecting the currently visible card via toggleCardSelection
  const updatedSelection = toggleCardSelection(
    displayed[0].id,
    userSelectedCardIds,
  )
  // Pikachu (25) is removed, but Bulbizarre (1), Salamèche (4), Électhor (145) remain!
  assert.strictEqual(updatedSelection.includes(25), false)
  assert.deepStrictEqual(updatedSelection, [1, 4, 145])
})

test('filterCards: robust edge cases (empty array, nullish list)', () => {
  assert.deepStrictEqual(filterCards([], 'pikachu'), [])
  assert.deepStrictEqual(filterCards(null, 'pikachu'), [])
  assert.deepStrictEqual(filterCards(undefined, 'pikachu'), [])
})

// =============================================================================
// Ticket 6 : Aperçu des cartes et mise en cache d'appel unique (Issue 6 / RG1)
// =============================================================================

const tenSampleCards = [
  {
    id: 1,
    name: 'Bulbizarre',
    hp: 60,
    attack: 40,
    type: 'Grass',
    pokedexNumber: 1,
    imgUrl: 'https://example.com/1.png',
  },
  {
    id: 2,
    name: 'Herbizarre',
    hp: 80,
    attack: 60,
    type: 'Grass',
    pokedexNumber: 2,
    imgUrl: 'https://example.com/2.png',
  },
  {
    id: 3,
    name: 'Florizarre',
    hp: 120,
    attack: 100,
    type: 'Grass',
    pokedexNumber: 3,
    imgUrl: 'https://example.com/3.png',
  },
  {
    id: 4,
    name: 'Salamèche',
    hp: 50,
    attack: 52,
    type: 'Fire',
    pokedexNumber: 4,
    imgUrl: 'https://example.com/4.png',
  },
  {
    id: 5,
    name: 'Reptincel',
    hp: 70,
    attack: 64,
    type: 'Fire',
    pokedexNumber: 5,
    imgUrl: 'https://example.com/5.png',
  },
  {
    id: 6,
    name: 'Dracaufeu',
    hp: 150,
    attack: 120,
    type: 'Fire',
    pokedexNumber: 6,
    imgUrl: 'https://example.com/6.png',
  },
  {
    id: 7,
    name: 'Carapuce',
    hp: 55,
    attack: 48,
    type: 'Water',
    pokedexNumber: 7,
    imgUrl: 'https://example.com/7.png',
  },
  {
    id: 8,
    name: 'Carabaffe',
    hp: 75,
    attack: 63,
    type: 'Water',
    pokedexNumber: 8,
    imgUrl: 'https://example.com/8.png',
  },
  {
    id: 9,
    name: 'Tortank',
    hp: 140,
    attack: 110,
    type: 'Water',
    pokedexNumber: 9,
    imgUrl: 'https://example.com/9.png',
  },
  {
    id: 25,
    name: 'Pikachu',
    hp: 45,
    attack: 55,
    type: 'Electric',
    pokedexNumber: 25,
    imgUrl: 'https://example.com/25.png',
  },
]

test('createCardCache: makes at most ONE API call across multiple consecutive calls (Ticket 6)', async () => {
  let apiCallCount = 0
  const mockGetCards = async () => {
    apiCallCount++
    return tenSampleCards
  }

  const cache = createCardCache(mockGetCards)

  // 1er appel : déclenche l'API
  const firstResult = await cache.loadAllCards()
  assert.strictEqual(apiCallCount, 1, 'L’API doit être appelée une fois')
  assert.strictEqual(firstResult.length, 10)

  // 2e et 3e appels consécutifs : réutilisent le cache sans appel API supplémentaire
  const secondResult = await cache.loadAllCards()
  const thirdResult = await cache.loadAllCards()
  assert.strictEqual(
    apiCallCount,
    1,
    'L’API ne doit pas être rappelée si les cartes sont en cache',
  )
  assert.strictEqual(secondResult, firstResult)
  assert.strictEqual(thirdResult, firstResult)
})

test('createCardCache: concurrent calls share a single in-flight API request (promise deduplication)', async () => {
  let apiCallCount = 0
  const mockGetCards = async () => {
    apiCallCount++
    // Simule une latence réseau
    await new Promise((resolve) => setTimeout(resolve, 20))
    return tenSampleCards
  }

  const cache = createCardCache(mockGetCards)

  // 3 appels simultanés (ex: plusieurs decks se chargeant en parallèle)
  const [res1, res2, res3] = await Promise.all([
    cache.loadAllCards(),
    cache.loadAllCards(),
    cache.loadAllCards(),
  ])

  assert.strictEqual(
    apiCallCount,
    1,
    'Les appels concurrents doivent mutualiser la même promesse (1 seul appel)',
  )
  assert.deepStrictEqual(res1, tenSampleCards)
  assert.deepStrictEqual(res2, tenSampleCards)
  assert.deepStrictEqual(res3, tenSampleCards)
})

test('createCardCache: shared cache serves multiple different decks without re-fetching', async () => {
  let apiCallCount = 0
  const mockGetCards = async () => {
    apiCallCount++
    return tenSampleCards
  }

  const cache = createCardCache(mockGetCards)

  // Deck 1 résout ses cartes
  const cardsForDeck1 = await cache.loadAllCards()
  const deck1Resolved = resolveDeckCards([1, 2, 3], cardsForDeck1)
  assert.strictEqual(apiCallCount, 1)
  assert.strictEqual(deck1Resolved.length, 3)
  assert.strictEqual(deck1Resolved[0].name, 'Bulbizarre')

  // Deck 2 résout ses cartes via le même cache partagé
  const cardsForDeck2 = await cache.loadAllCards()
  const deck2Resolved = resolveDeckCards([4, 5, 25], cardsForDeck2)
  assert.strictEqual(
    apiCallCount,
    1,
    'Deck 2 réutilise le cache sans appel API supplémentaire',
  )
  assert.strictEqual(deck2Resolved.length, 3)
  assert.strictEqual(deck2Resolved[2].name, 'Pikachu')
})

test('createCardCache: retry on failure and clear cache support', async () => {
  let attempts = 0
  const failingFetcher = async () => {
    attempts++
    if (attempts === 1) {
      throw new Error('Erreur réseau temporaire')
    }
    return tenSampleCards
  }

  const cache = createCardCache(failingFetcher)

  // Premier appel échoue
  await assert.rejects(async () => {
    await cache.loadAllCards()
  }, /Erreur réseau temporaire/)

  // Deuxième appel réessaie sans rester bloqué
  const cards = await cache.loadAllCards()
  assert.strictEqual(cards.length, 10)
  assert.strictEqual(attempts, 2)

  // Reset du cache permet un rechargement frais
  cache.clear()
  await cache.loadAllCards()
  assert.strictEqual(attempts, 3)
})

test('resolveDeckCards: resolves all 10 cards in a deck with valid thumbnails and metadata (RG1)', () => {
  const deckCards = tenSampleCards.map((c, idx) => ({
    id: 100 + idx,
    deckId: 1,
    cardId: c.id,
  }))

  const resolved = resolveDeckCards(deckCards, tenSampleCards)

  assert.strictEqual(resolved.length, 10, 'Le deck doit comporter 10 cartes')
  for (let i = 0; i < 10; i++) {
    const card = resolved[i]
    assert.strictEqual(card.id, tenSampleCards[i].id)
    assert.strictEqual(card.name, tenSampleCards[i].name)
    assert.strictEqual(card.pokedexNumber, tenSampleCards[i].pokedexNumber)
    assert.ok(
      card.imgUrl && card.imgUrl.startsWith('https://'),
      `La carte ${card.name} doit avoir une URL de miniature valide`,
    )
  }
})

test('resolveDeckCards: resolves deck defined as raw number IDs array (10 cards)', () => {
  const numericIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 25]
  const resolved = resolveDeckCards(numericIds, tenSampleCards)

  assert.strictEqual(resolved.length, 10)
  assert.strictEqual(resolved[0].name, 'Bulbizarre')
  assert.strictEqual(resolved[9].name, 'Pikachu')
  assert.strictEqual(resolved[9].imgUrl, 'https://example.com/25.png')
})

test('resolveDeckCards: resolves deck with duplicate cards preserving order and count', () => {
  const duplicateDeck = [25, 25, 25, 25, 25, 6, 6, 6, 6, 6]
  const resolved = resolveDeckCards(duplicateDeck, tenSampleCards)

  assert.strictEqual(resolved.length, 10)
  assert.strictEqual(resolved.filter((c) => c.name === 'Pikachu').length, 5)
  assert.strictEqual(resolved.filter((c) => c.name === 'Dracaufeu').length, 5)
  assert.strictEqual(resolved[0].imgUrl, 'https://example.com/25.png')
  assert.strictEqual(resolved[9].imgUrl, 'https://example.com/6.png')
})

test('resolveDeckCards: edge cases - fallback placeholders when card data is missing from cache', () => {
  const deckWithMissingCard = [{ id: 1, deckId: 1, cardId: 9999 }]
  const resolved = resolveDeckCards(deckWithMissingCard, tenSampleCards)

  assert.strictEqual(resolved.length, 1)
  assert.strictEqual(resolved[0].id, 9999)
  assert.strictEqual(resolved[0].name, 'Carte #9999')
  assert.strictEqual(
    resolved[0].imgUrl,
    '',
    'La carte inconnue doit avoir imgUrl vide pour afficher le placeholder ?',
  )
  assert.strictEqual(resolved[0].pokedexNumber, 9999)
})

test('resolveDeckCards: edge cases - card with empty imgUrl retains other properties', () => {
  const cardWithoutImage = {
    id: 88,
    name: 'Tadmorv',
    hp: 70,
    attack: 50,
    type: 'Poison',
    pokedexNumber: 88,
    imgUrl: '',
  }
  const resolved = resolveDeckCards([88], [cardWithoutImage])

  assert.strictEqual(resolved.length, 1)
  assert.strictEqual(resolved[0].name, 'Tadmorv')
  assert.strictEqual(resolved[0].imgUrl, '')
  assert.strictEqual(resolved[0].type, 'Poison')
})

test('resolveDeckCards: edge cases - resolving before card cache is loaded returns valid placeholders', () => {
  const deckCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 25]
  const resolved = resolveDeckCards(deckCards, [])

  assert.strictEqual(resolved.length, 10)
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(resolved[i].id, deckCards[i])
    assert.strictEqual(resolved[i].name, `Carte #${deckCards[i]}`)
    assert.strictEqual(resolved[i].imgUrl, '')
  }
})

test('resolveDeckCards: edge cases - nullish inputs and empty arrays return empty array gracefully', () => {
  assert.deepStrictEqual(resolveDeckCards(undefined, tenSampleCards), [])
  assert.deepStrictEqual(resolveDeckCards(null, tenSampleCards), [])
  assert.deepStrictEqual(resolveDeckCards([], tenSampleCards), [])
})

