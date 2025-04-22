import { Ember } from './ember.js';

export class InfernalEmber extends Ember {
    /**
     * Create a new infernal ember
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} particleSystem - Particle system for visual effects
     * @param {number} value - Value of the ember when collected
     */
    constructor(x, y, particleSystem, value = 200) {
        super(x, y, particleSystem, value);
        this.radius = 20; // Largest ember type
        this.pulseSpeed = 0.08;
        this.pulseRange = 0.4;
        this.baseRadius = this.radius;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        // Enhanced particle system
        this.particleCount = 12;
        this.particles = [];
        this.flameRings = [];
        this.initializeEffects();
    }

    initializeEffects() {
        // Initialize orbiting particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                angle: (Math.PI * 2 * i) / this.particleCount,
                distance: this.radius * 0.8,
                speed: 0.04 + Math.random() * 0.02,
                size: 4 + Math.random() * 2
            });
        }

        // Initialize flame rings
        for (let i = 0; i < 3; i++) {
            this.flameRings.push({
                radius: this.radius * (1.2 + i * 0.4),
                rotation: Math.random() * Math.PI * 2,
                speed: 0.02 + i * 0.01
            });
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update glow effect
        this.glowIntensity += 0.06 * this.glowDirection;
        if (this.glowIntensity >= 1) {
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0) {
            this.glowDirection = 1;
        }

        // Update particles
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
            particle.distance = this.radius * 0.8 + Math.sin(this.glowIntensity * Math.PI) * 8;
        });

        // Update flame rings
        this.flameRings.forEach(ring => {
            ring.rotation += ring.speed;
        });

        // Pulsing radius
        this.radius = this.baseRadius + Math.sin(Date.now() * this.pulseSpeed) * (this.baseRadius * this.pulseRange);
    }

    draw(ctx) {
        // Draw outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 3
        );
        gradient.addColorStop(0, `rgba(255, 30, 0, ${0.6 + this.glowIntensity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(255, 50, 0, ${0.3 + this.glowIntensity * 0.2})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw flame rings
        this.flameRings.forEach(ring => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 50, 0, ${0.4 + this.glowIntensity * 0.3})`;
            ctx.lineWidth = 3;
            
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8 + ring.rotation;
                const x = this.x + Math.cos(angle) * ring.radius;
                const y = this.y + Math.sin(angle) * ring.radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        });

        // Draw core
        const coreGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        coreGradient.addColorStop(0, '#FFFFFF');
        coreGradient.addColorStop(0.4, '#FFA500');
        coreGradient.addColorStop(1, '#FF0000');
        
        ctx.beginPath();
        ctx.fillStyle = coreGradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw particles
        this.particles.forEach(particle => {
            const px = this.x + Math.cos(particle.angle) * particle.distance;
            const py = this.y + Math.sin(particle.angle) * particle.distance;
            
            const particleGradient = ctx.createRadialGradient(
                px, py, 0,
                px, py, particle.size
            );
            particleGradient.addColorStop(0, `rgba(255, 200, 0, ${0.9 + this.glowIntensity * 0.1})`);
            particleGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            ctx.beginPath();
            ctx.fillStyle = particleGradient;
            ctx.arc(px, py, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}