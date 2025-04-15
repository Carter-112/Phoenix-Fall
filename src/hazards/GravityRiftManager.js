/**
 * GravityRiftManager - Manages gravity rifts that reverse gravity in areas
 */
export class GravityRiftManager {
    constructor(worldConfig) {
        this.config = worldConfig.hazards.gravityRift;
        this.rifts = [];
        this.active = true;
        this.lastSpawnTime = 0;
        
        // Apply any difficulty modifiers if provided
        if (worldConfig.systems.difficulty?.modifiers) {
            const modifiers = worldConfig.systems.difficulty.modifiers;
            this.spawnRateMultiplier = modifiers.spawnRate || 1;
        } else {
            this.spawnRateMultiplier = 1;
        }
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        // Auto-spawn logic - only if not being managed by a pattern coordinator
        const spawnInterval = this.config.spawnRate * this.spawnRateMultiplier;
        if (currentTime - this.lastSpawnTime > spawnInterval && this.rifts.length < this.config.maxActive) {
            // Random position, avoiding edges
            const x = width * 0.1 + Math.random() * width * 0.8;
            const y = height * 0.1 + Math.random() * height * 0.8;
            
            this.spawnRift(x, y);
            this.lastSpawnTime = currentTime;
        }
        
        // Update existing rifts
        for (let i = this.rifts.length - 1; i >= 0; i--) {
            const rift = this.rifts[i];
            
            // Update rift state
            rift.lifetime += deltaTime;
            
            // Warning phase
            if (rift.lifetime < this.config.warningTime) {
                rift.warningAlpha = Math.min(1, rift.lifetime / (this.config.warningTime * 0.5));
            } 
            // Active phase
            else if (rift.lifetime < this.config.warningTime + this.config.duration) {
                rift.active = true;
                
                // Gradually expand to full size
                const activeDuration = rift.lifetime - this.config.warningTime;
                const expansionTime = Math.min(1000, this.config.duration * 0.2);
                if (activeDuration < expansionTime) {
                    rift.scale = 0.2 + 0.8 * (activeDuration / expansionTime);
                } else {
                    rift.scale = 1.0;
                }
                
                // Pulse effect
                rift.pulsePhase = (rift.pulsePhase + deltaTime * 0.003) % (Math.PI * 2);
                rift.pulseMagnitude = 0.1 + 0.05 * Math.sin(rift.pulsePhase);
            } 
            // Fadeout phase
            else {
                const fadeOutDuration = 1000; // 1 second fade out
                const fadeOutTime = rift.lifetime - (this.config.warningTime + this.config.duration);
                
                if (fadeOutTime < fadeOutDuration) {
                    rift.alpha = 1 - (fadeOutTime / fadeOutDuration);
                    rift.scale *= 0.98; // Shrink as it fades
                } else {
                    // Remove rift once it's completely faded
                    this.rifts.splice(i, 1);
                    continue;
                }
            }
        }
    }
    
    spawnRift(x, y, velocityX = 0, velocityY = 0) {
        // Only spawn if under max active limit
        if (this.rifts.length >= this.config.maxActive) return null;
        
        const rift = {
            x,
            y,
            velocityX: velocityX,
            velocityY: velocityY,
            radius: this.config.radius,
            lifetime: 0,
            warningAlpha: 0,
            active: false,
            alpha: 1,
            scale: 0.2,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseMagnitude: 0.1
        };
        
        this.rifts.push(rift);
        
        // Play spawn sound if sound manager is available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('gravityRift', 0.4);
            } catch (error) {
                console.log('Could not play gravity rift sound');
            }
        }
        
        return rift;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw each rift
        for (const rift of this.rifts) {
            // Skip if not visible
            if (rift.alpha <= 0) continue;
            
            ctx.save();
            
            // Warning phase glow
            if (!rift.active) {
                // Draw warning indicator
                const warningRadius = rift.radius * (0.6 + 0.4 * Math.sin(Date.now() * 0.005));
                
                // Outer glow
                const gradient = ctx.createRadialGradient(
                    rift.x, rift.y, 0,
                    rift.x, rift.y, warningRadius
                );
                gradient.addColorStop(0, `rgba(255, 100, 50, ${0.7 * rift.warningAlpha})`);
                gradient.addColorStop(0.7, `rgba(255, 100, 50, ${0.3 * rift.warningAlpha})`);
                gradient.addColorStop(1, `rgba(255, 100, 50, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(rift.x, rift.y, warningRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Pulsing circle
                ctx.strokeStyle = `rgba(255, 150, 50, ${rift.warningAlpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(rift.x, rift.y, warningRadius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            } 
            // Active rift
            else {
                const displayRadius = rift.radius * rift.scale * (1 + rift.pulseMagnitude);
                
                // Create a swirling effect with gradient
                const gradient = ctx.createRadialGradient(
                    rift.x, rift.y, 0,
                    rift.x, rift.y, displayRadius
                );
                
                gradient.addColorStop(0, `rgba(255, 180, 50, ${0.9 * rift.alpha})`);
                gradient.addColorStop(0.4, `rgba(255, 100, 50, ${0.7 * rift.alpha})`);
                gradient.addColorStop(0.7, `rgba(200, 50, 50, ${0.5 * rift.alpha})`);
                gradient.addColorStop(1, `rgba(100, 20, 20, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(rift.x, rift.y, displayRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add some swirl particles within the rift
                const particleCount = Math.floor(15 * rift.scale);
                const time = Date.now() * 0.001;
                
                for (let i = 0; i < particleCount; i++) {
                    const angle = (i / particleCount) * Math.PI * 2 + time;
                    const distance = displayRadius * (0.2 + 0.6 * Math.random());
                    const particleX = rift.x + Math.cos(angle) * distance;
                    const particleY = rift.y + Math.sin(angle) * distance;
                    const particleSize = 3 + 5 * Math.random() * rift.scale;
                    
                    ctx.fillStyle = `rgba(255, 200, 100, ${0.8 * rift.alpha})`;
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Direction indicator arrows for gravity
                if (this.config.gravityReverse) {
                    const arrowCount = 8;
                    const arrowLength = displayRadius * 0.2;
                    
                    ctx.strokeStyle = `rgba(255, 220, 150, ${0.8 * rift.alpha})`;
                    ctx.lineWidth = 3 * rift.scale;
                    
                    for (let i = 0; i < arrowCount; i++) {
                        const angle = (i / arrowCount) * Math.PI * 2;
                        const startX = rift.x + Math.cos(angle) * displayRadius * 0.5;
                        const startY = rift.y + Math.sin(angle) * displayRadius * 0.5;
                        const endX = startX + Math.cos(angle) * arrowLength;
                        const endY = startY + Math.sin(angle) * arrowLength;
                        
                        // Draw arrow line
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        
                        // Draw arrowhead
                        const headLength = 10 * rift.scale;
                        const arrowAngle1 = angle - Math.PI / 6;
                        const arrowAngle2 = angle + Math.PI / 6;
                        
                        ctx.lineTo(endX - Math.cos(arrowAngle1) * headLength, endY - Math.sin(arrowAngle1) * headLength);
                        ctx.moveTo(endX, endY);
                        ctx.lineTo(endX - Math.cos(arrowAngle2) * headLength, endY - Math.sin(arrowAngle2) * headLength);
                        
                        ctx.stroke();
                    }
                }
            }
            
            ctx.restore();
        }
    }
    
    checkCollisions(phoenix) {
        if (!phoenix || !this.active) return 0;
        
        let isInRift = false;
        
        // Check each active rift
        for (const rift of this.rifts) {
            if (!rift.active) continue;
            
            // Calculate distance from phoenix to rift center
            const dx = phoenix.x - rift.x;
            const dy = phoenix.y - rift.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if phoenix is inside the rift
            if (distance < rift.radius * rift.scale) {
                isInRift = true;
                break;
            }
        }
        
        // Gravity rifts don't cause direct damage
        return 0;
    }
    
    applyGravityEffects(phoenix) {
        if (!phoenix || !this.active) return;
        
        // Reset any previous gravity effects
        phoenix.inGravityRift = false;
        
        // Check each active rift
        for (const rift of this.rifts) {
            if (!rift.active) continue;
            
            // Calculate distance from phoenix to rift center
            const dx = phoenix.x - rift.x;
            const dy = phoenix.y - rift.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if phoenix is inside the rift
            const effectiveRadius = rift.radius * rift.scale;
            if (distance < effectiveRadius) {
                // Apply gravity reversal effect
                if (this.config.gravityReverse) {
                    phoenix.inGravityRift = true;
                    phoenix.gravityMultiplier = -1;
                }
                
                // Calculate how far the phoenix is into the rift (0 = edge, 1 = center)
                const depthFactor = 1 - (distance / effectiveRadius);
                
                // Apply subtle pull toward the center
                const pullStrength = 0.2 * depthFactor;
                phoenix.velocityX += (rift.x - phoenix.x) * pullStrength * 0.01;
                phoenix.velocityY += (rift.y - phoenix.y) * pullStrength * 0.01;
            }
        }
    }
    
    reset() {
        this.rifts = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 