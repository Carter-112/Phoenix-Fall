/**
 * Celestial Ember - A special high-value collectible for World 4 (Celestial Void)
 * Has a gravitational pull effect and unique visual style
 */
export class CelestialEmber {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.width = 30;
        this.height = 30;
        this.active = true;
        this.value = config?.value || 150;
        
        // Visual properties
        this.rotationAngle = Math.random() * Math.PI * 2;
        this.rotationSpeed = 0.002 + Math.random() * 0.002;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitSpeed = 0.003 + Math.random() * 0.002;
        this.hue = 220 + Math.random() * 60; // Blue to purple
        
        // Particles
        this.particles = [];
        this.orbitParticles = [];
        for (let i = 0; i < 3; i++) {
            this.orbitParticles.push({
                angle: Math.PI * 2 * (i / 3),
                distance: 15 + Math.random() * 5,
                size: 4 + Math.random() * 3,
                speed: 0.001 + Math.random() * 0.001,
                offset: Math.random() * Math.PI * 2
            });
        }
        
        // Behavior settings
        this.lifetime = 0;
        this.maxLifetime = 12000; // 12 seconds before fading
        this.fadeOutTime = 2000; // 2 seconds to fade out
        this.gravitationalPull = 0.15; // Strength of pull toward phoenix
        this.pullRadius = 150; // Range of gravitational effect
    }
    
    update(deltaTime, phoenix) {
        if (!this.active) return;
        
        // Update lifetime
        this.lifetime += deltaTime;
        
        // Apply movement
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update visual effects
        this.rotationAngle += this.rotationSpeed * deltaTime;
        this.pulsePhase = (this.pulsePhase + 0.003 * deltaTime) % (Math.PI * 2);
        this.orbitAngle = (this.orbitAngle + this.orbitSpeed * deltaTime) % (Math.PI * 2);
        
        // Apply friction to slow movement
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        
        // Apply gravitational pull toward phoenix if nearby
        if (phoenix) {
            const dx = phoenix.x - this.x;
            const dy = phoenix.y - this.y;
            const distanceSquared = dx * dx + dy * dy;
            
            if (distanceSquared < this.pullRadius * this.pullRadius) {
                const distance = Math.sqrt(distanceSquared);
                if (distance > 0) {
                    // Calculate gravitational strength (stronger when closer)
                    const strength = this.gravitationalPull * (1 - distance / this.pullRadius);
                    
                    // Apply force toward phoenix
                    this.velocityX += (dx / distance) * strength;
                    this.velocityY += (dy / distance) * strength;
                }
            }
        }
        
        // Emit particles occasionally
        if (Math.random() < 0.2) {
            this.emitParticle();
        }
        
        // Update existing particles
        this.updateParticles(deltaTime);
        
        // Check if ember should start fading
        if (this.lifetime > this.maxLifetime - this.fadeOutTime) {
            // Fade out if at end of lifetime
            const fadeProgress = (this.lifetime - (this.maxLifetime - this.fadeOutTime)) / this.fadeOutTime;
            if (fadeProgress >= 1) {
                this.active = false;
            }
        }
    }
    
    emitParticle() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 8 + Math.random() * 4;
        
        this.particles.push({
            x: this.x + Math.cos(angle) * distance,
            y: this.y + Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.2, // Slight upward drift
            size: 2 + Math.random() * 3,
            opacity: 0.6 + Math.random() * 0.4,
            lifetime: 0,
            maxLifetime: 500 + Math.random() * 500,
            hue: this.hue + (Math.random() - 0.5) * 20
        });
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update lifetime
            particle.lifetime += deltaTime;
            
            // Remove if past max lifetime
            if (particle.lifetime > particle.maxLifetime) {
                this.particles.splice(i, 1);
            } else {
                // Fade out
                particle.opacity = (1 - particle.lifetime / particle.maxLifetime) * 
                    (particle.opacity > 0.5 ? 0.8 : particle.opacity);
                
                // Shrink
                particle.size *= 0.99;
            }
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Calculate fadeout opacity if nearing end of lifetime
        let fadeOpacity = 1;
        if (this.lifetime > this.maxLifetime - this.fadeOutTime) {
            fadeOpacity = 1 - (this.lifetime - (this.maxLifetime - this.fadeOutTime)) / this.fadeOutTime;
        }
        
        // Draw background particles first
        for (const particle of this.particles) {
            const particleOpacity = particle.opacity * fadeOpacity;
            ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${particleOpacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw pulsing glow effect
        const pulseSize = 1 + 0.2 * Math.sin(this.pulsePhase);
        const glowRadius = this.width * 0.7 * pulseSize;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowRadius
        );
        
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${0.4 * fadeOpacity})`);
        gradient.addColorStop(0.7, `hsla(${this.hue}, 100%, 60%, ${0.2 * fadeOpacity})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw orbiting particles
        for (const orbit of this.orbitParticles) {
            const orbitTime = this.orbitAngle + orbit.offset;
            const orbitX = this.x + Math.cos(orbitTime) * orbit.distance * pulseSize;
            const orbitY = this.y + Math.sin(orbitTime) * orbit.distance * pulseSize;
            
            ctx.fillStyle = `hsla(${this.hue + 20}, 100%, 80%, ${0.8 * fadeOpacity})`;
            ctx.beginPath();
            ctx.arc(orbitX, orbitY, orbit.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Small trail for each orbiting particle
            const trailLength = 3;
            for (let i = 1; i <= trailLength; i++) {
                const trailOpacity = (trailLength - i) / trailLength * 0.4;
                const trailAngle = orbitTime - i * 0.2;
                const trailX = this.x + Math.cos(trailAngle) * orbit.distance * pulseSize;
                const trailY = this.y + Math.sin(trailAngle) * orbit.distance * pulseSize;
                const trailSize = orbit.size * (1 - i / (trailLength + 1));
                
                ctx.fillStyle = `hsla(${this.hue + 20}, 100%, 80%, ${trailOpacity * fadeOpacity})`;
                ctx.beginPath();
                ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw inner core
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        
        const coreSize = this.width * 0.3 * pulseSize;
        
        // Inner glow
        const coreGradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, coreSize
        );
        
        coreGradient.addColorStop(0, `hsla(${this.hue - 20}, 100%, 90%, ${0.9 * fadeOpacity})`);
        coreGradient.addColorStop(0.7, `hsla(${this.hue}, 100%, 70%, ${0.7 * fadeOpacity})`);
        coreGradient.addColorStop(1, `hsla(${this.hue + 20}, 100%, 50%, ${0.5 * fadeOpacity})`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw celestial pattern
        ctx.strokeStyle = `hsla(${this.hue - 40}, 100%, 90%, ${0.8 * fadeOpacity})`;
        ctx.lineWidth = 1.5;
        
        // Draw star pattern
        const starPoints = 5;
        const innerRadius = coreSize * 0.4;
        const outerRadius = coreSize * 0.9;
        
        ctx.beginPath();
        for (let i = 0; i < starPoints * 2; i++) {
            const angle = (i / starPoints) * Math.PI;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
    
    checkCollision(phoenix) {
        if (!phoenix || !this.active) return false;
        
        // Use circular collision detection
        const collisionRadius = (this.width + phoenix.width) / 3;
        const dx = this.x - phoenix.x;
        const dy = this.y - phoenix.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < collisionRadius;
    }
    
    collect() {
        if (!this.active) return 0;
        
        this.active = false;
        
        // Play sound effect if available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('celestialEmberCollect', 0.6);
            } catch (error) {
                console.log('Could not play celestial ember collect sound');
            }
        }
        
        // Create collection effect
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.width * 0.7;
            
            this.particles.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                size: 3 + Math.random() * 4,
                opacity: 0.9,
                lifetime: 0,
                maxLifetime: 800 + Math.random() * 400,
                hue: this.hue + (Math.random() - 0.5) * 30
            });
        }
        
        return this.value;
    }
    
    isActive() {
        return this.active;
    }
} 