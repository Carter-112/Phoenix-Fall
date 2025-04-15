/**
 * SunPulseManager - Manages expanding sun pulse hazards
 */
export class SunPulseManager {
    constructor(worldConfig) {
        this.config = worldConfig.hazards.sunPulse;
        this.pulses = [];
        this.active = true;
        this.lastSpawnTime = 0;
        
        // Apply any difficulty modifiers if provided
        if (worldConfig.systems.difficulty?.modifiers) {
            const modifiers = worldConfig.systems.difficulty.modifiers;
            this.spawnRateMultiplier = modifiers.spawnRate || 1;
            this.damageMultiplier = modifiers.damage || 1;
        } else {
            this.spawnRateMultiplier = 1;
            this.damageMultiplier = 1;
        }
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        // Auto-spawn logic - only if not being managed by a pattern coordinator
        const spawnInterval = this.config.spawnRate * this.spawnRateMultiplier;
        if (currentTime - this.lastSpawnTime > spawnInterval && this.pulses.length < this.config.maxActive) {
            // Random position, avoiding edges
            const x = width * 0.1 + Math.random() * width * 0.8;
            const y = height * 0.1 + Math.random() * height * 0.8;
            
            this.spawnPulse(x, y);
            this.lastSpawnTime = currentTime;
        }
        
        // Update existing pulses
        for (let i = this.pulses.length - 1; i >= 0; i--) {
            const pulse = this.pulses[i];
            
            // Update pulse state
            pulse.lifetime += deltaTime;
            
            // Warning phase
            if (pulse.lifetime < this.config.warningEffect ? 1000 : 0) {
                pulse.warningAlpha = Math.min(1, pulse.lifetime / 500);
                pulse.warningScale = 0.5 + 0.5 * Math.sin(pulse.lifetime * 0.01);
            } 
            // Expansion phase
            else if (pulse.lifetime < this.config.expansionTime + (this.config.warningEffect ? 1000 : 0)) {
                pulse.active = true;
                
                // Calculate how far along the expansion we are
                const expansionStart = this.config.warningEffect ? 1000 : 0;
                const expansionProgress = (pulse.lifetime - expansionStart) / this.config.expansionTime;
                
                pulse.scale = Math.min(1, expansionProgress);
                pulse.alpha = Math.min(1, expansionProgress * 2);
            } 
            // Sustain phase
            else if (pulse.lifetime < this.config.expansionTime + 1000 + (this.config.warningEffect ? 1000 : 0)) {
                pulse.scale = 1;
                pulse.alpha = 1;
                
                // Pulsing effect during sustain
                const sustainTime = pulse.lifetime - (this.config.expansionTime + (this.config.warningEffect ? 1000 : 0));
                pulse.pulseScale = 1 + 0.1 * Math.sin(sustainTime * 0.01);
            }
            // Fadeout phase
            else {
                const fadeOutStart = this.config.expansionTime + 1000 + (this.config.warningEffect ? 1000 : 0);
                const fadeOutDuration = 500; // 0.5 second fade out
                const fadeOutProgress = (pulse.lifetime - fadeOutStart) / fadeOutDuration;
                
                if (fadeOutProgress < 1) {
                    pulse.alpha = 1 - fadeOutProgress;
                } else {
                    // Remove pulse once it's completely faded
                    this.pulses.splice(i, 1);
                    continue;
                }
            }
            
            // Move the pulse if it has velocity
            if (pulse.velocityX !== 0 || pulse.velocityY !== 0) {
                pulse.x += pulse.velocityX * deltaTime * 0.1;
                pulse.y += pulse.velocityY * deltaTime * 0.1;
                
                // Wrap around edges if needed
                if (pulse.x < -pulse.radius) pulse.x = width + pulse.radius;
                if (pulse.x > width + pulse.radius) pulse.x = -pulse.radius;
                if (pulse.y < -pulse.radius) pulse.y = height + pulse.radius;
                if (pulse.y > height + pulse.radius) pulse.y = -pulse.radius;
            }
        }
    }
    
    spawnPulse(x, y, velocityX = 0) {
        // Only spawn if under max active limit
        if (this.pulses.length >= this.config.maxActive) return null;
        
        const pulse = {
            x,
            y,
            velocityX: velocityX,
            velocityY: 0, // Sun pulses typically only move horizontally
            radius: this.config.radius,
            lifetime: 0,
            warningAlpha: 0,
            warningScale: 0.5,
            active: false,
            scale: 0,
            alpha: 0,
            pulseScale: 1
        };
        
        this.pulses.push(pulse);
        
        // Play spawn sound if sound manager is available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('sunPulse', 0.5);
            } catch (error) {
                console.log('Could not play sun pulse sound');
            }
        }
        
        return pulse;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw each pulse
        for (const pulse of this.pulses) {
            // Skip if not visible
            if (pulse.alpha <= 0 && pulse.warningAlpha <= 0) continue;
            
            ctx.save();
            
            // Warning phase
            if (!pulse.active && pulse.warningAlpha > 0) {
                // Draw warning indicator
                const warningRadius = pulse.radius * pulse.warningScale;
                
                // Outer glow
                const gradient = ctx.createRadialGradient(
                    pulse.x, pulse.y, 0,
                    pulse.x, pulse.y, warningRadius
                );
                gradient.addColorStop(0, `rgba(255, 220, 50, ${0.7 * pulse.warningAlpha})`);
                gradient.addColorStop(0.5, `rgba(255, 150, 0, ${0.4 * pulse.warningAlpha})`);
                gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(pulse.x, pulse.y, warningRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Center symbol
                ctx.fillStyle = `rgba(255, 255, 200, ${0.9 * pulse.warningAlpha})`;
                const symbolSize = warningRadius * 0.2;
                
                // Draw a sun-like symbol
                ctx.beginPath();
                ctx.arc(pulse.x, pulse.y, symbolSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw sun rays
                ctx.strokeStyle = `rgba(255, 255, 150, ${0.8 * pulse.warningAlpha})`;
                ctx.lineWidth = 3;
                
                const rayCount = 8;
                for (let i = 0; i < rayCount; i++) {
                    const angle = (i / rayCount) * Math.PI * 2;
                    const innerRadius = symbolSize * 1.2;
                    const outerRadius = symbolSize * 2.5;
                    
                    ctx.beginPath();
                    ctx.moveTo(
                        pulse.x + Math.cos(angle) * innerRadius,
                        pulse.y + Math.sin(angle) * innerRadius
                    );
                    ctx.lineTo(
                        pulse.x + Math.cos(angle) * outerRadius,
                        pulse.y + Math.sin(angle) * outerRadius
                    );
                    ctx.stroke();
                }
            }
            
            // Active pulse
            if (pulse.active && pulse.alpha > 0) {
                // Calculate visual radius based on scale and pulse effect
                const visualRadius = pulse.radius * pulse.scale * (pulse.pulseScale || 1);
                
                // Create a bright sun-like gradient
                const gradient = ctx.createRadialGradient(
                    pulse.x, pulse.y, 0,
                    pulse.x, pulse.y, visualRadius
                );
                
                gradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 * pulse.alpha})`); // Bright center
                gradient.addColorStop(0.3, `rgba(255, 200, 50, ${0.8 * pulse.alpha})`);
                gradient.addColorStop(0.6, `rgba(255, 150, 0, ${0.6 * pulse.alpha})`);
                gradient.addColorStop(0.8, `rgba(255, 50, 0, ${0.4 * pulse.alpha})`);
                gradient.addColorStop(1, `rgba(100, 0, 0, 0)`); // Fade out edge
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(pulse.x, pulse.y, visualRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add pulsing outer ring
                const ringWidth = visualRadius * 0.05;
                const outerRingRadius = visualRadius * 0.9;
                
                ctx.strokeStyle = `rgba(255, 255, 100, ${0.6 * pulse.alpha})`;
                ctx.lineWidth = ringWidth;
                ctx.beginPath();
                ctx.arc(pulse.x, pulse.y, outerRingRadius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Add corona effect with randomly placed particles
                const coronaCount = Math.floor(20 * pulse.scale);
                
                for (let i = 0; i < coronaCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = visualRadius * (0.7 + 0.4 * Math.random());
                    const size = 5 + 10 * Math.random() * pulse.scale;
                    
                    const particleX = pulse.x + Math.cos(angle) * distance;
                    const particleY = pulse.y + Math.sin(angle) * distance;
                    
                    ctx.fillStyle = `rgba(255, 200, 50, ${0.7 * pulse.alpha * Math.random()})`;
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }
    }
    
    checkCollisions(phoenix) {
        if (!phoenix || !this.active) return 0;
        
        let totalDamage = 0;
        
        // Check each active pulse
        for (const pulse of this.pulses) {
            if (!pulse.active) continue;
            
            // Calculate distance from phoenix to pulse center
            const dx = phoenix.x - pulse.x;
            const dy = phoenix.y - pulse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if phoenix is inside the pulse
            if (distance < pulse.radius * pulse.scale) {
                // Calculate damage based on proximity to center (more damage closer to center)
                const proximityFactor = 1 - (distance / (pulse.radius * pulse.scale));
                const damage = this.config.damage * proximityFactor * this.damageMultiplier;
                
                totalDamage += damage;
                
                // Apply a knockback effect away from the center
                const knockbackForce = 0.2 * proximityFactor;
                const angle = Math.atan2(dy, dx);
                
                phoenix.velocityX += Math.cos(angle) * knockbackForce;
                phoenix.velocityY += Math.sin(angle) * knockbackForce;
                
                // Visual effect on collision if possible
                if (phoenix.createDamageEffect) {
                    phoenix.createDamageEffect();
                }
            }
        }
        
        return totalDamage;
    }
    
    reset() {
        this.pulses = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 