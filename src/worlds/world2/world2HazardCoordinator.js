/**
 * World 2 Hazard Coordinator
 * Manages hazards specific to World 2 (Ashspire Ruins)
 */

import { WallHazard } from '../../hazards/wallHazard.js';

export class World2HazardCoordinator {
  constructor(world2Config) {
    this.config = world2Config;
    this.active = false;
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
    
    // Placeholder for ash cloud creation
    console.log("Spawning ash cloud at", cloudX, cloudY);
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
    
    // Placeholder for ember storm creation
    console.log("Spawning ember storm at", stormX, stormY);
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
  update(deltaTime) {
    // Update world 2 specific hazards if needed
  }
  
  /**
   * Set whether the coordinator is active
   * @param {boolean} active - Whether to activate
   */
  setActive(active) {
    this.active = active;
  }
} 