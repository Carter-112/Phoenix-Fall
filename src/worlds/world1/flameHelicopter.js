export class FlameHelicopter {
  constructor(x, y, particleSystem) {
    this.x = x;
    this.y = y;
    this.size = 40 + Math.random() * 20;
    this.particleSystem = particleSystem;
    this.speed = 60 + Math.random() * 30; // Slightly slower but more maneuverable
    this.particleTimer = 0;
    this.rotorAngle = 0;
    this.rotorSpeed = 8 + Math.random() * 4;
    this.health = 7; // More health to make them more challenging
    this.maxHealth = 7; // Store maximum health
    this.glowTimer = 0;
    
    // Burning effect properties
    this.burning = false;
    this.burnIntensity = 0;
    this.burnTimer = 0;
    this.burnDuration = 0;
    this.burnDamageRate = 0;
    this.lastBurnDamageTime = 0;
    
    // Enhanced movement patterns
    this.horzDirection = Math.random() > 0.5 ? 1 : -1;
    this.horzSpeed = 30 + Math.random() * 40; // Faster horizontal movement
    this.horzTimer = 0;
    this.horzInterval = 0.8 + Math.random() * 1.6; // More frequent direction changes
    this.chargeMode = false;
    this.chargeTimer = 0;
    this.targetX = x;
    this.targetY = y;
    this.targetIndicator = {
      angle: 0,
      pulseSize: 1,
      opacity: 0
    };
    
    // Particles configuration
    this.bodyParticles = [];
    this.rotorParticles = [];
    this.tailParticles = [];
    
    // Color palette for helicopter - fiery oranges and reds
    this.flameColors = [
      { h: 10, s: 100, l: 50 },  // Deep red-orange
      { h: 20, s: 100, l: 45 },  // Burnt orange
      { h: 30, s: 90, l: 40 },   // Dark amber
    ];
    
    this.initializeParticles();
  }
  
  initializeParticles() {
    // Body particles (helicopter fuselage)
    for (let i = 0; i < 15; i++) {
      this.bodyParticles.push({
        offsetX: (Math.random() - 0.5) * 20,
        offsetY: (Math.random() - 0.5) * 10,
        size: 3 + Math.random() * 3,
        color: this.getRandomFlameColor(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1
      });
    }
    
    // Rotor blades particles
    for (let blade = 0; blade < 4; blade++) {
      const bladeAngle = (blade / 4) * Math.PI * 2;
      
      for (let i = 0; i < 8; i++) {
        const distance = 10 + i * 3; // Distribute along blade length
        
        this.rotorParticles.push({
          blade: blade,
          distance: distance,
          angle: bladeAngle,
          size: 3 + Math.random() * 2,
          color: this.getRandomFlameColor(true), // Brighter for rotors
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5
        });
      }
    }
    
    // Tail particles
    for (let i = 0; i < 10; i++) {
      this.tailParticles.push({
        offsetX: -20 - i * 2, // Extend to the left
        offsetY: (Math.random() - 0.5) * 5,
        size: 3 + Math.random() * 2 - i * 0.15, // Smaller as they go back
        color: this.getRandomFlameColor(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1
      });
    }
    
    // Tail rotor particles
    for (let blade = 0; blade < 2; blade++) {
      const bladeAngle = (blade / 2) * Math.PI;
      
      for (let i = 0; i < 4; i++) {
        const distance = 5 + i * 2;
        
        this.rotorParticles.push({
          blade: blade + 10, // Different ID to distinguish from main rotor
          distance: distance,
          tailRotor: true,
          angle: bladeAngle,
          size: 2 + Math.random() * 1.5,
          color: this.getRandomFlameColor(true),
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5
        });
      }
    }
  }
  
  getRandomFlameColor(brighter = false) {
    const colorIdx = Math.floor(Math.random() * this.flameColors.length);
    const color = this.flameColors[colorIdx];
    
    // Add variation and make brighter if requested
    const h = color.h + (Math.random() - 0.5) * 10;
    const s = color.s;
    const l = color.l + (Math.random() - 0.5) * 10 + (brighter ? 20 : 0);
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  
  update(deltaTime) {
    // Basic movement downward
    this.y += this.speed * deltaTime;
    
    // Occasionally enter charge mode to target player
    this.chargeTimer += deltaTime;
    if (!this.chargeMode && this.chargeTimer > 5 && Math.random() < 0.02) {
      this.chargeMode = true;
      // Store current position as target - will be updated during game collision detection
      this.chargeTimer = 0;
      
      // Reset target indicator animation
      this.targetIndicator.angle = 0;
      this.targetIndicator.pulseSize = 1;
      this.targetIndicator.opacity = 1;
    }
    
    if (this.chargeMode) {
      // Move towards stored target - this will be updated to player position
      // in the game's update loop when checking for collisions
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 10) {
        this.x += dx * 0.8 * deltaTime;
        this.y += dy * 0.4 * deltaTime; // Still move down but more focused on x-targeting
      } else {
        // Exit charge mode if we reached the target
        this.chargeMode = false;
        this.chargeTimer = 0;
        this.targetIndicator.opacity = 0; // Hide indicator when exiting charge mode
      }
    } else {
      // Standard horizontal movement pattern
      this.horzTimer += deltaTime;
      if (this.horzTimer > this.horzInterval) {
        this.horzDirection *= -1;
        this.horzTimer = 0;
        this.horzInterval = 0.8 + Math.random() * 1.6;
      }
      
      this.x += this.horzDirection * this.horzSpeed * deltaTime;
    }
    
    // Rotate the helicopter blades
    this.rotorAngle += this.rotorSpeed * deltaTime;
    if (this.rotorAngle > Math.PI * 2) {
      this.rotorAngle -= Math.PI * 2;
    }
    
    // Emit flame particles for engine exhaust effect
    this.particleTimer += deltaTime;
    if (this.particleTimer > 0.05) {
      // Main engine exhaust
      this.particleSystem.createFlame(
        this.x - 15 + (Math.random() - 0.5) * 5,
        this.y + 5 + (Math.random() - 0.5) * 5
      );
      
      // Rotor flame particles
      const rotorX = this.x + Math.cos(this.rotorAngle) * 25;
      const rotorY = this.y + Math.sin(this.rotorAngle) * 25;
      this.particleSystem.createEmber(rotorX, rotorY);
      
      this.particleTimer = 0;
    }
    
    // Decrease glow timer when hit
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
          const offsetX = (Math.random() - 0.5) * this.size * 0.8;
          const offsetY = (Math.random() - 0.5) * this.size * 0.8;
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
    
    // Animate target indicator when in charge mode
    if (this.chargeMode) {
      // Rotate the indicator
      this.targetIndicator.angle += 2 * deltaTime;
      if (this.targetIndicator.angle > Math.PI * 2) {
        this.targetIndicator.angle -= Math.PI * 2;
      }
      
      // Pulse the indicator size
      this.targetIndicator.pulseSize = 1 + 0.3 * Math.sin(Date.now() / 100);
    } else if (this.targetIndicator.opacity > 0) {
      // Fade out indicator when not in charge mode
      this.targetIndicator.opacity -= deltaTime * 3;
      if (this.targetIndicator.opacity < 0) this.targetIndicator.opacity = 0;
    }
  }
  
  draw(ctx) {
    // Draw burning aura if burning
    if (this.burning && this.burnIntensity > 0) {
      this.drawBurningEffect(ctx);
    }
    
    // Draw tail first (behind body)
    this.drawTail(ctx);
    
    // Draw main body
    this.drawBody(ctx);
    
    // Draw rotors on top
    this.drawRotors(ctx);
    
    // Draw targeting indicator when in charge mode
    if (this.targetIndicator.opacity > 0) {
      this.drawTargetIndicator(ctx);
    }
  }
  
  drawBurningEffect(ctx) {
    // Draw fire aura around the helicopter
    const intensity = this.burnIntensity;
    const radius = this.size * 0.7;
    
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
    
    // Draw flickering flames around the edges
    const flameCount = Math.floor(10 * intensity);
    for (let i = 0; i < flameCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius * 0.8 + Math.random() * radius * 0.3;
      const flameHeight = radius * 0.3 * intensity * (0.7 + Math.random() * 0.6);
      const flameWidth = flameHeight * 0.4;
      
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      // Draw a flame shape
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Control points for flame curve
      const cpx1 = x + Math.cos(angle) * flameHeight * 0.5 + Math.cos(angle + Math.PI/2) * flameWidth;
      const cpy1 = y + Math.sin(angle) * flameHeight * 0.5 + Math.sin(angle + Math.PI/2) * flameWidth;
      
      const cpx2 = x + Math.cos(angle) * flameHeight * 0.5 + Math.cos(angle - Math.PI/2) * flameWidth;
      const cpy2 = y + Math.sin(angle) * flameHeight * 0.5 + Math.sin(angle - Math.PI/2) * flameWidth;
      
      const tipX = x + Math.cos(angle) * flameHeight;
      const tipY = y + Math.sin(angle) * flameHeight;
      
      // Draw the flame shape using quadratic curves
      ctx.quadraticCurveTo(cpx1, cpy1, tipX, tipY);
      ctx.quadraticCurveTo(cpx2, cpy2, x, y);
      
      // Fill with flame gradient
      const flameGradient = ctx.createLinearGradient(
        x, y,
        tipX, tipY
      );
      
      flameGradient.addColorStop(0, `rgba(255, 255, 100, ${intensity * 0.9})`);
      flameGradient.addColorStop(0.5, `rgba(255, 150, 50, ${intensity * 0.7})`);
      flameGradient.addColorStop(1, `rgba(255, 50, 0, ${intensity * 0.3})`);
      
      ctx.fillStyle = flameGradient;
      ctx.fill();
    }
  }
  
  drawTargetIndicator(ctx) {
    ctx.save();
    
    // Draw red glowing circle around helicopter
    const baseSize = this.size * 0.6;
    const pulseSize = baseSize * this.targetIndicator.pulseSize;
    
    // Create a bright red glow
    const glowGradient = ctx.createRadialGradient(
      this.x, this.y, baseSize * 0.5,
      this.x, this.y, pulseSize
    );
    
    glowGradient.addColorStop(0, `rgba(255, 50, 50, ${0.7 * this.targetIndicator.opacity})`);
    glowGradient.addColorStop(0.6, `rgba(255, 30, 30, ${0.4 * this.targetIndicator.opacity})`);
    glowGradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw targeting triangles around the helicopter
    ctx.strokeStyle = `rgba(255, 50, 50, ${this.targetIndicator.opacity})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 3; i++) {
      const angle = this.targetIndicator.angle + (i * Math.PI * 2 / 3);
      const distance = pulseSize * 1.2;
      
      const x = this.x + Math.cos(angle) * distance;
      const y = this.y + Math.sin(angle) * distance;
      
      // Draw triangle pointer
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * 10,
        y + Math.sin(angle) * 10
      );
      ctx.lineTo(
        x + Math.cos(angle + Math.PI * 0.8) * 8,
        y + Math.sin(angle + Math.PI * 0.8) * 8
      );
      ctx.lineTo(
        x + Math.cos(angle - Math.PI * 0.8) * 8,
        y + Math.sin(angle - Math.PI * 0.8) * 8
      );
      ctx.closePath();
      ctx.stroke();
    }
    
    // Draw targeting line to player when target is set
    if (this.targetX && this.targetY) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > pulseSize) {
        const angle = Math.atan2(dy, dx);
        const lineLength = Math.min(distance - pulseSize, 100);
        
        // Calculate start and end points for the line
        const startX = this.x + Math.cos(angle) * pulseSize;
        const startY = this.y + Math.sin(angle) * pulseSize;
        const endX = startX + Math.cos(angle) * lineLength;
        const endY = startY + Math.sin(angle) * lineLength;
        
        // Create gradient for line
        const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        lineGradient.addColorStop(0, `rgba(255, 50, 50, ${this.targetIndicator.opacity})`);
        lineGradient.addColorStop(1, `rgba(255, 50, 50, 0)`);
        
        // Draw dotted targeting line
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    
    ctx.restore();
  }
  
  drawBody(ctx) {
    // Draw body particles for helicopter fuselage
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
      
      gradient.addColorStop(1, 'rgba(120, 20, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw particle core
      ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw cockpit window (more visible during hit)
    const windowSize = 6 + (this.glowTimer > 0 ? this.glowTimer * 4 : 0);
    
    ctx.fillStyle = this.glowTimer > 0 ? 'rgba(255, 255, 200, 0.9)' : 'rgba(100, 200, 255, 0.7)';
    
    // Cockpit window
    ctx.beginPath();
    ctx.arc(this.x + 10, this.y - 2, windowSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawRotors(ctx) {
    // Draw rotating blades made of particles
    for (const p of this.rotorParticles) {
      const time = Date.now() / 1000;
      
      // Determine if this is a tail rotor particle
      const isTailRotor = p.tailRotor === true;
      
      // Calculate position based on current rotor angle
      let rotorAngle = this.rotorAngle + p.angle;
      let x, y;
      
      if (isTailRotor) {
        // Tail rotor position and faster rotation
        rotorAngle = this.rotorAngle * 1.5 + p.angle;
        x = this.x - 25 + Math.cos(rotorAngle) * p.distance;
        y = this.y + Math.sin(rotorAngle) * p.distance;
      } else {
        // Main rotor position
        x = this.x + Math.cos(rotorAngle) * p.distance;
        y = this.y + Math.sin(rotorAngle) * p.distance;
      }
      
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
      
      gradient.addColorStop(1, 'rgba(150, 50, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, oscSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw particle core
      ctx.fillStyle = 'rgba(255, 220, 150, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, oscSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw subtle rotor hub
    ctx.fillStyle = 'rgba(200, 100, 50, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw tail rotor hub
    ctx.fillStyle = 'rgba(200, 100, 50, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x - 25, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  drawTail(ctx) {
    // Draw tail particles
    for (const p of this.tailParticles) {
      const time = Date.now() / 1000;
      const oscX = Math.sin(time * p.speed + p.phase) * 1;
      const oscY = Math.cos(time * p.speed + p.phase) * 1;
      
      const x = this.x + p.offsetX + oscX;
      const y = this.y + p.offsetY + oscY;
      
      let glowMultiplier = 1;
      if (this.glowTimer > 0) {
        glowMultiplier = 1.5 + this.glowTimer * 2;
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
      
      gradient.addColorStop(1, 'rgba(120, 20, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  takeDamage() {
    this.health--;
    this.glowTimer = 0.3; // Glow effect duration in seconds
    
    // Increase rotor speed when damaged
    this.rotorSpeed += 2;
    
    // Emit damage particles
    for (let i = 0; i < 5; i++) {
      this.particleSystem.createEmber(
        this.x + (Math.random() - 0.5) * 20,
        this.y + (Math.random() - 0.5) * 20
      );
    }
    
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
      x: this.x - this.size / 2,
      y: this.y - this.size / 2,
      width: this.size,
      height: this.size
    };
  }
}