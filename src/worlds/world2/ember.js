export class Ember {
  constructor(x, y, particleSystem) {
    this.x = x;
    this.y = y;
    this.size = 15;
    this.particleSystem = particleSystem;
    this.oscillateOffset = Math.random() * Math.PI * 2;
    this.speed = 40 + Math.random() * 30;
    this.particleTimer = 0;
  }
  
  update(deltaTime) {
    this.y += this.speed * deltaTime;
    
    // Gentle horizontal oscillation
    this.x += Math.sin(Date.now() / 500 + this.oscillateOffset) * deltaTime * 20;
    
    // Emit ember particles
    this.particleTimer += deltaTime;
    if (this.particleTimer > 0.1) {
      for (let i = 0; i < 2; i++) {
        this.particleSystem.createEmber(
          this.x + (Math.random() - 0.5) * 10,
          this.y + (Math.random() - 0.5) * 10
        );
      }
      this.particleTimer = 0;
    }
  }
  
  draw(ctx) {
    // Glowing center
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    );
    
    gradient.addColorStop(0, 'rgba(255, 220, 100, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 150, 50, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Pulsing effect
    const pulseSize = this.size * (1 + Math.sin(Date.now() / 200) * 0.1);
    ctx.fillStyle = 'rgba(255, 220, 100, 0.2)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
  }
}