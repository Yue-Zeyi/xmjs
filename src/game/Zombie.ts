export class Zombie {
  id: number;
  x: number;
  y: number;
  char: string;
  speed: number;
  width: number = 60;
  height: number = 90;
  isDead: boolean = false;
  deathTimer: number = 0;
  walkCycle: number = 0;

  constructor(id: number, startX: number, startY: number, char: string, speed: number) {
    this.id = id;
    this.x = startX;
    this.y = startY;
    this.char = char;
    this.speed = speed;
  }

  update(dt: number) {
    if (this.isDead) {
      this.deathTimer += dt;
      return;
    }
    // Move left
    this.x -= this.speed * dt;
    this.walkCycle += dt * 10; // Animation speed
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isDead && this.deathTimer > 0.5) return; // Hide after animation

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isDead) {
      ctx.globalAlpha = 1 - (this.deathTimer * 2);
      ctx.translate(0, this.deathTimer * 20); // Sink into ground
      ctx.rotate(this.deathTimer); // Tip over
    }

    // Colors
    const skinColor = '#5e9663';
    const shirtColor = '#3b4252';
    const pantsColor = '#2e3440';
    
    // Bobbing animation
    const bob = Math.sin(this.walkCycle) * 3;
    
    // --- Draw Zombie (Pixel Art Style) ---
    // Scale slightly
    // Body dimensions roughly 60x90
    
    // Legs
    ctx.fillStyle = pantsColor;
    // Left Leg
    ctx.fillRect(15, 50, 12, 30);
    // Right Leg (animated)
    const legOffset = Math.sin(this.walkCycle) * 5;
    ctx.fillRect(33, 50 + legOffset, 12, 30);

    // Body
    ctx.fillStyle = shirtColor;
    ctx.fillRect(10, 20 + bob, 40, 35);

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(15, -10 + bob, 30, 30);

    // Eyes
    ctx.fillStyle = '#ff5555';
    ctx.fillRect(20, -2 + bob, 6, 6); // Left eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(35, -2 + bob, 5, 5); // Right eye (dead)

    // Arms (Extended forward)
    ctx.fillStyle = skinColor;
    // Left Arm
    ctx.fillRect(-5, 25 + bob, 20, 8); 
    // Right Arm
    ctx.fillRect(-5, 35 + bob, 20, 8);

    // --- Draw Target Key ---
    if (!this.isDead) {
      // Reset transform for text to ensure it's not affected by internal zombie rotation/bob too much if we want it steady,
      // but moving with zombie is good.
      
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.font = 'bold 40px "Courier New"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = 30; // Center of zombie width (60/2)
      const centerY = -40 + bob; // Float above head

      // Draw box behind letter for contrast
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(centerX - 20, centerY - 20, 40, 40);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(centerX - 20, centerY - 20, 40, 40);

      ctx.fillStyle = '#fff';
      ctx.fillText(this.char.toUpperCase(), centerX, centerY);
    }

    ctx.restore();
  }
}
