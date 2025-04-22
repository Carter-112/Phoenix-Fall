/**
 * Ember collectible
 * Basic ember that player can collect for points
 */
export class Ember {
    /**
     * Create a new ember
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} particleSystem - Particle system for visual effects
     * @param {number} value - Value of the ember when collected
     */
    constructor(x, y, particleSystem, value = 10) {
        this.x = x;
        this.y = y;
        this.particleSystem = particleSystem;
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
        this.floatSpeed = 0.2; // Added for the new update method
        this.animationTimer = 0; // Added for the new update method
        this.oscillationSpeed = 0.005; // Added for the new update method
        this.oscillationAmount = 0.1; // Added for the new update method
        this.baseScale = this.radius; // Added for the new update method
        this.alpha = 1; // Added for the new update method
        this.fadeDuration = 1000; // Added for the new update method
        this.scale = this.baseScale; // Added for the new update method
        this.type = 'regular'; // Added for the new update method
    }

    /**
     * Update ember state
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (!deltaTime || this.collected) return;

        // Float upward with some horizontal drift
        this.y -= this.floatSpeed * deltaTime;
        this.x += Math.sin(this.animationTimer * this.oscillationSpeed) * this.oscillationAmount * deltaTime;
        
        // Update the animation timer
        this.animationTimer += deltaTime;
        
        // Calculate alpha based on lifetime and fade duration
        this.alpha = Math.min(1, this.lifetime / this.fadeDuration);
        
        // Update scale based on pulsation animation
        this.scale = this.baseScale + Math.sin(this.animationTimer * 5) * 0.1;
        
        // Check if ember went off-screen
        if (this.y < -50) {
            this.active = false;
        }
    }

    /**
     * Draw the ember
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!ctx || this.collected || !this.active) return;
        
        ctx.save();
        
        // Set up the gradient for the ember glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * this.scale
        );
        
        // Apply gradient colors based on type
        if (this.type === 'regular') {
            gradient.addColorStop(0, `rgba(255, 220, 100, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 150, 50, ${this.alpha * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
        } else if (this.type === 'large') {
            gradient.addColorStop(0, `rgba(255, 240, 150, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 200, 50, ${this.alpha * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 150, 0, 0)`);
        } else if (this.type === 'rare') {
            gradient.addColorStop(0, `rgba(200, 255, 200, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(100, 255, 100, ${this.alpha * 0.8})`);
            gradient.addColorStop(1, `rgba(50, 200, 50, 0)`);
        }
        
        // Draw the main ember
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner glow
        const innerGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * this.scale * 0.6
        );
        
        // Apply inner gradient colors based on type
        if (this.type === 'regular') {
            innerGradient.addColorStop(0, `rgba(255, 255, 200, ${this.alpha})`);
            innerGradient.addColorStop(1, `rgba(255, 200, 100, 0)`);
        } else if (this.type === 'large') {
            innerGradient.addColorStop(0, `rgba(255, 255, 220, ${this.alpha})`);
            innerGradient.addColorStop(1, `rgba(255, 220, 150, 0)`);
        } else if (this.type === 'rare') {
            innerGradient.addColorStop(0, `rgba(220, 255, 220, ${this.alpha})`);
            innerGradient.addColorStop(1, `rgba(150, 255, 150, 0)`);
        }
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.scale * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Handle collection by player
     */
    collect() {
        if (!this.active || this.collected) return false;
        
        this.collected = true;
        
        // Create particle effect when collected
        if (this.particleSystem) {
            for (let i = 0; i < 8; i++) {
                this.particleSystem.createEmber(this.x, this.y);
            }
        }
        
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