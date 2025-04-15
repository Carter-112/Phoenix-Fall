export class InfernalBeam {
    constructor(x, config) {
        this.x = x;
        this.config = config;
        this.width = config.width;
        this.damage = config.damage;
        
        // Animation states
        this.active = true;
        this.state = 'charging'; // charging -> firing -> cooldown
        this.stateTime = 0;
        
        // Beam properties
        this.intensity = 0;
        this.height = 0;
        this.warningAlpha = 0;
        
        // Particle system for visual effects
        this.particles = [];
        this.maxParticles = 50;
        
        // Visual effects
        this.glowRadius = this.width * 1.5;
        this.pulsePhase = 0;
    }

    update(deltaTime) {
        this.stateTime += deltaTime;
        this.pulsePhase += deltaTime * 0.005;

        switch (this.state) {
            case 'charging':
                // Charging animation and warning effect
                this.warningAlpha = Math.sin(this.stateTime * 0.01) * 0.5 + 0.5;
                this.intensity = Math.min(this.stateTime / this.config.chargeTime, 1);
                
                if (this.stateTime >= this.config.chargeTime) {
                    this.state = 'firing';
                    this.stateTime = 0;
                    this.height = window.innerHeight;
                }
                break;

            case 'firing':
                // Full beam effect
                this.intensity = 1;
                this.updateParticles(deltaTime);
                
                if (this.stateTime >= this.config.beamDuration) {
                    this.state = 'cooldown';
                    this.stateTime = 0;
                }
                break;

            case 'cooldown':
                // Fade out effect
                this.intensity = Math.max(0, 1 - (this.stateTime / this.config.cooldown));
                this.height *= this.intensity;
                
                if (this.stateTime >= this.config.cooldown) {
                    this.active = false;
                }
                break;
        }
    }

    updateParticles(deltaTime) {
        // Add new particles during firing state
        if (this.state === 'firing' && this.particles.length < this.maxParticles) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * this.width,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2,
                life: 1
            });
        }

        // Update existing particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime * 0.001;
            return particle.life > 0;
        });
    }

    draw(ctx) {
        // Draw warning indicator during charging
        if (this.state === 'charging') {
            this.drawWarning(ctx);
        }

        // Draw main beam effect
        if (this.state === 'firing' || this.state === 'cooldown') {
            this.drawBeam(ctx);
        }

        // Draw particles
        this.drawParticles(ctx);
    }

    drawWarning(ctx) {
        ctx.save();
        ctx.globalAlpha = this.warningAlpha;
        
        // Create gradient for warning beam
        const gradient = ctx.createLinearGradient(
            this.x - this.width/2, 0,
            this.x + this.width/2, 0
        );
        gradient.addColorStop(0, 'rgba(255, 50, 0, 0)');
        gradient.addColorStop(0.5, `rgba(255, 50, 0, ${this.warningAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.width/2,
            0,
            this.width,
            window.innerHeight
        );
        ctx.restore();
    }

    drawBeam(ctx) {
        ctx.save();
        
        // Main beam gradient
        const gradient = ctx.createLinearGradient(
            this.x - this.width/2, 0,
            this.x + this.width/2, 0
        );
        gradient.addColorStop(0, 'rgba(255, 30, 0, 0)');
        gradient.addColorStop(0.2, `rgba(255, 60, 0, ${this.intensity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${this.intensity})`);
        gradient.addColorStop(0.8, `rgba(255, 60, 0, ${this.intensity * 0.8})`);
        gradient.addColorStop(1, 'rgba(255, 30, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.width/2,
            0,
            this.width,
            this.height
        );

        // Add pulsing glow effect
        const glowGradient = ctx.createRadialGradient(
            this.x, this.height/2, 0,
            this.x, this.height/2, this.glowRadius
        );
        glowGradient.addColorStop(0, `rgba(255, 100, 0, ${this.intensity * 0.5})`);
        glowGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(
            this.x - this.glowRadius,
            0,
            this.glowRadius * 2,
            this.height
        );
        
        ctx.restore();
    }

    drawParticles(ctx) {
        ctx.save();
        this.particles.forEach(particle => {
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, 5
            );
            gradient.addColorStop(0, `rgba(255, 100, 0, ${particle.life})`);
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    checkCollision(phoenix) {
        if (this.state !== 'firing' || !phoenix) return false;

        const phoenixRadius = phoenix.radius || 20;
        
        // Check if phoenix is within the beam's vertical range
        const beamLeft = this.x - this.width/2;
        const beamRight = this.x + this.width/2;
        
        const phoenixLeft = phoenix.x - phoenixRadius;
        const phoenixRight = phoenix.x + phoenixRadius;

        return !(phoenixLeft > beamRight || 
                phoenixRight < beamLeft);
    }
}