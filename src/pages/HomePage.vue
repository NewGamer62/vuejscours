<template>
  <div class="home-page">
    <!-- RG6 (Ticket 3) : Le composant lobby est intégré sur la page d'accueil -->
    <GameLobby />

    <!-- RG5 (Ticket 2) : Le composant de liste des decks est intégré sur la page d'accueil -->
    <DeckList />
  </div>
</template>

<script setup lang="ts">
import DeckList from '@/components/decks/DeckList.vue'
import GameLobby from '@/components/game/GameLobby.vue'
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
