import assert from 'node:assert/strict'
import test from 'node:test'

import { useColors } from '../src/composables/useColors.ts'
import {
  isCardDisabled,
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
