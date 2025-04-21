/**
 * Ember collectible
 * Basic ember that player can collect for points
 */
export class Ember {
    /**
     * Create a new ember
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - Value of the ember when collected
     */
    constructor(x, y, value = 10) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.active = true;
        this.radius = 10;
        this.pulseSpeed = 0.05;
        this.pulseRange = 0.2;
        this.baseRadius = this.radius;
        this.collected = false;
        this.lifetime = 8000; // Lifetime in ms
        this.creationTime = Date.now();
        this.fadeOutTime = 1000; // Time to fade out
        this.opacity = 1;
    }

    /**
     * Update ember state
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (!this.active) return;

        // If collected, fade out
        if (this.collected) {
            this.opacity -= deltaTime / this.fadeOutTime;
            if (this.opacity <= 0) {
                this.active = false;
            }
            return;
        }

        // Check lifetime
        const elapsedTime = Date.now() - this.creationTime;
        if (elapsedTime > this.lifetime) {
            this.collected = true; // Start fade out
            return;
        }

        // Slightly hover and pulse
        this.y += Math.sin(Date.now() * 0.002) * 0.2;
        this.radius = this.baseRadius + Math.sin(Date.now() * this.pulseSpeed) * (this.baseRadius * this.pulseRange);
    }

    /**
     * Draw the ember
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Draw glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, 'rgba(255, 200, 100, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.fillStyle = '#ffaa00';
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Handle collection by player
     */
    collect() {
        if (!this.active || this.collected) return false;
        
        this.collected = true;
        return this.value;
    }

    /**
     * Check if point collides with ember
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} Whether collision occurred
     */
    checkCollision(x, y) {
        if (!this.active || this.collected) return false;
        
        const dx = this.x - x;
        const dy = this.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + 30; // Add margin for player size
    }
}