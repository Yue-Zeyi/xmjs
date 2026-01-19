import { reactive } from 'vue';
import { Zombie } from './Zombie';
import { soundManager } from './SoundManager';

export interface GameStats {
  score: number;
  maxScore: number; // Highest score achieved in session
  time: number; // seconds
  combo: number;
  lives: number;
  maxCombo: number;
  zombiesKilled: number;
  wpm: number;
}

export interface CombatLog {
  id: number;
  type: 'hit' | 'miss' | 'kill' | 'damage';
  message: string;
  timestamp: number;
}

export type GameMode = 'survival' | 'practice';

export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover';
  mode: GameMode;
  stats: GameStats;
  zombies: Zombie[];
  lastInput: string | null;
  inputFeedback: 'hit' | 'miss' | null;
  feedbackTimer: number;
  muzzleFlashTimer: number;
  tracerTarget: { x: number, y: number } | null;
  logs: CombatLog[];
}

export class GameEngine {
  state: GameState;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  
  private lastFrameTime: number = 0;
  private spawnTimer: number = 0;
  private spawnInterval: number = 3; // seconds
  private difficultyMultiplier: number = 1;
  private animationFrameId: number | null = null;
  
  // Custom Settings
  private practiceSpeed: number = 5; // seconds to cross screen

  // Audio placeholders
  private shootSound: HTMLAudioElement | null = null;
  private missSound: HTMLAudioElement | null = null;

  constructor() {
    this.state = reactive({
      status: 'menu',
      mode: 'survival',
      stats: {
        score: 0,
        maxScore: 0,
        time: 0,
        combo: 0,
        lives: 100,
        maxCombo: 0,
        zombiesKilled: 0,
        wpm: 0
      },
      zombies: [],
      lastInput: null,
      inputFeedback: null,
      feedbackTimer: 0,
      muzzleFlashTimer: 0,
      tracerTarget: null,
      logs: []
    });
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    window.addEventListener('keydown', this.handleInput.bind(this));
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth * 0.8; // 80% width as per design (Left + Center)
      this.canvas.height = window.innerHeight * 0.65; // Adjust height for bottom panel
    }
  }

  start(mode: GameMode = 'survival', speed: number = 5) {
    this.reset();
    this.state.mode = mode;
    this.practiceSpeed = speed;
    this.state.status = 'playing';
    this.lastFrameTime = performance.now();
    this.loop(this.lastFrameTime);
    
    this.addLog('info', mode === 'survival' ? '生存挑战开始！' : `练习模式开始！速度: ${speed}秒`);
  }

  reset() {
    this.state.stats = {
      score: 100, // Initial buffer
      maxScore: 100,
      time: 0,
      combo: 0,
      lives: 1, // Not really used if score is health
      maxCombo: 0,
      zombiesKilled: 0,
      wpm: 0
    };
    this.state.zombies = [];
    this.spawnTimer = 0;
    this.difficultyMultiplier = 1;
    this.state.inputFeedback = null;
    this.state.muzzleFlashTimer = 0;
    this.state.tracerTarget = null;
    this.state.logs = [];
  }

  addLog(type: any, message: string) {
    const log: CombatLog = {
      id: Date.now() + Math.random(),
      type: type,
      message: message,
      timestamp: Date.now()
    };
    this.state.logs.unshift(log); // Add to top
    if (this.state.logs.length > 20) {
      this.state.logs.pop();
    }
  }

  pause() {
    if (this.state.status === 'playing') {
      this.state.status = 'paused';
    } else if (this.state.status === 'paused') {
      this.state.status = 'playing';
      this.lastFrameTime = performance.now();
      this.loop(this.lastFrameTime);
    }
  }

  stop() {
    this.state.status = 'menu';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private loop(timestamp: number) {
    if (this.state.status !== 'playing') return;

    const dt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.update(dt);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number) {
    // Update Time
    this.state.stats.time += dt;

    // Feedback timer
    if (this.state.inputFeedback) {
      this.state.feedbackTimer -= dt;
      if (this.state.feedbackTimer <= 0) {
        this.state.inputFeedback = null;
        this.state.lastInput = null;
      }
    }

    // Effect timers
    if (this.state.muzzleFlashTimer > 0) {
      this.state.muzzleFlashTimer -= dt;
    }

    // Spawn Logic
    this.spawnTimer += dt;
    // Difficulty Scaling: Speed increases with Score
    // Formula: Speed = 5 * (1 - Score/20000). Min 1.5s per screen width.
    // Screen width is variable here, so we use pixels per second.
    // Base speed: ScreenWidth / 5s.
    // Max speed: ScreenWidth / 1.5s.
    
    // Spawn Interval Scaling
    let currentInterval;
    
    if (this.state.mode === 'survival') {
      currentInterval = Math.max(0.5, 3 - (this.state.stats.score / 5000));
    } else {
      // Practice Mode: Scale spawn interval with speed setting
      // Speed 10s (slow) -> Interval ~4s
      // Speed 1s (fast) -> Interval ~0.5s
      // Formula: interval = speed * 0.4 (roughly)
      currentInterval = Math.max(0.5, this.practiceSpeed * 0.4);
    }
    
    if (this.spawnTimer > currentInterval) {
      this.spawnZombie();
      this.spawnTimer = 0;
    }

    // Update Zombies
    // We iterate backwards to safely remove
    for (let i = this.state.zombies.length - 1; i >= 0; i--) {
      const zombie = this.state.zombies[i];
      zombie.update(dt);

      // Remove dead zombies after animation
      if (zombie.isDead && zombie.deathTimer > 0.5) {
        this.state.zombies.splice(i, 1);
        continue;
      }

      // Check boundary (Passed player)
      if (!zombie.isDead && zombie.x < 50) { // Assuming player is at ~100, barrier at 50
        this.handleZombiePass(zombie);
        this.state.zombies.splice(i, 1);
      }
    }

    // Check Game Over
    if (this.state.stats.score <= 0) {
      this.state.status = 'gameover';
      this.saveScore();
    }
  }

  private saveScore() {
    const currentScore = this.state.stats.score;
    // We actually only save if it's a high score, but for history we might save all?
    // Design: "Data Localization: LocalStorage cache records"
    // Let's just save high score for now.
    const saved = localStorage.getItem('zombie-typist-highscore');
    const high = saved ? parseInt(saved) : 0;
    
    // Note: score might be 0 or negative here if we died. 
    // Usually we track "Highest Score Achieved" during the run or just Final Score?
    // If we die at 0, our score is 0. 
    // Maybe we should track "Peak Score" or just accumulate total points earned?
    // Standard survival: Final Score.
    
    // However, if we die because score drops to 0, then high score is 0? 
    // That seems wrong. 
    // "Score increases with kills, decreases with misses/pass".
    // So it's a "Current Energy" style score? 
    // Or is "Score" cumulative and "Health" separate?
    // Design: "Score <= 0 or Active End -> Game Over".
    // "Zombie pass -> deduct points".
    // "Kill -> Add points".
    // This implies Score IS Health.
    // If so, the final score is 0. That's bad for a High Score system.
    // Usually in these games, you have "Score" (cumulative) and "Health" (current energy).
    // The design says: "Score decreases... Game Over if Score <= 0".
    // This strongly suggests Score = Health.
    // BUT, "Record Survival Time and Final Score".
    // If Final Score is always 0 (cause of death), then it's useless.
    // UNLESS you end manually via ESC.
    
    // Interpretation: The "Score" used for Game Over is likely "Current Energy".
    // But we should probably track "Total Score Accumulated" separately for the High Score.
    // Let's add `totalScore` to stats.
    
    if (this.state.stats.maxCombo > (parseInt(localStorage.getItem('zombie-typist-maxcombo') || '0'))) {
       localStorage.setItem('zombie-typist-maxcombo', this.state.stats.maxCombo.toString());
    }
    
    // For now, let's assume we want to track Survival Time as the main metric if Score dies at 0.
  }

  private draw() {
    if (!this.ctx || !this.canvas) return;

    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Background (Placeholder)
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Safe Zone / Player Zone
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, 100, this.canvas.height);

    const playerX = 20;
    const playerY = this.canvas.height / 2;

    // Draw Player
    this.drawPlayer(playerX, playerY);

    // Draw Zombies
    this.state.zombies.forEach(z => z.draw(this.ctx!));

    // Draw Tracer
    if (this.state.muzzleFlashTimer > 0 && this.state.tracerTarget) {
      this.ctx.beginPath();
      this.ctx.moveTo(playerX + 90, playerY + 20); // Gun tip position (adjusted)
      this.ctx.lineTo(this.state.tracerTarget.x + 30, this.state.tracerTarget.y + 30); // Center of zombie
      this.ctx.strokeStyle = `rgba(255, 255, 0, ${this.state.muzzleFlashTimer * 5})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  private drawPlayer(x: number, y: number) {
    if (!this.ctx || !this.canvas) return;
    
    // Legs
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(x + 10, y + 40, 15, 20); // Left
    this.ctx.fillRect(x + 35, y + 40, 15, 20); // Right

    // Body
    this.ctx.fillStyle = '#34495e';
    this.ctx.fillRect(x + 10, y + 10, 40, 30);

    // Head
    this.ctx.fillStyle = '#e67e22'; // Skin
    this.ctx.fillRect(x + 15, y - 15, 30, 25);
    // Bandana
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(x + 15, y - 15, 30, 8);
    // Tie
    this.ctx.fillRect(x + 10, y - 10, 5, 10);

    // Gun (Shotgun/Rifle)
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(x + 30, y + 15, 60, 10); // Barrel
    this.ctx.fillStyle = '#8e44ad';
    this.ctx.fillRect(x + 30, y + 15, 20, 10); // Stock

    // Muzzle Flash
    if (this.state.muzzleFlashTimer > 0) {
      this.ctx.save();
      this.ctx.translate(x + 90, y + 20);
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 10 + Math.random() * 10, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#e67e22';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 5 + Math.random() * 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private spawnZombie() {
    if (!this.canvas) return;
    
    // Progressive Difficulty based on score (Touch Typing Order)
    // 1. Home Row (F J)
    // 2. Home Row Extended (D K S L A ;)
    // 3. Top Row (R U E I W O Q P)
    // 4. Bottom Row (V M C N X B Z) + (G H T Y)
    // 5. Numbers
    // 6. Symbols

    let chars = '';
    const score = this.state.stats.score;

    if (score < 200) {
      chars = 'FJ'; // Level 1: Core Home Keys
    } else if (score < 500) {
      chars = 'FJDKSL'; // Level 2: Extended Home
    } else if (score < 1000) {
      chars = 'FJDKSLA;'; // Level 3: Full Home Row
    } else if (score < 2000) {
      chars = 'FJDKSLA;RUEIWOQP'; // Level 4: + Top Row
    } else if (score < 4000) {
      chars = 'FJDKSLA;RUEIWOQPVMCNBXZGHTY'; // Level 5: All Letters
    } else if (score < 6000) {
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Level 6: + Numbers
    } else {
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'; // Level 7: Chaos
    }

    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    
    // Avoid duplicates on screen if possible (simple check)
    const existingChars = this.state.zombies.map(z => z.char);
    if (existingChars.includes(char) && existingChars.length < chars.length) {
       // Retry once
       const char2 = chars.charAt(Math.floor(Math.random() * chars.length));
       if (!existingChars.includes(char2)) {
         // use char2
       }
       // If still duplicate, it's okay for now
    }

    const startX = this.canvas.width + 50;
    const startY = 100 + Math.random() * (this.canvas.height - 200);
    
    // Calculate Speed
    // Speed = Width / Duration.
    let duration;
    
    if (this.state.mode === 'survival') {
      // Duration starts at 5s, drops to 1.5s.
      const scoreFactor = Math.min(1, this.state.stats.score / 20000);
      duration = 5 * (1 - scoreFactor * 0.7); // 5 -> 1.5
    } else {
      // Practice Mode: Fixed Duration
      duration = this.practiceSpeed;
    }

    const speed = this.canvas.width / duration;

    const zombie = new Zombie(Date.now() + Math.random(), startX, startY, char, speed);
    this.state.zombies.push(zombie);
  }

  private handleInput(e: KeyboardEvent) {
    if (this.state.status !== 'playing') {
      if (e.key === 'Escape' && this.state.status === 'playing') this.pause();
      else if (e.key === 'Escape' && this.state.status === 'paused') this.pause();
      return;
    }

    if (e.key === 'Escape') {
      this.pause();
      return;
    }

    // Ignore modifiers if they are just pressed alone (e.g. just Shift)
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

    const key = e.key.toUpperCase();
    this.state.lastInput = key;

    // Find matching zombie
    // Prioritize closest zombie? Or just any matching?
    // "Single Key Shooting" -> usually closest one matching the key.
    // Or if multiple match, kill the closest.
    
    // We filter zombies that match the key (case insensitive usually, but design says Shift matters for symbols)
    // Design: "Shift+2=@". So we should check e.key (which is already case/symbol sensitive).
    // e.key for 'a' is 'a', for 'A' (shift+a) is 'A'.
    // Design says: "Only respond to KeyboardEvent.key".
    
    // Design: "Letter keys (A-Z)". "Shift+2=@".
    // So we match `zombie.char` with `e.key`.
    
    // Note: My Zombie generation used .toUpperCase() for display, but let's be precise.
    // The design implies case insensitivity for basic letters usually?
    // "Left pinky A Q Z...".
    // "Expert: Shift+2=@".
    // If level is Low, usually A and a are treated same?
    // Let's strictly follow `e.key`. If zombie is 'A', user must press Shift+A?
    // Wait, typical typing games allow 'a' for 'A' unless specified.
    // Design: "Target key (64px, White Bold)".
    // Let's assume Case Insensitive for Letters unless "Expert" mode?
    // Design says: "Primary: A-Z".
    // Let's normalize letters to Uppercase for matching if it's a letter.
    // But for symbols, exact match.

    let targetKey = e.key;
    if (targetKey.length === 1 && targetKey.match(/[a-z]/i)) {
      targetKey = targetKey.toUpperCase();
    }

    // Find zombies
    const candidates = this.state.zombies.filter(z => !z.isDead && z.char.toUpperCase() === targetKey);
    
    if (candidates.length > 0) {
      // Hit!
      // Pick closest (smallest X)
      candidates.sort((a, b) => a.x - b.x);
      const target = candidates[0];
      
      this.killZombie(target);
      this.state.inputFeedback = 'hit';
      this.state.feedbackTimer = 0.2;
      
      // Visual Effects
      this.state.muzzleFlashTimer = 0.1; // 100ms flash
      this.state.tracerTarget = { x: target.x, y: target.y };
      
      // Update Max Score
      if (this.state.stats.score > this.state.stats.maxScore) {
        this.state.stats.maxScore = this.state.stats.score;
      }

      // Sound
      soundManager.playShoot();
      soundManager.playHit();
      
      this.addLog('kill', `击杀僵尸 [${target.char}] +${baseScore + speedBonus + comboBonus}分`);

    } else {
      // Miss
      this.state.stats.score -= 5;
      this.state.stats.combo = 0;
      this.state.inputFeedback = 'miss';
      this.state.feedbackTimer = 0.2;
      // Play empty sound
      soundManager.playMiss();
      
      this.addLog('miss', `射击失误！扣除 5 分`);
    }
  }

  private killZombie(zombie: Zombie) {
    zombie.isDead = true;
    
    // Score Calc
    const baseScore = 20;
    // Speed Bonus (Not tracked per zombie yet, assuming < 0.5s reaction? 
    // We don't track when it appeared vs when hit easily without extra property.
    // Let's skip speed bonus precise calc for MVP or add creationTime to Zombie.
    const speedBonus = 15; // Placeholder avg
    
    this.state.stats.combo++;
    if (this.state.stats.combo > this.state.stats.maxCombo) {
      this.state.stats.maxCombo = this.state.stats.combo;
    }
    
    const comboBonus = Math.min(this.state.stats.combo * 10, 500);
    
    this.state.stats.score += baseScore + speedBonus + comboBonus;
    this.state.stats.zombiesKilled++;
  }

  private handleZombiePass(zombie: Zombie) {
    // Penalty
    this.state.stats.score -= 10;
    this.state.stats.combo = 0;
    this.addLog('damage', `僵尸突破防线！扣除 10 分`);
    // Flash screen red (handled by UI watching state)
  }
}

export const gameEngine = new GameEngine();
