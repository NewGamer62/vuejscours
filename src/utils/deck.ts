import type { Card, DeckCard } from '../types/index.js'

/**
 * Associe chaque carte de deck (DeckCard) à ses données complètes (Card).
 */
export function resolveDeckCards(
  deckCards: (DeckCard | number)[] | undefined,
  cardsList: Card[] = [],
): Card[] {
  if (!deckCards || deckCards.length === 0) return []
  return deckCards.map((dc) => {
    if (typeof dc === 'number') {
      const found = cardsList.find((c) => c.id === dc)
      if (found) return found
      return {
        id: dc,
        name: `Carte #${dc}`,
        hp: 0,
        attack: 0,
        type: 'Normal',
        pokedexNumber: dc,
        imgUrl: '',
      }
    }
    if (dc.card) return dc.card
    const cardId = dc.cardId ?? (dc as unknown as Card).id
    const found = cardsList.find((c) => c.id === cardId)
    if (found) return found
    return {
      id: cardId,
      name: `Carte #${cardId}`,
      hp: 0,
      attack: 0,
      type: 'Normal',
      pokedexNumber: cardId,
      imgUrl: '',
    }
  })
}

/**
 * Valide les contraintes de création/édition d'un deck :
 * Nom non vide et exactement 10 cartes.
 */
export function validateDeck(
  name: string,
  selectedCardIds: number[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!name || !name.trim()) {
    errors.push('Le nom du deck est obligatoire.')
  }
  if (!Array.isArray(selectedCardIds) || selectedCardIds.length !== 10) {
    errors.push('Le deck doit comporter exactement 10 cartes.')
  }
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Logique de désactivation des cartes dans la grille :
 * Quand le maximum est atteint, les cartes non sélectionnées sont désactivées.
 */
export function isCardDisabled(
  cardId: number,
  selectedCardIds: number[],
  maxSelected = 10,
  selectable = true,
): boolean {
  if (!selectable) return false
  const isSelected = selectedCardIds.includes(cardId)
  if (selectedCardIds.length >= maxSelected && !isSelected) {
    return true
  }
  return false
}

/**
 * Logique de sélection/désélection d'une carte dans la grille.
 */
export function toggleCardSelection(
  cardId: number,
  selectedCardIds: number[],
  maxSelected = 10,
): number[] {
  const index = selectedCardIds.indexOf(cardId)
  if (index !== -1) {
    return selectedCardIds.filter((id) => id !== cardId)
  }
  if (selectedCardIds.length < maxSelected) {
    return [...selectedCardIds, cardId]
  }
  return selectedCardIds
}

/**
 * Normalise une chaîne de caractères en supprimant les accents,
 * en passant en minuscules et en retirant les espaces superflus.
 */
export function normalizeSearchText(str: string): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export interface FilterCardsOptions {
  activeFilter?: 'all' | 'selected'
  selectedCardIds?: number[]
}

/**
 * Filtre les cartes selon la recherche textuelle (insensible à la casse et aux accents)
 * et le filtre d'affichage (toutes ou sélectionnées) (Issue 4 / RG2).
 */
export function filterCards(
  cards: Card[],
  query?: string | null,
  options?: FilterCardsOptions,
): Card[] {
  if (!Array.isArray(cards)) return []

  let list = cards

  // Si activeFilter === 'selected', filtrer uniquement les cartes sélectionnées
  if (options?.activeFilter === 'selected') {
    const selectedIds = new Set(options.selectedCardIds ?? [])
    list = list.filter((c) => selectedIds.has(c.id))
  }

  // Filtrage par texte de recherche normalisé
  const normalizedQuery = normalizeSearchText(query || '')
  if (normalizedQuery.length > 0) {
    list = list.filter((c) => {
      const normalizedName = normalizeSearchText(c.name || '')
      return normalizedName.includes(normalizedQuery)
    })
  }

  return list
}
