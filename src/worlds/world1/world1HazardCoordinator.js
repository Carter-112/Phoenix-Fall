/**
 * World 1 Hazard Coordinator
 * Manages hazards and UI specific to World 1
 */

import { World1UI } from './world1UI.js';
import { FlameHelicopter } from '../../entities/flameHelicopter.js';

export class World1HazardCoordinator {
  constructor(world1Config) {
    this.config = world1Config;
    this.active = false;
    this.world1UI = null;
    
    // Track last pattern time for spawning
    this.lastPatternTime = 0;
    this.patternInterval = 10000; // 10 seconds between patterns
    this.patternActive = false;
    this.currentPattern = null;
    
    // World-specific managers (currently empty for World 1)
    this.emberManagers = [];
    
    // DEBUG: Track world1 helicopters for debugging
    this.flameHelicopters = [];
    console.log("World1HazardCoordinator created (with helicopter tracking)");
  }
  
  /**
   * Initialize the UI component
   * @param {Game} game - The game instance
   */
  initUI(game) {
    if (game && !this.world1UI) {
      this.world1UI = new World1UI(game);
      console.log('World 1 UI initialized through hazard coordinator');
    }
  }
  
  /**
   * Generic hazard spawn method called by game.spawnHazard()
   * @param {number} x - X spawn position
   * @param {number} y - Y spawn position
   */
  spawnHazard(x, y) {
    // Get game instance from window
    const game = window.gameInstance;
    if (!game) return;
    
    // Create a FlameHelicopter and track it for debugging
    const helicopter = new FlameHelicopter(x, y, game.particleSystem);
    
    // Debug logging for helicopter creation
    console.log(`🚁 World1: Created helicopter at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    
    // Add to main game hazards
    game.hazards.push(helicopter);
    
    // Track for debugging
    this.flameHelicopters.push(helicopter);
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in ms
   * @param {number} currentTime - Current game time in ms
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  update(deltaTime, currentTime, width, height) {
    if (!this.active) return;
    
    // Clean up destroyed helicopters
    if (this.flameHelicopters.length > 0) {
      // Filter out helicopters that are no longer in game.hazards
      const game = window.gameInstance;
      if (game) {
        const activeHelicopterIds = new Set(game.hazards.filter(h => h.chargeMode !== undefined).map(h => h.id));
        const initialCount = this.flameHelicopters.length;
        
        this.flameHelicopters = this.flameHelicopters.filter(h => 
          game.hazards.includes(h) || activeHelicopterIds.has(h.id)
        );
        
        if (initialCount !== this.flameHelicopters.length) {
          console.log(`🚁 World1: Cleaned up helicopters. Count: ${this.flameHelicopters.length}`);
        }
      }
    }
  }
  
  /**
   * Draw method for world-specific effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  draw(ctx, width, height) {
    if (!this.active) return;
    
    // Draw UI if available
    if (this.world1UI) {
      this.world1UI.draw(width, height);
    }
    
    // Draw any other World 1 specific effects here
  }
  
  /**
   * Check collisions between phoenix and hazards
   * @param {Phoenix} phoenix - The player's phoenix
   * @returns {number} - Damage amount
   */
  checkCollisions(phoenix) {
    if (!this.active || !phoenix) return 0;
    
    // Update helicopter targets if in charge mode
    if (phoenix) {
      this.updateHelicopterTargets(phoenix);
    }
    
    // DEBUG: Log helicopter count periodically (about 1% of frames)
    if (Math.random() < 0.01 && this.flameHelicopters.length > 0) {
      console.log(`🚁 World1: Active helicopters: ${this.flameHelicopters.length}`);
      
      // Log details of targeting
      this.flameHelicopters.forEach((h, i) => {
        if (h.chargeMode) {
          const dx = h.targetX - h.x;
          const dy = h.targetY - h.y;
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          console.log(`🚁 World1: Helicopter ${i} targeting angle: ${angle.toFixed(1)}° (${dx.toFixed(0)}, ${dy.toFixed(0)})`);
        }
      });
    }
    
    return 0;
  }
  
  /**
   * Update helicopter targets to follow the phoenix
   * @param {Object} phoenix - The phoenix object
   */
  updateHelicopterTargets(phoenix) {
    this.flameHelicopters.forEach(helicopter => {
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
  
  /**
   * Reset the coordinator state
   */
  reset() {
    this.patternActive = false;
    this.currentPattern = null;
    this.lastPatternTime = 0;
    
    // Reset debug tracking array
    this.flameHelicopters = [];
    console.log("🚁 World1: Helicopter tracking reset");
  }
  
  /**
   * Set whether the coordinator is active
   * @param {boolean} active - Whether to activate
   */
  setActive(active) {
    this.active = active;
    
    console.log(`🚁 World1: Hazard coordinator ${active ? 'activated' : 'deactivated'}`);
    
    if (!active) {
      this.reset();
    }
  }
} 