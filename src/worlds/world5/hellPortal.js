export class HellPortal {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.radius = config.radius || 50;
        this.damage = config.damage || 25;
        
        // Animation states
        this.active = true;
        this.state = 'warning'; // warning -> active -> fading
        this.stateTime = 0;
        
        // Portal properties
        this.intensity = 0;
        this.warningAlpha = 0;
        this.alpha = 1;
        
        // Particle system for visual effects
        this.particles = [];
        this.maxParticles = 40;
        
        // Pull force properties
        this.pullStrength = config.pullStrength || 1.0;
        this.pullRadius = config.pullRadius || this.radius * 4;
        
        // Visual effects
        this.rotationAngle = 0;
        this.pulsePhase = 0;
    }

    update(deltaTime) {
        this.stateTime += deltaTime;
        this.pulsePhase += deltaTime * 0.003;
        this.rotationAngle += deltaTime * 0.001;

        switch (this.state) {
            case 'warning':
                // Warning animation before portal opens
                this.warningAlpha = Math.sin(this.stateTime * 0.01) * 0.5 + 0.5;
                this.intensity = Math.min(this.stateTime / this.config.warningTime, 1);
                
                if (this.stateTime >= this.config.warningTime) {
                    this.state = 'active';
                    this.stateTime = 0;
                }
                break;

            case 'active':
                // Full portal effect
                this.intensity = 1.0;
                this.updateParticles(deltaTime);
                
                if (this.stateTime >= this.config.duration) {
                    this.state = 'fading';
                    this.stateTime = 0;
                }
                break;

            case 'fading':
                // Fade out effect
                this.alpha = Math.max(0, 1 - (this.stateTime / this.config.fadeTime));
                
                if (this.stateTime >= this.config.fadeTime) {
                    this.active = false;
                }
                break;
        }
    }

    updateParticles(deltaTime) {
        // Add new particles during active state
        if (this.state === 'active' && this.particles.length < this.maxParticles) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.radius * 0.7 * Math.random();
            
            this.particles.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * (0.5 + Math.random()),
                vy: Math.sin(angle) * (0.5 + Math.random()),
                size: 2 + Math.random() * 5,
                life: 0.8 + Math.random() * 0.2
            });
        }

        // Update existing particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.size *= 0.99;
            particle.life -= deltaTime * 0.0008;
            return particle.life > 0;
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Draw warning indicator during warning phase
        if (this.state === 'warning') {
            this.drawWarning(ctx);
        }

        // Draw main portal effect
        if (this.state === 'active' || this.state === 'fading') {
            this.drawPortal(ctx);
        }

        // Draw particles
        this.drawParticles(ctx);
        
        ctx.restore();
    }

    drawWarning(ctx) {
        ctx.globalAlpha = this.warningAlpha * this.alpha;
        
        // Warning circle
        ctx.strokeStyle = `rgba(255, 50, 0, ${this.warningAlpha})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Warning symbol
        ctx.strokeStyle = `rgba(255, 50, 0, ${this.warningAlpha * 1.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Draw pentagram
        const points = 5;
        for (let i = 0; i <= points * 2; i++) {
            const angle = (Math.PI / 2) + (i * 2 * Math.PI / points);
            const r = i % 2 === 0 ? this.radius * 0.4 : this.radius * 0.7;
            const x = this.x + r * Math.cos(angle);
            const y = this.y + r * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
    }

    drawPortal(ctx) {
        ctx.globalAlpha = this.alpha;
        
        // Portal glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 1.5
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, ${this.alpha * 0.7})`);
        gradient.addColorStop(0.5, `rgba(200, 0, 0, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Main portal
        const portalGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        portalGradient.addColorStop(0, `rgba(255, 50, 0, ${this.alpha})`);
        portalGradient.addColorStop(0.7, `rgba(180, 0, 0, ${this.alpha})`);
        portalGradient.addColorStop(1, `rgba(100, 0, 0, ${this.alpha * 0.8})`);
        
        ctx.fillStyle = portalGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Swirling effect
        this.drawSwirlEffects(ctx);
    }
    
    drawSwirlEffects(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.8;
        
        // Draw spiral patterns
        for (let i = 0; i < 3; i++) {
            const angleOffset = (i * Math.PI * 2 / 3) + this.rotationAngle;
            
            ctx.strokeStyle = `rgba(255, 160, 0, ${this.alpha * 0.7})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
                const radius = (angle / (Math.PI * 6)) * this.radius;
                const x = this.x + Math.cos(angle + angleOffset) * radius;
                const y = this.y + Math.sin(angle + angleOffset) * radius;
                
                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawParticles(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        this.particles.forEach(particle => {
            const particleGradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            particleGradient.addColorStop(0, `rgba(255, 150, 0, ${particle.life})`);
            particleGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    checkCollision(phoenix) {
        if (this.state !== 'active' || !phoenix) return false;

        const phoenixRadius = phoenix.radius || 20;
        const dx = phoenix.x - this.x;
        const dy = phoenix.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.radius + phoenixRadius);
    }
    
    calculatePull(phoenix) {
        if (!phoenix || this.state !== 'active') return { x: 0, y: 0 };
        
        const dx = this.x - phoenix.x;
        const dy = this.y - phoenix.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // No pull outside the pull radius
        if (distance > this.pullRadius) return { x: 0, y: 0 };
        
        // Calculate pull strength based on distance
        // Closer to the portal = stronger pull
        const pullFactor = (1 - distance / this.pullRadius) * this.pullStrength;
        
        return {
            x: (dx / distance) * pullFactor,
            y: (dy / distance) * pullFactor
        };
    }
} 