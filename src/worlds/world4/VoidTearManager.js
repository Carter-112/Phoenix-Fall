/**
 * VoidTearManager - Manages void tear hazards in World 4
 * Creates unstable rifts that damage the phoenix
 */
export class VoidTearManager {
    constructor(worldConfig) {
        this.config = worldConfig.hazards.voidTear;
        this.tears = [];
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
        if (currentTime - this.lastSpawnTime > spawnInterval && this.tears.length < this.config.maxActive) {
            // Random position, favoring center area
            const x = width * 0.3 + Math.random() * width * 0.4;
            
            // Either top or bottom half, randomly
            const topHalf = Math.random() > 0.5;
            const y = topHalf ? 
                height * 0.1 + Math.random() * height * 0.3 : 
                height * 0.6 + Math.random() * height * 0.3;
            
            this.spawnVoidTear(x, y);
            this.lastSpawnTime = currentTime;
        }
        
        // Update existing void tears
        for (let i = this.tears.length - 1; i >= 0; i--) {
            const tear = this.tears[i];
            
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
                    this.tears.splice(i, 1);
                }
            }
        }
    }
    
    spawnVoidTear(x, y) {
        // Only spawn if under max active limit
        if (this.tears.length >= this.config.maxActive) return null;
        
        const tear = {
            x,
            y,
            width: this.config.width,
            height: this.config.height,
            damage: this.config.damage,
            lifetime: 0,
            duration: this.config.duration,
            active: true,
            alpha: 1,
            scale: 0.2,
            visualDistortion: 0.3,
            particles: []
        };
        
        this.tears.push(tear);
        
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
        
        // Draw each void tear
        for (const tear of this.tears) {
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
    
    checkCollisions(phoenix) {
        if (!phoenix || !this.active) return 0;
        
        let totalDamage = 0;
        
        // Check for void tear collisions
        for (const tear of this.tears) {
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
                
                // Apply a slight random force to simulate unstable space
                if (Math.random() < 0.3) {
                    const forceMagnitude = 0.2;
                    const angle = Math.random() * Math.PI * 2;
                    
                    phoenix.velocityX += Math.cos(angle) * forceMagnitude;
                    phoenix.velocityY += Math.sin(angle) * forceMagnitude;
                }
            }
        }
        
        return totalDamage;
    }
    
    reset() {
        this.tears = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 