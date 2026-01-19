<template>
  <div class="menu">
    <h1 class="title">僵尸打字员</h1>
    <div class="subtitle">PC 纯净版</div>
    
    <div class="controls">
      <button @click="$emit('start', 'survival')">开始生存挑战</button>
      
      <div class="practice-box">
        <h3>练习模式设置</h3>
        <div class="speed-control">
          <label>僵尸速度: {{ speedText }} ({{ speed }}s)</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="0.5" 
            v-model.number="speed"
            class="slider"
          >
        </div>
        <button @click="$emit('start', 'practice', speed)">开始练习模式</button>
      </div>
    </div>

    <div class="tips">
      <p>使用键盘按键进行射击</p>
      <p>按 ESC 暂停</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

defineEmits(['start']);

const speed = ref(5);

const speedText = computed(() => {
  if (speed.value <= 2) return '疯狂';
  if (speed.value <= 4) return '快速';
  if (speed.value <= 6) return '中等';
  if (speed.value <= 8) return '缓慢';
  return '散步';
});
</script>

<style scoped>
.menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
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
  text-shadow: 4px 4px 0 #000;
  margin: 0;
  font-family: 'Impact', sans-serif;
  letter-spacing: 5px;
}

.subtitle {
  font-size: 24px;
  color: #aaa;
  margin-bottom: 50px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 300px; /* Fixed width for alignment */
}

.practice-box {
  background: #222;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #444;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  width: 100%;
  box-sizing: border-box; /* Include padding in width */
}

.practice-box h3 {
  margin: 0;
  font-size: 18px;
  color: #ccc;
}

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  align-items: center;
}

.slider {
  width: 100%;
  cursor: pointer;
}

button {
  font-size: 24px;
  padding: 15px 0; /* Use 0 horizontal padding and let width control it */
  background: #333;
  color: #fff;
  border: 2px solid #555;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box; /* Include border in width */
}

button:hover:not(:disabled) {
  background: #e74c3c;
  border-color: #e74c3c;
  transform: scale(1.05);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tips {
  margin-top: 50px;
  text-align: center;
  color: #666;
}
</style>
