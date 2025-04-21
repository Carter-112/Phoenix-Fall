/**
 * Base Enemy class
 */
export class Enemy {
    /**
     * Create a new enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of enemy
     * @param {number} height - Height of enemy
     * @param {number} health - Initial health
     * @param {object} particleSystem - Reference to game's particle system
     */
    constructor(x, y, width, height, health, particleSystem) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.particleSystem = particleSystem;
        this.active = true;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * Update enemy state
     * @param {number} deltaTime - Time since last frame
     * @param {object} game - Game instance
     */
    update(deltaTime, game) {
        // Base update logic - can be overridden by child classes
        if (!this.active) return;

        // Apply physics
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Check if enemy is off-screen
        const margin = 100;
        if (this.y > game.height + margin || 
            this.y < -margin ||
            this.x > game.width + margin ||
            this.x < -margin) {
            this.active = false;
        }
    }

    /**
     * Draw the enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;

        // Default drawing (circle)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Handle collision with player
     * @param {object} phoenix - Player character
     * @returns {boolean} Whether collision was handled
     */
    onCollision(phoenix) {
        return false; // Override in child classes
    }

    /**
     * Take damage
     * @param {number} amount - Damage amount
     * @returns {boolean} Whether enemy died
     */
    takeDamage(amount) {
        if (!this.active) return false;

        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.active = false;
            return true;
        }
        
        return false;
    }

    /**
     * Handle enemy death
     * @param {object} game - Game instance
     */
    onDeath(game) {
        // Override in child classes
    }
} 