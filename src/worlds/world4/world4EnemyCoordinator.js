/**
 * World 4 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 4 (Void/Celestial)
 */

export class World4EnemyCoordinator {
  constructor(world4Config) {
    this.config = world4Config;
    this.active = false;
    
    // Extract enemy configuration from world config
    const enemyConfig = world4Config.enemies || {};
    
    // Configure spawn settings
    this.spawnRates = {
      voidWraith: enemyConfig.voidWraith?.spawnRate || 5000,
      celestialGuardian: enemyConfig.celestialGuardian?.spawnRate || 7000
    };
    
    this.maxEnemies = {
      voidWraith: enemyConfig.voidWraith?.maxActive || 2,
      celestialGuardian: enemyConfig.celestialGuardian?.maxActive || 1
    };
    
    // Track last spawn times
    this.lastSpawnTimes = {
      voidWraith: 0,
      celestialGuardian: 0
    };
    
    // Special spawn pattern variables
    this.specialPatternCooldown = 15000; // 15 seconds between special patterns
    this.lastSpecialPatternTime = 0;
    this.specialPatternActive = false;
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active) return;
    
    // Check for special pattern
    if (!this.specialPatternActive && 
        currentTime - this.lastSpecialPatternTime > this.specialPatternCooldown &&
        game.gameState.survivalTime > 45 &&
        Math.random() < 0.1) {
      
      this.triggerSpecialPattern(game);
      this.lastSpecialPatternTime = currentTime;
      return;
    }
    
    // Check if we should spawn a void wraith
    const voidWraithCount = game.enemies.filter(enemy => enemy.constructor.name === 'VoidWraith').length;
    if (currentTime - this.lastSpawnTimes.voidWraith > this.spawnRates.voidWraith && 
        voidWraithCount < this.maxEnemies.voidWraith) {
      this.spawnEnemy(
        Math.random() * game.width, 
        -50, 
        game, 
        'VoidWraith'
      );
      this.lastSpawnTimes.voidWraith = currentTime;
    }
    
    // Check if we should spawn a celestial guardian
    const celestialCount = game.enemies.filter(enemy => enemy.constructor.name === 'CelestialGuardian').length;
    if (currentTime - this.lastSpawnTimes.celestialGuardian > this.spawnRates.celestialGuardian && 
        celestialCount < this.maxEnemies.celestialGuardian) {
      
      // Celestial guardians appear from the side edges more often
      const x = Math.random() < 0.7 ? 
        (Math.random() < 0.5 ? -50 : game.width + 50) : 
        Math.random() * game.width;
      const y = Math.random() * (game.height * 0.4);
      
      this.spawnEnemy(x, y, game, 'CelestialGuardian');
      this.lastSpawnTimes.celestialGuardian = currentTime;
    }
  }
  
  /**
   * Trigger a special spawn pattern
   * @param {object} game - Game instance
   */
  triggerSpecialPattern(game) {
    this.specialPatternActive = true;
    
    // Select a pattern
    const patternType = Math.random() < 0.5 ? 'voidTornado' : 'celestialBarrage';
    
    if (patternType === 'voidTornado') {
      // Spawn a spiral of void wraiths
      const centerX = game.width / 2;
      const spiralCount = 4;
      
      for (let i = 0; i < spiralCount; i++) {
        const angle = (i / spiralCount) * Math.PI * 2;
        const radius = 200;
        const x = centerX + Math.cos(angle) * radius;
        const y = -50 - i * 30;
        
        setTimeout(() => {
          this.spawnEnemy(x, y, game, 'VoidWraith');
        }, i * 500); // Stagger spawns
      }
    } else {
      // Spawn a line of celestial guardians across the top
      const count = 3;
      for (let i = 0; i < count; i++) {
        const x = (game.width / (count + 1)) * (i + 1);
        
        setTimeout(() => {
          this.spawnEnemy(x, -50, game, 'CelestialGuardian');
        }, i * 700); // Stagger spawns
      }
    }
    
    // Reset special pattern after all enemies have spawned
    setTimeout(() => {
      this.specialPatternActive = false;
    }, 4000);
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
      enemyType = Math.random() < 0.5 ? 'VoidWraith' : 'CelestialGuardian';
    }
    
    try {
      if (enemyType === 'VoidWraith') {
        const VoidWraith = (typeof require !== 'undefined') ? 
          require('./voidWraith.js').VoidWraith : 
          window.VoidWraith;
        
        if (typeof VoidWraith !== 'undefined') {
          game.enemies.push(new VoidWraith(x, y, game.particleSystem));
        }
      } else if (enemyType === 'CelestialGuardian') {
        const CelestialGuardian = (typeof require !== 'undefined') ? 
          require('./celestialGuardian.js').CelestialGuardian : 
          window.CelestialGuardian;
        
        if (typeof CelestialGuardian !== 'undefined') {
          game.enemies.push(new CelestialGuardian(x, y, game.particleSystem));
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
      voidWraith: 0,
      celestialGuardian: 0
    };
    this.specialPatternActive = false;
    this.lastSpecialPatternTime = 0;
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