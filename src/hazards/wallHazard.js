export class WallHazard {
  /**
   * Creates a wall hazard
   * @param {Game} game - The game instance
   * @param {number} x - X position of the wall
   * @param {number} y - Y position of the wall
   * @param {number} width - Width of the wall
   * @param {number} height - Height of the wall
   * @param {number} speed - Speed at which the wall moves
   * @param {number} damage - Damage the wall causes on collision
   */
  constructor(game, x, y, width, height, speed, damage) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.damage = damage;
    this.active = true;
    this.particleSystem = game.particleSystem;
    this.particleTimer = 0;
    this.particleInterval = 100; // Emit particles every 100ms
    this.size = Math.max(width, height); // For collision detection purposes
  }

  /**
   * Updates the wall hazard position
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.active) return;

    // Move the wall hazard upward (negative Y is upward)
    this.y -= this.speed * 60 * deltaTime;

    // Emit smoke particles
    this.particleTimer += deltaTime * 1000;
    if (this.particleTimer >= this.particleInterval) {
      this.emitParticles();
      this.particleTimer = 0;
    }

    // Remove if off screen
    if (this.y + this.height < -100) {
      this.active = false;
    }
  }

  /**
   * Checks for collision with the phoenix
   * @param {Phoenix} phoenix - The player's phoenix
   * @returns {boolean} - Whether a collision occurred
   */
  checkCollision(phoenix) {
    if (!this.active || !phoenix) return false;

    // Rectangular collision detection
    if (this.x < phoenix.x + 30 &&
        this.x + this.width > phoenix.x - 30 &&
        this.y < phoenix.y + 30 &&
        this.y + this.height > phoenix.y - 30) {
      return true;
    }
    
    return false;
  }

  /**
   * Emits particles for the wall hazard
   */
  emitParticles() {
    if (!this.particleSystem) return;

    // Emit smoke particles along the wall
    const particleCount = Math.floor(this.width / 20); // One particle every 20px of width
    
    for (let i = 0; i < particleCount; i++) {
      const particleX = this.x + (this.width * (i / particleCount));
      const particleY = this.y + Math.random() * this.height;
      
      // Use createSmoke method instead of addParticle
      this.particleSystem.createSmoke(particleX, particleY);
    }
  }

  /**
   * Renders the wall hazard
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   */
  draw(ctx) {
    if (!this.active) return;
    
    // Draw the wall hazard
    ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Add some gradient details
    const gradient = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
    gradient.addColorStop(0, 'rgba(120, 120, 120, 0.8)');
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
} 