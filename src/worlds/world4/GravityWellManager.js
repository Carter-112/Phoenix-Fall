/**
 * GravityWellManager - Manages gravity well hazards in World 4
 * Creates areas that pull the phoenix toward their center
 */
export class GravityWellManager {
    constructor(worldConfig) {
        this.config = worldConfig.hazards.gravityWell;
        this.wells = [];
        this.active = true;
        this.lastSpawnTime = 0;
        
        // Apply any difficulty modifiers if provided
        if (worldConfig.systems.difficulty?.modifiers) {
            const modifiers = worldConfig.systems.difficulty.modifiers;
            this.spawnRateMultiplier = modifiers.spawnRate || 1;
            this.forceMultiplier = modifiers.force || 1;
        } else {
            this.spawnRateMultiplier = 1;
            this.forceMultiplier = 1;
        }
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        // Auto-spawn logic - only if not being managed by a pattern coordinator
        const spawnInterval = this.config.spawnRate * this.spawnRateMultiplier;
        if (currentTime - this.lastSpawnTime > spawnInterval && this.wells.length < this.config.maxActive) {
            // Random position, avoiding edges
            const x = width * 0.2 + Math.random() * width * 0.6;
            const y = height * 0.2 + Math.random() * height * 0.6;
            
            this.spawnGravityWell(x, y);
            this.lastSpawnTime = currentTime;
        }
        
        // Update existing gravity wells
        for (let i = this.wells.length - 1; i >= 0; i--) {
            const well = this.wells[i];
            
            // Update lifetime
            well.lifetime += deltaTime;
            
            // Process warning phase
            if (well.lifetime < this.config.warningTime) {
                well.warningIntensity = Math.min(1, well.lifetime / this.config.warningTime);
            } 
            // Process active phase
            else if (well.lifetime < this.config.warningTime + this.config.duration) {
                well.active = true;
                well.pulsePhase = (well.pulsePhase + deltaTime * 0.003) % (Math.PI * 2);
            } 
            // Process fadeout phase
            else {
                const fadeOutDuration = 1000; // 1 second fade out
                const fadeOutProgress = (well.lifetime - (this.config.warningTime + this.config.duration)) / fadeOutDuration;
                
                if (fadeOutProgress < 1) {
                    well.alpha = 1 - fadeOutProgress;
                } else {
                    // Remove well once it's completely faded
                    this.wells.splice(i, 1);
                }
            }
        }
    }
    
    spawnGravityWell(x, y) {
        // Only spawn if under max active limit
        if (this.wells.length >= this.config.maxActive) return null;
        
        const well = {
            x,
            y,
            radius: this.config.radius,
            pullForce: this.config.pullForce * this.forceMultiplier,
            lifetime: 0,
            warningIntensity: 0,
            active: false,
            alpha: 1,
            pulsePhase: 0
        };
        
        this.wells.push(well);
        
        // Play spawn sound if sound manager is available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('gravityWell', 0.4);
            } catch (error) {
                console.log('Could not play gravity well sound');
            }
        }
        
        return well;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw each gravity well
        for (const well of this.wells) {
            ctx.save();
            
            if (!well.active && well.warningIntensity > 0) {
                // Warning indicator
                const warningRadius = well.radius * 0.8;
                const gradient = ctx.createRadialGradient(
                    well.x, well.y, 0,
                    well.x, well.y, warningRadius
                );
                gradient.addColorStop(0, `rgba(100, 50, 255, ${0.5 * well.warningIntensity})`);
                gradient.addColorStop(0.7, `rgba(100, 50, 255, ${0.2 * well.warningIntensity})`);
                gradient.addColorStop(1, 'rgba(100, 50, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(well.x, well.y, warningRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Pulsing circle
                ctx.strokeStyle = `rgba(150, 100, 255, ${well.warningIntensity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(well.x, well.y, warningRadius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            if (well.active) {
                // Active gravity well
                const pulseEffect = 1 + 0.1 * Math.sin(well.pulsePhase);
                const displayRadius = well.radius * pulseEffect;
                
                // Main gradient
                const gradient = ctx.createRadialGradient(
                    well.x, well.y, 0,
                    well.x, well.y, displayRadius
                );
                gradient.addColorStop(0, `rgba(130, 70, 255, ${0.7 * well.alpha})`);
                gradient.addColorStop(0.5, `rgba(70, 30, 180, ${0.5 * well.alpha})`);
                gradient.addColorStop(1, `rgba(40, 10, 100, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(well.x, well.y, displayRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw spiral effect to show pulling
                ctx.strokeStyle = `rgba(180, 120, 255, ${0.6 * well.alpha})`;
                ctx.lineWidth = 2;
                
                const spiralArms = 3;
                for (let i = 0; i < spiralArms; i++) {
                    const startAngle = (i / spiralArms) * Math.PI * 2 + well.pulsePhase;
                    ctx.beginPath();
                    
                    for (let r = 0; r < displayRadius; r += 5) {
                        const angle = startAngle + (r / displayRadius) * Math.PI * 4;
                        const x = well.x + Math.cos(angle) * r;
                        const y = well.y + Math.sin(angle) * r;
                        
                        if (r === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
    }
    
    applyPhysicsEffects(phoenix) {
        if (!phoenix || !this.active) return;
        
        // Apply gravity well effects
        for (const well of this.wells) {
            if (!well.active) continue;
            
            // Calculate distance from phoenix to well center
            const dx = phoenix.x - well.x;
            const dy = phoenix.y - well.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply force if within influence radius
            if (distance < well.radius) {
                // Calculate force based on distance (stronger closer to center)
                const forceFactor = (1 - distance / well.radius) * well.pullForce * 0.05;
                
                // Apply force toward well center
                phoenix.velocityX -= dx * forceFactor;
                phoenix.velocityY -= dy * forceFactor;
                
                // Apply visual effect if phoenix has the method
                if (phoenix.applyVisualEffect) {
                    phoenix.applyVisualEffect('gravityPull', forceFactor * 10);
                }
            }
        }
    }
    
    reset() {
        this.wells = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 