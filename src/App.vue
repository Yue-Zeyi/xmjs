<template>
  <div id="app">
    <MainMenu 
      v-if="state.status === 'menu'" 
      @start="startGame" 
    />
    
    <GameOver 
      v-if="state.status === 'gameover'" 
      :stats="state.stats" 
      @restart="startGame" 
      @menu="toMenu" 
    />

    <div class="main-layout">
      <div class="top-section">
        <div class="game-area">
          <GameCanvas />
          <!-- Pause Overlay -->
          <div v-if="state.status === 'paused'" class="pause-overlay">
            <div class="pause-menu">
              <h1 class="pause-title">暂停中</h1>
              <div class="pause-controls">
                <button @click="resumeGame">继续游戏 (ESC)</button>
                <button @click="startGame">重新开始</button>
                <button @click="toMenu">返回主菜单</button>
              </div>
            </div>
          </div>
        </div>
        
        <SidePanel 
          :stats="state.stats" 
          :feedback="state.inputFeedback"
          :logs="state.logs"
        />
      </div>

      <BottomPanel 
        :last-input="state.lastInput"
        :zombies="state.zombies"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { gameEngine } from './game/Engine';
import GameCanvas from './components/GameCanvas.vue';
import SidePanel from './components/SidePanel.vue';
import MainMenu from './components/MainMenu.vue';
import GameOver from './components/GameOver.vue';
import BottomPanel from './components/BottomPanel.vue';

const state = gameEngine.state;

const startGame = (mode: 'survival' | 'practice' = 'survival', speed?: number) => {
  gameEngine.start(mode, speed);
};

const resumeGame = () => {
  gameEngine.pause();
};

const toMenu = () => {
  gameEngine.stop();
};
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.top-section {
  display: flex;
  width: 100%;
  height: 65%; /* 65% height for game + side panel */
}

.game-area {
  width: 80%;
  height: 100%;
  position: relative;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 100;
}

.pause-menu {
  background: #222;
  padding: 40px;
  border-radius: 10px;
  border: 2px solid #444;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.pause-title {
  font-size: 40px;
  margin: 0 0 30px 0;
  color: #fff;
}

.pause-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pause-controls button {
  font-size: 18px;
  padding: 12px 30px;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.pause-controls button:hover {
  background: #e74c3c;
  border-color: #e74c3c;
  transform: scale(1.05);
}
</style>
