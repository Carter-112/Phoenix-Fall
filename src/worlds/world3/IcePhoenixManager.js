/**
 * IcePhoenixManager - Manages ice phoenix enemies in World 3 (Frost Peak)
 * 
 * Spawns and controls hostile ice phoenixes that fly around and attack the player
 */
export class IcePhoenixManager {
    constructor(worldConfig) {
        // Check if enemy is defined in world config
        const icePhoenixConfig = worldConfig.enemies.icePhoenix;
        
        this.config = {
            spawnRate: icePhoenixConfig?.spawnRate || 1500, // Even faster spawning
            maxActive: icePhoenixConfig?.maxActive || 4,    // More phoenixes
            speed: icePhoenixConfig?.speed || 30,          // Extreme speed
            health: icePhoenixConfig?.health || 180,
            damage: icePhoenixConfig?.damage || 20,
            attackCooldown: icePhoenixConfig?.attackCooldown || 800 // Very fast attacks
        };
        
        this.phoenixes = [];
        this.lastSpawnTime = 0;
        this.active = true;
        this.debugLogging = true; // Enable debug logging
        this.invulnerable = false; // NEW: False by default
        
        console.warn("SUPER EXTREME ICE PHOENIX MANAGER INITIALIZED");
        console.log(`Settings: speed=${this.config.speed}, maxActive=${this.config.maxActive}, attackCooldown=${this.config.attackCooldown}ms`);
        
        // Add ourselves to window for debugging
        window.icePhoenixManager = this;
        
        // Force immediate spawn of multiple phoenixes
        this.forceSpawn();
        
        // Force another phoenix spawn soon
        setTimeout(() => {
            if (this.active && this.phoenixes.length < this.config.maxActive) {
                this.forceSpawn();
            }
        }, 500);
    }
    
    // Add a debug method to kill all phoenixes
    forceKillAll() {
        console.log(`Force killing all Ice Phoenixes (${this.phoenixes.length} active)`);
        
        // Kill all phoenixes
        for (let i = this.phoenixes.length - 1; i >= 0; i--) {
            const phoenix = this.phoenixes[i];
            
            console.log(`Force killing Ice Phoenix ${i}, current health: ${phoenix.health}`);
            
            // Force set health to negative value
            phoenix.health = -9999;
            
            // Create death effect
            this.createDeathEffect(phoenix);
            
            // Award XP
            if (window.gameInstance && window.gameInstance.gameState) {
                window.gameInstance.gameState.addXP(30);
            }
            
            // Remove from array
            this.phoenixes.splice(i, 1);
        }
        
        console.log("All Ice Phoenixes force killed");
        
        // Clear ice blasts too
        this.iceBlasts = [];
        
        // Force spawn a new one after a short delay
        setTimeout(() => this.forceSpawn(), 3000);
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        if (this.debugLogging && this.phoenixes.length === 0) {
            console.log("Warning: No active ice phoenixes");
        }
        
        // Check if we should spawn a new phoenix
        if (this.phoenixes.length < this.config.maxActive && 
            currentTime - this.lastSpawnTime > this.config.spawnRate) {
            this.spawnRandomPhoenix(width, height);
            this.lastSpawnTime = currentTime;
        }
        
        // If no phoenixes are present for too long, force spawn one
        if (this.phoenixes.length === 0 && currentTime - this.lastSpawnTime > 2000) {
            this.spawnRandomPhoenix(width, height);
            this.lastSpawnTime = currentTime;
            console.log("Forced phoenix spawn - none present for too long");
        }
        
        // Get player phoenix for targeting
        const playerPhoenix = window.gameInstance?.phoenix;
        
        // Update all existing phoenixes
        for (let i = this.phoenixes.length - 1; i >= 0; i--) {
            const phoenix = this.phoenixes[i];
            
            // Debug logging for movement tracking
            if (this.debugLogging && Math.random() < 0.01) {
                console.log(`Phoenix ${i} position: (${phoenix.x.toFixed(0)}, ${phoenix.y.toFixed(0)}), velocity: (${phoenix.vx.toFixed(2)}, ${phoenix.vy.toFixed(2)}), health: ${phoenix.health}`);
            }
            
            // Update movement
            this.updatePhoenixMovement(phoenix, deltaTime, playerPhoenix, width, height);
            
            // Check if phoenix should fire an ice blast
            if (currentTime - phoenix.lastAttackTime > this.config.attackCooldown) {
                if (playerPhoenix && Math.random() < 0.3) { // Increased attack chance (was 0.2)
                    this.fireIceBlast(phoenix, playerPhoenix);
                    phoenix.lastAttackTime = currentTime;
                }
            }
            
            // Update all existing ice blasts for this phoenix
            for (let j = phoenix.iceBlasts.length - 1; j >= 0; j--) {
                const blast = phoenix.iceBlasts[j];
                
                // Move the blast
                blast.x += blast.vx * deltaTime;
                blast.y += blast.vy * deltaTime;
                
                // Check if blast is out of bounds
                if (blast.x < -50 || blast.x > width + 50 || 
                    blast.y < -50 || blast.y > height + 50) {
                    phoenix.iceBlasts.splice(j, 1);
                }
            }
            
            // Check if phoenix is dead
            if (phoenix.health <= 0) {
                console.log("Phoenix detected as dead in update loop!");
                
                // Create explosion effect
                this.createDeathEffect(phoenix);
                
                // Award XP
                if (window.gameInstance?.gameState) {
                    window.gameInstance.gameState.addXP(30);
                    console.log("XP awarded for phoenix defeat");
                }
                
                // Remove the phoenix
                this.phoenixes.splice(i, 1);
                console.log("Phoenix removed from array during update");
            }
        }
    }
    
    updatePhoenixMovement(phoenix, deltaTime, playerPhoenix, width, height) {
        // EXTREMELY ERRATIC MOVEMENT
        const safeDeltaTime = Math.min(deltaTime, 0.03); // Very restricted deltaTime
        
        // Add significant random jitter to movement
        phoenix.vx += (Math.random() - 0.5) * 6; // Extreme random adjustments
        phoenix.vy += (Math.random() - 0.5) * 6; // Extreme random adjustments
        
        // Occasionally add burst of speed
        if (Math.random() < 0.03) { // 3% chance per frame
            const burstDir = Math.random() * Math.PI * 2;
            phoenix.vx += Math.cos(burstDir) * this.config.speed * 3;
            phoenix.vy += Math.sin(burstDir) * this.config.speed * 3;
            
            if (this.debugLogging) {
                console.log("Phoenix speed burst activated!");
            }
        }
        
        // Apply speed limit to avoid excessive velocity
        const currentSpeed = Math.sqrt(phoenix.vx * phoenix.vx + phoenix.vy * phoenix.vy);
        if (currentSpeed > this.config.speed * 2.5) {
            // Scale back to maxSpeed but still allow high bursts
            const scale = this.config.speed * 2.5 / currentSpeed;
            phoenix.vx *= scale;
            phoenix.vy *= scale;
        }
        
        // Apply movement
        phoenix.x += phoenix.vx * safeDeltaTime;
        phoenix.y += phoenix.vy * safeDeltaTime;
        
        // Handle screen bounds - extreme bounce with direction change
        if (phoenix.x < 50) {
            phoenix.x = 50;
            phoenix.vx = Math.abs(phoenix.vx) * 3; // Super strong bounce
            phoenix.vy += (Math.random() - 0.5) * 10; // Random vertical adjustment on bounce
        } else if (phoenix.x > width - 50) {
            phoenix.x = width - 50;
            phoenix.vx = -Math.abs(phoenix.vx) * 3; // Super strong bounce
            phoenix.vy += (Math.random() - 0.5) * 10; // Random vertical adjustment on bounce
        }
        
        if (phoenix.y < 50) {
            phoenix.y = 50;
            phoenix.vy = Math.abs(phoenix.vy) * 3; // Super strong bounce
            phoenix.vx += (Math.random() - 0.5) * 10; // Random horizontal adjustment on bounce
        } else if (phoenix.y > height - 50) {
            phoenix.y = height - 50;
            phoenix.vy = -Math.abs(phoenix.vy) * 3; // Super strong bounce
            phoenix.vx += (Math.random() - 0.5) * 10; // Random horizontal adjustment on bounce
        }
        
        // Change direction very frequently
        if (Math.random() < 0.15) { // 15% chance per frame
            this.setRandomDirection(phoenix);
        }
        
        // Extremely aggressive player targeting
        if (playerPhoenix && Math.random() < 0.2) { // 20% chance per frame
            const dx = playerPhoenix.x - phoenix.x;
            const dy = playerPhoenix.y - phoenix.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 700) { // Extreme detection range
                // Aggressive targeting with extreme speed boost
                phoenix.vx = (dx / dist) * this.config.speed * 2;
                phoenix.vy = (dy / dist) * this.config.speed * 2;
            }
        }
        
        // Ultra fast wing animation
        phoenix.animTime += deltaTime;
        phoenix.wingPhase = Math.sin(phoenix.animTime * 20) * 0.5 + 0.5; // Extremely fast animation
    }
    
    setRandomDirection(phoenix) {
        const angle = Math.random() * Math.PI * 2;
        phoenix.vx = Math.cos(angle) * this.config.speed;
        phoenix.vy = Math.sin(angle) * this.config.speed;
    }
    
    fireIceBlast(phoenix, target) {
        // Calculate direction toward player
        const dx = target.x - phoenix.x;
        const dy = target.y - phoenix.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Add slight randomness to targeting
        const spreadFactor = 0.1; // 10% spread
        const randomAngle = (Math.random() - 0.5) * spreadFactor;
        const adjustedDx = dx * Math.cos(randomAngle) - dy * Math.sin(randomAngle);
        const adjustedDy = dx * Math.sin(randomAngle) + dy * Math.cos(randomAngle);
        
        // Create the ice blast - ULTRA EXTREME SPEED
        const blast = {
            x: phoenix.x,
            y: phoenix.y,
            vx: (adjustedDx / dist) * 200, // SUPER EXTREME SPEED
            vy: (adjustedDy / dist) * 200, // SUPER EXTREME SPEED
            radius: 8,
            damage: this.config.damage
        };
        
        phoenix.iceBlasts.push(blast);
        
        // Play sound if available
        if (window.gameInstance?.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('iceBlast', 0.4);
            } catch (error) {
                console.log('Could not play ice blast sound');
            }
        }
    }
    
    // Force spawn a phoenix at a valid position
    forceSpawn() {
        if (!window.gameInstance) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Position one phoenix on each side for faster gameplay
        if (this.phoenixes.length === 0) {
            // Left side
            this.spawnPhoenix(50, height * 0.5);
            
            // Right side if we need two
            if (this.config.maxActive > 1) {
                this.spawnPhoenix(width - 50, height * 0.3);
            }
            
            this.lastSpawnTime = performance.now();
            console.log("Forced phoenix spawn on startup");
        }
    }
    
    spawnRandomPhoenix(width, height) {
        // Choose a random position at the edge of the screen
        let x, y;
        
        if (Math.random() < 0.5) {
            // Spawn from left or right
            x = Math.random() < 0.5 ? 50 : width - 50;
            y = 50 + Math.random() * (height - 100);
        } else {
            // Spawn from top or bottom
            x = 50 + Math.random() * (width - 100);
            y = Math.random() < 0.5 ? 50 : height - 50;
        }
        
        this.spawnPhoenix(x, y);
    }
    
    spawnPhoenix(x, y) {
        // Create a new phoenix object
        const phoenix = {
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            radius: 25,
            health: this.config.health,
            maxHealth: this.config.health, // Add explicit maxHealth property
            takeDamage: function(amount) {
                if (window.icePhoenixManager && window.icePhoenixManager.invulnerable) {
                    console.log("Phoenix is invulnerable - damage ignored");
                    return false;
                }
                
                // Actually apply the damage
                this.health -= amount;
                console.log(`Phoenix took ${amount} damage, health now: ${this.health}`);
                
                // Return true if destroyed
                return this.health <= 0;
            },
            wingPhase: 0,
            animTime: 0,
            lastAttackTime: 0,
            iceBlasts: []
        };
        
        // Set initial random direction
        this.setRandomDirection(phoenix);
        
        this.phoenixes.push(phoenix);
        console.log(`Ice Phoenix spawned at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Draw all phoenixes
        for (const phoenix of this.phoenixes) {
            this.drawPhoenix(ctx, phoenix);
            
            // Draw ice blasts
            for (const blast of phoenix.iceBlasts) {
                this.drawIceBlast(ctx, blast);
            }
        }
    }
    
    drawPhoenix(ctx, phoenix) {
        ctx.save();
        
        // Translate to phoenix position
        ctx.translate(phoenix.x, phoenix.y);
        
        // Draw body
        const bodyGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, phoenix.radius);
        bodyGradient.addColorStop(0, 'rgba(200, 240, 255, 0.9)');
        bodyGradient.addColorStop(0.7, 'rgba(150, 210, 255, 0.7)');
        bodyGradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, phoenix.radius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        
        // Calculate wing position based on animation phase
        const wingOffset = 5 + phoenix.wingPhase * 15;
        
        // Draw wings
        ctx.beginPath();
        
        // Left wing
        ctx.moveTo(-5, 0);
        ctx.quadraticCurveTo(
            -phoenix.radius - wingOffset, -wingOffset, 
            -phoenix.radius, phoenix.radius/2
        );
        
        // Right wing
        ctx.moveTo(5, 0);
        ctx.quadraticCurveTo(
            phoenix.radius + wingOffset, -wingOffset, 
            phoenix.radius, phoenix.radius/2
        );
        
        ctx.strokeStyle = 'rgba(200, 240, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw head
        ctx.beginPath();
        ctx.arc(0, -phoenix.radius * 0.6, phoenix.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 240, 255, 0.9)';
        ctx.fill();
        
        // Draw eyes
        ctx.beginPath();
        ctx.arc(-phoenix.radius * 0.2, -phoenix.radius * 0.7, 3, 0, Math.PI * 2);
        ctx.arc(phoenix.radius * 0.2, -phoenix.radius * 0.7, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(80, 150, 255, 0.9)';
        ctx.fill();
        
        // Draw ice crystal details
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const length = phoenix.radius * 0.5;
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
        }
        
        ctx.strokeStyle = 'rgba(200, 240, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawIceBlast(ctx, blast) {
        ctx.save();
        
        // Translate to blast position
        ctx.translate(blast.x, blast.y);
        
        // Draw the ice blast
        const blastGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, blast.radius);
        blastGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        blastGradient.addColorStop(0.7, 'rgba(150, 210, 255, 0.7)');
        blastGradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, blast.radius, 0, Math.PI * 2);
        ctx.fillStyle = blastGradient;
        ctx.fill();
        
        // Draw ice crystal details
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const length = blast.radius * 1.5;
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
        }
        
        ctx.strokeStyle = 'rgba(200, 240, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    createDeathEffect(phoenix) {
        // Create particle effect for phoenix death
        if (window.gameInstance && window.gameInstance.particleSystem) {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                const size = 1 + Math.random() * 3;
                
                window.gameInstance.particleSystem.createParticle(
                    phoenix.x, 
                    phoenix.y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    size,
                    "rgba(180, 230, 255, 0.8)",
                    30, // life in frames
                    0.9 // decay
                );
            }
            
            // Play sound if available
            if (window.gameInstance.soundManager) {
                try {
                    window.gameInstance.soundManager.playSound('iceBreak', 0.5);
                } catch (error) {
                    console.log('Could not play ice break sound');
                }
            }
        }
    }
    
    checkCollisions(phoenix) {
        if (!this.active || !phoenix) return 0;
        
        let damage = 0;
        
        // Create a collision circle for the player phoenix
        const playerCircle = {
            x: phoenix.x,
            y: phoenix.y,
            radius: phoenix.collisionRadius || 20 // Default if not specified
        };
        
        // Check collisions with enemy phoenixes
        for (const enemyPhoenix of this.phoenixes) {
            const enemyCircle = {
                x: enemyPhoenix.x,
                y: enemyPhoenix.y,
                radius: enemyPhoenix.radius
            };
            
            // Check for collision between circles
            if (this.circleCollision(playerCircle, enemyCircle)) {
                damage = this.config.damage;
                
                // Damage the enemy phoenix as well
                enemyPhoenix.health -= 10;
                
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
            
            // Check collisions with ice blasts
            for (let i = enemyPhoenix.iceBlasts.length - 1; i >= 0; i--) {
                const blast = enemyPhoenix.iceBlasts[i];
                const blastCircle = {
                    x: blast.x,
                    y: blast.y,
                    radius: blast.radius
                };
                
                if (this.circleCollision(playerCircle, blastCircle)) {
                    damage = blast.damage;
                    
                    // Remove the blast
                    enemyPhoenix.iceBlasts.splice(i, 1);
                    
                    // Create particle effect for impact
                    if (window.gameInstance && window.gameInstance.particleSystem) {
                        for (let j = 0; j < 15; j++) {
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
        }
        
        return damage;
    }
    
    circleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (circle1.radius + circle2.radius);
    }
    
    reset() {
        // Don't clear phoenixes on reset - let them persist
        // Just reset spawn timer so new phoenixes spawn quickly
        this.lastSpawnTime = 0;
        
        // Force a spawn after a short delay
        setTimeout(() => {
            if (this.phoenixes.length === 0) {
                this.forceSpawn();
            }
        }, 1000);
    }
    
    setActive(active) {
        this.active = active;
        
        // When activating, force spawn if needed
        if (active && this.phoenixes.length === 0) {
            setTimeout(() => this.forceSpawn(), 1000);
        }
    }
} 