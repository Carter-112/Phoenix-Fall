import { ParticleSystem } from 'particleSystem';

export class FireWisp {
    constructor(x, y, size = 1.0) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = 15 * size;
        this.speed = 4 + (1 - size) * 2; // Smaller wisps are faster
        this.health = 40 * size;
        this.active = true;
        this.splitCount = size > 0.5 ? 2 : 0; // Only larger wisps split
        
        // Movement pattern
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.1;
        this.sinOffset = Math.random() * Math.PI * 2;
        this.sinSpeed = 0.05;
        
        // Particle effects
        this.particles = new ParticleSystem({
            color: '#FF3300',
            size: 3 * size,
            speed: 1,
            lifetime: 0.5,
            spread: 0.2
        });
    }

    update(deltaTime) {
        if (!this.active) return;

        // Update movement pattern
        this.sinOffset += this.sinSpeed;
        this.angle += this.angleSpeed + Math.sin(this.sinOffset) * 0.05;

        // Update position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Keep in bounds
        const margin = 50;
        if (this.x < margin) this.angle = Math.PI - this.angle;
        if (this.x > window.innerWidth - margin) this.angle = Math.PI - this.angle;
        if (this.y < margin) this.angle = -this.angle;
        if (this.y > window.innerHeight - margin) this.angle = -this.angle;

        // Update particles
        this.particles.emit(this.x, this.y, 1);
        this.particles.update(deltaTime);
    }

    draw(ctx) {
        if (!this.active) return;

        // Draw particle trail
        this.particles.draw(ctx);

        // Draw wisp core
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, '#FF6600');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
        }
        return this.health <= 0;
    }

    getCollisionDamage() {
        return 15 * this.size;
    }
}