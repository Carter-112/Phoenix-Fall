export class Hazard {
  constructor(x, y, size, particleSystem) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.particleSystem = particleSystem;
    this.speed = 60 + Math.random() * 40;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 2;
    this.particleTimer = 0;
  }
  
  update(deltaTime) {
    this.y += this.speed * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
    
    // Emit smoke particles occasionally
    this.particleTimer += deltaTime;
    if (this.particleTimer > 0.2) {
      this.particleSystem.createSmoke(
        this.x + (Math.random() - 0.5) * this.size,
        this.y + (Math.random() - 0.5) * this.size
      );
      this.particleTimer = 0;
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Main rock body
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size / 2);
    gradient.addColorStop(0, '#663931');
    gradient.addColorStop(0.7, '#442721');
    gradient.addColorStop(1, '#221311');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    // Create a jagged rock shape
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const radius = (this.size / 2) * (0.8 + Math.sin(i * 5) * 0.2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Glowing cracks
    for (let i = 0; i < 3; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const length = (0.3 + Math.random() * 0.4) * (this.size / 2);
      
      const startX = Math.cos(startAngle) * (this.size / 4);
      const startY = Math.sin(startAngle) * (this.size / 4);
      const endX = startX + Math.cos(startAngle) * length;
      const endY = startY + Math.sin(startAngle) * length;
      
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    ctx.restore();
  }
}