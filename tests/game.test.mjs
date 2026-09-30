import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateHpPercentage,
  canAttack,
  canDrawCard,
  canEndTurn,
  canPlayCardFromHand,
  checkGameEndByScore,
} from '../src/utils/game.ts'

test('canDrawCard: RG4 & RG6 constraints (turn, max 5 hand, non-empty deck)', () => {
  // Tour du joueur, main non pleine (<5), deck non vide (>0) -> autorisé
  assert.strictEqual(canDrawCard(true, 3, 7), true)
  assert.strictEqual(canDrawCard(true, 0, 10), true)
  assert.strictEqual(canDrawCard(true, 4, 1), true)

  // RG6 : Interdit si ce n'est pas le tour du joueur
  assert.strictEqual(canDrawCard(false, 2, 5), false)
  assert.strictEqual(canDrawCard(false, 0, 10), false)

  // RG4 : Interdit si la main est pleine (>= 5 cartes)
  assert.strictEqual(canDrawCard(true, 5, 5), false)
  assert.strictEqual(canDrawCard(true, 6, 2), false)

  // RG4 : Interdit si le deck est vide (<= 0)
  assert.strictEqual(canDrawCard(true, 2, 0), false)
  assert.strictEqual(canDrawCard(true, 0, 0), false)
})

test('canAttack: RG5 & RG6 constraints (turn, active cards for both players)', () => {
  // Tour du joueur, les deux ont une carte active -> autorisé
  assert.strictEqual(canAttack(true, true, true), true)

  // RG6 : Interdit si ce n'est pas le tour du joueur
  assert.strictEqual(canAttack(false, true, true), false)

  // RG5 : Interdit si le joueur n'a pas de carte active
  assert.strictEqual(canAttack(true, false, true), false)

  // RG5 : Interdit si l'adversaire n'a pas de carte active
  assert.strictEqual(canAttack(true, true, false), false)

  // Interdit si aucun des deux n'a de carte active
  assert.strictEqual(canAttack(true, false, false), false)
})

test('canPlayCardFromHand: RG2 (turn and NO active card on board)', () => {
  // Tour du joueur et aucune carte active -> autorisé
  assert.strictEqual(canPlayCardFromHand(true, false), true)

  // Joueur a déjà une carte active sur le plateau -> interdit
  assert.strictEqual(canPlayCardFromHand(true, true), false)

  // Ce n'est pas le tour du joueur -> interdit
  assert.strictEqual(canPlayCardFromHand(false, false), false)
  assert.strictEqual(canPlayCardFromHand(false, true), false)
})

test('canEndTurn: RG6 (turn constraint)', () => {
  assert.strictEqual(canEndTurn(true), true)
  assert.strictEqual(canEndTurn(false), false)
})

test('checkGameEndByScore: RG8 (win/loss when 3 KOs reached)', () => {
  // Partie en cours (moins de 3 KOs)
  assert.deepStrictEqual(checkGameEndByScore(0, 0), {
    isEnded: false,
    winnerRole: null,
  })
  assert.deepStrictEqual(checkGameEndByScore(2, 1), {
    isEnded: false,
    winnerRole: null,
  })

  // Victoire joueur (3 KOs)
  assert.deepStrictEqual(checkGameEndByScore(3, 1), {
    isEnded: true,
    winnerRole: 'player',
  })

  // Victoire adversaire (3 KOs)
  assert.deepStrictEqual(checkGameEndByScore(1, 3), {
    isEnded: true,
    winnerRole: 'opponent',
  })
})

test('calculateHpPercentage: clamped between 0 and 100', () => {
  assert.strictEqual(calculateHpPercentage(100, 100), 100)
  assert.strictEqual(calculateHpPercentage(50, 100), 50)
  assert.strictEqual(calculateHpPercentage(0, 80), 0)
  assert.strictEqual(calculateHpPercentage(90, 80), 100) // clamp max
  assert.strictEqual(calculateHpPercentage(-10, 80), 0) // clamp min
  assert.strictEqual(calculateHpPercentage(10, 0), 0) // division par zéro
})
