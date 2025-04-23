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
        this.radius = 6;
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

        // Float upward with some horizontal drift - increased speed for better visibility
        this.y -= this.floatSpeed * deltaTime * 1.5; // Increased speed by 50%
        this.x += Math.sin(this.animationTimer * this.oscillationSpeed) * this.oscillationAmount * deltaTime;
        
        // Update the animation timer
        this.animationTimer += deltaTime;
        
        // Calculate alpha based on lifetime and fade duration
        this.alpha = Math.min(1, this.lifetime / this.fadeDuration);
        
        // Update scale based on pulsation animation - slightly increased pulse for better visibility
        this.scale = this.baseScale + Math.sin(this.animationTimer * 5) * 0.15; // Increased pulse amplitude
        
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
        
        // Set up the gradient for the ember glow - increased size for better visibility
        const glowSize = this.radius * this.scale * 1.5; // Add extra glow radius
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );
        
        // Apply gradient colors based on type with enhanced brightness
        if (this.type === 'regular') {
            gradient.addColorStop(0, `rgba(255, 240, 150, ${this.alpha})`); // Brighter center
            gradient.addColorStop(0.5, `rgba(255, 180, 80, ${this.alpha * 0.9})`); // More vibrant mid-tone
            gradient.addColorStop(1, `rgba(255, 120, 40, 0)`); // Stronger outer glow
        } else if (this.type === 'large') {
            gradient.addColorStop(0, `rgba(255, 250, 200, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 220, 100, ${this.alpha * 0.9})`);
            gradient.addColorStop(1, `rgba(255, 180, 50, 0)`);
        } else if (this.type === 'rare') {
            gradient.addColorStop(0, `rgba(220, 255, 220, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(150, 255, 150, ${this.alpha * 0.9})`);
            gradient.addColorStop(1, `rgba(80, 220, 80, 0)`);
        }
        
        // Draw the main ember with enhanced glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner glow with increased brightness
        const innerGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * this.scale * 0.6
        );
        
        // Apply inner gradient colors based on type with higher brightness
        if (this.type === 'regular') {
            innerGradient.addColorStop(0, `rgba(255, 255, 230, ${this.alpha * 1.2})`); // Brighter center
            innerGradient.addColorStop(1, `rgba(255, 220, 150, 0)`);
        } else if (this.type === 'large') {
            innerGradient.addColorStop(0, `rgba(255, 255, 240, ${this.alpha * 1.2})`);
            innerGradient.addColorStop(1, `rgba(255, 240, 180, 0)`);
        } else if (this.type === 'rare') {
            innerGradient.addColorStop(0, `rgba(230, 255, 230, ${this.alpha * 1.2})`);
            innerGradient.addColorStop(1, `rgba(180, 255, 180, 0)`);
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