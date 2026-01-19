<template>
  <div class="bottom-panel">
    <div class="keyboard-section">
      <VirtualKeyboard 
        :active-key="lastInput" 
        :target-key="currentTarget" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import { Zombie } from '../game/Zombie';

const props = defineProps<{
  lastInput: string | null;
  zombies: Zombie[];
}>();

const currentTarget = computed(() => {
  if (props.zombies.length === 0) return null;
  const sorted = [...props.zombies].sort((a, b) => a.x - b.x);
  return sorted[0].char;
});
</script>

<style scoped>
.bottom-panel {
  width: 100%;
  height: 35vh; /* Takes up bottom 35% */
  background: #151515;
  border-top: 2px solid #333;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
}

.keyboard-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}
</style>
