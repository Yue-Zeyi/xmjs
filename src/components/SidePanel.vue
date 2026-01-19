<template>
  <div class="side-panel">
    <div class="stats-box">
      <h2>状态概览</h2>
      <div class="stat-row">
        <label>当前积分</label>
        <span class="value">{{ stats.score }}</span>
      </div>
      <div class="stat-row">
        <label>生存时间</label>
        <span class="value">{{ formatTime(stats.time) }}</span>
      </div>
      <div class="stat-row">
        <label>连击数</label>
        <span class="value">{{ stats.combo }}</span>
      </div>
      <div class="stat-row">
        <label>手速 (WPM)</label>
        <span class="value">{{ stats.wpm || 0 }}</span>
      </div>
    </div>

    <div class="log-box">
      <h2>战斗日志</h2>
      <div class="log-list">
        <div v-for="log in logs" :key="log.id" :class="['log-entry', log.type]">
          <span class="time">[{{ formatLogTime(log.timestamp) }}]</span>
          <span class="msg">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { GameStats, CombatLog } from '../game/Engine';

const props = defineProps<{
  stats: GameStats;
  feedback: string | null;
  logs: CombatLog[];
}>();

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const formatLogTime = (ts: number) => {
  const date = new Date(ts);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.side-panel {
  width: 20%;
  height: 100%;
  background: #1a1a1a;
  border-left: 2px solid #333;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  color: #fff;
}

h2 {
  font-size: 18px;
  color: #888;
  border-bottom: 1px solid #444;
  padding-bottom: 5px;
  margin-top: 0;
}

.stats-box, .keyboard-box, .log-box {
  margin-bottom: 30px;
}

.log-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* Scrollbar styling */
.log-list::-webkit-scrollbar {
  width: 5px;
}
.log-list::-webkit-scrollbar-track {
  background: #222;
}
.log-list::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 2px;
}

.log-entry {
  display: flex;
  gap: 5px;
  padding: 2px 0;
  border-bottom: 1px solid #222;
}

.log-entry.kill { color: #2ecc71; }
.log-entry.miss { color: #e74c3c; }
.log-entry.damage { color: #ff0000; font-weight: bold; }
.log-entry.info { color: #3498db; }

.time {
  color: #666;
  font-size: 0.9em;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
  font-size: 20px;
}

.stat-row .value {
  color: #2ecc71;
  font-weight: bold;
}

.posture-feedback {
  margin-top: 20px;
}

.bar {
  background: #333;
  height: 20px;
  margin-bottom: 10px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.fill {
  background: #3498db;
  height: 100%;
}

.bar span {
  position: absolute;
  top: 0;
  left: 5px;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}
</style>
