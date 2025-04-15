/**
 * World4HazardCoordinator - Manages hazards for World 4 (Celestial Void)
 * Controls gravity wells and void tears specific to this world
 */

export class World4HazardCoordinator {
    constructor(world4Config) {
        this.config = world4Config;
        this.active = true;
        this.gravityWells = [];
        this.voidTears = [];
        this.lastGravityWellSpawn = 0;
        this.lastVoidTearSpawn = 0;
        
        // Track gravity distortion system state
        this.gravityDistortion = {
            active: false,
            lastActivation: 0,
            startTime: 0,
            endTime: 0
        };
        
        // Apply difficulty modifiers if available
        if (world4Config.systems.difficulty?.modifiers) {
            const modifiers = world4Config.systems.difficulty.modifiers;
            this.spawnRateMultiplier = modifiers.spawnRate || 1;
            this.damageMultiplier = modifiers.damage || 1;
        } else {
            this.spawnRateMultiplier = 1;
            this.damageMultiplier = 1;
        }
    }

    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;

        // Update gravity distortion system
        this.updateGravityDistortion(currentTime);
        
        // Spawn and update gravity wells
        this.updateGravityWells(deltaTime, currentTime, width, height);
        
        // Spawn and update void tears
        this.updateVoidTears(deltaTime, currentTime, width, height);
    }
    
    updateGravityDistortion(currentTime) {
        const system = this.config.systems.gravityDistortion;
        if (!system || !system.enabled) return;
        
        // Check if gravity distortion should start
        if (!this.gravityDistortion.active) {
            if (currentTime - this.gravityDistortion.lastActivation > system.frequency) {
                this.gravityDistortion.active = true;
                this.gravityDistortion.startTime = currentTime;
                this.gravityDistortion.endTime = currentTime + system.duration;
                
                // Play effect if sound manager is available
                if (window.gameInstance && window.gameInstance.soundManager) {
                    try {
                        window.gameInstance.soundManager.playSound('gravityDistortion', 0.5);
                    } catch (error) {
                        console.log('Could not play gravity distortion sound');
                    }
                }
            }
        } 
        // Check if gravity distortion should end
        else if (currentTime > this.gravityDistortion.endTime) {
            this.gravityDistortion.active = false;
            this.gravityDistortion.lastActivation = currentTime;
        }
    }
    
    updateGravityWells(deltaTime, currentTime, width, height) {
        // Spawn new gravity wells
        const gravityWellConfig = this.config.hazards.gravityWell;
        if (gravityWellConfig) {
            const spawnInterval = gravityWellConfig.spawnRate * this.spawnRateMultiplier;
            if (currentTime - this.lastGravityWellSpawn > spawnInterval && 
                this.gravityWells.length < gravityWellConfig.maxActive) {
                
                // Random position, avoiding edges
                const x = width * 0.2 + Math.random() * width * 0.6;
                const y = height * 0.2 + Math.random() * height * 0.6;
                
                this.spawnGravityWell(x, y, gravityWellConfig);
                this.lastGravityWellSpawn = currentTime;
            }
        }
        
        // Update existing gravity wells
        for (let i = this.gravityWells.length - 1; i >= 0; i--) {
            const well = this.gravityWells[i];
            
            // Update lifetime
            well.lifetime += deltaTime;
            
            // Process warning phase
            if (well.lifetime < well.warningTime) {
                well.warningIntensity = Math.min(1, well.lifetime / well.warningTime);
            } 
            // Process active phase
            else if (well.lifetime < well.warningTime + well.duration) {
                well.active = true;
                well.pulsePhase = (well.pulsePhase + deltaTime * 0.003) % (Math.PI * 2);
            } 
            // Process fadeout phase
            else {
                const fadeOutDuration = 1000; // 1 second fade out
                const fadeOutProgress = (well.lifetime - (well.warningTime + well.duration)) / fadeOutDuration;
                
                if (fadeOutProgress < 1) {
                    well.alpha = 1 - fadeOutProgress;
                } else {
                    // Remove well once it's completely faded
                    this.gravityWells.splice(i, 1);
                }
            }
        }
    }
    
    updateVoidTears(deltaTime, currentTime, width, height) {
        // Spawn new void tears
        const voidTearConfig = this.config.hazards.voidTear;
        if (voidTearConfig) {
            const spawnInterval = voidTearConfig.spawnRate * this.spawnRateMultiplier;
            if (currentTime - this.lastVoidTearSpawn > spawnInterval && 
                this.voidTears.length < voidTearConfig.maxActive) {
                
                // Random position, favoring center area
                const x = width * 0.3 + Math.random() * width * 0.4;
                
                // Either top or bottom half, randomly
                const topHalf = Math.random() > 0.5;
                const y = topHalf ? 
                    height * 0.1 + Math.random() * height * 0.3 : 
                    height * 0.6 + Math.random() * height * 0.3;
                
                this.spawnVoidTear(x, y, voidTearConfig);
                this.lastVoidTearSpawn = currentTime;
            }
        }
        
        // Update existing void tears
        for (let i = this.voidTears.length - 1; i >= 0; i--) {
            const tear = this.voidTears[i];
            
            // Update lifetime
            tear.lifetime += deltaTime;
            
            // Process active phase
            if (tear.lifetime < tear.duration) {
                // Gradually expand to full size in first 20% of lifetime
                const expansionTime = tear.duration * 0.2;
                if (tear.lifetime < expansionTime) {
                    tear.scale = 0.2 + 0.8 * (tear.lifetime / expansionTime);
                }
                
                // Update visual distortion
                tear.visualDistortion = 0.3 + 0.7 * Math.sin(tear.lifetime * 0.005);
                
                // Add particles occasionally
                if (Math.random() < 0.1) {
                    tear.particles.push({
                        x: tear.x + (Math.random() - 0.5) * tear.width * 0.8,
                        y: tear.y + (Math.random() - 0.5) * tear.height * 0.8,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: 3 + Math.random() * 8,
                        lifetime: 0,
                        maxLifetime: 800 + Math.random() * 800
                    });
                }
                
                // Update existing particles
                for (let j = tear.particles.length - 1; j >= 0; j--) {
                    const particle = tear.particles[j];
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.lifetime += deltaTime;
                    
                    if (particle.lifetime > particle.maxLifetime) {
                        tear.particles.splice(j, 1);
                    }
                }
            } 
            // Process fadeout phase
            else {
                const fadeOutDuration = 800; // 0.8 second fade out
                const fadeOutProgress = (tear.lifetime - tear.duration) / fadeOutDuration;
                
                if (fadeOutProgress < 1) {
                    tear.alpha = 1 - fadeOutProgress;
                } else {
                    // Remove tear once it's completely faded
                    this.voidTears.splice(i, 1);
                }
            }
        }
    }
    
    spawnGravityWell(x, y, config) {
        const well = {
            x,
            y,
            radius: config.radius,
            pullForce: config.pullForce,
            lifetime: 0,
            warningTime: config.warningTime,
            duration: config.duration,
            warningIntensity: 0,
            active: false,
            alpha: 1,
            pulsePhase: 0
        };
        
        this.gravityWells.push(well);
        
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
    
    spawnVoidTear(x, y, config) {
        const tear = {
            x,
            y,
            width: config.width,
            height: config.height,
            damage: config.damage,
            lifetime: 0,
            duration: config.duration,
            active: true,
            alpha: 1,
            scale: 0.2,
            visualDistortion: 0.3,
            particles: []
        };
        
        this.voidTears.push(tear);
        
        // Play spawn sound if sound manager is available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('voidTear', 0.5);
            } catch (error) {
                console.log('Could not play void tear sound');
            }
        }
        
        return tear;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw gravity wells
        this.drawGravityWells(ctx);
        
        // Draw void tears
        this.drawVoidTears(ctx);
        
        // Draw global gravity distortion effect if active
        if (this.gravityDistortion.active) {
            this.drawGravityDistortionEffect(ctx);
        }
    }
    
    drawGravityWells(ctx) {
        for (const well of this.gravityWells) {
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
    
    drawVoidTears(ctx) {
        for (const tear of this.voidTears) {
            if (tear.alpha <= 0) continue;
            
            ctx.save();
            
            const halfWidth = (tear.width * tear.scale) / 2;
            const halfHeight = (tear.height * tear.scale) / 2;
            
            // Create a dark purple/blue gradient for the void
            const gradient = ctx.createLinearGradient(
                tear.x - halfWidth, tear.y - halfHeight,
                tear.x + halfWidth, tear.y + halfHeight
            );
            
            gradient.addColorStop(0, `rgba(30, 0, 70, ${0.8 * tear.alpha})`);
            gradient.addColorStop(0.5, `rgba(70, 20, 120, ${0.6 * tear.alpha})`);
            gradient.addColorStop(1, `rgba(20, 0, 50, ${0.8 * tear.alpha})`);
            
            ctx.fillStyle = gradient;
            
            // Draw a distorted rectangle with visual tearing effect
            const distortion = 10 * tear.visualDistortion;
            
            ctx.beginPath();
            ctx.moveTo(
                tear.x - halfWidth + (Math.random() - 0.5) * distortion, 
                tear.y - halfHeight + (Math.random() - 0.5) * distortion
            );
            ctx.lineTo(
                tear.x + halfWidth + (Math.random() - 0.5) * distortion, 
                tear.y - halfHeight + (Math.random() - 0.5) * distortion
            );
            ctx.lineTo(
                tear.x + halfWidth + (Math.random() - 0.5) * distortion, 
                tear.y + halfHeight + (Math.random() - 0.5) * distortion
            );
            ctx.lineTo(
                tear.x - halfWidth + (Math.random() - 0.5) * distortion, 
                tear.y + halfHeight + (Math.random() - 0.5) * distortion
            );
            ctx.closePath();
            ctx.fill();
            
            // Draw void particles
            for (const particle of tear.particles) {
                const particleOpacity = 1 - (particle.lifetime / particle.maxLifetime);
                
                ctx.fillStyle = `rgba(150, 100, 255, ${particleOpacity * tear.alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw jagged edges to enhance the tear effect
            ctx.strokeStyle = `rgba(200, 150, 255, ${0.7 * tear.alpha})`;
            ctx.lineWidth = 1;
            
            const edgePoints = 12;
            for (let i = 0; i < edgePoints; i++) {
                const xPos = tear.x - halfWidth + (tear.width * tear.scale / edgePoints) * i;
                const yTop = tear.y - halfHeight + (Math.random() - 0.5) * distortion * 2;
                const yBottom = tear.y + halfHeight + (Math.random() - 0.5) * distortion * 2;
                
                ctx.beginPath();
                ctx.moveTo(xPos, yTop);
                ctx.lineTo(xPos, yBottom);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    drawGravityDistortionEffect(ctx) {
        if (!this.gravityDistortion.active) return;
        
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.save();
        
        // Draw a subtle color overlay
        ctx.fillStyle = 'rgba(100, 50, 180, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Draw distortion lines
        ctx.strokeStyle = 'rgba(150, 100, 255, 0.2)';
        ctx.lineWidth = 1;
        
        const lineCount = 15;
        const time = performance.now() * 0.001;
        
        for (let i = 0; i < lineCount; i++) {
            const y = (height / lineCount) * i;
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            
            for (let x = 0; x < width; x += 20) {
                const waveHeight = 5 * Math.sin(x * 0.01 + time + i * 0.5);
                ctx.lineTo(x, y + waveHeight);
            }
            
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    applyPhysicsEffects(phoenix) {
        if (!phoenix) return;
        
        // Apply gravity well effects
        for (const well of this.gravityWells) {
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
        
        // Apply global gravity distortion if active
        if (this.gravityDistortion.active) {
            const system = this.config.systems.gravityDistortion;
            
            // Calculate progress through the distortion effect (0 to 1)
            const progress = (performance.now() - this.gravityDistortion.startTime) / system.duration;
            
            // Sine wave fluctuation for gravity intensity
            const fluctuation = Math.sin(progress * Math.PI * 4);
            
            // Apply gravity modification
            phoenix.gravityMultiplier = 1 + fluctuation * system.intensity * 0.5;
            
            // Add random movement interference
            if (Math.random() < 0.2) {
                phoenix.velocityX += (Math.random() - 0.5) * 0.5;
                phoenix.velocityY += (Math.random() - 0.5) * 0.5;
            }
        }
    }
    
    checkCollisions(phoenix) {
        if (!phoenix) return 0;
        
        let totalDamage = 0;
        
        // Check for void tear collisions
        for (const tear of this.voidTears) {
            if (!tear.active) continue;
            
            const halfWidth = (tear.width * tear.scale) / 2;
            const halfHeight = (tear.height * tear.scale) / 2;
            
            // Check if phoenix is inside the tear area
            if (phoenix.x > tear.x - halfWidth && 
                phoenix.x < tear.x + halfWidth && 
                phoenix.y > tear.y - halfHeight && 
                phoenix.y < tear.y + halfHeight) {
                
                // Calculate damage
                const damage = tear.damage * this.damageMultiplier * 0.05; // per frame
                totalDamage += damage;
                
                // Visual effect on collision
                if (phoenix.createDamageEffect && Math.random() < 0.2) {
                    phoenix.createDamageEffect();
                }
            }
        }
        
        return totalDamage;
    }
    
    reset() {
        this.gravityWells = [];
        this.voidTears = [];
        this.lastGravityWellSpawn = 0;
        this.lastVoidTearSpawn = 0;
        this.gravityDistortion.active = false;
        this.gravityDistortion.lastActivation = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 