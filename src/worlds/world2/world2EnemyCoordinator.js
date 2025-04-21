/**
 * World 2 Enemy Coordinator
 * Manages the spawning and behavior of enemies in World 2
 */

export class World2EnemyCoordinator {
  constructor(world2Config) {
    this.config = world2Config;
    this.active = false;
    
    // Extract enemy configuration from world config
    const enemyConfig = world2Config.enemies || {};
    
    // Configure spawn settings
    this.spawnRate = enemyConfig.lavaGolem?.spawnRate || 5000;
    this.maxEnemies = enemyConfig.lavaGolem?.maxActive || 2;
    
    // Track last spawn time
    this.lastSpawnTime = 0;
  }
  
  /**
   * Update method called each frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {number} currentTime - Current game time in ms
   * @param {object} game - Game instance for access to width, height, etc.
   */
  update(deltaTime, currentTime, game) {
    if (!this.active) return;
    
    // Check if we should spawn a lava golem
    const lavaGolemCount = game.enemies.filter(enemy => enemy.constructor.name === 'LavaGolem').length;
    if (currentTime - this.lastSpawnTime > this.spawnRate && 
        lavaGolemCount < this.maxEnemies) {
      this.spawnLavaGolem(game.width, game.particleSystem, game);
      this.lastSpawnTime = currentTime;
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
    
    try {
      // In World 2, we only have LavaGolem
      const LavaGolem = (typeof require !== 'undefined') ? 
        require('./lavaGolem.js').LavaGolem : 
        window.LavaGolem;
      
      if (typeof LavaGolem !== 'undefined') {
        game.enemies.push(new LavaGolem(x, y, game.particleSystem));
      }
    } catch (error) {
      console.error('Error spawning LavaGolem:', error);
    }
  }
  
  /**
   * Spawn a LavaGolem at a specific position
   * @param {number} width - Canvas width for calculating spawn position
   * @param {object} particleSystem - Particle system for creating particles
   * @param {object} game - Game instance to add enemy to
   */
  spawnLavaGolem(width, particleSystem, game) {
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