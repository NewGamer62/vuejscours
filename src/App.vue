<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout>
        <HeaderBar />
        <NLayoutContent>
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
  padding: 0 20px;
}
</style>
