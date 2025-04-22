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
    
    // World 1 hazards are simple - just spawn FlameHelicopter
    game.hazards.push(new FlameHelicopter(x, y, game.particleSystem));
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
    
    // Currently World 1 doesn't have special hazards
    // This is a placeholder for future hazards
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
    
    // Currently no hazards in World 1
    return 0;
  }
  
  /**
   * Reset the coordinator state
   */
  reset() {
    this.patternActive = false;
    this.currentPattern = null;
    this.lastPatternTime = 0;
  }
  
  /**
   * Set whether the coordinator is active
   * @param {boolean} active - Whether to activate
   */
  setActive(active) {
    this.active = active;
    
    if (!active) {
      this.reset();
    }
  }
} 