<template>
  <div class="keyboard-container">
    <!-- Static Hand Overlay with Highlights -->
    <div class="hands-display">
      <!-- Left Hand -->
      <svg class="hand left-hand" viewBox="0 0 100 100">
        <path d="M30,90 Q50,100 70,90 L70,70 L30,70 Z" fill="#444" opacity="0.5"/>
        <rect x="10" y="30" width="12" height="40" rx="6" fill="#c0392b" :class="{ active: activeFinger === 'l-pinky' }"/>
        <rect x="28" y="20" width="12" height="50" rx="6" fill="#d35400" :class="{ active: activeFinger === 'l-ring' }"/>
        <rect x="46" y="15" width="12" height="55" rx="6" fill="#f39c12" :class="{ active: activeFinger === 'l-middle' }"/>
        <rect x="64" y="20" width="12" height="50" rx="6" fill="#27ae60" :class="{ active: activeFinger === 'l-index' }"/>
        <rect x="82" y="50" width="12" height="35" rx="6" fill="#7f8c8d" transform="rotate(-20 82 50)" :class="{ active: activeFinger === 'thumb' }"/>
      </svg>
      
      <!-- Right Hand -->
      <svg class="hand right-hand" viewBox="0 0 100 100">
        <path d="M30,90 Q50,100 70,90 L70,70 L30,70 Z" fill="#444" opacity="0.5"/>
        <rect x="8" y="50" width="12" height="35" rx="6" fill="#7f8c8d" transform="rotate(20 8 50)" :class="{ active: activeFinger === 'thumb' }"/>
        <rect x="24" y="20" width="12" height="50" rx="6" fill="#2980b9" :class="{ active: activeFinger === 'r-index' }"/>
        <rect x="42" y="15" width="12" height="55" rx="6" fill="#8e44ad" :class="{ active: activeFinger === 'r-middle' }"/>
        <rect x="60" y="20" width="12" height="50" rx="6" fill="#c0392b" :class="{ active: activeFinger === 'r-ring' }"/>
        <rect x="78" y="30" width="12" height="40" rx="6" fill="#e74c3c" :class="{ active: activeFinger === 'r-pinky' }"/>
      </svg>
    </div>

    <div class="keyboard">
      <div class="row" v-for="(row, rIndex) in rows" :key="rIndex">
        <div 
          v-for="key in row" 
          :key="key.code"
          :class="['key', key.finger, { active: isActive(key), target: isTarget(key) }]"
          :style="{ width: (key.width || 1) * 3.4 + 'em' }"
        >
          <span class="main">{{ key.main }}</span>
          <span v-if="key.shift" class="shift">{{ key.shift }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps<{
  activeKey: string | null;
  targetKey: string | null; // The key the user SHOULD press (hint)
}>();

// --- Hand Positioning Logic ---

// Base styling unit
const KEY_SIZE = 3.4; // em (width scaling factor)
const KEY_HEIGHT = 3.2; // em
const ROW_GAP = 0.375; // em (6px)
const KEY_GAP = 0.375; // em

// Resting Positions (F and J)
// F: Row 2 (index 2), Index 4.
// J: Row 2 (index 2), Index 7.
// We need to calculate these dynamically or hardcode 'em' values.

// Helper to get key position
const getKeyPosition = (targetCode: string) => {
  // Calculate max row width for centering logic
  const rowWidths = rows.map(row => 
    row.reduce((acc, key) => acc + (key.width || 1) * KEY_SIZE, 0) + (row.length - 1) * KEY_GAP
  );
  const maxWidth = Math.max(...rowWidths);
  const PADDING_TOP = 15 / 16; // 15px -> approx 0.9375em
  const PADDING_LEFT = 15 / 16; 

  let y = PADDING_TOP;
  
  for (let r = 0; r < rows.length; r++) {
    // Start x with offset for centered row
    let x = PADDING_LEFT + (maxWidth - rowWidths[r]) / 2;
    
    for (let k = 0; k < rows[r].length; k++) {
      const key = rows[r][k];
      const w = (key.width || 1) * KEY_SIZE;
      
      if (key.code === targetCode || key.main === targetCode || key.shift === targetCode) {
        return {
          x: x + w / 2,
          y: y + KEY_HEIGHT / 2,
          finger: key.finger
        };
      }
      x += w + KEY_GAP;
    }
    y += KEY_HEIGHT + ROW_GAP;
  }
  return null;
};

// Hand Offsets (Where the "Hand Center" is relative to the "Active Finger")
// Assuming SVG is 100x100 viewbox, and scaled to be approx 5em x 5em on screen.
// Left Hand: Index finger is at approx 70, 20 (in 100x100).
// Right Hand: Index finger is at approx 30, 20.
// Let's approximate: The hand should center its index finger on the key.

const activeFinger = computed(() => {
  if (!props.targetKey) return null;
  const pos = getKeyPosition(props.targetKey.toUpperCase());
  if (!pos) {
      // Try finding by char if code fail (e.g. for symbols)
      // Actually rows use codes mostly.
      // Let's assume passed targetKey is a char.
      // We need to find the key object by char.
      for (const row of rows) {
          for (const key of row) {
              if (key.main === props.targetKey.toUpperCase() || key.shift === props.targetKey) {
                  return key.finger;
              }
          }
      }
  }
  return pos ? pos.finger : null;
});
// Simple check
const isActive = (key: KeyDef) => {
  if (!props.activeKey) return false;
  return props.activeKey.toUpperCase() === key.main || props.activeKey === key.shift;
};

const isTarget = (key: KeyDef) => {
  if (!props.targetKey) return false;
  return props.targetKey.toUpperCase() === key.main || props.targetKey === key.shift;
};

interface KeyDef {
  main: string;
  shift?: string;
  code: string;
  width?: number;
  finger: string;
}

const rows: KeyDef[][] = [
  // Row 1
  [
    { main: '`', shift: '~', code: 'Backquote', finger: 'l-pinky' },
    { main: '1', shift: '!', code: 'Digit1', finger: 'l-pinky' },
    { main: '2', shift: '@', code: 'Digit2', finger: 'l-ring' },
    { main: '3', shift: '#', code: 'Digit3', finger: 'l-middle' },
    { main: '4', shift: '$', code: 'Digit4', finger: 'l-index' },
    { main: '5', shift: '%', code: 'Digit5', finger: 'l-index' },
    { main: '6', shift: '^', code: 'Digit6', finger: 'r-index' },
    { main: '7', shift: '&', code: 'Digit7', finger: 'r-index' },
    { main: '8', shift: '*', code: 'Digit8', finger: 'r-middle' },
    { main: '9', shift: '(', code: 'Digit9', finger: 'r-ring' },
    { main: '0', shift: ')', code: 'Digit0', finger: 'r-pinky' },
    { main: '-', shift: '_', code: 'Minus', finger: 'r-pinky' },
    { main: '=', shift: '+', code: 'Equal', finger: 'r-pinky' },
    { main: 'Backspace', code: 'Backspace', width: 2, finger: 'r-pinky' },
  ],
  // Row 2
  [
    { main: 'Tab', code: 'Tab', width: 1.5, finger: 'l-pinky' },
    { main: 'Q', code: 'KeyQ', finger: 'l-pinky' },
    { main: 'W', code: 'KeyW', finger: 'l-ring' },
    { main: 'E', code: 'KeyE', finger: 'l-middle' },
    { main: 'R', code: 'KeyR', finger: 'l-index' },
    { main: 'T', code: 'KeyT', finger: 'l-index' },
    { main: 'Y', code: 'KeyY', finger: 'r-index' },
    { main: 'U', code: 'KeyU', finger: 'r-index' },
    { main: 'I', code: 'KeyI', finger: 'r-middle' },
    { main: 'O', code: 'KeyO', finger: 'r-ring' },
    { main: 'P', code: 'KeyP', finger: 'r-pinky' },
    { main: '[', shift: '{', code: 'BracketLeft', finger: 'r-pinky' },
    { main: ']', shift: '}', code: 'BracketRight', finger: 'r-pinky' },
    { main: '\\', shift: '|', code: 'Backslash', width: 1.5, finger: 'r-pinky' },
  ],
  // Row 3
  [
    { main: 'Caps', code: 'CapsLock', width: 1.75, finger: 'l-pinky' },
    { main: 'A', code: 'KeyA', finger: 'l-pinky' },
    { main: 'S', code: 'KeyS', finger: 'l-ring' },
    { main: 'D', code: 'KeyD', finger: 'l-middle' },
    { main: 'F', code: 'KeyF', finger: 'l-index' },
    { main: 'G', code: 'KeyG', finger: 'l-index' },
    { main: 'H', code: 'KeyH', finger: 'r-index' },
    { main: 'J', code: 'KeyJ', finger: 'r-index' },
    { main: 'K', code: 'KeyK', finger: 'r-middle' },
    { main: 'L', code: 'KeyL', finger: 'r-ring' },
    { main: ';', shift: ':', code: 'Semicolon', finger: 'r-pinky' },
    { main: '\'', shift: '"', code: 'Quote', finger: 'r-pinky' },
    { main: 'Enter', code: 'Enter', width: 2.25, finger: 'r-pinky' },
  ],
  // Row 4
  [
    { main: 'Shift', code: 'ShiftLeft', width: 2.25, finger: 'l-pinky' },
    { main: 'Z', code: 'KeyZ', finger: 'l-pinky' },
    { main: 'X', code: 'KeyX', finger: 'l-ring' },
    { main: 'C', code: 'KeyC', finger: 'l-middle' },
    { main: 'V', code: 'KeyV', finger: 'l-index' },
    { main: 'B', code: 'KeyB', finger: 'l-index' },
    { main: 'N', code: 'KeyN', finger: 'r-index' },
    { main: 'M', code: 'KeyM', finger: 'r-index' },
    { main: ',', shift: '<', code: 'Comma', finger: 'r-middle' },
    { main: '.', shift: '>', code: 'Period', finger: 'r-ring' },
    { main: '/', shift: '?', code: 'Slash', finger: 'r-pinky' },
    { main: 'Shift', code: 'ShiftRight', width: 2.75, finger: 'r-pinky' },
  ],
  // Row 5
  [
    { main: 'Space', code: 'Space', width: 6.25, finger: 'thumb' }
  ]
];
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #222;
  padding: 15px;
  border-radius: 12px;
  width: fit-content;
  margin: 0 auto;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  border: 1px solid #333;
  position: relative;
}

.row {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.key {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 3.2em;
  height: 3.2em;
  background: #333;
  color: #ccc;
  border-radius: 6px;
  position: relative;
  
  /* 3D Key Effect */
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 4px solid #111;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.05s ease-out;
  cursor: default;
  user-select: none;
}

.key.active {
  transform: translateY(3px);
  border-bottom-width: 1px;
  background: #555;
  color: #fff;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
}

.key.target {
  border-color: #f1c40f;
  box-shadow: 0 0 15px rgba(241, 196, 15, 0.4);
  background: #444;
  color: #fff;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 10px rgba(241, 196, 15, 0.4); }
  50% { box-shadow: 0 0 20px rgba(241, 196, 15, 0.8); }
  100% { box-shadow: 0 0 10px rgba(241, 196, 15, 0.4); }
}

.main {
  font-weight: 600;
  font-size: 1.1em;
  font-family: 'Courier New', monospace;
}

.shift {
  font-size: 0.7em;
  position: absolute;
  top: 4px;
  left: 6px;
  color: #777;
}

/* Finger Colors (Vibrant but Dark for Gaming) */
/* Bottom border color overrides */
.l-pinky { border-bottom-color: #c0392b; }
.l-ring { border-bottom-color: #d35400; }
.l-middle { border-bottom-color: #f39c12; }
.l-index { border-bottom-color: #27ae60; }
.r-index { border-bottom-color: #2980b9; }
.r-middle { border-bottom-color: #8e44ad; }
.r-ring { border-bottom-color: #c0392b; }
.r-pinky { border-bottom-color: #e74c3c; }
.thumb { border-bottom-color: #7f8c8d; }

/* Active State Colors */
  .key.active.l-pinky { background: #c0392b; border-bottom-color: #922b21; }
  .key.active.l-ring { background: #d35400; border-bottom-color: #a04000; }
  .key.active.l-middle { background: #f39c12; border-bottom-color: #b7750b; }
  .key.active.l-index { background: #27ae60; border-bottom-color: #1e8449; }
  .key.active.r-index { background: #2980b9; border-bottom-color: #1f618d; }
  .key.active.r-middle { background: #8e44ad; border-bottom-color: #6c3483; }
  .key.active.r-ring { background: #c0392b; border-bottom-color: #922b21; }
  .key.active.r-pinky { background: #e74c3c; border-bottom-color: #b03a2e; }
  .key.active.thumb { background: #95a5a6; border-bottom-color: #717d7e; }
  
  /* Hand Overlay Styles */
  .keyboard-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0px;
    width: 100%;
  }

  .hands-display {
    display: flex;
    justify-content: center;
    gap: 100px; /* Space between hands */
    height: 120px; /* Fixed height for hands */
    width: 100%;
  }
  
  .hand {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));
  }
  
  .hand rect {
    transition: fill 0.1s;
  }
  
  .hand rect.active {
    fill: #fff !important; /* Highlight active finger */
    filter: drop-shadow(0 0 5px #fff);
  }
  </style>
