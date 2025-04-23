/**
 * World 2 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 2
 */

// Import FlameHelicopter directly since it's already available in the game
import { FlameHelicopter } from '../../entities/flameHelicopter.js';
import { MagmaBat } from '../../entities/magmaBat.js';

export class World2EnemyCoordinator {
  constructor(world2Config) {
    this.config = world2Config;
    this.active = false;
    
    // Extract enemy configuration from world config
    const enemyConfig = world2Config.enemies || {};
    
    // Configure spawn settings - using much slower spawn rates for better visibility
    this.spawnRates = {
      flameHelicopter: enemyConfig.flameHelicopter?.spawnRate || 8000, // 8 seconds between spawns
      magmaBat: enemyConfig.magmaBat?.spawnRate || 6000 // 6 seconds between spawns
    };
    
    // Maximum number of active enemies
    this.maxEnemies = {
      flameHelicopter: enemyConfig.flameHelicopter?.maxActive || 2,
      magmaBat: enemyConfig.magmaBat?.maxActive || 3
    };
    
    // Track last spawn time
    this.lastSpawnTimes = {
      flameHelicopter: 0,
      magmaBat: 0
    };
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active || !game) return;
    
    // Check if we should spawn a flame helicopter
    const helicopterCount = this.countEnemiesByType(game.enemies, FlameHelicopter);
    if (currentTime - this.lastSpawnTimes.flameHelicopter > this.spawnRates.flameHelicopter && 
        helicopterCount < this.maxEnemies.flameHelicopter) {
      this.spawnFlameHelicopter(game);
      this.lastSpawnTimes.flameHelicopter = currentTime;
    }
    
    // Check if we should spawn a magma bat
    const batCount = this.countEnemiesByType(game.enemies, MagmaBat);
    if (currentTime - this.lastSpawnTimes.magmaBat > this.spawnRates.magmaBat && 
        batCount < this.maxEnemies.magmaBat) {
      this.spawnMagmaBat(game);
      this.lastSpawnTimes.magmaBat = currentTime;
    }
  }
  
  /**
   * Count enemies by their type
   * @param {Array} enemies - Array of enemy objects
   * @param {Class} enemyClass - Class to count
   * @returns {number} Number of enemies of the specified type
   */
  countEnemiesByType(enemies, enemyClass) {
    return enemies.filter(enemy => enemy instanceof enemyClass).length;
  }
  
  /**
   * Spawn a single enemy at the specified position
   * @param {number} x - X spawn position
   * @param {number} y - Y spawn position
   * @param {object} game - Game instance for access to enemies array and particleSystem
   */
  spawnEnemy(x, y, game) {
    if (!this.active || !game) return;
    
    // Choose which enemy type to spawn (50/50 chance)
    if (Math.random() < 0.5) {
      game.enemies.push(new FlameHelicopter(x, y, game.particleSystem));
      console.log('Spawned FlameHelicopter at', x, y);
    } else {
      game.enemies.push(new MagmaBat(x, y, game.particleSystem));
      console.log('Spawned MagmaBat at', x, y);
    }
  }
  
  /**
   * Spawn a FlameHelicopter at a random position
   * @param {object} game - Game instance
   */
  spawnFlameHelicopter(game) {
    // Determine spawn position
    let x, y;
    
    if (Math.random() < 0.7) {
      // 70% chance to spawn from top
      x = Math.random() * game.width;
      y = -50;
    } else {
      // 30% chance to spawn from sides
      x = Math.random() < 0.5 ? -30 : game.width + 30;
      y = Math.random() * (game.height / 2);
    }
    
    // Create the flame helicopter
    const helicopter = new FlameHelicopter(x, y, game.particleSystem);
    game.enemies.push(helicopter);
    console.log('Spawned FlameHelicopter at', x, y);
    return helicopter;
  }
  
  /**
   * Spawn a MagmaBat at a random position
   * @param {object} game - Game instance
   */
  spawnMagmaBat(game) {
    // Determine spawn position
    let x, y;
    
    if (Math.random() < 0.7) {
      // 70% chance to spawn from top
      x = Math.random() * game.width;
      y = -50;
    } else {
      // 30% chance to spawn from sides
      x = Math.random() < 0.5 ? -30 : game.width + 30;
      y = Math.random() * (game.height / 2);
    }
    
    // Create the magma bat
    const bat = new MagmaBat(x, y, game.particleSystem);
    game.enemies.push(bat);
    console.log('Spawned MagmaBat at', x, y);
    return bat;
  }
  
  /**
   * Reset the coordinator state
   */
  reset() {
    this.lastSpawnTimes = {
      flameHelicopter: 0,
      magmaBat: 0
    };
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