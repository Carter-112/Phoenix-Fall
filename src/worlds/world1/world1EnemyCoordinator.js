/**
 * World 1 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 1 (Ember Valley)
 */

import { MagmaBat } from './magmaBat.js';
import { FlameHelicopter } from './flameHelicopter.js';

export class World1EnemyCoordinator {
  constructor(world1Config) {
    this.config = world1Config;
    this.active = false;
    this.enemies = [];
    
    // Extract enemy configuration from world config
    const enemyConfig = world1Config.enemies || {};
    
    // Configure spawn settings
    this.spawnRates = {
      magmaBat: enemyConfig.magmaBat?.spawnRate || 3000,
      flameHelicopter: enemyConfig.flameHelicopter?.spawnRate || 4000
    };
    
    this.maxEnemies = {
      magmaBat: enemyConfig.magmaBat?.maxActive || 2,
      flameHelicopter: enemyConfig.flameHelicopter?.maxActive || 2
    };
    
    // Track last spawn times
    this.lastSpawnTimes = {
      magmaBat: 0,
      flameHelicopter: 0
    };
    
    // Formation settings
    this.formationCooldown = 10000; // 10 seconds between formations
    this.lastFormationTime = 0;
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active) return;
    
    // Check if we should spawn a formation
    if (currentTime - this.lastFormationTime > this.formationCooldown && 
        game.gameState.survivalTime > 30 && 
        Math.random() < 0.1) {
      this.spawnFormation(game.width, game.particleSystem);
      this.lastFormationTime = currentTime;
      return;
    }
    
    // Check if we should spawn a magma bat
    const magmaBatCount = this.countEnemiesByType(game.enemies, MagmaBat);
    if (currentTime - this.lastSpawnTimes.magmaBat > this.spawnRates.magmaBat && 
        magmaBatCount < this.maxEnemies.magmaBat) {
      this.spawnMagmaBat(game.width, game.particleSystem);
      this.lastSpawnTimes.magmaBat = currentTime;
    }
    
    // Check if we should spawn a flame helicopter
    const helicopterCount = this.countEnemiesByType(game.enemies, FlameHelicopter);
    if (currentTime - this.lastSpawnTimes.flameHelicopter > this.spawnRates.flameHelicopter && 
        helicopterCount < this.maxEnemies.flameHelicopter) {
      this.spawnFlameHelicopter(game.width, game.particleSystem);
      this.lastSpawnTimes.flameHelicopter = currentTime;
    }
  }
  
  /**
   * Spawn a single enemy at the specified position
   * @param {number} x - X spawn position
   * @param {number} y - Y spawn position
   * @param {object} game - Game instance for access to enemies array and particleSystem
   */
  spawnEnemy(x, y, game) {
    if (!this.active || !game) return;
    
    // Randomly choose between MagmaBat (60%) and FlameHelicopter (40%)
    if (Math.random() < 0.6) {
      game.enemies.push(new MagmaBat(x, y, game.particleSystem));
    } else {
      game.hazards.push(new FlameHelicopter(x, y, game.particleSystem));
    }
  }
  
  /**
   * Spawn a MagmaBat at a specific position
   * @param {number} width - Canvas width for calculating spawn position
   * @param {object} particleSystem - Particle system for creating particles
   * @returns {MagmaBat} - The created MagmaBat instance
   */
  spawnMagmaBat(width, particleSystem) {
    // Determine spawn position
    let x, y;
    
    if (Math.random() < 0.7) {
      // 70% chance to spawn from top
      x = Math.random() * width;
      y = -50;
    } else {
      // 30% chance to spawn from sides
      x = Math.random() < 0.5 ? -30 : width + 30;
      y = Math.random() * (window.innerHeight / 2);
    }
    
    const bat = new MagmaBat(x, y, particleSystem);
    return bat;
  }
  
  /**
   * Spawn a FlameHelicopter at a specific position
   * @param {number} width - Canvas width for calculating spawn position
   * @param {object} particleSystem - Particle system for creating particles
   * @returns {FlameHelicopter} - The created FlameHelicopter instance
   */
  spawnFlameHelicopter(width, particleSystem) {
    // Determine spawn position
    let x, y;
    
    if (Math.random() < 0.7) {
      // 70% chance to spawn from top
      x = Math.random() * width;
      y = -50;
    } else {
      // 30% chance to spawn from sides
      x = Math.random() < 0.5 ? -30 : width + 30;
      y = Math.random() * (window.innerHeight / 2);
    }
    
    const helicopter = new FlameHelicopter(x, y, particleSystem);
    return helicopter;
  }
  
  /**
   * Spawn a formation of enemies
   * @param {number} width - Canvas width for calculating spawn positions
   * @param {object} particleSystem - Particle system
   */
  spawnFormation(width, particleSystem) {
    // Create a formation of 2-3 helicopters
    const formationCount = Math.random() < 0.5 ? 2 : 3;
    const baseX = Math.random() * width;
    const helicopters = [];
    
    for (let i = 0; i < formationCount; i++) {
      const offsetX = (i - (formationCount-1)/2) * 80;
      const helicopter = new FlameHelicopter(
        baseX + offsetX, 
        -80 - i * 30, 
        particleSystem
      );
      helicopters.push(helicopter);
    }
    
    return helicopters;
  }
  
  /**
   * Count enemies of a specific type
   * @param {Array} enemies - Array of enemy objects
   * @param {class} type - The enemy class type to count
   * @returns {number} - Count of enemies of specified type
   */
  countEnemiesByType(enemies, type) {
    return enemies.filter(enemy => enemy instanceof type).length;
  }
  
  /**
   * Reset the coordinator state
   */
  reset() {
    this.lastSpawnTimes = {
      magmaBat: 0,
      flameHelicopter: 0
    };
    this.lastFormationTime = 0;
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