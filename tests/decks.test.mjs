import assert from 'node:assert/strict'
import test from 'node:test'

import { useColors } from '../src/composables/useColors.ts'
import {
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
