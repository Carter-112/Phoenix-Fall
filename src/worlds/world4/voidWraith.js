/**
 * Void Wraith - A phasing enemy specific to World 4 (Celestial Void)
 * Can phase in and out, becoming temporarily invulnerable
 */

export class VoidWraith {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        this.velocityX = 0;
        this.velocityY = 0;
        this.maxVelocity = config?.speed || 2.2;
        this.health = config?.health || 300;
        this.maxHealth = this.health;
        this.damage = 30; // Damage to phoenix on collision
        this.active = true;
        this.particles = [];
        
        // Phasing state
        this.phased = false;
        this.phaseTimer = 0;
        this.phaseDuration = 3000; // 3 seconds in phase mode
        this.phaseInterval = 5000; // 5 seconds between phases
        this.phaseTransition = 0; // 0-1 for transition effect
        
        // Movement pattern
        this.movementPattern = 'hunt'; // 'hunt', 'circle', 'phase'
        this.patternTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTime = 1000 + Math.random() * 1000;
        
        // Visuals
        this.rotationAngle = 0;
        this.opacity = 1;
        this.color = {
            r: 90,
            g: 50,
            b: 180
        };
    }
    
    update(deltaTime, phoenix) {
        if (!this.active) return;
        
        // Update phase state
        this.updatePhasing(deltaTime);
        
        // Update movement pattern
        this.updateMovement(deltaTime, phoenix);
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update visual effects
        this.rotationAngle += deltaTime * 0.001;
        
        // Handle screen boundaries
        const boundaryPadding = 50;
        if (this.x < -boundaryPadding) this.x = window.innerWidth + boundaryPadding;
        if (this.x > window.innerWidth + boundaryPadding) this.x = -boundaryPadding;
        if (this.y < -boundaryPadding) this.y = window.innerHeight + boundaryPadding;
        if (this.y > window.innerHeight + boundaryPadding) this.y = -boundaryPadding;
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Emit particles
        if (Math.random() < 0.2) {
            this.emitParticle();
        }
    }
    
    updatePhasing(deltaTime) {
        this.phaseTimer += deltaTime;
        
        if (this.phased) {
            // Currently phased
            if (this.phaseTimer >= this.phaseDuration) {
                this.phased = false;
                this.phaseTimer = 0;
                this.phaseTransition = 1;
            }
        } else {
            // Currently normal
            if (this.phaseTimer >= this.phaseInterval) {
                this.phased = true;
                this.phaseTimer = 0;
                this.phaseTransition = 1;
                
                // Change movement to phase pattern when entering phased state
                this.movementPattern = 'phase';
            }
        }
        
        // Update phase transition effect
        if (this.phaseTransition > 0) {
            this.phaseTransition = Math.max(0, this.phaseTransition - deltaTime * 0.003);
        }
    }
    
    updateMovement(deltaTime, phoenix) {
        this.patternTimer += deltaTime;
        
        if (this.patternTimer > this.changeDirectionTime) {
            // Randomly switch patterns if not phasing
            if (!this.phased) {
                const patterns = ['hunt', 'circle'];
                this.movementPattern = patterns[Math.floor(Math.random() * patterns.length)];
            }
            
            this.patternTimer = 0;
            this.changeDirectionTime = 2000 + Math.random() * 2000;
        }
        
        // Apply the current movement pattern
        switch (this.movementPattern) {
            case 'hunt':
                this.huntPattern(deltaTime, phoenix);
                break;
            case 'circle':
                this.circlePattern(deltaTime, phoenix);
                break;
            case 'phase':
                this.phasePattern(deltaTime);
                break;
        }
        
        // Apply friction
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        
        // Limit velocity
        const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (currentSpeed > this.maxVelocity) {
            const ratio = this.maxVelocity / currentSpeed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }
    }
    
    huntPattern(deltaTime, phoenix) {
        if (!phoenix) return;
        
        // Calculate direction to phoenix
        const dx = phoenix.x - this.x;
        const dy = phoenix.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 20) {
            // Move toward phoenix
            const accel = 0.02;
            this.velocityX += (dx / distance) * accel;
            this.velocityY += (dy / distance) * accel;
        }
    }
    
    circlePattern(deltaTime, phoenix) {
        if (!phoenix) return;
        
        // Calculate direction to phoenix
        const dx = phoenix.x - this.x;
        const dy = phoenix.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 100 && distance < 300) {
            // Circle around phoenix
            const angle = Math.atan2(dy, dx);
            const perpAngle = angle + Math.PI / 2; // 90 degrees
            
            const circleAccel = 0.03;
            this.velocityX += Math.cos(perpAngle) * circleAccel;
            this.velocityY += Math.sin(perpAngle) * circleAccel;
            
            // Maintain distance
            const distanceAccel = 0.01;
            const optimalDistance = 200;
            const distanceDiff = distance - optimalDistance;
            
            this.velocityX += (dx / distance) * distanceDiff * distanceAccel;
            this.velocityY += (dy / distance) * distanceDiff * distanceAccel;
        } else {
            // If too far or too close, switch to hunt pattern
            this.huntPattern(deltaTime, phoenix);
        }
    }
    
    phasePattern(deltaTime) {
        // Erratic movement during phase state
        if (this.patternTimer % 500 < 50) {
            const angle = Math.random() * Math.PI * 2;
            const force = 0.2 + Math.random() * 0.3;
            
            this.velocityX += Math.cos(angle) * force;
            this.velocityY += Math.sin(angle) * force;
        }
    }
    
    emitParticle() {
        const particleCount = this.phased ? 2 : 1;
        
        for (let i = 0; i < particleCount; i++) {
            // Random position within the wraith
            const offsetX = (Math.random() - 0.5) * this.width * 0.8;
            const offsetY = (Math.random() - 0.5) * this.height * 0.8;
            
            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1;
            
            this.particles.push({
                x: this.x + offsetX,
                y: this.y + offsetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                opacity: 0.7 + Math.random() * 0.3,
                lifetime: 0,
                maxLifetime: 500 + Math.random() * 500,
                color: this.phased ? 
                    {r: 150, g: 100, b: 255} : 
                    {r: 90, g: 50, b: 180}
            });
        }
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
                    (particle.opacity > 0.5 ? 1 : particle.opacity);
                
                // Shrink
                particle.size *= 0.99;
            }
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Draw particles behind the wraith
        for (const particle of this.particles) {
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Set the base opacity based on phase state
        const baseOpacity = this.phased ? 0.6 : 0.9;
        
        // Create a pulsing effect
        const pulseAmount = this.phased ? 0.3 : 0.1;
        const pulse = baseOpacity - pulseAmount + pulseAmount * Math.sin(Date.now() * 0.003);
        
        // Apply phase transition effect
        const phaseFlash = Math.max(0, 0.5 * this.phaseTransition);
        const finalOpacity = Math.min(1, pulse + phaseFlash);
        
        // Get the wraith color based on state
        let color = this.color;
        if (this.phased) {
            color = {r: 150, g: 100, b: 255};
        }
        
        // Draw the wraith
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        
        // Draw wraith body (ghost-like shape)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, `rgba(${color.r + 30}, ${color.g + 30}, ${color.b + 30}, ${finalOpacity})`);
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${finalOpacity * 0.7})`);
        gradient.addColorStop(1, `rgba(${color.r - 20}, ${color.g - 20}, ${color.b - 20}, 0)`);
        
        ctx.fillStyle = gradient;
        
        // Draw a floating ghostly shape
        const time = Date.now() * 0.002;
        
        ctx.beginPath();
        const points = 8;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / points) * Math.PI;
            
            // Alternate between outer and inner radius
            const radius = (i % 2 === 0) ? 
                this.width / 2 : 
                this.width / 3 + 5 * Math.sin(angle * 3 + time);
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Draw eyes
        if (!this.phased) {
            const eyeDistance = 15;
            const eyeY = -5;
            
            // Left eye
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(-eyeDistance, eyeY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Right eye
            ctx.beginPath();
            ctx.arc(eyeDistance, eyeY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye pupils
            ctx.fillStyle = 'rgba(0, 0, 30, 0.9)';
            ctx.beginPath();
            ctx.arc(-eyeDistance, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeDistance, eyeY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth && !this.phased) {
            const healthBarWidth = 40;
            const healthBarHeight = 4;
            const healthPercentage = this.health / this.maxHealth;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-healthBarWidth / 2, -this.height / 2 - 15, healthBarWidth, healthBarHeight);
            
            ctx.fillStyle = `rgba(${255 - 255 * healthPercentage}, ${255 * healthPercentage}, 50, 0.8)`;
            ctx.fillRect(
                -healthBarWidth / 2, 
                -this.height / 2 - 15, 
                healthBarWidth * healthPercentage, 
                healthBarHeight
            );
        }
        
        ctx.restore();
    }
    
    takeDamage(amount) {
        // Cannot take damage while phased
        if (this.phased) return 0;
        
        const actualDamage = Math.min(this.health, amount);
        this.health -= actualDamage;
        
        // Create damage effect particles
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * this.width * 0.5,
                y: this.y + (Math.random() - 0.5) * this.height * 0.5,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: 5 + Math.random() * 5,
                opacity: 0.9,
                lifetime: 0,
                maxLifetime: 300 + Math.random() * 200,
                color: {r: 180, g: 100, b: 255}
            });
        }
        
        // Check if defeated
        if (this.health <= 0) {
            this.onDefeat();
        }
        
        return actualDamage;
    }
    
    onDefeat() {
        // Create explosion effect
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.width * 0.7;
            
            this.particles.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                size: 5 + Math.random() * 8,
                opacity: 0.9,
                lifetime: 0,
                maxLifetime: 500 + Math.random() * 500,
                color: {r: 150, g: 100, b: 255}
            });
        }
        
        // Deactivate the wraith
        this.active = false;
        
        // Play sound effect if available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('enemyDefeat', 0.5);
            } catch (error) {
                console.log('Could not play enemy defeat sound');
            }
        }
    }
    
    checkCollision(phoenix) {
        if (!phoenix || !this.active || this.phased) return 0;
        
        // Calculate collision with radius-based approach
        const collisionRadius = (this.width + phoenix.width) / 4;
        const dx = this.x - phoenix.x;
        const dy = this.y - phoenix.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < collisionRadius) {
            return this.damage;
        }
        
        return 0;
    }
    
    isActive() {
        return this.active;
    }
} 