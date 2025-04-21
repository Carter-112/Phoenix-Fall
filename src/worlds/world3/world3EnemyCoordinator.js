/**
 * World 3 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 3 (Frost Peak)
 */

export class World3EnemyCoordinator {
  constructor(world3Config) {
    this.config = world3Config;
    this.active = false;
    
    // Extract enemy configuration from world config
    const enemyConfig = world3Config.enemies || {};
    
    // Configure spawn settings for both enemy types
    this.spawnRates = {
      frostGolem: enemyConfig.frostGolem?.spawnRate || 6000,
      icePhoenix: enemyConfig.icePhoenix?.spawnRate || 8000
    };
    
    this.maxEnemies = {
      frostGolem: enemyConfig.frostGolem?.maxActive || 2,
      icePhoenix: enemyConfig.icePhoenix?.maxActive || 1
    };
    
    // Track last spawn times
    this.lastSpawnTimes = {
      frostGolem: 0,
      icePhoenix: 0
    };
    
    // Difficulty setting that can be adjusted from world config
    this.difficulty = world3Config.settings?.difficulty || 1;
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active) return;
    
    // Scale spawn timers based on difficulty
    const difficultyFactor = 1 - (this.difficulty * 0.1); // Harder = spawn more frequently
    
    // Check if we should spawn a frost golem
    const frostGolemCount = game.enemies.filter(enemy => enemy.constructor.name === 'FrostGolem').length;
    if (currentTime - this.lastSpawnTimes.frostGolem > this.spawnRates.frostGolem * difficultyFactor && 
        frostGolemCount < this.maxEnemies.frostGolem) {
      this.spawnEnemy(
        Math.random() * game.width, 
        -50, 
        game, 
        'FrostGolem'
      );
      this.lastSpawnTimes.frostGolem = currentTime;
    }
    
    // Check if we should spawn an ice phoenix
    const icePhoenixCount = game.enemies.filter(enemy => enemy.constructor.name === 'IcePhoenix').length;
    if (currentTime - this.lastSpawnTimes.icePhoenix > this.spawnRates.icePhoenix * difficultyFactor && 
        icePhoenixCount < this.maxEnemies.icePhoenix) {
      // Ice phoenixes prefer to spawn from the sides
      const fromSide = Math.random() < 0.6;
      let x, y;
      
      if (fromSide) {
        x = Math.random() < 0.5 ? -30 : game.width + 30;
        y = Math.random() * (game.height * 0.4);
      } else {
        x = Math.random() * game.width;
        y = -50;
      }
      
      this.spawnEnemy(x, y, game, 'IcePhoenix');
      this.lastSpawnTimes.icePhoenix = currentTime;
    }
  }
  
  /**
   * Spawn a single enemy at the specified position
   * @param {number} x - X spawn position
   * @param {number} y - Y spawn position
   * @param {object} game - Game instance for access to enemies array and particleSystem
   * @param {string} enemyType - Optional type of enemy to spawn, otherwise random
   */
  spawnEnemy(x, y, game, enemyType = null) {
    if (!this.active || !game) return;
    
    // Determine which enemy to spawn
    if (!enemyType) {
      enemyType = Math.random() < 0.5 ? 'FrostGolem' : 'IcePhoenix';
    }
    
    try {
      if (enemyType === 'FrostGolem') {
        const FrostGolem = (typeof require !== 'undefined') ? 
          require('./frostGolem.js').FrostGolem : 
          window.FrostGolem;
        
        if (typeof FrostGolem !== 'undefined') {
          game.enemies.push(new FrostGolem(x, y, game.particleSystem));
        }
      } else if (enemyType === 'IcePhoenix') {
        const IcePhoenix = (typeof require !== 'undefined') ? 
          require('./icePhoenix.js').IcePhoenix : 
          window.IcePhoenix;
        
        if (typeof IcePhoenix !== 'undefined') {
          game.enemies.push(new IcePhoenix(x, y, game.particleSystem));
        }
      }
    } catch (error) {
      console.error(`Error spawning ${enemyType}:`, error);
    }
  }
  
  /**
   * Reset the coordinator state
   */
  reset() {
    this.lastSpawnTimes = {
      frostGolem: 0,
      icePhoenix: 0
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