export type PokemonType =
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Grass'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dragon'
  | 'Dark'
  | 'Steel'
  | 'Fairy'

export interface Card {
  id: number
  name: string
  hp: number
  attack: number
  type: PokemonType
  pokedexNumber: number
  imgUrl: string
}

export interface DeckCard {
  id: number
  deckId: number
  cardId: number
}
