export class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  
  createParticle(x, y, vx, vy, life, color, size, alpha = 1) {
    this.particles.push({
      x, y,
      vx, vy,
      life, maxLife: life,
      color, size, alpha
    });
  }
  
  createEmber(x, y) {
    const life = 1.0 + Math.random() * 1.5;
    const size = 5 + Math.random() * 8;
    const vx = (Math.random() - 0.5) * 30;
    const vy = (Math.random() - 0.5) * 30;
    
    const colorType = Math.random();
    let color;
    
    if (colorType < 0.6) {
      const hue = 30 + Math.random() * 25;
      color = `hsl(${hue}, 100%, 70%)`;
    } else if (colorType < 0.9) {
      color = `rgba(255, 255, ${Math.floor(180 + Math.random() * 75)}, 0.9)`;
    } else {
      color = `rgba(255, ${Math.floor(100 + Math.random() * 50)}, 50, 0.8)`;
    }
    
    this.createParticle(x, y, vx, vy, life, color, size, 0.9);
  }
  
  createFlame(x, y) {
    const life = 0.4 + Math.random() * 0.8;
    const size = 4 + Math.random() * 5;
    const vx = (Math.random() - 0.5) * 10;
    const vy = (Math.random() - 0.5) * 30 - 20; // Upward bias
    const hue = 15 + Math.random() * 30;
    const lightness = 50 + Math.random() * 50;
    const color = `hsl(${hue}, 100%, ${lightness}%)`;
    this.createParticle(x, y, vx, vy, life, color, size);
  }
  
  createSmoke(x, y) {
    const life = 1 + Math.random() * 2;
    const size = 10 + Math.random() * 20;
    const vx = (Math.random() - 0.5) * 5;
    const vy = (Math.random() - 0.5) * 5 - 10; // Upward bias
    const alpha = 0.1 + Math.random() * 0.2;
    const color = `rgba(20, 20, 20, ${alpha})`;
    this.createParticle(x, y, vx, vy, life, color, size, alpha);
  }
  
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.life -= deltaTime;
      
      // Add some randomness to make flames more lively
      if (p.color.includes('hsl')) {
        p.vx += (Math.random() - 0.5) * 1;
        p.vy += (Math.random() - 0.5) * 1;
      }
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  createRiftParticle(x, y, color) {
    const life = 0.3 + Math.random() * 0.6;
    const size = 3 + Math.random() * 5;
    const vx = (Math.random() - 0.5) * 15;
    const vy = (Math.random() - 0.5) * 15;
    
    // Default purple if no color provided
    const particleColor = color || 'rgba(255, 50, 255, 0.7)';
    this.createParticle(x, y, vx, vy, life, particleColor, size, 0.8);
  }
  
  createTimeParticle(x, y, color) {
    const life = 0.6 + Math.random() * 0.8;
    const size = 2 + Math.random() * 4;
    
    // Time particles have more structured motion - circular or rippling
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 10;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    // Default blue if no color provided
    const particleColor = color || 'rgba(50, 100, 255, 0.7)';
    this.createParticle(x, y, vx, vy, life, particleColor, size, 0.6);
  }
  
  createSpecialParticle(x, y, color) {
    const life = 0.5 + Math.random() * 0.8;
    const size = 2 + Math.random() * 6;
    const vx = (Math.random() - 0.5) * 12;
    const vy = (Math.random() - 0.5) * 12;
    
    // Default white/yellow if no color provided
    const particleColor = color || 'rgba(255, 255, 200, 0.7)';
    this.createParticle(x, y, vx, vy, life, particleColor, size, 0.7);
  }
  
  draw(ctx) {
    this.particles.forEach(p => {
      const lifeFactor = p.life / p.maxLife;
      const fadeAlpha = p.alpha * (lifeFactor < 0.2 ? lifeFactor * 5 : 1);
      
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * lifeFactor, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
  }
}