import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { computed, ref } from 'vue'

import router from '@/router'
import { useAuthStore } from '@/stores/auth.store'
import type { GameEndPayload, GameState, PlayerBoard, Room } from '@/types'

export type GameStatus = 'idle' | 'waiting' | 'playing' | 'ended'

function normalizeBoard(raw: unknown): PlayerBoard {
  if (!raw || typeof raw !== 'object') {
    return {
      userId: undefined,
      username: '',
      socketId: '',
      score: 0,
      activeCard: null,
      currentHp: 0,
      hand: [],
      deckCount: 0,
    }
  }

  const record = raw as Record<string, unknown>
  const activeCard = (record.activeCard ??
    record.card ??
    null) as PlayerBoard['activeCard']
  const cardHp =
    activeCard && typeof activeCard.hp === 'number' ? activeCard.hp : 0
  const currentHp =
    typeof record.currentHp === 'number' ? record.currentHp : cardHp

  const hand = Array.isArray(record.hand)
    ? (record.hand as PlayerBoard['hand'])
    : []

  let deckCount = 0
  if (typeof record.deckCount === 'number') {
    deckCount = record.deckCount
  } else if (Array.isArray(record.deck)) {
    deckCount = record.deck.length
  } else if (typeof record.remainingCards === 'number') {
    deckCount = record.remainingCards
  }

  const score =
    typeof record.score === 'number'
      ? record.score
      : typeof record.kos === 'number'
        ? (record.kos as number)
        : 0

  return {
    userId:
      typeof record.userId === 'number'
        ? record.userId
        : (record.id as number | undefined),
    username: typeof record.username === 'string' ? record.username : '',
    socketId: typeof record.socketId === 'string' ? record.socketId : '',
    score,
    activeCard,
    currentHp,
    hand,
    deckCount,
  }
}

export const useGameStore = defineStore('game', () => {
  const authStore = useAuthStore()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socket = ref<any>(null)
  const isConnected = ref(false)
  const rooms = ref<Room[]>([])
  const currentRoomId = ref<string | number | null>(null)
  const selectedDeckId = ref<number | null>(null)
  const gameStatus = ref<GameStatus>('idle')
  const gameState = ref<GameState | null>(null)
  const isHost = ref(false)
  const winner = ref<string | number | null>(null)
  const lastEventMessage = ref<string>('')
  const errorMessage = ref<string | null>(null)
  const opponentDisconnectedMessage = ref<string | null>(null)

  const playerRole = computed<'hôte' | 'invité'>(() => {
    if (gameState.value?.host) {
      const host = gameState.value.host as Record<string, unknown>
      if (
        (authStore.user?.id && host.userId === authStore.user.id) ||
        (authStore.user?.username &&
          host.username === authStore.user.username) ||
        (socket.value?.id && host.socketId === socket.value.id)
      ) {
        return 'hôte'
      }

      const guest = gameState.value.guest as Record<string, unknown> | undefined
      if (
        guest &&
        ((authStore.user?.id && guest.userId === authStore.user.id) ||
          (authStore.user?.username &&
            guest.username === authStore.user.username) ||
          (socket.value?.id && guest.socketId === socket.value.id))
      ) {
        return 'invité'
      }
    }
    return isHost.value ? 'hôte' : 'invité'
  })

  const myBoard = computed<PlayerBoard>(() => {
    if (!gameState.value) return normalizeBoard(null)
    if (gameState.value.player) {
      return normalizeBoard(gameState.value.player)
    }
    return playerRole.value === 'hôte'
      ? normalizeBoard(gameState.value.host)
      : normalizeBoard(gameState.value.guest)
  })

  const opponentBoard = computed<PlayerBoard>(() => {
    if (!gameState.value) return normalizeBoard(null)
    if (gameState.value.opponent) {
      return normalizeBoard(gameState.value.opponent)
    }
    return playerRole.value === 'hôte'
      ? normalizeBoard(gameState.value.guest)
      : normalizeBoard(gameState.value.host)
  })

  const isMyTurn = computed<boolean>(() => {
    if (gameStatus.value !== 'playing' || !gameState.value) return false
    if (typeof gameState.value.isMyTurn === 'boolean') {
      return gameState.value.isMyTurn
    }

    const currentTurn =
      gameState.value.currentTurn ?? gameState.value.currentPlayerSocketId
    if (!currentTurn) {
      // Par défaut, l'hôte commence le premier tour
      return playerRole.value === 'hôte'
    }

    if (socket.value && currentTurn === socket.value.id) {
      return true
    }

    if (
      authStore.user &&
      (String(currentTurn) === String(authStore.user.id) ||
        currentTurn === authStore.user.username)
    ) {
      return true
    }

    if (currentTurn === 'host' || currentTurn === 'hôte') {
      return playerRole.value === 'hôte'
    }

    if (currentTurn === 'guest' || currentTurn === 'invité') {
      return playerRole.value === 'invité'
    }

    return false
  })

  const isVictory = computed<boolean>(() => {
    if (winner.value === null || winner.value === undefined) return false

    if (
      authStore.user &&
      (winner.value === authStore.user.id ||
        winner.value === authStore.user.username ||
        String(winner.value) === String(authStore.user.id))
    ) {
      return true
    }

    if (socket.value && winner.value === socket.value.id) {
      return true
    }

    if (
      (playerRole.value === 'hôte' &&
        (winner.value === 'host' || winner.value === 'hôte')) ||
      (playerRole.value === 'invité' &&
        (winner.value === 'guest' || winner.value === 'invité'))
    ) {
      return true
    }

    // Victoire par KOs (3 KOs atteints)
    if (myBoard.value.score >= 3) return true
    if (opponentBoard.value.score >= 3) return false

    return false
  })

  function fetchRooms() {
    if (socket.value?.connected) {
      socket.value.emit('getRooms')
    }
  }

  function connect() {
    if (socket.value?.connected) return

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
    const newSocket = io(socketUrl, {
      auth: {
        token: authStore.token,
      },
    })

    socket.value = newSocket

    newSocket.on('connect', () => {
      isConnected.value = true
      fetchRooms()
    })

    newSocket.on('disconnect', () => {
      isConnected.value = false
    })

    newSocket.on('roomsList', (list: Room[]) => {
      rooms.value = list
    })

    newSocket.on('roomsListUpdated', (list: Room[]) => {
      rooms.value = list
    })

    newSocket.on('roomCreated', (data: { roomId: string | number }) => {
      currentRoomId.value = data.roomId
      gameStatus.value = 'waiting'
      lastEventMessage.value = 'Room créée. En attente d’un adversaire...'
    })

    newSocket.on('gameStarted', (state: GameState) => {
      gameState.value = state
      gameStatus.value = 'playing'
      if (state.roomId) {
        currentRoomId.value = state.roomId
      }
      lastEventMessage.value = 'La partie a commencé !'
      router.push('/game')
    })

    newSocket.on('gameStateUpdated', (state: GameState) => {
      gameState.value = state
      const raw = state as unknown as Record<string, unknown>
      if (typeof raw.lastAction === 'string') {
        lastEventMessage.value = raw.lastAction
      } else if (typeof raw.message === 'string') {
        lastEventMessage.value = raw.message
      }
    })

    newSocket.on('gameEnded', (payload: GameEndPayload) => {
      gameStatus.value = 'ended'
      winner.value = payload.winner
      lastEventMessage.value = payload.reason
        ? `Fin de partie : ${payload.reason}`
        : 'Fin de la partie !'
    })

    newSocket.on('opponentDisconnected', (payload?: { message?: string }) => {
      const msg = payload?.message || 'L’adversaire s’est déconnecté.'
      opponentDisconnectedMessage.value = msg
      lastEventMessage.value = msg
      gameStatus.value = 'ended'
    })

    newSocket.on('error', (err: { message: string } | string) => {
      const msg =
        typeof err === 'string'
          ? err
          : err?.message || 'Une erreur est survenue'
      errorMessage.value = msg
      lastEventMessage.value = msg
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }

  function createRoom(deckId: number) {
    if (!socket.value?.connected) {
      connect()
    }
    isHost.value = true
    selectedDeckId.value = deckId
    socket.value?.emit('createRoom', { deckId })
  }

  function joinRoom(roomId: string | number, deckId: number) {
    if (!socket.value?.connected) {
      connect()
    }
    isHost.value = false
    currentRoomId.value = roomId
    selectedDeckId.value = deckId
    socket.value?.emit('joinRoom', { roomId, deckId })
  }

  function drawCards() {
    if (!currentRoomId.value || !socket.value) return
    socket.value.emit('drawCards', { roomId: currentRoomId.value })
    lastEventMessage.value = 'Vous piochez une carte...'
  }

  function playCard(cardIndex: number) {
    if (!currentRoomId.value || !socket.value) return
    socket.value.emit('playCard', { roomId: currentRoomId.value, cardIndex })
    lastEventMessage.value = `Vous jouez une carte (${cardIndex + 1})...`
  }

  function attack() {
    if (!currentRoomId.value || !socket.value) return
    socket.value.emit('attack', { roomId: currentRoomId.value })
    lastEventMessage.value = 'Vous attaquez la carte adverse !'
  }

  function endTurn() {
    if (!currentRoomId.value || !socket.value) return
    socket.value.emit('endTurn', { roomId: currentRoomId.value })
    lastEventMessage.value = 'Vous terminez votre tour.'
  }

  function resetGame() {
    gameStatus.value = 'idle'
    gameState.value = null
    currentRoomId.value = null
    selectedDeckId.value = null
    winner.value = null
    lastEventMessage.value = ''
    errorMessage.value = null
    opponentDisconnectedMessage.value = null
    isHost.value = false
  }

  return {
    socket,
    isConnected,
    rooms,
    currentRoomId,
    selectedDeckId,
    gameStatus,
    gameState,
    isHost,
    winner,
    lastEventMessage,
    errorMessage,
    opponentDisconnectedMessage,
    playerRole,
    myBoard,
    opponentBoard,
    isMyTurn,
    isVictory,
    connect,
    disconnect,
    fetchRooms,
    createRoom,
    joinRoom,
    drawCards,
    playCard,
    attack,
    endTurn,
    resetGame,
  }
})
