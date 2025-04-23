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
    
    // Strafing behavior properties
    this.strafing = false;
    this.strafeTimer = 0;
    this.strafeDirection = Math.random() > 0.5 ? 1 : -1;
    this.strafeSpeed = 350 + Math.random() * 150;
    this.strafeEmissionRate = 0.015;
    this.strafeDuration = 1.2 + Math.random() * 1.0;
    this.strafeCooldown = false;
    this.strafeCooldownTime = 5 + Math.random() * 4;
    this.strafeCooldownTimer = 0;
    this.zigzagFrequency = 15;
    this.zigzagAmplitude = 8 + Math.random() * 12;
    
    // World 2 special - occasional strafing with fire bombs
    this.dropsBombs = Math.random() < 0.4;
    this.bombDropRate = 0.3;
    this.lastBombTime = 0;
    
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
    
    // Set unique World 2 identifier
    this.worldId = 'world2';
    
    this.initializeParticles();
    
    // Randomly start with strafing for some helicopters
    if (Math.random() < 0.2) {
      setTimeout(() => {
        this.startStrafeRun();
      }, 2000 + Math.random() * 3000);
    }
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
    // Update cooldown timer if we're cooling down
    if (this.strafeCooldown) {
      this.strafeCooldownTimer += deltaTime;
      if (this.strafeCooldownTimer >= this.strafeCooldownTime) {
        this.strafeCooldown = false;
        this.strafeCooldownTimer = 0;
        
        // Randomly start another strafe after cooldown
        if (Math.random() < 0.4) {
          this.startStrafeRun();
        }
      }
    }
    
    // Choose between strafing movement and normal movement
    if (this.strafing) {
      this.updateStrafeMovement(deltaTime);
    } else {
      this.updateNormalMovement(deltaTime);
      
      // Randomly enter strafe mode if not in cooldown
      if (!this.strafeCooldown && !this.chargeMode && Math.random() < 0.002) {
        this.startStrafeRun();
      }
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
  
  // Split the regular movement logic into a separate method
  updateNormalMovement(deltaTime) {
    // Basic movement downward
    this.y += this.speed * deltaTime;
    
    // Occasionally enter charge mode to target player
    this.chargeTimer += deltaTime;
    if (!this.chargeMode && this.chargeTimer > 5 && Math.random() < 0.02) {
      this.chargeMode = true;
      this.chargeTimer = 0;
      
      // WORLD 2 FIX: Always set an initial horizontal target 
      // This prevents the helicopter from ever targeting straight up
      const randomHorizontalOffset = (Math.random() > 0.5 ? 200 : -200);
      this.targetX = this.x + randomHorizontalOffset;
      this.targetY = this.y - 100; 
      console.log("🌋 World2 Helicopter initializing chase with target:", this.targetX, this.targetY);
      
      // Reset target indicator animation
      this.targetIndicator.angle = 0;
      this.targetIndicator.pulseSize = 1;
      this.targetIndicator.opacity = 1;
    }
    
    if (this.chargeMode) {
      // Move towards stored target - this will be updated to player position
      // in the game's update loop when checking for collisions
      
      // WORLD 2 FIX: Safety check for straight-up targeting
      const isTargetingUp = Math.abs(this.targetX - this.x) < 10 && this.targetY < this.y;
      if (isTargetingUp) {
        // Force a horizontal component to the target if it's targeting straight up
        console.log("🌋 World2 Helicopter was targeting straight up - fixing target");
        this.targetX = this.x + (Math.random() > 0.5 ? 200 : -200);
        this.targetY = this.y - 100;
      }
      
      // Check if we have valid target coordinates
      if (typeof this.targetX !== 'number' || typeof this.targetY !== 'number' || 
          isNaN(this.targetX) || isNaN(this.targetY)) {
        // If target is invalid, exit charge mode and resume normal movement
        this.chargeMode = false;
        this.chargeTimer = 0;
        this.targetIndicator.opacity = 0;
        console.log("World2 FlameHelicopter: Invalid target coordinates, exiting charge mode");
      } else {
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
  }
  
  // Strafing behavior methods
  startStrafeRun() {
    if (this.strafing || this.strafeCooldown) return;
    
    console.log("🌋 World2 Helicopter starting strafe run");
    this.strafing = true;
    this.strafeTimer = 0;
    
    // Choose a random direction for strafing (left to right or right to left)
    this.strafeDirection = Math.random() > 0.5 ? 1 : -1;
    
    // Position the helicopter just off-screen on the side we're coming from
    if (this.strafeDirection > 0) {
      this.x = -50; // Start from left side
    } else {
      this.x = window.innerWidth + 50; // Start from right side
    }
    
    // Random Y position in the upper half of the screen
    this.y = window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.3);
    
    // Increase rotor speed during strafing
    this.rotorSpeed = 15;
    
    // Create a particle burst effect
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      const speed = 1 + Math.random() * 2;
      this.particleSystem.createEmber(
        this.x + Math.cos(angle) * distance,
        this.y + Math.sin(angle) * distance,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  }
  
  endStrafeRun() {
    if (!this.strafing) return;
    
    console.log("🌋 World2 Helicopter ending strafe run");
    this.strafing = false;
    this.strafeCooldown = true;
    this.strafeCooldownTimer = 0;
    this.rotorSpeed = 8 + Math.random() * 4; // Reset rotor speed
    
    // Create a particle burst effect
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 20;
      this.particleSystem.createFlame(
        this.x + Math.cos(angle) * distance,
        this.y + Math.sin(angle) * distance
      );
    }
  }
  
  updateStrafeMovement(deltaTime) {
    // Update strafe timer
    this.strafeTimer += deltaTime;
    
    // Move horizontally at high speed with zigzag pattern
    this.x += this.strafeDirection * this.strafeSpeed * deltaTime;
    
    // World 2 special - zigzag movement
    const zigzagOffset = Math.sin(this.strafeTimer * this.zigzagFrequency) * this.zigzagAmplitude;
    this.y += zigzagOffset * deltaTime * 10;
    
    // World 2 special - drop fire bombs during strafe
    if (this.dropsBombs && Math.random() < this.bombDropRate * deltaTime) {
      this.dropFireBomb();
    }
    
    // Emit a stream of particles behind the helicopter
    if (Math.random() < 0.5) {
      const offsetX = -this.strafeDirection * (10 + Math.random() * 30);
      const offsetY = (Math.random() - 0.5) * 15;
      
      this.particleSystem.createFlame(
        this.x + offsetX,
        this.y + offsetY,
        -this.strafeDirection * 1,
        (Math.random() - 0.5) * 0.5
      );
      
      if (Math.random() < 0.3) {
        this.particleSystem.createEmber(
          this.x + offsetX,
          this.y + offsetY,
          -this.strafeDirection * 2,
          (Math.random() - 0.5)
        );
      }
    }
    
    // End strafe if duration is over or helicopter is off-screen
    if (this.strafeTimer >= this.strafeDuration ||
        this.x < -100 || 
        this.x > window.innerWidth + 100) {
      this.endStrafeRun();
    }
  }
  
  // World 2 special - drop explosive fire bombs during strafing
  dropFireBomb() {
    const bombX = this.x;
    const bombY = this.y + 20;
    
    // Create the bomb visual effect
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 8;
      this.particleSystem.createEmber(
        bombX + Math.cos(angle) * distance,
        bombY + Math.sin(angle) * distance,
        Math.cos(angle) * 0.5,
        Math.sin(angle) * 0.5 + 2 // Fall downward faster
      );
    }
    
    // Create an explosion after a delay
    setTimeout(() => {
      // Check if we're still active before creating explosion
      if (this.particleSystem) {
        // Create explosion effect
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 10 + Math.random() * 20;
          const speed = 2 + Math.random() * 3;
          
          this.particleSystem.createFlame(
            bombX + Math.cos(angle) * 10,
            bombY + 100 + Math.sin(angle) * 10,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
          
          if (i % 3 === 0) {
            this.particleSystem.createEmber(
              bombX + Math.cos(angle) * 5,
              bombY + 100 + Math.sin(angle) * 5,
              Math.cos(angle) * speed * 1.5,
              Math.sin(angle) * speed * 1.5
            );
          }
        }
      }
    }, 800 + Math.random() * 200);
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