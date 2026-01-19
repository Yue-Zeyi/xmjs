<template>
  <div class="hud">
    <div class="stat-panel">
      <div class="stat">积分: {{ stats.score }}</div>
      <div class="stat">时间: {{ formatTime(stats.time) }}</div>
      <div class="stat">连击: {{ stats.combo }} <span v-if="stats.combo > 10" class="fire">🔥</span></div>
      <div class="stat">生命: {{ stats.lives }}</div>
    </div>
    
    <div class="feedback" v-if="feedback">
      <div :class="['msg', feedback]">{{ feedback === 'hit' ? '命中!' : '失误!' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { GameStats } from '../game/Engine';

defineProps<{
  stats: GameStats;
  feedback: string | null;
}>();

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
}

.stat-panel {
  display: flex;
  gap: 20px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 24px;
  color: #fff;
  text-shadow: 2px 2px 0 #000;
}

.fire {
  animation: flicker 0.5s infinite;
}

@keyframes flicker {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

.feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.msg {
  font-size: 48px;
  font-weight: bold;
  animation: pop 0.2s ease-out;
}

.hit { color: #2ecc71; text-shadow: 0 0 10px #2ecc71; }
.miss { color: #e74c3c; text-shadow: 0 0 10px #e74c3c; }

@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
