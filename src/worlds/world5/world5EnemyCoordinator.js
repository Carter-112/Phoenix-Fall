/**
 * World 5 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 5 (Infernal)
 */

import { InfernalBeast } from './infernalBeast.js';

export class World5EnemyCoordinator {
  constructor(world5Config) {
    this.config = world5Config;
    this.active = false;
    
    // Extract enemy configuration from world config
    const enemyConfig = world5Config.enemies || {};
    
    // Configure spawn settings
    this.spawnRate = enemyConfig.infernalBeast?.spawnRate || 6000;
    this.maxEnemies = enemyConfig.infernalBeast?.maxActive || 2;
    
    // Track last spawn time
    this.lastSpawnTime = 0;
    
    // Boss wave settings
    this.bossInterval = 30000; // 30 seconds between boss waves
    this.lastBossTime = 0;
    this.bossActive = false;
    
    // Apply difficulty modifiers if available
    if (world5Config.systems?.difficulty?.modifiers) {
      const modifiers = world5Config.systems.difficulty.modifiers;
      this.spawnRateMultiplier = modifiers.spawnRate || 1;
      this.maxEnemiesMultiplier = modifiers.maxEnemies || 1;
    } else {
      this.spawnRateMultiplier = 1;
      this.maxEnemiesMultiplier = 1;
    }
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active) return;
    
    // Apply difficulty modifiers
    const effectiveSpawnRate = this.spawnRate / this.spawnRateMultiplier;
    const effectiveMaxEnemies = Math.ceil(this.maxEnemies * this.maxEnemiesMultiplier);
    
    // Check if we should trigger a boss wave
    if (!this.bossActive && 
        currentTime - this.lastBossTime > this.bossInterval &&
        game.gameState.survivalTime > 45) {
      
      this.triggerBossWave(game);
      this.lastBossTime = currentTime;
      return;
    }
    
    // Check if we should spawn an infernal beast
    const beastCount = game.enemies.filter(enemy => enemy.constructor.name === 'InfernalBeast').length;
    if (currentTime - this.lastSpawnTime > effectiveSpawnRate && 
        beastCount < effectiveMaxEnemies) {
      this.spawnInfernalBeast(game.width, game.particleSystem, game);
      this.lastSpawnTime = currentTime;
    }
  }
  
  /**
   * Trigger a boss wave event
   * @param {object} game - Game instance
   */
  triggerBossWave(game) {
    this.bossActive = true;
    
    // Create a large infernal beast at the center top (mini-boss)
    const centerX = game.width / 2;
    
    try {
      // Create the boss with extra health and size
      const boss = new InfernalBeast(centerX, -100, game.particleSystem, {
        isBoss: true,
        health: 2000, // Override default health
        damage: 100,  // Higher damage
        speed: 1.5,   // Slightly slower but more powerful
        attackRate: 1500, // Attack more frequently
      });
      
      game.enemies.push(boss);
    } catch (error) {
      console.error('Error spawning boss InfernalBeast:', error);
    }
    
    // Reset boss active flag after a delay
    setTimeout(() => {
      this.bossActive = false;
    }, 10000); // 10 seconds cooldown after boss is spawned
  }
  
  /**
   * Spawn a single enemy at the specified position
   * @param {number} x - X spawn position
   * @param {number} y - Y spawn position
   * @param {object} game - Game instance for access to enemies array and particleSystem
   */
  spawnEnemy(x, y, game) {
    if (!this.active || !game) return;
    
    try {
      game.enemies.push(new InfernalBeast(x, y, game.particleSystem));
    } catch (error) {
      console.error('Error spawning InfernalBeast:', error);
    }
  }
  
  /**
   * Spawn an InfernalBeast at a random position
   * @param {number} width - Canvas width
   * @param {object} particleSystem - Particle system
   * @param {object} game - Game instance
   */
  spawnInfernalBeast(width, particleSystem, game) {
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
    
    this.spawnEnemy(x, y, game);
  }
  
  /**
   * Reset the coordinator state
   */
  reset() {
    this.lastSpawnTime = 0;
    this.lastBossTime = 0;
    this.bossActive = false;
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
  
  /**
   * Handle the boss defeat by spawning InfernalEmbers
   * @param {number} x - X position where boss was defeated
   * @param {number} y - Y position where boss was defeated
   * @param {object} game - Game instance
   */
  spawnInfernalEmberRewards(x, y, game) {
    if (!game.collectibles) return;
    
    // Spawn multiple infernal embers around the defeat position
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * 150;
      const offsetY = (Math.random() - 0.5) * 150;
      
      if (typeof game.collectibles.spawnInfernalEmber === 'function') {
        game.collectibles.spawnInfernalEmber(x + offsetX, y + offsetY);
      } else if (typeof game.collectibles.spawnEmber === 'function') {
        // Fallback to generic ember spawning if specific method doesn't exist
        game.collectibles.spawnEmber('infernalEmber', x + offsetX, y + offsetY);
      }
    }
  }
} 