/**
 * IceSpikeManager - Manages ice spike hazards in World 3 (Frost Peak)
 * 
 * Spawns and controls ice spikes that rise from the ground and damage the phoenix on contact
 */
export class IceSpikeManager {
    constructor(worldConfig) {
        this.config = worldConfig.hazards.iceSpike;
        this.spikes = [];
        this.lastSpawnTime = 0;
        this.active = true;
        
        // Calculate spawn rate including any difficulty modifiers
        this.effectiveSpawnRate = this.config.spawnRate;
        if (worldConfig.systems.iceSpikes?.difficultyScaling?.spawnRateMultiplier) {
            this.effectiveSpawnRate *= worldConfig.systems.iceSpikes.difficultyScaling.spawnRateMultiplier;
        }
        
        // Calculate damage including any difficulty modifiers
        this.effectiveDamage = this.config.damage;
        if (worldConfig.systems.iceSpikes?.difficultyScaling?.damageMultiplier) {
            this.effectiveDamage *= worldConfig.systems.iceSpikes.difficultyScaling.damageMultiplier;
        }
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        // Check if we should spawn a new spike
        if (this.spikes.length < this.config.maxActive && 
            currentTime - this.lastSpawnTime > this.effectiveSpawnRate) {
            this.spawnRandomSpike(width, height);
            this.lastSpawnTime = currentTime;
        }
        
        // Update all existing spikes
        for (let i = this.spikes.length - 1; i >= 0; i--) {
            const spike = this.spikes[i];
            
            // Update spike state based on its phase
            switch (spike.phase) {
                case 'warning':
                    spike.timeInPhase += deltaTime;
                    if (spike.timeInPhase >= this.config.timing.warningDuration) {
                        spike.phase = 'rising';
                        spike.timeInPhase = 0;
                    }
                    break;
                    
                case 'rising':
                    spike.timeInPhase += deltaTime;
                    // Calculate progress through rise animation (0 to 1)
                    spike.progress = Math.min(1, spike.timeInPhase / this.config.timing.riseDuration);
                    
                    if (spike.timeInPhase >= this.config.timing.riseDuration) {
                        spike.phase = 'active';
                        spike.timeInPhase = 0;
                        spike.progress = 1; // Fully extended
                    }
                    break;
                    
                case 'active':
                    spike.timeInPhase += deltaTime;
                    if (spike.timeInPhase >= this.config.timing.activeDuration) {
                        spike.phase = 'retracting';
                        spike.timeInPhase = 0;
                    }
                    break;
                    
                case 'retracting':
                    spike.timeInPhase += deltaTime;
                    // Calculate progress through retraction (1 to 0)
                    spike.progress = 1 - Math.min(1, spike.timeInPhase / this.config.timing.retractDuration);
                    
                    if (spike.timeInPhase >= this.config.timing.retractDuration) {
                        // Remove the spike
                        this.spikes.splice(i, 1);
                    }
                    break;
            }
        }
    }
    
    spawnRandomSpike(width, height) {
        // Choose a spawn location based on the weighted locations
        const locations = this.config.spawnLocations;
        const totalWeight = locations.reduce((sum, loc) => sum + (loc.weight || 1), 0);
        let random = Math.random() * totalWeight;
        
        let chosenX = 0;
        for (const location of locations) {
            if (random <= (location.weight || 1)) {
                chosenX = location.x * width;
                break;
            }
            random -= (location.weight || 1);
        }
        
        // Spawn the spike at the chosen location
        this.spawnSpike(chosenX, height);
    }
    
    spawnSpike(x, y) {
        // Create a new spike object
        const spike = {
            x: x,
            y: y,
            width: this.config.width,
            height: this.config.height,
            phase: 'warning',
            timeInPhase: 0,
            progress: 0 // Used for animation (0-1)
        };
        
        this.spikes.push(spike);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw all spikes
        for (const spike of this.spikes) {
            // Draw based on the current phase
            switch (spike.phase) {
                case 'warning':
                    this.drawWarning(ctx, spike);
                    break;
                    
                case 'rising':
                case 'active':
                case 'retracting':
                    this.drawSpike(ctx, spike);
                    break;
            }
        }
    }
    
    drawWarning(ctx, spike) {
        // Draw a warning indicator where the spike will appear
        ctx.save();
        
        // Pulsing warning effect
        const pulseRate = 300; // ms per pulse
        const pulse = Math.sin((performance.now() % pulseRate) / pulseRate * Math.PI);
        const alpha = 0.3 + pulse * 0.2;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.8)';
        ctx.lineWidth = 2;
        
        // Draw warning zone
        ctx.beginPath();
        ctx.rect(spike.x - spike.width/2, spike.y - 10, spike.width, 10);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawSpike(ctx, spike) {
        ctx.save();
        
        // Calculate visible height based on progress
        const visibleHeight = spike.height * spike.progress;
        
        // Base coordinates for the spike
        const baseX = spike.x;
        const baseY = spike.y;
        
        // Create a gradient for the ice spike
        const gradient = ctx.createLinearGradient(
            baseX - spike.width/2, baseY,
            baseX + spike.width/2, baseY - visibleHeight
        );
        gradient.addColorStop(0, 'rgba(180, 220, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(220, 240, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        
        // Draw the spike
        ctx.beginPath();
        ctx.moveTo(baseX - spike.width/2, baseY);
        ctx.lineTo(baseX, baseY - visibleHeight);
        ctx.lineTo(baseX + spike.width/2, baseY);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        
        ctx.fill();
        ctx.stroke();
        
        // Draw ice crystal details
        ctx.beginPath();
        ctx.moveTo(baseX, baseY - visibleHeight);
        ctx.lineTo(baseX, baseY - visibleHeight * 0.7);
        ctx.moveTo(baseX - spike.width/4, baseY - visibleHeight * 0.3);
        ctx.lineTo(baseX + spike.width/4, baseY - visibleHeight * 0.5);
        ctx.moveTo(baseX + spike.width/4, baseY - visibleHeight * 0.3);
        ctx.lineTo(baseX - spike.width/4, baseY - visibleHeight * 0.5);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    checkCollisions(phoenix) {
        if (!this.active || !phoenix) return 0;
        
        let damage = 0;
        
        // Only check collisions with spikes in active or transitioning phases
        for (const spike of this.spikes) {
            if (spike.phase === 'warning') continue;
            
            // Calculate actual height based on progress
            const actualHeight = spike.height * spike.progress;
            
            // Create a collision rectangle
            const spikeRect = {
                x: spike.x - spike.width/2,
                y: spike.y - actualHeight,
                width: spike.width,
                height: actualHeight
            };
            
            // Create a collision circle for the phoenix
            const phoenixCircle = {
                x: phoenix.x,
                y: phoenix.y,
                radius: phoenix.collisionRadius || 20 // Default if not specified
            };
            
            // Check for collision between circle and rectangle
            if (this.circleRectCollision(phoenixCircle, spikeRect)) {
                damage = this.effectiveDamage;
                
                // Create particle effect for collision
                if (window.gameInstance && window.gameInstance.particleSystem) {
                    for (let i = 0; i < 10; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 1 + Math.random() * 2;
                        const size = 1 + Math.random() * 2;
                        
                        window.gameInstance.particleSystem.createParticle(
                            phoenix.x, 
                            phoenix.y,
                            Math.cos(angle) * speed,
                            Math.sin(angle) * speed,
                            size,
                            "rgba(180, 230, 255, 0.8)",
                            20, // life in frames
                            0.8 // decay
                        );
                    }
                }
                
                break;
            }
        }
        
        return damage;
    }
    
    circleRectCollision(circle, rect) {
        // Find the closest point to the circle within the rectangle
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // Calculate the distance between the circle's center and the closest point
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        
        // If the distance is less than the circle's radius, an intersection occurs
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (circle.radius * circle.radius);
    }
    
    reset() {
        this.spikes = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 