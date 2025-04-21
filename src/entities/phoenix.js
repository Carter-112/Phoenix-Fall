export class Phoenix {
  constructor(x, y, particleSystem) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.width = 40;
    this.height = 60;
    this.particleSystem = particleSystem;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 1.5; // Seconds of invulnerability after being hit
    this.flameTimer = 0;
    this.trailTimer = 0;
    this.wingTimer = 0;
    this.wingAngle = 0;
    this.wingDirection = 1;
    this.bodyParticles = [];
    this.wingParticles = [];
    this.tailParticles = [];
    this.trailPoints = []; // Store points for trail
    this.trailLength = 40; // Increased from default 20
    this.trailHeatRadius = 70; // Radius of heat damage area
    this.timeDilationFactor = 1.0; // Default normal time
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravityMultiplier = 1.0; // Normal gravity direction
    this.inGravityRift = false;
    
    // Damage animation properties
    this.damageFlashTimer = 0;
    this.damageFlashDuration = 0.5; // Duration in seconds
    this.damageShockwaveActive = false;
    this.damageShockwaveRadius = 0;
    this.damageShockwaveMaxRadius = 100;
    this.damageShockwaveSpeed = 200; // Pixels per second
    
    // Near-miss warning properties
    this.nearMissTimer = 0;
    this.nearMissDuration = 0.3; // Duration in seconds
    this.nearMissIntensity = 0; // Current intensity of the warning effect
    
    // Default World 1 flame colors
    this.worldFlameColors = {
      1: [
        { h: 15, s: 100, l: 60 },  // Deep orange
        { h: 30, s: 100, l: 70 },  // Orange
        { h: 45, s: 100, l: 75 },  // Gold
        { h: 60, s: 100, l: 80 },  // Yellow
      ],
      2: [
        { h: 170, s: 100, l: 60 },  // Deep teal
        { h: 175, s: 100, l: 70 },  // Teal
        { h: 180, s: 90, l: 75 },   // Light teal
        { h: 185, s: 80, l: 80 },   // Cyan
      ],
      3: [
        { h: 200, s: 100, l: 60 },  // Deep blue
        { h: 210, s: 100, l: 70 },  // Blue
        { h: 220, s: 90, l: 75 },   // Light blue
        { h: 230, s: 80, l: 80 },   // Sky blue
      ],
      4: [
        { h: 270, s: 100, l: 60 },  // Deep purple
        { h: 280, s: 100, l: 70 },  // Purple
        { h: 290, s: 90, l: 75 },   // Light purple
        { h: 300, s: 80, l: 80 },   // Pink-purple
      ],
      5: [
        { h: 350, s: 100, l: 60 },  // Deep red
        { h: 355, s: 100, l: 70 },  // Red
        { h: 0, s: 90, l: 75 },     // Light red
        { h: 5, s: 80, l: 80 },     // Red-orange
      ],
      6: [
        { h: 30, s: 100, l: 60 },   // Deep gold
        { h: 40, s: 100, l: 70 },   // Gold
        { h: 50, s: 90, l: 75 },    // Light gold
        { h: 60, s: 80, l: 80 },    // Yellow-gold
      ]
    };
    
    // Start with world 1 flame colors
    this.flameColors = this.worldFlameColors[1];
    
    // Initialize body particles
    this.initializeBodyParticles();
    this.healingParticles = [];
    this.glowIntensity = 1;
    this.glowColor = null;
    
    // Set up world change listener
    this.setupWorldChangeListener();
  }
  
  setupWorldChangeListener() {
    // Check for world changes at regular intervals
    this.worldCheckInterval = setInterval(() => {
      if (window.gameInstance && window.gameInstance.worldManager) {
        const currentWorld = window.gameInstance.worldManager.getCurrentWorldNumber();
        this.updateWorldColors(currentWorld);
      }
    }, 1000); // Check every second
  }
  
  updateWorldColors(worldNumber) {
    // If world has changed, update flame colors
    if (this.worldFlameColors[worldNumber] && 
        this.flameColors !== this.worldFlameColors[worldNumber]) {
      console.log(`Updating phoenix flame colors for world ${worldNumber}`);
      this.flameColors = this.worldFlameColors[worldNumber];
      this.initializeBodyParticles(); // Regenerate body particles with new colors
    }
  }
  
  initializeBodyParticles() {
    // Clear existing particles
    this.bodyParticles = [];
    this.wingParticles = [];
    this.tailParticles = [];
    
    // Create phoenix body shape
    for (let i = 0; i < 25; i++) {
      this.bodyParticles.push({
        offsetX: (Math.random() - 0.5) * 15,
        offsetY: (Math.random() - 0.5) * 25,
        size: 3 + Math.random() * 4,
        color: this.getRandomFlameColor(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2
      });
    }
    
    // Create wing particles (left and right wings)
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 15; i++) {
        const distance = 10 + Math.random() * 25;
        const angle = (Math.random() * 0.5 + 0.25) * Math.PI; // Wing angle range
        
        this.wingParticles.push({
          side: side,
          distance: distance,
          angle: angle,
          baseAngle: angle,
          size: 3 + Math.random() * 4,
          color: this.getRandomFlameColor(),
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 2
        });
      }
    }
    
    // Create tail particles
    for (let i = 0; i < 20; i++) {
      const distance = 15 + i * 1.5;
      const spread = 5 + i * 0.5;
      
      this.tailParticles.push({
        distance: distance,
        offsetX: (Math.random() - 0.5) * spread,
        size: 4 + Math.random() * 3 - i * 0.1,
        color: this.getRandomFlameColor(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2
      });
    }
  }
  
  getRandomFlameColor() {
    const colorIdx = Math.floor(Math.random() * this.flameColors.length);
    const color = this.flameColors[colorIdx];
    
    // Add slight variation
    const h = color.h + (Math.random() - 0.5) * 10;
    const s = color.s;
    const l = color.l + (Math.random() - 0.5) * 15;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  
  update(deltaTime) {
    // Apply time dilation to delta time if active
    const dilatedDeltaTime = this.timeDilationFactor ? deltaTime * this.timeDilationFactor : deltaTime;
    
    // Smooth movement toward target (both X and Y)
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.x += dx * 5 * dilatedDeltaTime;
    this.y += dy * 5 * dilatedDeltaTime;
    
    // Apply velocity from external forces (gravity wells, dimensional rifts, etc.)
    this.x += this.velocityX * dilatedDeltaTime;
    this.y += this.velocityY * dilatedDeltaTime;
    
    // Apply drag/friction to slow down velocity over time
    this.velocityX *= 0.95;
    this.velocityY *= 0.95;
    
    // Apply gravity based on current multiplier
    if (this.gravityMultiplier !== 0) {
      // Default very light gravity pulling downward
      this.velocityY += 0.2 * this.gravityMultiplier * dilatedDeltaTime;
    }
    
    // Reset gravity multiplier to default if not in a gravity rift
    if (!this.inGravityRift) {
      this.gravityMultiplier = 1.0;
    }
    
    // Update damage flash animation if active
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dilatedDeltaTime;
    }
    
    // Update invulnerability timer
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= deltaTime; // Regular time for gameplay mechanics
    }
    
    // Update shockwave animation if active
    if (this.damageShockwaveActive) {
      this.damageShockwaveRadius += this.damageShockwaveSpeed * dilatedDeltaTime;
      
      if (this.damageShockwaveRadius >= this.damageShockwaveMaxRadius) {
        this.damageShockwaveActive = false;
      }
    }
    
    // Update near-miss warning effect if active
    if (this.nearMissTimer > 0) {
      this.nearMissTimer -= dilatedDeltaTime;
      
      // Calculate intensity - starts strong and fades out
      this.nearMissIntensity = this.nearMissTimer / this.nearMissDuration;
    } else {
      this.nearMissIntensity = 0;
    }
    
    // Update wing animation
    this.wingTimer += dilatedDeltaTime;
    if (this.wingTimer > 0.05) {
      this.wingAngle += 0.1 * this.wingDirection;
      
      if (this.wingAngle > 0.4) {
        this.wingDirection = -1;
      } else if (this.wingAngle < -0.2) {
        this.wingDirection = 1;
      }
      
      this.wingTimer = 0;
    }
    
    // Store trail points
    this.trailPoints.unshift({ 
      x: this.x, 
      y: this.y,
      time: Date.now() // Store timestamp for each point
    });
    if (this.trailPoints.length > this.trailLength) {
      this.trailPoints.pop();
    }
    
    // Emit flame particles around the body
    this.flameTimer += dilatedDeltaTime;
    if (this.flameTimer > 0.03) {
      for (let i = 0; i < 2; i++) {
        // Body flames
        this.particleSystem.createFlame(
          this.x + (Math.random() - 0.5) * 30,
          this.y + (Math.random() - 0.5) * 40
        );
        
        // Trail flames
        if (this.trailPoints.length > 5) {
          const trailIdx = 5 + Math.floor(Math.random() * (this.trailPoints.length - 5));
          const trailPoint = this.trailPoints[trailIdx];
          this.particleSystem.createFlame(
            trailPoint.x + (Math.random() - 0.5) * 15,
            trailPoint.y + (Math.random() - 0.5) * 15
          );
        }
      }
      this.flameTimer = 0;
    }
    
    // Emit trail particles
    this.trailTimer += dilatedDeltaTime;
    if (this.trailTimer > 0.05) {
      // Main trail
      this.particleSystem.createSmoke(
        this.x + (Math.random() - 0.5) * 10,
        this.y + 30 + (Math.random() - 0.5) * 10
      );
      
      // Trail from specific points
      if (this.trailPoints.length > 10) {
        const trailIdx = Math.floor(Math.random() * Math.min(10, this.trailPoints.length));
        const trailPoint = this.trailPoints[trailIdx];
        this.particleSystem.createSmoke(
          trailPoint.x + (Math.random() - 0.5) * 20,
          trailPoint.y + (Math.random() - 0.5) * 10
        );
      }
      
      this.trailTimer = 0;
    }
    
    // Gradually reset time dilation if active
    if (this.timeDilationFactor && this.timeDilationFactor !== 1.0) {
      // Return to normal speed gradually
      this.timeDilationFactor += (1.0 - this.timeDilationFactor) * 0.01;
      
      // If close enough to 1.0, reset to exactly 1.0
      if (Math.abs(this.timeDilationFactor - 1.0) < 0.02) {
        this.timeDilationFactor = 1.0;
      }
    }
    
    // Update healing particles
    for (let i = this.healingParticles.length - 1; i >= 0; i--) {
      const particle = this.healingParticles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Update life
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.healingParticles.splice(i, 1);
      }
    }
  }
  
  draw(ctx) {
    // Draw near-miss warning glow behind everything
    if (this.nearMissIntensity > 0) {
      this.drawNearMissWarning(ctx);
    }
    
    // Draw shockwave if active
    if (this.damageShockwaveActive) {
      this.drawShockwave(ctx);
    }
    
    // Draw trail flame effect
    this.drawTrail(ctx);
    
    // Draw the phoenix body particles
    this.drawBodyParticles(ctx);
    
    // Draw wings
    this.drawWings(ctx);
    
    // Draw tail
    this.drawTail(ctx);
    
    // Draw healing particles
    for (const particle of this.healingParticles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Draw glow effect if active
    if (this.glowIntensity > 1 && this.glowColor) {
      ctx.globalAlpha = (this.glowIntensity - 1) / 2;
      ctx.fillStyle = this.glowColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  
  // Draw the shockwave effect
  drawShockwave(ctx) {
    const opacity = 1 - (this.damageShockwaveRadius / this.damageShockwaveMaxRadius);
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.damageShockwaveRadius
    );
    
    gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
    gradient.addColorStop(0.2, `rgba(255, 200, 50, ${opacity * 0.1})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${opacity * 0.3})`);
    gradient.addColorStop(0.8, `rgba(255, 50, 0, ${opacity * 0.2})`);
    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.damageShockwaveRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw ring at the edge of the shockwave
    ctx.strokeStyle = `rgba(255, 50, 0, ${opacity * 0.7})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.damageShockwaveRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw the near-miss warning effect
  drawNearMissWarning(ctx) {
    // Create a yellow-orange glow around the phoenix
    const intensity = this.nearMissIntensity;
    const glowSize = 30 + 20 * Math.sin(Date.now() / 100); // Pulsating size
    
    // Create radial gradient for warning glow
    const gradient = ctx.createRadialGradient(
      this.x, this.y, this.width / 2,
      this.x, this.y, glowSize
    );
    
    gradient.addColorStop(0, `rgba(255, 255, 0, ${intensity * 0.1})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 0, ${intensity * 0.15})`);
    gradient.addColorStop(1, `rgba(255, 150, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a subtle yellow stroke around phoenix
    ctx.strokeStyle = `rgba(255, 255, 0, ${intensity * 0.4})`;
    ctx.lineWidth = 3 * intensity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add subtle lightning-like arcs around the phoenix
    ctx.strokeStyle = `rgba(255, 255, 100, ${intensity * 0.6})`;
    ctx.lineWidth = 1;
    
    const arcs = 5;
    for (let i = 0; i < arcs; i++) {
      const startAngle = (Math.PI * 2 * i / arcs) + (Date.now() / 500);
      const arcLength = Math.PI / 4 + (Math.PI / 6) * Math.sin(Date.now() / 300 + i);
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2 + 12, startAngle, startAngle + arcLength);
      ctx.stroke();
    }
  }
  
  drawTrail(ctx) {
    if (this.trailPoints.length < 2) return;
    
    // Draw heat radiation glow under the trail
    this.drawTrailHeatGlow(ctx);
    
    // Draw a fading trail connecting previous positions
    for (let i = 1; i < this.trailPoints.length; i++) {
      const p1 = this.trailPoints[i-1];
      const p2 = this.trailPoints[i];
      
      // Create gradient between points
      const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      const alpha = 1 - (i / this.trailPoints.length);
      
      gradient.addColorStop(0, `rgba(255, 120, 50, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 150, 20, ${alpha * 0.2})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 22 * (1 - i / this.trailPoints.length); // Wider trail
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }
  
  drawTrailHeatGlow(ctx) {
    // Draw heat radiation effect
    for (let i = 0; i < this.trailPoints.length; i += 2) { // Skip every other point for performance
      const point = this.trailPoints[i];
      if (!point) continue;
      
      // Calculate age of this trail point
      const pointAge = (Date.now() - point.time) / 1000; // Age in seconds
      
      // Skip if too old
      if (pointAge > 1.5) continue;
      
      // Calculate intensity based on position in trail and age
      const intensity = 1 - (i / this.trailPoints.length) - (pointAge * 0.5);
      if (intensity <= 0) continue;
      
      // Draw heat glow
      const radius = this.trailHeatRadius * (0.5 + intensity * 0.5);
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      gradient.addColorStop(0, `rgba(255, 200, 70, ${intensity * 0.15})`);
      gradient.addColorStop(0.4, `rgba(255, 100, 0, ${intensity * 0.08})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Check if a point is within the heat radius of this trail point
  isPointInHeatRadius(x, y, point) {
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate heat radius based on point age
    const pointAge = (Date.now() - point.time) / 1000; // Age in seconds
    if (pointAge > 1.5) return false; // Too old to cause damage
    
    // Intensity decreases with age
    const intensity = 1 - (pointAge * 0.5);
    if (intensity <= 0) return false;
    
    // Calculate effective radius based on intensity
    const effectiveRadius = this.trailHeatRadius * (0.5 + intensity * 0.5);
    
    return distance < effectiveRadius;
  }
  
  drawBodyParticles(ctx) {
    // Animate and draw body particles
    for (const p of this.bodyParticles) {
      const time = Date.now() / 1000;
      const oscX = Math.sin(time * p.speed + p.phase) * 3;
      const oscY = Math.cos(time * p.speed + p.phase) * 3;
      
      const x = this.x + p.offsetX + oscX;
      const y = this.y + p.offsetY + oscY;
      
      const glowSize = p.size * (1.2 + Math.sin(time * 2 + p.phase) * 0.2);
      
      // Modify color and size for damage flash
      let particleColor = p.color;
      let sizeFactor = 1;
      
      if (this.damageFlashTimer > 0) {
        // Calculate flash intensity (1.0 to 0.0 over the flash duration)
        const flashIntensity = this.damageFlashTimer / this.damageFlashDuration;
        
        // Flash to red color
        particleColor = this.damageFlashTimer > 0.25 * this.damageFlashDuration ? 
                        'rgba(255, 0, 0, 0.9)' : p.color;
        
        // Make particles pulse outward during damage
        sizeFactor = 1 + flashIntensity * 0.5;
      }
      
      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize * 2 * sizeFactor);
      gradient.addColorStop(0, particleColor);
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw particle core
      ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawWings(ctx) {
    // Draw and animate wing particles
    for (const p of this.wingParticles) {
      const time = Date.now() / 1000;
      const wingAngle = p.baseAngle + this.wingAngle;
      
      const x = this.x + Math.cos(wingAngle) * p.distance * p.side;
      const y = this.y + Math.sin(wingAngle) * p.distance;
      
      const oscSize = p.size * (1 + Math.sin(time * p.speed + p.phase) * 0.3);
      
      // Modify color and size for damage flash
      let particleColor = p.color;
      let sizeFactor = 1;
      
      if (this.damageFlashTimer > 0) {
        // Calculate flash intensity (1.0 to 0.0 over the flash duration)
        const flashIntensity = this.damageFlashTimer / this.damageFlashDuration;
        
        // Flash to red color
        particleColor = this.damageFlashTimer > 0.25 * this.damageFlashDuration ? 
                        'rgba(255, 0, 0, 0.9)' : p.color;
        
        // Make particles pulse outward during damage
        sizeFactor = 1 + flashIntensity * 0.5;
      }
      
      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, oscSize * 2 * sizeFactor);
      gradient.addColorStop(0, particleColor);
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, oscSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw particle core
      ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, oscSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawTail(ctx) {
    // Draw and animate tail particles
    for (const p of this.tailParticles) {
      const time = Date.now() / 1000;
      const oscX = Math.sin(time * p.speed + p.phase) * 2;
      
      const x = this.x + p.offsetX + oscX;
      const y = this.y + p.distance;
      
      const oscSize = p.size * (1 + Math.sin(time * p.speed + p.phase) * 0.3);
      
      // Modify color and size for damage flash
      let particleColor = p.color;
      let sizeFactor = 1;
      
      if (this.damageFlashTimer > 0) {
        // Calculate flash intensity (1.0 to 0.0 over the flash duration)
        const flashIntensity = this.damageFlashTimer / this.damageFlashDuration;
        
        // Flash to red color
        particleColor = this.damageFlashTimer > 0.25 * this.damageFlashDuration ? 
                        'rgba(255, 0, 0, 0.9)' : p.color;
        
        // Make particles pulse outward during damage
        sizeFactor = 1 + flashIntensity * 0.5;
      }
      
      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, oscSize * 2 * sizeFactor);
      gradient.addColorStop(0, particleColor);
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, oscSize * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Trigger damage animation and apply damage
  takeDamage(amount = 25) {
    // Don't take damage if invulnerable
    if (this.invulnerableTime > 0) {
      return false;
    }
    
    // Apply damage
    this.health = Math.max(0, this.health - amount);
    
    // Start damage flash
    this.damageFlashTimer = this.damageFlashDuration;
    
    // Start shockwave
    this.damageShockwaveActive = true;
    this.damageShockwaveRadius = 0;
    
    // Make player invulnerable briefly
    this.invulnerableTime = this.invulnerableDuration;
    
    // Create explosion particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 30;
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      this.particleSystem.createEmber(x, y);
    }
    
    // If phoenix died (health reached 0), ensure game over is triggered immediately
    if (this.health <= 0) {
      // Forcefully stop game and set game over
      if (window.gameInstance) {
        // Let the game handle the game over state via handlePhoenixDefeated
        // This method is more complete and includes all necessary state changes
        if (typeof window.gameInstance.handlePhoenixDefeated === 'function') {
          window.gameInstance.handlePhoenixDefeated();
        } else {
          // Fallback to direct property manipulation if the method doesn't exist
          window.gameInstance.isRunning = false;
          window.gameInstance.gameState.gameOver = true;
        }
        console.log('Phoenix defeated - Game over state forced');
      }
    }
    
    // Return whether the phoenix died
    return this.health <= 0;
  }
  
  // Get health percentage
  getHealthPercent() {
    return this.health / this.maxHealth;
  }
  
  // Heal the phoenix
  heal(amount) {
    const previousHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    const actualHealAmount = this.health - previousHealth;
    
    if (actualHealAmount > 0) {
      this.createHealingEffect(actualHealAmount);
      return true;
    }
    return false;
  }
  
  // Create healing effect particles
  createHealingEffect(healAmount) {
    // Create healing particles around the phoenix
    const particleCount = Math.min(20, Math.floor(healAmount * 0.5));
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = this.width * 1.2 + Math.random() * 20;
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      // Create a green healing particle
      const particle = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 2, // Float upward
        size: 3 + Math.random() * 5,
        alpha: 0.9,
        color: `rgba(0, 255, 100, ${Math.random() * 0.5 + 0.5})`,
        life: 40 + Math.random() * 20,
        maxLife: 60
      };
      
      this.healingParticles.push(particle);
    }
    
    // Also add a brief glow effect to the phoenix
    this.glowIntensity = 2;
    this.glowColor = 'rgba(0, 255, 100, 0.7)';
    
    // Reset glow after a short time
    setTimeout(() => {
      this.glowIntensity = 1;
      this.glowColor = null;
    }, 500);
  }
  
  // Trigger near-miss warning effect
  triggerNearMiss() {
    // Only trigger if not already showing a stronger effect (damage)
    if (this.damageFlashTimer <= 0) {
      this.nearMissTimer = this.nearMissDuration;
      
      // Add a few subtle particles for near-miss visualization
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 10;
        const x = this.x + Math.cos(angle) * distance;
        const y = this.y + Math.sin(angle) * distance;
        
        this.particleSystem.createEmber(x, y);
      }
    }
  }
  
  // Apply time dilation effect to the phoenix
  applyTimeDilation(factor = 1.0) {
    // This method modifies how quickly the phoenix moves and animates
    // It's called by hazard systems like dimensional rifts
    // Factor < 1.0 means slower, > 1.0 means faster

    // Store the time dilation factor for use in update methods
    this.timeDilationFactor = factor;
    
    // Visual effect to indicate time dilation
    if (factor < 1.0) {
      // Slow time effect - add blue/purple distortion
      this.createVisualDistortion('timeSlow', 1.0 - factor);
    } else if (factor > 1.0) {
      // Fast time effect - add yellow/red distortion
      this.createVisualDistortion('timeFast', factor - 1.0);
    }
  }
  
  // Apply visual effects like gravity distortion, time dilation, etc.
  applyVisualEffect(effectType, intensity = 0.5) {
    // Called by hazard systems to create visual effects on the phoenix
    
    switch (effectType) {
      case 'dimensionalDistortion':
        // Create dimensional rift distortion effect
        this.createVisualDistortion('dimensional', intensity);
        break;
        
      case 'gravityPull':
        // Create gravity well distortion effect
        this.createVisualDistortion('gravity', intensity);
        break;
        
      case 'timeDilation':
        // Create time dilation visual effect
        this.createVisualDistortion('time', intensity);
        break;
    }
  }
  
  // Helper method to create visual distortion particles
  createVisualDistortion(distortionType, intensity) {
    // Skip if intensity is too low to be visible
    if (intensity < 0.1) return;
    
    // Cap intensity at 1.0
    intensity = Math.min(1.0, intensity);
    
    // Create distortion particles based on type
    const particleCount = Math.floor(5 * intensity);
    
    for (let i = 0; i < particleCount; i++) {
      // Calculate random position around phoenix
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 20;
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      // Choose color based on distortion type
      let color;
      
      switch (distortionType) {
        case 'dimensional':
          color = `rgba(255, 50, 255, ${0.7 * intensity})`;
          break;
        case 'gravity':
          color = `rgba(100, 100, 255, ${0.7 * intensity})`;
          break;
        case 'time':
        case 'timeSlow':
          color = `rgba(50, 100, 255, ${0.7 * intensity})`;
          break;
        case 'timeFast':
          color = `rgba(255, 200, 50, ${0.7 * intensity})`;
          break;
        default:
          color = `rgba(255, 255, 255, ${0.7 * intensity})`;
      }
      
      // Create appropriate effect using particle system
      if (this.particleSystem) {
        if (distortionType === 'dimensional') {
          this.particleSystem.createRiftParticle(x, y, color);
        } else if (distortionType.includes('time')) {
          this.particleSystem.createTimeParticle(x, y, color);
        } else {
          this.particleSystem.createSpecialParticle(x, y, color);
        }
      }
    }
  }
  
  // Create damage visual effect - called by hazards
  createDamageEffect() {
    // Skip if in invulnerable state
    if (this.invulnerableTime > 0) return;
    
    // Create small damage visual without applying actual damage
    const numParticles = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 15;
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      this.particleSystem.createEmber(x, y);
    }
  }
}