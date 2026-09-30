<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout class="app-layout">
        <HeaderBar />
        <NLayoutContent class="app-content">
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import HeaderBar from './components/layout/HeaderBar.vue'
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

.app-layout {
  min-height: 100vh;
}

.app-content {
  padding: 12px 16px;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .app-content {
    padding: 16px 20px;
  }
}

@media (min-width: 1024px) {
  .app-content {
    padding: 20px 24px;
  }
}
</style>
