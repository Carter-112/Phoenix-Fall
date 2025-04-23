import { ParticleEmitter } from '../particles/ParticleEmitter.js';

export class FlameHelicopter {
  constructor(x, y, particleSystem) {
    this.x = x;
    this.y = y;
    this.size = 40 + Math.random() * 20;
    this.particleSystem = particleSystem;
    this.speed = 90 + Math.random() * 50; // Base movement speed
    this.particleTimer = 0;
    this.rotorAngle = 0;
    this.rotorSpeed = 10 + Math.random() * 5;
    this.health = 3; // More health to make them more challenging
    this.maxHealth = 3; // Store maximum health
    this.glowTimer = 0;
    
    // Burning effect properties
    this.burning = false;
    this.burnIntensity = 0;
    this.burnTimer = 0;
    this.burnDuration = 0;
    this.burnDamageRate = 0;
    this.lastBurnDamageTime = 0;
    
    // Enhanced movement patterns - using only this for movement now
    this.horzDirection = Math.random() > 0.5 ? 1 : -1;
    this.horzSpeed = 30 + Math.random() * 40; // Faster horizontal movement
    this.horzTimer = 0;
    this.horzInterval = 0.8 + Math.random() * 1.6; // More frequent direction changes
    
    // Add some vertical oscillation
    this.vertDirection = Math.random() > 0.5 ? 1 : -1;
    this.vertSpeed = 20 + Math.random() * 20;
    this.vertTimer = 0;
    this.vertInterval = 1.2 + Math.random() * 1.8;
    
    // Strafing run properties
    this.strafing = false;
    this.strafeSpeed = 300; // Faster than normal movement
    this.strafeTimer = 0;
    this.strafeDuration = 1.5; // How long a strafe lasts
    this.strafeCooldown = 0;
    this.strafeCooldownTime = 7 + Math.random() * 5; // Time between strafes
    this.strafeEmissionRate = 0.02; // Faster particle emission during strafe
    this.strafeDirection = 0; // Will be set when strafing starts
    
    // Particles configuration
    this.bodyParticles = [];
    this.rotorParticles = [];
    this.tailParticles = [];
    
    // World-specific color palettes
    this.worldFlameColors = {
      1: [ // World 1 - red/orange
        { h: 10, s: 100, l: 50 },  // Deep red-orange
        { h: 20, s: 100, l: 45 },  // Burnt orange
        { h: 30, s: 90, l: 40 },   // Dark amber
      ],
      2: [ // World 2 - teal/green
        { h: 160, s: 90, l: 40 },  // Dark teal
        { h: 170, s: 90, l: 35 },  // Murky teal
        { h: 180, s: 80, l: 30 },  // Deep cyan
      ],
      3: [ // World 3 - blue
        { h: 200, s: 90, l: 40 },  // Dark blue
        { h: 210, s: 90, l: 35 },  // Navy
        { h: 220, s: 80, l: 30 },  // Deep royal blue
      ],
      4: [ // World 4 - purple
        { h: 270, s: 90, l: 40 },  // Dark purple
        { h: 280, s: 90, l: 35 },  // Deep violet
        { h: 290, s: 80, l: 30 },  // Magenta-purple
      ],
      5: [ // World 5 - red
        { h: 350, s: 90, l: 40 },  // Dark red
        { h: 0, s: 90, l: 35 },    // Crimson
        { h: 10, s: 80, l: 30 },   // Blood red
      ],
      6: [ // World 6 - gold
        { h: 30, s: 90, l: 40 },   // Dark gold
        { h: 40, s: 90, l: 35 },   // Bronze
        { h: 50, s: 80, l: 30 },   // Amber
      ]
    };
    
    // Set initial colors based on current world
    this.getCurrentWorldColors();
    this.initializeParticles();
    
    // Set active by default
    this.active = true;
  }
  
  getCurrentWorldColors() {
    // Default to World 1 colors
    this.flameColors = this.worldFlameColors[1];
    
    // Try to get current world from game instance
    if (window.gameInstance && window.gameInstance.worldManager) {
      const worldNumber = window.gameInstance.worldManager.getCurrentWorldNumber();
      if (this.worldFlameColors[worldNumber]) {
        this.flameColors = this.worldFlameColors[worldNumber];
      }
    }
  }
  
  initializeParticles() {
    // Reset particle arrays
    this.bodyParticles = [];
    this.rotorParticles = [];
    this.tailParticles = [];
    
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
    // Check if world has changed (every ~5 seconds)
    if (Math.random() < 0.01) {
      const oldColors = this.flameColors;
      this.getCurrentWorldColors();
      
      // Reinitialize particles if colors changed
      if (oldColors !== this.flameColors) {
        this.initializeParticles();
      }
    }
    
    // Update strafing cooldown if not currently strafing
    if (!this.strafing) {
      this.strafeCooldown -= deltaTime;
      
      // Check if we should start a strafe run
      if (this.strafeCooldown <= 0) {
        this.startStrafeRun();
      }
    }
    
    // Handle movement based on current mode
    if (this.strafing) {
      this.updateStrafeMovement(deltaTime);
    } else {
      this.updateNormalMovement(deltaTime);
    }
    
    // Rotate the helicopter blades
    this.rotorAngle += this.rotorSpeed * deltaTime;
    if (this.rotorAngle > Math.PI * 2) {
      this.rotorAngle -= Math.PI * 2;
    }
    
    // Emit flame particles for engine exhaust effect
    this.particleTimer += deltaTime;
    const emissionRate = this.strafing ? this.strafeEmissionRate : 0.05;
    
    if (this.particleTimer > emissionRate) {
      // Main engine exhaust
      this.particleSystem.createFlame(
        this.x - 15 + (Math.random() - 0.5) * 5,
        this.y + 5 + (Math.random() - 0.5) * 5
      );
      
      // Rotor flame particles
      const rotorX = this.x + Math.cos(this.rotorAngle) * 25;
      const rotorY = this.y + Math.sin(this.rotorAngle) * 25;
      this.particleSystem.createEmber(rotorX, rotorY);
      
      // Extra trail particles during strafe
      if (this.strafing) {
        // Create a trail of flames behind the helicopter
        for (let i = 0; i < 3; i++) {
          const offsetX = -this.strafeDirection * (10 + i * 5) + (Math.random() - 0.5) * 10;
          const offsetY = (Math.random() - 0.5) * 10;
          this.particleSystem.createFlame(this.x + offsetX, this.y + offsetY);
        }
      }
      
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
  }
  
  // Split movement into separate methods for better organization
  updateNormalMovement(deltaTime) {
    // Basic movement downward
    this.y += this.speed * deltaTime;
    
    // Horizontal movement pattern
    this.horzTimer += deltaTime;
    if (this.horzTimer > this.horzInterval) {
      this.horzDirection *= -1;
      this.horzTimer = 0;
      this.horzInterval = 0.8 + Math.random() * 1.6;
    }
    
    this.x += this.horzDirection * this.horzSpeed * deltaTime;
    
    // Vertical oscillation (small up/down movements)
    this.vertTimer += deltaTime;
    if (this.vertTimer > this.vertInterval) {
      this.vertDirection *= -1;
      this.vertTimer = 0;
      this.vertInterval = 1.2 + Math.random() * 1.8;
    }
    
    // Apply slight vertical oscillation
    this.y += this.vertDirection * this.vertSpeed * 0.2 * deltaTime;
  }
  
  updateStrafeMovement(deltaTime) {
    // Update strafe timer
    this.strafeTimer += deltaTime;
    
    // Move fast in strafe direction with slight downward drift
    this.x += this.strafeDirection * this.strafeSpeed * deltaTime;
    this.y += this.speed * 0.2 * deltaTime; // Slower vertical movement during strafe
    
    // Increase rotor speed during strafe for dramatic effect
    this.rotorSpeed = 15 + Math.sin(this.strafeTimer * 10) * 5;
    
    // End strafe if duration is over or helicopter is off-screen
    if (this.strafeTimer >= this.strafeDuration ||
        this.x < -100 || 
        this.x > window.innerWidth + 100) {
      this.endStrafeRun();
    }
  }
  
  startStrafeRun() {
    // Don't start a strafe if already strafing
    if (this.strafing) return;
    
    this.strafing = true;
    this.strafeTimer = 0;
    
    // Determine strafe direction based on position
    // If on left side, go right; if on right side, go left
    if (this.x < window.innerWidth / 2) {
      this.strafeDirection = 1; // Right
    } else {
      this.strafeDirection = -1; // Left
    }
    
    // Play a sound if we have access to the sound manager
    if (window.gameInstance && window.gameInstance.soundManager) {
      // Check if the specific method exists before calling it
      if (typeof window.gameInstance.soundManager.playHelicopterCharge === 'function') {
        window.gameInstance.soundManager.playHelicopterCharge(0.5);
      } else if (typeof window.gameInstance.soundManager.playEffect === 'function') {
        // Try to use a generic sound effect method as fallback
        window.gameInstance.soundManager.playEffect('helicopterCharge', 0.5);
      }
    }
    
    // Create a burst of particles to indicate the start of the strafe
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 20;
      this.particleSystem.createEmber(
        this.x + Math.cos(angle) * distance,
        this.y + Math.sin(angle) * distance
      );
    }
    
    // Temporarily increase the helicopter's glow
    this.glowTimer = 0.5;
  }
  
  endStrafeRun() {
    this.strafing = false;
    // Reset the cooldown
    this.strafeCooldown = this.strafeCooldownTime;
    // Reset rotor speed
    this.rotorSpeed = 10 + Math.random() * 5;
    
    // Create a burst of particles to indicate the end of the strafe
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 10;
      this.particleSystem.createFlame(
        this.x + Math.cos(angle) * distance,
        this.y + Math.sin(angle) * distance
      );
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