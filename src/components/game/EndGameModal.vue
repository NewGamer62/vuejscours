<template>
  <!-- RG8 : Modal fin de partie automatique avec résultat -->
  <NModal
    :show="show"
    :mask-closable="false"
    :close-on-esc="false"
    preset="card"
    class="end-game-modal"
    style="max-width: 480px; width: 90%"
    :title="isVictory ? '🎉 Victoire !' : '💔 Défaite'"
  >
    <div class="modal-content">
      <div
        class="result-icon-wrapper"
        :class="isVictory ? 'victory' : 'defeat'"
      >
        <span class="result-icon">{{ isVictory ? '🏆' : '💀' }}</span>
      </div>

      <div class="result-text-group">
        <h2
          class="result-title"
          :class="isVictory ? 'victory-title' : 'defeat-title'"
        >
          {{
            isVictory
              ? 'Félicitations, vous remportez le duel !'
              : 'Vous avez été vaincu cette fois-ci...'
          }}
        </h2>

        <p v-if="reason" class="result-reason">
          {{ reason }}
        </p>

        <p class="result-summary">
          {{
            isVictory
              ? 'Votre stratégie a porté ses fruits. Vous avez atteint les 3 KOs ou éliminé la menace adverse.'
              : 'Ne baissez pas les bras, adaptez votre deck et retentez votre chance !'
          }}
        </p>
      </div>

      <!-- RG9 : Bouton retour au lobby -->
      <div class="modal-actions">
        <NButton
          type="primary"
          size="large"
          class="return-button"
          @click="emit('leave')"
        >
          🏠 Retourner au lobby
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  isVictory?: boolean
  reason?: string
}

withDefaults(defineProps<Props>(), {
  isVictory: false,
  reason: '',
})

const emit = defineEmits<(e: 'leave') => void>()
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 8px;
  gap: 16px;
}

.result-icon-wrapper {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46px;
}

.result-icon-wrapper.victory {
  background: #edfcf2;
  border: 3px solid #18a058;
}

.result-icon-wrapper.defeat {
  background: #fdf1f3;
  border: 3px solid #d03050;
}

.result-text-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.victory-title {
  color: #18a058;
}

.defeat-title {
  color: #d03050;
}

.result-reason {
  margin: 0;
  font-weight: 600;
  color: #555555;
  font-size: 14px;
}

.result-summary {
  margin: 0;
  font-size: 13px;
  color: #777777;
  line-height: 1.5;
}

.modal-actions {
  width: 100%;
  margin-top: 8px;
}

.return-button {
  width: 100%;
}
</style>
