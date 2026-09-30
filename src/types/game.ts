import type { Card } from './card.js'

export interface Room {
  id: string | number
  name?: string
  host?: {
    id?: number
    username?: string
    socketId?: string
  }
  hostUsername?: string
  players?: {
    id?: number
    username?: string
    socketId?: string
  }[]
  playerCount?: number
  status?: 'waiting' | 'playing' | 'ended'
  createdAt?: string
}

export interface PlayerBoard {
  userId?: number
  username?: string
  socketId?: string
  score: number // Nombre de KOs infligés (0 à 3)
  activeCard: Card | null
  currentHp: number
  hand: Card[]
  deckCount: number
}

export interface GameState {
  roomId: string | number
  status?: 'waiting' | 'playing' | 'ended'
  turn?: number
  currentTurn?: string
  currentPlayerSocketId?: string
  host?: PlayerBoard | Record<string, unknown>
  guest?: PlayerBoard | Record<string, unknown>
  player?: PlayerBoard
  opponent?: PlayerBoard
  winner?: string | number | null
  isMyTurn?: boolean
  lastAction?: string
  message?: string
  [key: string]: unknown
}

export interface GameEndPayload {
  winner: string | number
  reason?: string
}

export interface GameActionPayload {
  roomId: string | number
  cardIndex?: number
  deckId?: number
}

export interface ClientToServerEvents {
  getRooms: () => void
  createRoom: (data: { deckId: number }) => void
  joinRoom: (data: { roomId: string | number; deckId: number }) => void
  drawCards: (data: { roomId: string | number }) => void
  playCard: (data: { roomId: string | number; cardIndex: number }) => void
  attack: (data: { roomId: string | number }) => void
  endTurn: (data: { roomId: string | number }) => void
}

export interface ServerToClientEvents {
  roomsList: (rooms: Room[]) => void
  roomsListUpdated: (rooms: Room[]) => void
  roomCreated: (data: { roomId: string | number }) => void
  gameStarted: (gameState: GameState) => void
  gameStateUpdated: (gameState: GameState) => void
  gameEnded: (payload: GameEndPayload) => void
  opponentDisconnected: (payload?: { message?: string }) => void
  error: (error: { message: string } | string) => void
}
