/**
 * Frost Ember collectible
 * A cooler variant of the standard ember with frost effects
 */
import { Ember } from './ember.js';

export class FrostEmber extends Ember {
    /**
     * Create a new frost ember
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} value - Value of the ember when collected
     */
    constructor(x, y, value = 150) {
        super(x, y, value);
        this.radius = 15; // Slightly larger than standard ember
        this.pulseSpeed = 0.04;
        this.pulseRange = 0.3;
        this.baseRadius = this.radius;
        
        // Particle effect properties
        this.snowflakesCount = 8;
        this.snowflakes = [];
        
        // Initialize snowflakes
        for (let i = 0; i < this.snowflakesCount; i++) {
            this.snowflakes.push({
                angle: (Math.PI * 2 * i) / this.snowflakesCount,
                distance: this.radius * 1.2,
                size: 3 + Math.random() * 2,
                orbitSpeed: 0.001 + Math.random() * 0.002
            });
        }
    }
    
    /**
     * Update ember state
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (!this.active) return;
        
        // Update snowflake positions
        this.snowflakes.forEach(snowflake => {
            snowflake.angle += snowflake.orbitSpeed * deltaTime;
        });
    }
    
    /**
     * Draw the frost ember
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Draw frost glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 2.5
        );
        gradient.addColorStop(0, 'rgba(150, 220, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        const coreGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.4, '#a0e0ff');
        coreGradient.addColorStop(1, '#60a0ff');
        
        ctx.beginPath();
        ctx.fillStyle = coreGradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw snowflakes
        ctx.fillStyle = '#ffffff';
        this.snowflakes.forEach(snowflake => {
            const px = this.x + Math.cos(snowflake.angle) * snowflake.distance;
            const py = this.y + Math.sin(snowflake.angle) * snowflake.distance;
            
            // Draw a small snowflake shape
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6;
                const x = px + Math.cos(angle) * snowflake.size;
                const y = py + Math.sin(angle) * snowflake.size;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        });
        
        ctx.restore();
    }
}