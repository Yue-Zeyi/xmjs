export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize on first interaction
    window.addEventListener('click', () => this.init(), { once: true });
    window.addEventListener('keydown', () => this.init(), { once: true });
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, vol: number = 0.1) {
    if (!this.ctx || !this.enabled) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playShoot() {
    // Laser/Gunshot sound
    this.createOscillator('square', 400, 0.1, 0.2);
    this.createOscillator('sawtooth', 200, 0.15, 0.1);
    
    // Noise burst for impact (simulated with random freq modulation)
    if (this.ctx) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }
  }

  playHit() {
    // High pitch ping
    this.createOscillator('sine', 880, 0.1, 0.1);
  }

  playMiss() {
    // Low buzzer
    this.createOscillator('sawtooth', 100, 0.3, 0.2);
  }

  playReload() {
    // Mechanical click
    this.createOscillator('square', 600, 0.05, 0.1);
    setTimeout(() => this.createOscillator('square', 800, 0.05, 0.1), 100);
  }
}

export const soundManager = new SoundManager();
