<template>
  <div class="home-page">
    <!-- RG5 : Le composant de liste des decks est intégré sur la page d'accueil -->
    <DeckList />
  </div>
</template>

<script setup lang="ts">
import DeckList from '@/components/decks/DeckList.vue'
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
