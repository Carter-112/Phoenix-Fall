/**
 * WorldManager - Manages loading and switching between game worlds
 * 
 * This class loads world configuration data from world files,
 * and applies the appropriate settings when switching worlds.
 */

import { world1 } from '../worlds/world1/world1.js';
import { world2 } from '../worlds/world2/world2.js';
import { world3 } from '../worlds/world3/world3.js';
import { world4 } from '../worlds/world4/world4.js';
import { world5 } from '../worlds/world5/world5.js';
import { world6 } from '../worlds/world6/world6.js';

// Import hazard coordinators for each world
import { World1HazardCoordinator } from '../worlds/world1/world1HazardCoordinator.js';
import { World2HazardCoordinator } from '../worlds/world2/world2HazardCoordinator.js';
import { World3HazardCoordinator } from '../worlds/world3/world3HazardCoordinator.js';
import { World4HazardCoordinator } from '../worlds/world4/World4HazardCoordinator.js';
import { World5HazardCoordinator } from '../worlds/world5/world5HazardCoordinator.js';
import { World6HazardCoordinator } from '../worlds/world6/World6HazardCoordinator.js';

// Import enemy coordinators for each world
import { World1EnemyCoordinator } from '../worlds/world1/world1EnemyCoordinator.js';
import { World2EnemyCoordinator } from '../worlds/world2/world2EnemyCoordinator.js';
import { World3EnemyCoordinator } from '../worlds/world3/world3EnemyCoordinator.js';
import { World4EnemyCoordinator } from '../worlds/world4/world4EnemyCoordinator.js';
import { World5EnemyCoordinator } from '../worlds/world5/world5EnemyCoordinator.js';
import { World6EnemyCoordinator } from '../worlds/world6/world6EnemyCoordinator.js';

export class WorldManager {
  constructor(game) {
    this.game = game;
    this.currentWorldNumber = 1;
    
    // Map of world configurations
    this.worlds = {
      1: world1,
      2: world2,
      3: world3,
      4: world4,
      5: world5,
      6: world6
    };
    
    // Map of world-specific hazard coordinators
    this.hazardCoordinators = {
      1: World1HazardCoordinator, // Added World 1 hazard coordinator with UI
      2: World2HazardCoordinator, // Added World 2 hazard coordinator with wall hazards
      3: World3HazardCoordinator,
      4: World4HazardCoordinator,
      5: World5HazardCoordinator,
      6: World6HazardCoordinator
    };
    
    // Map of world-specific enemy coordinators
    this.enemyCoordinators = {
      1: World1EnemyCoordinator,
      2: World2EnemyCoordinator,
      3: World3EnemyCoordinator,
      4: World4EnemyCoordinator,
      5: World5EnemyCoordinator,
      6: World6EnemyCoordinator
    };
    
    // Current active hazard coordinator instance
    this.currentHazardCoordinator = null;
    
    // Current active enemy coordinator instance
    this.currentEnemyCoordinator = null;
    
    // Initialize with world 1 settings
    this.currentWorld = this.worlds[1];
    
    console.log('WorldManager initialized with', Object.keys(this.worlds).length, 'worlds');
  }
  
  /**
   * Get the current world number
   * @returns {number} Current world number
   */
  getCurrentWorldNumber() {
    return this.currentWorldNumber;
  }
  
  /**
   * Get the current world configuration
   * @returns {Object} Current world configuration
   */
  getCurrentWorld() {
    return this.currentWorld;
  }
  
  /**
   * Get the current hazard coordinator
   * @returns {Object|null} Current hazard coordinator or null if none for this world
   */
  getCurrentHazardCoordinator() {
    return this.currentHazardCoordinator;
  }
  
  /**
   * Get the current enemy coordinator
   * @returns {Object|null} Current enemy coordinator or null if none for this world
   */
  getCurrentEnemyCoordinator() {
    return this.currentEnemyCoordinator;
  }
  
  /**
   * Set the current world and apply its settings
   * @param {number} worldNumber - World number to set
   * @returns {boolean} Whether the world was successfully set
   */
  setCurrentWorld(worldNumber) {
    // Check if world exists
    if (!this.worlds[worldNumber]) {
      console.error(`World ${worldNumber} does not exist`);
      return false;
    }
    
    console.log(`Switching to World ${worldNumber}: ${this.worlds[worldNumber].name}`);
    
    // Clean up any existing hazard coordinator
    if (this.currentHazardCoordinator) {
      this.currentHazardCoordinator.setActive(false);
      this.currentHazardCoordinator = null;
    }
    
    // Clean up any existing enemy coordinator
    if (this.currentEnemyCoordinator) {
      this.currentEnemyCoordinator.setActive(false);
      this.currentEnemyCoordinator = null;
    }
    
    // Store the new world configuration
    this.currentWorldNumber = worldNumber;
    this.currentWorld = this.worlds[worldNumber];
    
    // Create new hazard coordinator if this world has one
    if (this.hazardCoordinators[worldNumber]) {
      this.currentHazardCoordinator = new this.hazardCoordinators[worldNumber](this.currentWorld);
    }
    
    // Create new enemy coordinator if this world has one
    if (this.enemyCoordinators[worldNumber]) {
      this.currentEnemyCoordinator = new this.enemyCoordinators[worldNumber](this.currentWorld);
    }
    
    // Apply world settings to the game
    this.applyWorldSettings();
    
    return true;
  }
  
  /**
   * Apply the current world settings to the game
   * This includes background color, spawn rates, enemy properties, etc.
   */
  applyWorldSettings() {
    if (!this.currentWorld) {
      console.error('No current world to apply settings from');
      return;
    }
    
    if (!this.game) {
      console.error('No game instance to apply settings to');
      return;
    }
    
    const settings = this.currentWorld.settings;
    
    // Apply visual settings
    if (settings.backgroundColor) {
      document.body.style.backgroundColor = settings.backgroundColor;
      
      // If game has a background color property, set it as well
      if (this.game.backgroundColor) {
        this.game.backgroundColor = settings.backgroundColor;
      }
      
      // Add data attribute to body for CSS targeting
      document.body.setAttribute('data-world', this.currentWorldNumber);
      
      // Apply world-specific CSS class to body
      // Remove any existing world classes
      for (let i = 1; i <= 6; i++) {
        document.body.classList.remove(`world-${i}`);
      }
      // Add current world class
      document.body.classList.add(`world-${this.currentWorldNumber}`);
    }
    
    // Apply game settings
    if (this.game.gameState) {
      // Set level duration based on world settings
      if (settings.timeToComplete) {
        this.game.gameState.setTotalLevelTime(settings.timeToComplete);
      }
      
      // Reset game state for new world
      this.game.gameState.survivalTime = 0;
      this.game.gameState.altitude = 0;
    }
    
    // Activate hazard coordinator if one exists for this world
    if (this.currentHazardCoordinator) {
      // Initialize the UI for World 1
      if (this.currentWorldNumber === 1 && this.game) {
        this.currentHazardCoordinator.initUI(this.game);
      }
      
      this.currentHazardCoordinator.setActive(true);
    }
    
    // Activate enemy coordinator if one exists for this world
    if (this.currentEnemyCoordinator) {
      this.currentEnemyCoordinator.setActive(true);
    }
    
    // Apply enemy spawn rates and properties
    this.applyEnemySettings();
    
    // Apply collectible settings
    this.applyCollectibleSettings();
    
    console.log(`Applied settings for World ${this.currentWorldNumber}: ${this.currentWorld.name}`);
  }
  
  /**
   * Apply enemy settings from the current world
   * This sets up spawn rates, health, and other properties for enemies
   */
  applyEnemySettings() {
    if (!this.currentWorld || !this.currentWorld.enemies) {
      return;
    }
    
    // Enemy settings will be retrieved from world config in spawn methods
    console.log(`Applied enemy settings for World ${this.currentWorldNumber}`);
  }
  
  /**
   * Apply collectible settings from the current world
   * This sets up spawn rates, values, and properties for collectibles
   */
  applyCollectibleSettings() {
    if (!this.currentWorld || !this.currentWorld.collectibles) {
      return;
    }
    
    // Collectible settings will be retrieved from world config in spawn methods
    console.log(`Applied collectible settings for World ${this.currentWorldNumber}`);
  }
  
  /**
   * Update method to be called each frame
   * This updates the hazard and enemy coordinators
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    const currentTime = performance.now();
    
    // Update hazard coordinator
    if (this.currentHazardCoordinator) {
      this.currentHazardCoordinator.update(deltaTime, currentTime, this.game.width, this.game.height);
    }
    
    // Update enemy coordinator
    if (this.currentEnemyCoordinator) {
      this.currentEnemyCoordinator.update(deltaTime, currentTime, this.game);
    }
  }
  
  /**
   * Draw the current world's hazard effects
   * This should be called in the game's main render loop
   * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  draw(ctx, width, height) {
    // Draw hazard effects if a coordinator exists for the current world
    if (this.currentHazardCoordinator) {
      this.currentHazardCoordinator.draw(ctx, width, height);
    }
  }
  
  /**
   * Check for collisions between phoenix and hazards
   * @param {Phoenix} phoenix - The player's phoenix object
   * @returns {number} The amount of damage to apply
   */
  checkHazardCollisions(phoenix) {
    if (this.currentHazardCoordinator) {
      return this.currentHazardCoordinator.checkCollisions(phoenix);
    }
    return 0;
  }
  
  /**
   * Apply physics effects from the current world
   * @param {Phoenix} phoenix - The player's phoenix object
   */
  applyPhysicsEffects(phoenix) {
    if (!phoenix) return;
    
    // Apply world-specific physics to phoenix
    // To be implemented by each world's hazard coordinator
  }
  
  /**
   * Reset the current world's state
   */
  resetCurrentWorld() {
    // Reset hazard coordinator
    if (this.currentHazardCoordinator) {
      this.currentHazardCoordinator.reset();
    }
    
    // Reset enemy coordinator
    if (this.currentEnemyCoordinator) {
      this.currentEnemyCoordinator.reset();
    }
  }
  
  /**
   * Get a world's name by number
   * @param {number} worldNumber - The world number
   * @returns {string} The world name or 'Unknown World'
   */
  getWorldName(worldNumber) {
    return this.worlds[worldNumber]?.name || 'Unknown World';
  }
  
  /**
   * Get a world's description by number
   * @param {number} worldNumber - The world number
   * @returns {string} The world description or empty string
   */
  getWorldDescription(worldNumber) {
    return this.worlds[worldNumber]?.description || '';
  }
} 