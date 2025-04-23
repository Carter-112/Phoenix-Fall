// World 1 specific FlameHelicopter implementation
import { FlameHelicopter } from '../../entities/flameHelicopter.js';

class World1FlameHelicopter extends FlameHelicopter {
  constructor(x, y, particleSystem) {
    super(x, y, particleSystem);
    
    // Make World 1 helicopters slightly slower but more aggressive
    this.speed = 80 + Math.random() * 40;
    this.worldId = 'world1'; // Add a unique identifier for debugging
    
    // Enhanced horizontal movement (more erratic)
    this.horzSpeed = 50 + Math.random() * 50; // Faster horizontal movement
    this.horzInterval = 0.6 + Math.random() * 1.2; // More frequent direction changes
    
    // Enhanced vertical oscillation (more pronounced)
    this.vertSpeed = 30 + Math.random() * 25;
    this.vertInterval = 1.0 + Math.random() * 1.5;
    
    // Enhanced strafing for World 1 helicopters - more frequent and faster
    this.strafeSpeed = 400 + Math.random() * 100; // Even faster strafing
    this.strafeDuration = 1.0 + Math.random() * 0.8; // Shorter but more impactful
    this.strafeCooldownTime = 4 + Math.random() * 3; // Less time between strafes
    this.strafeEmissionRate = 0.01; // Even more particles during strafe
    
    // Add charge mode properties for World 1
    this.chargeMode = false;
    this.chargeTimer = 0;
    this.targetX = null;
    this.targetY = null;
    
    // Higher chance to start with strafing
    if (Math.random() < 0.3) {
      setTimeout(() => {
        if (this.active) this.startStrafeRun();
      }, 1000 + Math.random() * 2000);
    }
    
    console.log(`🚁 WORLD1: Created helicopter at (${x.toFixed(1)}, ${y.toFixed(1)})`);
  }
  
  // Override update for world-specific behaviors
  update(deltaTime) {
    if (!this.active) return;
    
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
    
    // World 1 specific movement adjustments
    if (this.strafing) {
      this.updateStrafeMovement(deltaTime);
    } else if (this.chargeMode) {
      this.updateChargeMovement(deltaTime);
    } else {
      this.updateNormalMovement(deltaTime);
    }
  }
  
  // New method for World 1: updateChargeMovement
  updateChargeMovement(deltaTime) {
    // Safety check for straight-up targeting
    const isTargetingUp = Math.abs(this.targetX - this.x) < 10 && this.targetY < this.y;
    if (isTargetingUp) {
      // Force a horizontal component to the target if it's targeting straight up
      console.log("🚁 WORLD1: Helicopter was targeting straight up - fixing target");
      this.targetX = this.x + (Math.random() > 0.5 ? 200 : -200);
      this.targetY = this.y - 100;
    }
    
    // Check if we have valid target coordinates
    if (typeof this.targetX !== 'number' || typeof this.targetY !== 'number' || 
        isNaN(this.targetX) || isNaN(this.targetY)) {
      // If target is invalid, exit charge mode and resume normal movement
      this.chargeMode = false;
      this.chargeTimer = 0;
      console.log("WORLD1 FlameHelicopter: Invalid target coordinates, exiting charge mode");
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
        console.log("WORLD1 FlameHelicopter: Reached target, exiting charge mode");
      }
    }
  }
  
  // Override to handle charge mode
  updateNormalMovement(deltaTime) {
    // Basic movement downward
    this.y += this.speed * deltaTime;
    
    // Occasionally enter charge mode to target player
    this.chargeTimer += deltaTime;
    if (!this.chargeMode && this.chargeTimer > 5 && Math.random() < 0.02) {
      this.enterChargeMode();
    }
    
    // Standard horizontal movement pattern
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
  
  // New method to enter charge mode
  enterChargeMode() {
    this.chargeMode = true;
    this.chargeTimer = 0;
    
    // WORLD 1 FIX: Always set an initial horizontal target 
    // This prevents the helicopter from ever targeting straight up
    const randomHorizontalOffset = (Math.random() > 0.5 ? 200 : -200);
    this.targetX = this.x + randomHorizontalOffset;
    this.targetY = this.y - 100; 
    console.log("🚁 WORLD1: Helicopter initializing chase with target:", this.targetX, this.targetY);
    
    // Create a burst of particles to indicate the start of the charge
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
  
  // Enhanced strafe effect for World 1
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
    
    console.log(`🚁 WORLD1: Helicopter starting aggressive strafe run`);
    
    // Create an even bigger burst of particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 25;
      this.particleSystem.createEmber(
        this.x + Math.cos(angle) * distance,
        this.y + Math.sin(angle) * distance,
        Math.cos(angle) * 2,
        Math.sin(angle) * 2
      );
    }
  }
  
  // Enhanced end strafe effect
  endStrafeRun() {
    if (!this.strafing) return;
    
    this.strafing = false;
    // Reset the cooldown
    this.strafeCooldown = this.strafeCooldownTime;
    // Reset rotor speed
    this.rotorSpeed = 10 + Math.random() * 5;
    
    // Create extra flame particles when ending a strafe
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 8 + Math.random() * 12;
      this.particleSystem.createFlame(
        this.x + Math.cos(angle) * distance,
        this.y + Math.sin(angle) * distance
      );
    }
  }
  
  // Override updateStrafeMovement for more violent strafing
  updateStrafeMovement(deltaTime) {
    // Update strafe timer
    this.strafeTimer += deltaTime;
    
    // Move even faster in strafe direction with slight random vertical jitter
    this.x += this.strafeDirection * this.strafeSpeed * deltaTime;
    this.y += (this.speed * 0.2 + (Math.random() - 0.5) * 30) * deltaTime;
    
    // Wild rotor spinning during strafe
    this.rotorSpeed = 20 + Math.sin(this.strafeTimer * 15) * 8;
    
    // End strafe if duration is over or helicopter is off-screen
    if (this.strafeTimer >= this.strafeDuration ||
        this.x < -100 || 
        this.x > window.innerWidth + 100) {
      this.endStrafeRun();
    }
    
    // Extra trail of particles during World 1 strafing
    if (Math.random() < 0.3) {
      for (let i = 0; i < 2; i++) {
        const offset = Math.random() * 40;
        this.particleSystem.createFlame(
          this.x - this.strafeDirection * offset,
          this.y + (Math.random() - 0.5) * 20
        );
      }
    }
  }
}

export default World1FlameHelicopter;