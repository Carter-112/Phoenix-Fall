import { Hazard } from './hazard.js';

export class LavaWall extends Hazard {
  constructor(x, y, width, particleSystem, game) {
    super(x, y, width, particleSystem); // Call parent constructor
    this.width = width;
    this.height = 30; // Wall thickness
    this.game = game;
    this.speed = 80 + Math.random() * 40; // Slightly faster than standard hazards
    this.particleTimer = 0;
    this.particleEmitRate = 0.05;
    this.active = true;
    this.damage = 20; // Damage amount when phoenix collides
    
    // Visual properties
    this.glowIntensity = 0.8;
    this.glowPhase = 0;
    this.glowSpeed = 2;
    
    // Create initial lava particles
    this.createInitialParticles();
  }
  
  createInitialParticles() {
    // Create more particles for wider walls
    const particleCount = Math.floor(this.width / 20);
    
    for (let i = 0; i < particleCount; i++) {
      const offset = (Math.random() * this.width) - (this.width / 2);
      this.particleSystem.createEmber(
        this.x + offset,
        this.y + (Math.random() - 0.5) * this.height,
        {
          color: '#FF4500',
          size: 4 + Math.random() * 4,
          lifetime: 1 + Math.random() * 0.5,
          velX: (Math.random() - 0.5) * 20,
          velY: (Math.random() - 0.5) * 20
        }
      );
    }
  }
  
  update(deltaTime) {
    if (!this.active) return;
    
    // Move the wall down
    this.y += this.speed * deltaTime;
    
    // Update glow effect
    this.glowPhase += this.glowSpeed * deltaTime;
    this.glowIntensity = 0.6 + Math.sin(this.glowPhase) * 0.2;
    
    // Emit lava particles continuously
    this.particleTimer += deltaTime;
    if (this.particleTimer > this.particleEmitRate) {
      this.emitLavaParticles();
      this.particleTimer = 0;
    }
    
    // Check if wall is out of the screen
    if (this.y > window.innerHeight + this.height) {
      this.active = false;
    }
  }
  
  emitLavaParticles() {
    // Emit particles along the entire wall
    const particleCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < particleCount; i++) {
      const offsetX = (Math.random() * this.width) - (this.width / 2);
      const offsetY = (Math.random() * this.height) - (this.height / 2);
      
      // Create lava droplet particles
      this.particleSystem.createEmber(
        this.x + offsetX,
        this.y + offsetY,
        {
          color: '#FF7F00',
          size: 3 + Math.random() * 3,
          lifetime: 0.8 + Math.random() * 0.6,
          velX: (Math.random() - 0.5) * 30,
          velY: 20 + Math.random() * 20
        }
      );
      
      // Create smoke
      if (Math.random() > 0.6) {
        this.particleSystem.createSmoke(
          this.x + offsetX,
          this.y + offsetY - this.height/2
        );
      }
    }
  }
  
  draw(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Create lava gradient
    const gradient = ctx.createLinearGradient(
      this.x - this.width/2, this.y,
      this.x + this.width/2, this.y
    );
    gradient.addColorStop(0, 'rgba(255, 80, 0, 0.7)');
    gradient.addColorStop(0.3, 'rgba(255, 160, 0, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 60, 0, 0.7)');
    
    // Draw main lava wall with wavy top/bottom edges
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    // Start at top-left
    const segments = Math.floor(this.width / 20);
    
    // Draw top wavy edge
    for (let i = 0; i <= segments; i++) {
      const x = this.x - this.width/2 + (i * (this.width / segments));
      const waveOffset = Math.sin(i + this.glowPhase) * 5;
      const y = this.y - this.height/2 + waveOffset;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    // Draw bottom wavy edge
    for (let i = segments; i >= 0; i--) {
      const x = this.x - this.width/2 + (i * (this.width / segments));
      const waveOffset = Math.sin(i + this.glowPhase + Math.PI) * 5;
      const y = this.y + this.height/2 + waveOffset;
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.shadowColor = 'rgba(255, 60, 0, ' + this.glowIntensity + ')';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    ctx.fillStyle = 'rgba(255, 120, 0, 0.1)';
    ctx.fill();
    
    // Add inner core details
    ctx.beginPath();
    const innerWidth = this.width * 0.7;
    const innerHeight = this.height * 0.5;
    ctx.ellipse(this.x, this.y, innerWidth/2, innerHeight/2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.fill();
    
    ctx.restore();
  }
  
  checkCollision(phoenix) {
    if (!this.active || !phoenix) return false;
    
    // Simple rectangle collision check
    if (
      phoenix.x + phoenix.collisionRadius > this.x - this.width/2 &&
      phoenix.x - phoenix.collisionRadius < this.x + this.width/2 &&
      phoenix.y + phoenix.collisionRadius > this.y - this.height/2 &&
      phoenix.y - phoenix.collisionRadius < this.y + this.height/2
    ) {
      return true;
    }
    
    return false;
  }
  
  getDamage() {
    return this.damage;
  }
  
  isActive() {
    return this.active;
  }
} 