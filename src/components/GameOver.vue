<template>
  <div class="game-over">
    <h1 class="title">游戏结束</h1>
    
    <div class="stats">
      <div class="row">
        <span>最高积分</span>
        <span>{{ stats.maxScore }}</span>
      </div>
      <div class="row">
        <span>生存时间</span>
        <span>{{ formatTime(stats.time) }}</span>
      </div>
      <div class="row">
        <span>最大连击</span>
        <span>{{ stats.maxCombo }}</span>
      </div>
      <div class="row">
        <span>消灭数量</span>
        <span>{{ stats.zombiesKilled }}</span>
      </div>
    </div>

    <div class="controls">
      <button @click="$emit('restart')">再次挑战</button>
      <button @click="$emit('menu')">返回主菜单</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { GameStats } from '../game/Engine';

defineProps<{
  stats: GameStats;
}>();

defineEmits(['restart', 'menu']);

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.game-over {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 100;
}

.title {
  font-size: 80px;
  color: #e74c3c;
  margin-bottom: 40px;
}

.stats {
  width: 400px;
  background: #222;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 40px;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 24px;
  margin-bottom: 10px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.row:last-child {
  border-bottom: none;
}

.controls {
  display: flex;
  gap: 20px;
}

button {
  font-size: 24px;
  padding: 15px 40px;
  background: #333;
  color: #fff;
  border: 2px solid #555;
  cursor: pointer;
}

button:hover {
  background: #fff;
  color: #000;
}
</style>
