import type {
  AuthResponse,
  Card,
  Deck,
  DeckPayload,
  SignInPayload,
  SignUpPayload,
} from '../types/index.js'
import { useStorage } from './useStorage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const storage = useStorage()

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = storage.get<string>('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(
      (data as { message?: string }).message || `Erreur ${res.status}`,
    )
  }

  return res.json() as Promise<T>
}

/**
 * Composable exposant toutes les méthodes HTTP de l'API.
 *
 * - Le token JWT est injecté automatiquement dans chaque requête.
 * - En cas d'erreur (4xx, 5xx), une exception est levée avec le message renvoyé par l'API.
 *
 * @example
 * const api = useApi()
 * const cards = await api.getCards()
 */
export function useApi() {
  /** Connecte un utilisateur existant. Retourne le token JWT et les infos utilisateur. */
  const signIn = ({ email, password }: SignInPayload) =>
    request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

  /** Crée un nouveau compte. Retourne le token JWT et les infos utilisateur. */
  const signUp = ({ email, password, username }: SignUpPayload) =>
    request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    })

  /** Retourne toutes les cartes Pokémon disponibles. */
  const getCards = () => request<Card[]>('/cards')

  /** Retourne les decks de l'utilisateur connecté. */
  const getMyDecks = () => request<Deck[]>('/decks/mine')

  /** Retourne un deck par son id (avec ses cartes). */
  const getDeck = (id: string | number) => request<Deck>(`/decks/${id}`)

  /** Crée un nouveau deck. `cards` est un tableau de 10 `cardId`. */
  const createDeck = ({ name, cards }: DeckPayload) =>
    request<Deck>('/decks', {
      method: 'POST',
      body: JSON.stringify({ name, cards }),
    })

  /** Met à jour le nom et/ou les cartes d'un deck existant. */
  const updateDeck = (id: string | number, { name, cards }: DeckPayload) =>
    request<Deck>(`/decks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, cards }),
    })

  /** Supprime un deck par son id. */
  const deleteDeck = (id: string | number) =>
    request<unknown>(`/decks/${id}`, { method: 'DELETE' })

  return {
    signIn,
    signUp,
    getCards,
    getMyDecks,
    getDeck,
    createDeck,
    updateDeck,
    deleteDeck,
  }
}
