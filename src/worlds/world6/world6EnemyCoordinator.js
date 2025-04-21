/**
 * World 6 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 6 (Solar Rift)
 */

export class World6EnemyCoordinator {
  constructor(world6Config) {
    this.config = world6Config;
    this.active = false;
    
    // Extract enemy configuration from world config
    const enemyConfig = world6Config.enemies || {};
    
    // Configure spawn settings for the three enemy types
    this.spawnRates = {
      solarSpirit: enemyConfig.solarSpirit?.spawnRate || 4000,
      blackSunling: enemyConfig.blackSunling?.spawnRate || 6000,
      flameLeech: enemyConfig.flameLeech?.spawnRate || 5000
    };
    
    this.maxEnemies = {
      solarSpirit: enemyConfig.solarSpirit?.maxActive || 2,
      blackSunling: enemyConfig.blackSunling?.maxActive || 1,
      flameLeech: enemyConfig.flameLeech?.maxActive || 3
    };
    
    // Track last spawn times
    this.lastSpawnTimes = {
      solarSpirit: 0,
      blackSunling: 0,
      flameLeech: 0
    };
    
    // Special solar surge events
    this.solarSurgeCooldown = 20000; // 20 seconds between surges
    this.lastSolarSurgeTime = 0;
    this.surgePending = false;
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active) return;
    
    // Check if we should trigger a solar surge
    if (!this.surgePending && 
        currentTime - this.lastSolarSurgeTime > this.solarSurgeCooldown &&
        game.gameState.survivalTime > 60 &&
        Math.random() < 0.1) {
      
      this.triggerSolarSurge(game);
      this.lastSolarSurgeTime = currentTime;
      return;
    }
    
    // Regular enemy spawning logic
    
    // Solar Spirits
    const spiritCount = game.enemies.filter(enemy => enemy.constructor.name === 'SolarSpirit').length;
    if (currentTime - this.lastSpawnTimes.solarSpirit > this.spawnRates.solarSpirit && 
        spiritCount < this.maxEnemies.solarSpirit) {
      this.spawnEnemy(
        Math.random() * game.width, 
        -50, 
        game, 
        'SolarSpirit'
      );
      this.lastSpawnTimes.solarSpirit = currentTime;
    }
    
    // Black Sunlings
    const sunlingCount = game.enemies.filter(enemy => enemy.constructor.name === 'BlackSunling').length;
    if (currentTime - this.lastSpawnTimes.blackSunling > this.spawnRates.blackSunling && 
        sunlingCount < this.maxEnemies.blackSunling) {
      
      // Black Sunlings tend to spawn from the top rather than sides
      const x = Math.random() * game.width;
      const y = -50;
      
      this.spawnEnemy(x, y, game, 'BlackSunling');
      this.lastSpawnTimes.blackSunling = currentTime;
    }
    
    // Flame Leeches
    const leechCount = game.enemies.filter(enemy => enemy.constructor.name === 'FlameLeech').length;
    if (currentTime - this.lastSpawnTimes.flameLeech > this.spawnRates.flameLeech && 
        leechCount < this.maxEnemies.flameLeech) {
      
      // Flame leeches prefer to spawn from the sides to attack from the flanks
      const fromSide = Math.random() < 0.8;
      let x, y;
      
      if (fromSide) {
        x = Math.random() < 0.5 ? -30 : game.width + 30;
        y = Math.random() * (game.height * 0.6);
      } else {
        x = Math.random() * game.width;
        y = -50;
      }
      
      this.spawnEnemy(x, y, game, 'FlameLeech');
      this.lastSpawnTimes.flameLeech = currentTime;
    }
  }
  
  /**
   * Trigger a solar surge event
   * @param {object} game - Game instance
   */
  triggerSolarSurge(game) {
    this.surgePending = true;
    
    // Warn player with visual effect (can be implemented in the game or UI)
    if (game.ui && typeof game.ui.showWarningMessage === 'function') {
      game.ui.showWarningMessage('SOLAR SURGE IMMINENT!', 3);
    }
    
    // After delay, spawn a wave of enemies
    setTimeout(() => {
      // Spawn multiple enemies in a pattern
      const patternType = Math.random() < 0.5 ? 'circle' : 'line';
      
      if (patternType === 'circle') {
        // Spawn enemies in a circle around the center
        const centerX = game.width / 2;
        const centerY = game.height / 3;
        const count = 6;
        const radius = 150;
        
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Alternate enemy types
          const enemyType = i % 2 === 0 ? 'SolarSpirit' : 'FlameLeech';
          this.spawnEnemy(x, y, game, enemyType);
        }
        
        // Add a Black Sunling in the center
        this.spawnEnemy(centerX, centerY, game, 'BlackSunling');
      } else { // line pattern
        // Spawn a line of enemies across the top
        const count = 5;
        
        for (let i = 0; i < count; i++) {
          const x = (game.width / (count + 1)) * (i + 1);
          const y = -50;
          
          // Alternate between enemy types
          let enemyType;
          if (i % 3 === 0) {
            enemyType = 'SolarSpirit';
          } else if (i % 3 === 1) {
            enemyType = 'BlackSunling';
          } else {
            enemyType = 'FlameLeech';
          }
          
          this.spawnEnemy(x, y, game, enemyType);
        }
      }
      
      this.surgePending = false;
    }, 3000); // 3 second warning before surge
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
    
    // If no enemy type specified, randomly choose one
    if (!enemyType) {
      const rand = Math.random();
      if (rand < 0.33) {
        enemyType = 'SolarSpirit';
      } else if (rand < 0.66) {
        enemyType = 'BlackSunling';
      } else {
        enemyType = 'FlameLeech';
      }
    }
    
    try {
      if (enemyType === 'SolarSpirit') {
        const SolarSpirit = (typeof require !== 'undefined') ? 
          require('./solarSpirit.js').SolarSpirit : 
          window.SolarSpirit;
        
        if (typeof SolarSpirit !== 'undefined') {
          game.enemies.push(new SolarSpirit(x, y, game.particleSystem));
        }
      } else if (enemyType === 'BlackSunling') {
        const BlackSunling = (typeof require !== 'undefined') ? 
          require('./blackSunling.js').BlackSunling : 
          window.BlackSunling;
        
        if (typeof BlackSunling !== 'undefined') {
          game.enemies.push(new BlackSunling(x, y, game.particleSystem));
        }
      } else if (enemyType === 'FlameLeech') {
        const FlameLeech = (typeof require !== 'undefined') ? 
          require('./flameLeech.js').FlameLeech : 
          window.FlameLeech;
        
        if (typeof FlameLeech !== 'undefined') {
          game.enemies.push(new FlameLeech(x, y, game.particleSystem));
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
      solarSpirit: 0,
      blackSunling: 0,
      flameLeech: 0
    };
    this.lastSolarSurgeTime = 0;
    this.surgePending = false;
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