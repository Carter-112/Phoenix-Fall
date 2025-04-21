export class MagmaBat {
  constructor(x, y, particleSystem) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.particleSystem = particleSystem;
    this.speed = 40 + Math.random() * 20;
    this.particleTimer = 0;
    this.wingTimer = 0;
    this.wingAngle = 0;
    this.wingDirection = 1;
    this.health = 3;
    this.maxHealth = 3;
    this.bodyParticles = [];
    this.wingParticles = [];
    this.glowTimer = 0;
    
    // Burning effect properties
    this.burning = false;
    this.burnIntensity = 0;
    this.burnTimer = 0;
    this.burnDuration = 0;
    this.burnDamageRate = 0;
    this.lastBurnDamageTime = 0;
    this.oscillateTimer = 0;
    this.oscillateFactor = Math.random() * Math.PI * 2;
    this.hoverPoint = { x: x, y: y };
    
    // World-specific color palettes
    this.worldBatColors = {
      1: [ // World 1 - red/orange
        { h: 0, s: 90, l: 40 },    // Deep red
        { h: 15, s: 100, l: 35 },  // Dark orange-red
        { h: 20, s: 100, l: 30 },  // Burnt orange
      ],
      2: [ // World 2 - teal/green
        { h: 160, s: 90, l: 35 },  // Deep teal
        { h: 170, s: 100, l: 30 },  // Dark teal
        { h: 175, s: 100, l: 25 },  // Forest teal
      ],
      3: [ // World 3 - blue
        { h: 200, s: 90, l: 35 },  // Deep blue
        { h: 210, s: 100, l: 30 },  // Dark blue
        { h: 220, s: 100, l: 25 },  // Navy blue
      ],
      4: [ // World 4 - purple
        { h: 270, s: 90, l: 35 },  // Deep purple
        { h: 280, s: 100, l: 30 },  // Dark violet
        { h: 290, s: 100, l: 25 },  // Magenta
      ],
      5: [ // World 5 - red
        { h: 350, s: 90, l: 35 },  // Deep crimson
        { h: 0, s: 100, l: 30 },   // Blood red
        { h: 10, s: 100, l: 25 },  // Dark red
      ],
      6: [ // World 6 - gold
        { h: 30, s: 90, l: 35 },   // Deep gold
        { h: 40, s: 100, l: 30 },  // Bronze
        { h: 45, s: 100, l: 25 },  // Dark amber
      ]
    };
    
    // Set initial colors based on current world
    this.getCurrentWorldColors();
    this.initializeParticles();
  }
  
  getCurrentWorldColors() {
    // Default to World 1 colors
    this.batColors = this.worldBatColors[1];
    
    // Try to get current world from game instance
    if (window.gameInstance && window.gameInstance.worldManager) {
      const worldNumber = window.gameInstance.worldManager.getCurrentWorldNumber();
      if (this.worldBatColors[worldNumber]) {
        this.batColors = this.worldBatColors[worldNumber];
      }
    }
  }
  
  initializeParticles() {
    // Reset particle arrays
    this.bodyParticles = [];
    this.wingParticles = [];
    
    // Create body particles
    for (let i = 0; i < 12; i++) {
      this.bodyParticles.push({
        offsetX: (Math.random() - 0.5) * 10,
        offsetY: (Math.random() - 0.5) * 10,
        size: 2 + Math.random() * 3,
        color: this.getRandomBatColor(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2
      });
    }
    
    // Create wing particles
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 8; i++) {
        const distance = 5 + i * 2;
        const angle = (Math.random() * 0.2 + 0.3) * Math.PI; // Wing angle range
        
        this.wingParticles.push({
          side: side,
          distance: distance,
          angle: angle,
          baseAngle: angle,
          size: 2 + Math.random() * 2,
          color: this.getRandomBatColor(),
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 2
        });
      }
    }
  }
  
  getRandomBatColor() {
    const colorIdx = Math.floor(Math.random() * this.batColors.length);
    const color = this.batColors[colorIdx];
    
    // Add slight variation
    const h = color.h + (Math.random() - 0.5) * 10;
    const s = color.s;
    const l = color.l + (Math.random() - 0.5) * 10;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  
  update(deltaTime, phoenixX, phoenixY) {
    // Check if world has changed (every ~5 seconds)
    if (Math.random() < 0.01) {
      const oldColors = this.batColors;
      this.getCurrentWorldColors();
      
      // Reinitialize particles if colors changed
      if (oldColors !== this.batColors) {
        this.initializeParticles();
      }
    }
    
    // Basic movement - floating downward with sideways oscillation
    this.y += this.speed * deltaTime;
    
    // Oscillation movement
    this.oscillateTimer += deltaTime;
    this.x += Math.sin(this.oscillateTimer + this.oscillateFactor) * 2;
    
    // Occasional change in hover point direction to create more erratic movement
    if (Math.random() < 0.01) {
      this.hoverPoint = {
        x: this.x + (Math.random() - 0.5) * 100,
        y: this.y + (Math.random() - 0.5) * 50
      };
    }
    
    // Simple AI to sometimes try to move toward player
    if (Math.random() < 0.005) {
      // 0.5% chance per frame to target player
      this.hoverPoint = {
        x: phoenixX,
        y: phoenixY - 50 // Aim to be slightly above the phoenix
      };
    }
    
    // Move slightly toward hover point
    const dx = this.hoverPoint.x - this.x;
    const dy = this.hoverPoint.y - this.y;
    this.x += dx * 0.02;
    this.y += dy * 0.01;
    
    // Update wing animation
    this.wingTimer += deltaTime;
    if (this.wingTimer > 0.03) {
      this.wingAngle += 0.15 * this.wingDirection;
      
      if (this.wingAngle > 0.6) {
        this.wingDirection = -1;
      } else if (this.wingAngle < -0.2) {
        this.wingDirection = 1;
      }
      
      this.wingTimer = 0;
    }
    
    // Emit particles occasionally
    this.particleTimer += deltaTime;
    if (this.particleTimer > 0.1) {
      // Embers and smoke from the bat's body
      this.particleSystem.createEmber(
        this.x + (Math.random() - 0.5) * 20,
        this.y + (Math.random() - 0.5) * 20
      );
      
      this.particleTimer = 0;
    }
    
    // Gradually increase the glow on hit
    if (this.glowTimer > 0) {
      this.glowTimer -= deltaTime;
    }
    
    // Handle burning effect
    if (this.burning) {
      // Update burn intensity (fades over time)
      this.burnTimer += deltaTime;
      if (this.burnTimer >= this.burnDuration) {
        this.burning = false;
        this.burnIntensity = 0;
      } else {
        // Calculate current burn intensity based on remaining time
        this.burnIntensity = 1 - (this.burnTimer / this.burnDuration);
        
        // Create burn particles
        if (Math.random() < this.burnIntensity * 0.7) {
          const offsetX = (Math.random() - 0.5) * this.width * 0.8;
          const offsetY = (Math.random() - 0.5) * this.height * 0.8;
          this.particleSystem.createFlame(this.x + offsetX, this.y + offsetY);
        }
        
        // Apply burn damage over time
        const currentTime = Date.now();
        if (currentTime - this.lastBurnDamageTime > 500) { // Damage every 500ms
          this.health -= this.burnDamageRate;
          this.lastBurnDamageTime = currentTime;
          
          // Flash when taking burn damage
          this.glowTimer = 0.1;
        }
      }
    }
  }
  
  draw(ctx) {
    // Draw burning aura if burning
    if (this.burning && this.burnIntensity > 0) {
      this.drawBurningEffect(ctx);
    }
    
    this.drawWings(ctx);
    this.drawBody(ctx);
  }
  
  drawBurningEffect(ctx) {
    // Draw fire aura around the bat
    const intensity = this.burnIntensity;
    const radius = this.width * 0.8;
    
    // Create gradient for burning effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, radius * 0.3,
      this.x, this.y, radius
    );
    
    gradient.addColorStop(0, `rgba(255, 200, 50, ${intensity * 0.1})`);
    gradient.addColorStop(0.4, `rgba(255, 100, 0, ${intensity * 0.15})`);
    gradient.addColorStop(0.7, `rgba(255, 50, 0, ${intensity * 0.1})`);
    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw small flames around the bat
    const flameCount = Math.floor(6 * intensity);
    for (let i = 0; i < flameCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius * 0.6 + Math.random() * radius * 0.3;
      const flameHeight = radius * 0.3 * intensity * (0.7 + Math.random() * 0.6);
      
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      // Draw a simple flame
      ctx.fillStyle = `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 50, ${intensity * 0.7})`;
      ctx.beginPath();
      ctx.arc(x, y, flameHeight * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawBody(ctx) {
    // Draw body particles
    for (const p of this.bodyParticles) {
      const time = Date.now() / 1000;
      const oscX = Math.sin(time * p.speed + p.phase) * 2;
      const oscY = Math.cos(time * p.speed + p.phase) * 2;
      
      const x = this.x + p.offsetX + oscX;
      const y = this.y + p.offsetY + oscY;
      
      let glowMultiplier = 1;
      if (this.glowTimer > 0) {
        glowMultiplier = 1.5 + this.glowTimer * 3;
      }
      
      const glowSize = p.size * glowMultiplier * (1 + Math.sin(time * 2 + p.phase) * 0.2);
      
      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2);
      
      if (this.glowTimer > 0) {
        // When hit, glow white-orange
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.5, p.color);
      } else {
        gradient.addColorStop(0, p.color);
      }
      
      gradient.addColorStop(1, 'rgba(100, 20, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw particle core
      ctx.fillStyle = 'rgba(200, 50, 20, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw eyes (more visible during hit)
    const eyeSize = 2 + (this.glowTimer > 0 ? this.glowTimer * 4 : 0);
    
    ctx.fillStyle = this.glowTimer > 0 ? 'rgba(255, 255, 200, 0.9)' : 'rgba(255, 255, 100, 0.7)';
    
    // Left eye
    ctx.beginPath();
    ctx.arc(this.x - 5, this.y - 3, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(this.x + 5, this.y - 3, eyeSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawWings(ctx) {
    // Draw wing particles
    for (const p of this.wingParticles) {
      const time = Date.now() / 1000;
      const wingAngle = p.baseAngle + this.wingAngle;
      
      const x = this.x + Math.cos(wingAngle) * p.distance * p.side;
      const y = this.y + Math.sin(wingAngle) * p.distance * 0.5;
      
      let glowMultiplier = 1;
      if (this.glowTimer > 0) {
        glowMultiplier = 1.5 + this.glowTimer * 2;
      }
      
      const oscSize = p.size * glowMultiplier * (1 + Math.sin(time * p.speed + p.phase) * 0.3);
      
      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, oscSize * 2);
      
      if (this.glowTimer > 0) {
        // When hit, glow white-orange
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.5, p.color);
      } else {
        gradient.addColorStop(0, p.color);
      }
      
      gradient.addColorStop(1, 'rgba(80, 10, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, oscSize * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Connect wings with subtle lines
    ctx.strokeStyle = 'rgba(120, 30, 10, 0.5)';
    ctx.lineWidth = 1;
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    const leftWingX = this.x + Math.cos(this.wingAngle + 0.4) * 15 * -1;
    const leftWingY = this.y + Math.sin(this.wingAngle + 0.4) * 10;
    ctx.lineTo(leftWingX, leftWingY);
    ctx.stroke();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    const rightWingX = this.x + Math.cos(this.wingAngle + 0.4) * 15;
    const rightWingY = this.y + Math.sin(this.wingAngle + 0.4) * 10;
    ctx.lineTo(rightWingX, rightWingY);
    ctx.stroke();
  }
  
  takeDamage() {
    this.health--;
    this.glowTimer = 0.3; // Glow effect duration in seconds
    return this.health <= 0;
  }
  
  setBurning(duration, damageRate) {
    this.burning = true;
    this.burnTimer = 0;
    this.burnDuration = duration;
    this.burnIntensity = 1.0;
    this.burnDamageRate = damageRate;
    this.lastBurnDamageTime = Date.now();
  }
  
  getHealthPercent() {
    return this.health / this.maxHealth;
  }
  
  getBounds() {
    return {
      x: this.x - 15,
      y: this.y - 15,
      width: 30,
      height: 30
    };
  }
}