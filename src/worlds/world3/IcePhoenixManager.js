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
            spawnRate: icePhoenixConfig?.spawnRate || 5000,
            maxActive: icePhoenixConfig?.maxActive || 1,
            speed: icePhoenixConfig?.speed || 3.5,
            health: icePhoenixConfig?.health || 180,
            damage: icePhoenixConfig?.damage || 20,
            attackCooldown: icePhoenixConfig?.attackCooldown || 2000
        };
        
        this.phoenixes = [];
        this.lastSpawnTime = 0;
        this.active = true;
    }
    
    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;
        
        // Check if we should spawn a new phoenix
        if (this.phoenixes.length < this.config.maxActive && 
            currentTime - this.lastSpawnTime > this.config.spawnRate) {
            this.spawnRandomPhoenix(width, height);
            this.lastSpawnTime = currentTime;
        }
        
        // Get player phoenix for targeting
        const playerPhoenix = window.gameInstance?.phoenix;
        
        // Update all existing phoenixes
        for (let i = this.phoenixes.length - 1; i >= 0; i--) {
            const phoenix = this.phoenixes[i];
            
            // Update movement
            this.updatePhoenixMovement(phoenix, deltaTime, playerPhoenix, width, height);
            
            // Check if phoenix should fire an ice blast
            if (currentTime - phoenix.lastAttackTime > this.config.attackCooldown) {
                if (playerPhoenix && Math.random() < 0.2) { // 20% chance to attack when off cooldown
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
                // Create explosion effect
                this.createDeathEffect(phoenix);
                
                // Award XP
                if (window.gameInstance?.gameState) {
                    window.gameInstance.gameState.addXP(30);
                }
                
                // Remove the phoenix
                this.phoenixes.splice(i, 1);
            }
        }
    }
    
    updatePhoenixMovement(phoenix, deltaTime, playerPhoenix, width, height) {
        // Apply current velocity
        phoenix.x += phoenix.vx * deltaTime;
        phoenix.y += phoenix.vy * deltaTime;
        
        // Handle screen bounds - bounce off edges
        if (phoenix.x < 50) {
            phoenix.x = 50;
            phoenix.vx = Math.abs(phoenix.vx);
        } else if (phoenix.x > width - 50) {
            phoenix.x = width - 50;
            phoenix.vx = -Math.abs(phoenix.vx);
        }
        
        if (phoenix.y < 50) {
            phoenix.y = 50;
            phoenix.vy = Math.abs(phoenix.vy);
        } else if (phoenix.y > height - 50) {
            phoenix.y = height - 50;
            phoenix.vy = -Math.abs(phoenix.vy);
        }
        
        // Occasionally change direction randomly
        if (Math.random() < 0.01) {
            this.setRandomDirection(phoenix);
        }
        
        // If the player is nearby, sometimes move toward them
        if (playerPhoenix && Math.random() < 0.03) {
            const dx = playerPhoenix.x - phoenix.x;
            const dy = playerPhoenix.y - phoenix.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 300) {
                phoenix.vx = (dx / dist) * this.config.speed;
                phoenix.vy = (dy / dist) * this.config.speed;
            }
        }
        
        // Update animation
        phoenix.animTime += deltaTime;
        phoenix.wingPhase = Math.sin(phoenix.animTime / 200) * 0.5 + 0.5;
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
        
        // Create the ice blast
        const blast = {
            x: phoenix.x,
            y: phoenix.y,
            vx: (dx / dist) * 5, // Faster than the phoenix
            vy: (dy / dist) * 5,
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
            wingPhase: 0,
            animTime: 0,
            lastAttackTime: 0,
            iceBlasts: []
        };
        
        // Set initial random direction
        this.setRandomDirection(phoenix);
        
        this.phoenixes.push(phoenix);
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
        this.phoenixes = [];
        this.lastSpawnTime = 0;
    }
    
    setActive(active) {
        this.active = active;
        if (!active) {
            this.reset();
        }
    }
} 