/**
 * World 2 Hazard Coordinator
 * Manages hazards specific to World 2 (Ashspire Ruins)
 */

import { WallHazard } from '../../hazards/wallHazard.js';

export class World2HazardCoordinator {
  constructor(world2Config) {
    this.config = world2Config;
    this.active = false;
    this.ashClouds = [];  // Track ash clouds
    this.emberStorms = []; // Track ember storms
    this.lastPatternTime = 0;
    this.patternInterval = 3000;
    this.patternActive = false;
    
    // Array to track World 2 helicopters for targeting updates
    this.flameHelicopters = [];
  }

  /**
   * Generic hazard spawn method called by game.spawnHazard()
   * @param {number} x - X spawn position
   * @param {number} y - Y spawn position
   */
  spawnHazard(x, y) {
    // Select a random hazard type based on configuration weights
    const random = Math.random();
    
    // Default weights if not configured
    const ashCloudWeight = this.config.hazards.ashCloud?.weight || 0.4;
    const emberStormWeight = this.config.hazards.emberStorm?.weight || 0.3;
    // Smoke wall gets the remaining probability
    
    // Use game instance from window for now
    const game = window.gameInstance;
    if (!game) return;
    
    if (random < ashCloudWeight) {
      this.spawnAshCloud(game, x, y);
    } else if (random < ashCloudWeight + emberStormWeight) {
      this.spawnEmberStorm(game, x, y);
    } else {
      this.spawnSmokeWall(game, x, y);
    }
  }

  /**
   * Spawn an ash cloud hazard
   * @param {object} game - Game instance
   * @param {number} x - X position to spawn at (if provided)
   * @param {number} y - Y position to spawn at (if provided)
   */
  spawnAshCloud(game, x, y) {
    // Use provided coordinates if available, otherwise generate random position
    const cloudX = x !== undefined ? x : Math.random() * game.width;
    const cloudY = y !== undefined ? y : Math.random() * Math.min(500, game.height / 2);
    
    console.log("Spawning ash cloud at", cloudX, cloudY);
    
    // Create an ash cloud object
    const ashCloud = {
      x: cloudX,
      y: cloudY,
      width: 180 + Math.random() * 100, // Increased size (was 120-200)
      height: 120 + Math.random() * 80, // Increased size (was 80-140)
      alpha: 0.8, // Increased opacity (was 0.7)
      speed: 0.2 + Math.random() * 0.3, // Reduced speed (was 0.5-1.0)
      drift: Math.random() * 0.3 - 0.15, // Reduced drift for more stable movement
      damage: 15, // Damage on collision
      active: true,
      lifetime: 0,
      maxLifetime: 20 + Math.random() * 10, // Doubled lifetime (was 10-15)
      
      update(deltaTime) {
        this.lifetime += deltaTime;
        this.y -= this.speed * 60 * deltaTime; // Move upward
        this.x += this.drift * deltaTime * 30; // Drift sideways
        
        // Fade out near end of lifetime
        if (this.lifetime > this.maxLifetime * 0.8) {
          this.alpha = Math.max(0, 0.8 * (1 - (this.lifetime - this.maxLifetime * 0.8) / (this.maxLifetime * 0.2)));
        }
        
        // Deactivate if off-screen or lifetime expired
        if (this.y + this.height < -100 || this.lifetime >= this.maxLifetime) {
          this.active = false;
        }
      },
      
      draw(ctx) {
        if (!this.active) return;
        
        // Draw the ash cloud
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)'; // Darker color for better visibility
        
        // Draw as multiple overlapping circles for cloud effect
        const circleCount = 12; // More circles for denser appearance (was 8)
        for (let i = 0; i < circleCount; i++) {
          const offsetX = (i % 3 - 1) * this.width * 0.4;
          const offsetY = (Math.floor(i / 3) % 3 - 1) * this.height * 0.4;
          const radius = (this.width + this.height) / 6 * (0.7 + Math.sin(i) * 0.3);
          
          ctx.beginPath();
          ctx.arc(this.x + offsetX, this.y + offsetY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
      },
      
      checkCollision(phoenix) {
        if (!this.active || !phoenix) return false;
        
        // Use a circular collision check (simpler than complex cloud shape)
        const dx = phoenix.x - this.x;
        const dy = phoenix.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use the average of width and height divided by 2 as radius
        const cloudRadius = (this.width + this.height) / 4;
        
        return distance < cloudRadius + 30; // 30 is approximate phoenix radius
      }
    };
    
    // Add to game hazards array
    game.hazards.push(ashCloud);
    this.ashClouds.push(ashCloud);
  }

  /**
   * Spawn an ember storm hazard
   * @param {object} game - Game instance
   * @param {number} x - X position to spawn at (if provided)
   * @param {number} y - Y position to spawn at (if provided)
   */
  spawnEmberStorm(game, x, y) {
    // Use provided coordinates if available, otherwise generate random position
    const stormX = x !== undefined ? x : Math.random() * game.width;
    const stormY = y !== undefined ? y : -100; // Start above the screen
    
    console.log("Spawning ember storm at", stormX, stormY);
    
    // Create an ember storm object
    const emberStorm = {
      x: stormX,
      y: stormY,
      width: 250 + Math.random() * 150, // Increased size (was 150-250)
      height: 300, // Increased height (was 200)
      particles: [], // Store particles
      speed: 0.4 + Math.random() * 0.3, // Reduced speed (was 1.0-1.5)
      damage: 20, // Damage on collision
      active: true,
      lifetime: 0,
      maxLifetime: 15 + Math.random() * 10, // Increased lifetime (was 8-12)
      lastParticleTime: 0,
      
      update(deltaTime, currentTime) {
        this.lifetime += deltaTime;
        this.y -= this.speed * 60 * deltaTime; // Move upward
        
        // Create new ember particles
        if (currentTime - this.lastParticleTime > 30) { // More frequent particles (was 50ms)
          for (let i = 0; i < 5; i++) { // More particles per burst (was 3)
            const particle = {
              x: this.x + (Math.random() - 0.5) * this.width,
              y: this.y + Math.random() * this.height,
              vx: (Math.random() - 0.5) * 2,
              vy: -2 - Math.random() * 2, // Slower upward velocity (was -3 to -5)
              size: 5 + Math.random() * 8, // Larger particles (was 3-8)
              color: `hsl(${10 + Math.random() * 30}, 100%, ${60 + Math.random() * 30}%)`, // Brighter color
              lifetime: 0,
              maxLifetime: 2 + Math.random() * 2 // Longer particle lifetime (was 1-2.5)
            };
            this.particles.push(particle);
          }
          this.lastParticleTime = currentTime;
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const particle = this.particles[i];
          particle.lifetime += deltaTime;
          particle.x += particle.vx * 60 * deltaTime;
          particle.y += particle.vy * 60 * deltaTime;
          
          // Remove old particles
          if (particle.lifetime >= particle.maxLifetime) {
            this.particles.splice(i, 1);
          }
        }
        
        // Deactivate if off-screen or lifetime expired
        if (this.y + this.height < -100 || this.lifetime >= this.maxLifetime) {
          this.active = false;
        }
      },
      
      draw(ctx) {
        if (!this.active) return;
        
        // Draw storm boundary for debugging/visibility
        ctx.strokeStyle = 'rgba(255, 100, 50, 0.3)';
        ctx.strokeRect(this.x - this.width/2, this.y, this.width, this.height);
        
        // Draw all particles
        for (const particle of this.particles) {
          const alpha = 1 - (particle.lifetime / particle.maxLifetime);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
      },
      
      checkCollision(phoenix) {
        if (!this.active || !phoenix) return false;
        
        // Simple bounding box check
        if (phoenix.x > this.x - this.width/2 && phoenix.x < this.x + this.width/2 &&
            phoenix.y > this.y && phoenix.y < this.y + this.height) {
          return true;
        }
        
        return false;
      }
    };
    
    // Add to game hazards array
    game.hazards.push(emberStorm);
    this.emberStorms.push(emberStorm);
  }

  /**
   * Spawn a smoke wall hazard
   * @param {object} game - Game instance
   * @param {number} x - X position to spawn at (if provided)
   * @param {number} y - Y position to spawn at (if provided)
   */
  spawnSmokeWall(game, x, y) {
    // Use provided X if available, otherwise random
    const wallX = x !== undefined ? x : Math.random() * game.width;
    
    // Y position is always at the bottom or use provided Y
    const wallY = y !== undefined ? y : game.height + 50;
    
    // Create the wall hazard
    const wallWidth = 200; // Width of the smoke wall
    const wallHeight = 100; // Height of the smoke wall
    const wallSpeed = 2; // Speed at which the wall moves upward
    const wallDamage = 25; // Damage the wall causes to the phoenix
    
    const smokeWall = new WallHazard(
      game,
      wallX - wallWidth/2, // Center the wall on the X position
      wallY,
      wallWidth,
      wallHeight,
      wallSpeed,
      wallDamage
    );
    
    // Add to game hazards array
    game.hazards.push(smokeWall);
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in ms
   */
  update(deltaTime, currentTime) {
    if (!this.active) return;
    
    // Update active hazards
    for (let i = this.ashClouds.length - 1; i >= 0; i--) {
      const cloud = this.ashClouds[i];
      cloud.update(deltaTime);
      if (!cloud.active) {
        this.ashClouds.splice(i, 1);
      }
    }
    
    for (let i = this.emberStorms.length - 1; i >= 0; i--) {
      const storm = this.emberStorms[i];
      storm.update(deltaTime, currentTime || performance.now());
      if (!storm.active) {
        this.emberStorms.splice(i, 1);
      }
    }
  }
  
  /**
   * Set whether the coordinator is active
   * @param {boolean} active - Whether to activate
   */
  setActive(active) {
    this.active = active;
  }

  /**
   * Reset the hazard coordinator state
   * Called when restarting a world or resetting game state
   */
  reset() {
    // Reset any internal state
    this.ashClouds = [];
    this.emberStorms = [];
    console.log("World 2 hazard coordinator reset");
  }

  /**
   * Draw world-specific hazard effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  draw(ctx, width, height) {
    // Draw world-specific hazard effects
    // This method is required by the WorldManager
    if (!this.active) return;
    
    // Draw all ash clouds
    for (const cloud of this.ashClouds) {
      cloud.draw(ctx);
    }
    
    // Draw all ember storms
    for (const storm of this.emberStorms) {
      storm.draw(ctx);
    }
  }

  /**
   * Check for collisions between phoenix and hazards
   * @param {Phoenix} phoenix - The player's phoenix object
   * @returns {number} The amount of damage to apply
   */
  checkCollisions(phoenix) {
    if (!this.active || !phoenix) return 0;
    
    // Update helicopter targets if in charge mode
    if (phoenix) {
      this.updateHelicopterTargets(phoenix);
    }
    
    let damage = 0;
    
    // Check ash cloud collisions
    for (const cloud of this.ashClouds) {
      if (cloud.checkCollision(phoenix)) {
        damage = Math.max(damage, cloud.damage);
      }
    }
    
    // Check ember storm collisions
    for (const storm of this.emberStorms) {
      if (storm.checkCollision(phoenix)) {
        damage = Math.max(damage, storm.damage);
      }
    }
    
    return damage;
  }
  
  /**
   * Update helicopter targets to follow the phoenix
   * @param {Object} phoenix - The phoenix object
   */
  updateHelicopterTargets(phoenix) {
    // Get all helicopters with chargeMode property from game.hazards
    if (window.gameInstance) {
      // Find helicopters that have a chargeMode property
      const helicopters = window.gameInstance.hazards.filter(h => 
        h.chargeMode !== undefined && h.worldId === 'world2'
      );
      
      // Update helicopters array if needed
      this.flameHelicopters = helicopters;
      
      // Update each helicopter in charge mode
      helicopters.forEach(helicopter => {
        if (helicopter.chargeMode && phoenix) {
          // Only update the helicopter target if the phoenix is in a valid position
          if (typeof phoenix.x === 'number' && typeof phoenix.y === 'number' &&
              !isNaN(phoenix.x) && !isNaN(phoenix.y) &&
              phoenix.x >= 0 && phoenix.x <= window.innerWidth &&
              phoenix.y >= 0 && phoenix.y <= window.innerHeight) {
            
            // Set target with slight randomization to make movement more natural
            helicopter.targetX = phoenix.x + (Math.random() - 0.5) * 50;
            helicopter.targetY = phoenix.y + (Math.random() - 0.5) * 50;
            
            // Safety check - never target straight up
            const dx = helicopter.targetX - helicopter.x;
            if (Math.abs(dx) < 10) {
              // Force a horizontal component to avoid straight-up targeting
              helicopter.targetX += (Math.random() > 0.5 ? 100 : -100);
            }
          } else {
            // Invalid phoenix position - use safe default
            helicopter.targetX = helicopter.x + (Math.random() > 0.5 ? 200 : -200);
            helicopter.targetY = helicopter.y - 100;
          }
        }
      });
    }
  }
} 