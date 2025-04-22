// Constants for debugging
export const DEBUG = {
  SHOW_HITBOX: false,
  SHOW_EMBER_COUNT: true,
  SHOW_MAGNETIC_RADIUS: false,
  FORCE_VISIBLE: false
};

export class Ember {
  constructor(x, y, particleSystem, value = 10) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.particleSystem = particleSystem;
    this.oscillateOffset = Math.random() * Math.PI * 2;
    this.speed = 40 + Math.random() * 30;
    this.particleTimer = 0;
    this.active = true;
    this.value = value; // XP value with default of 10
    this.radius = this.size / 2;
    this.collected = false;
    
    // Visual effects
    this.opacity = 1;
    this.glowIntensity = 0.8 + Math.random() * 0.4;
    this.pulseSpeed = 3 + Math.random() * 2;
    
    // Add gentle floating motion
    this.floatTime = Math.random() * Math.PI * 2;
    this.baseX = x;
    this.baseY = y;
    this.baseSize = this.size;
    this.velocity = { y: 0 };
  }
  
  update(deltaTime) {
    if (!this.active) return;
    
    // If collected, fade out
    if (this.collected) {
      this.opacity -= deltaTime;
      if (this.opacity <= 0) {
        this.active = false;
      }
      return;
    }
    
    // Update float time
    this.floatTime += deltaTime * 0.002;
    
    // Gentle floating motion
    const xOffset = Math.sin(this.floatTime) * 1.5;
    const yOffset = Math.cos(this.floatTime * 0.7) * 1.0;
    
    // Update velocity (slowly increase downward velocity)
    this.velocity.y += deltaTime * 0.00005;
    
    // Update position
    this.baseY += this.velocity.y * deltaTime;
    this.x = this.baseX + xOffset;
    this.y = this.baseY + yOffset;
    
    // Pulsing opacity effect
    this.opacity = 0.7 + Math.sin(this.floatTime * 1.5) * 0.2;
    
    // If ember goes too far below screen, remove it
    if (this.y > window.innerHeight + 50) {
      this.active = false;
    }
  }
  
  draw(ctx) {
    if (!this.active) return;

    // Save context to restore later
    ctx.save();
    ctx.globalAlpha = this.opacity;
    
    // Calculate pulsing effect (value between 0.6 and 1.0)
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 300);
    
    // Alpha fade for glow based on distance from player
    const alphaFade = Math.min(1, Math.max(0.3, this.opacity * pulse));
    
    // Draw outer glow (wide and subtle)
    const outerGlow = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 2.5
    );
    outerGlow.addColorStop(0, `rgba(255, 150, 50, ${alphaFade * 0.5})`);
    outerGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
    
    ctx.beginPath();
    ctx.fillStyle = outerGlow;
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw core
    const coreGradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    );
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    coreGradient.addColorStop(0.5, 'rgba(255, 200, 50, 1)');
    coreGradient.addColorStop(1, 'rgba(255, 100, 0, 1)');
    
    ctx.beginPath();
    ctx.fillStyle = coreGradient;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Restore context
    ctx.restore();
    
    // Emit particles
    this.emitParticles();
  }
  
  emitParticles() {
    // Only emit particles sometimes to avoid performance issues
    if (Math.random() > 0.4 || !this.particleSystem) return;
    
    // Create a small particle at ember position
    if (this.particleSystem.createEmber) {
      this.particleSystem.createEmber(this.x, this.y);
    }
  }
  
  collect() {
    if (!this.active || this.collected) return false;
    
    this.collected = true;
    
    // Create particle effect when collected
    if (this.particleSystem) {
      for (let i = 0; i < 8; i++) {
        this.particleSystem.createEmber(this.x, this.y);
      }
    }
    
    return this.value;
  }
  
  checkCollision(x, y) {
    if (!this.active || this.collected) return false;
    
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (this.size / 2) + 30; // Add margin for player size
  }
}