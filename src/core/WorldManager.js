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
import { World3HazardCoordinator } from '../worlds/world3/world3HazardCoordinator.js';
import { World4HazardCoordinator } from '../worlds/world4/World4HazardCoordinator.js';
import { World5HazardCoordinator } from '../worlds/world5/world5HazardCoordinator.js';
import { World6HazardCoordinator } from '../worlds/world6/World6HazardCoordinator.js';

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
      // World 2 still uses basic hazards only
      3: World3HazardCoordinator,
      4: World4HazardCoordinator,
      5: World5HazardCoordinator,
      6: World6HazardCoordinator
    };
    
    // Current active hazard coordinator instance
    this.currentHazardCoordinator = null;
    
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
    
    // Store the new world configuration
    this.currentWorldNumber = worldNumber;
    this.currentWorld = this.worlds[worldNumber];
    
    // Create new hazard coordinator if this world has one
    if (this.hazardCoordinators[worldNumber]) {
      this.currentHazardCoordinator = new this.hazardCoordinators[worldNumber](this.currentWorld);
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
   * Update the current world's hazard coordinator
   * This should be called in the game's main update loop
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    // Update hazard coordinator if one exists for the current world
    if (this.currentHazardCoordinator) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const currentTime = performance.now();
      
      this.currentHazardCoordinator.update(deltaTime, currentTime, width, height);
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
   * Apply physics effects from the current world to the phoenix
   * @param {Phoenix} phoenix - The player's phoenix object
   */
  applyPhysicsEffects(phoenix) {
    if (this.currentHazardCoordinator && this.currentHazardCoordinator.applyPhysicsEffects) {
      this.currentHazardCoordinator.applyPhysicsEffects(phoenix);
    }
  }
  
  /**
   * Reset the current world state
   * This should be called when restarting a level
   */
  resetCurrentWorld() {
    if (this.currentHazardCoordinator) {
      this.currentHazardCoordinator.reset();
    }
  }
  
  /**
   * Get world name by number
   * @param {number} worldNumber - World number
   * @returns {string} World name or default if not found
   */
  getWorldName(worldNumber) {
    return this.worlds[worldNumber]?.name || `World ${worldNumber}`;
  }
  
  /**
   * Get world description by number
   * @param {number} worldNumber - World number
   * @returns {string} World description or default if not found
   */
  getWorldDescription(worldNumber) {
    return this.worlds[worldNumber]?.description || `World ${worldNumber} description`;
  }
} 