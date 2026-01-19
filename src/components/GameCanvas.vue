<template>
  <div class="game-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { gameEngine } from '../game/Engine';

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvas.value) {
    gameEngine.init(canvas.value);
  }
});

onUnmounted(() => {
  gameEngine.stop();
});
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center; /* Center the canvas */
  align-items: center;
  background: #111;
}

canvas {
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  background: #222;
}
</style>
