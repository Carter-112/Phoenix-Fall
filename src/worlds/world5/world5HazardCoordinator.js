/**
 * World 5 Hazard Coordinator
 * Manages the spawning and behavior of hazards in World 5 (Infernal Core)
 */

export class World5HazardCoordinator {
    constructor(world5Config) {
        this.config = world5Config;
        this.active = false;
        
        // Extract hazard configuration from world config
        const hazardConfig = world5Config.hazards || {};
        
        // Configure spawn settings for hazards
        this.hazardTypes = {
            hellPortal: {
                spawnRate: hazardConfig.hellPortal?.spawnRate || 3500,
                maxActive: hazardConfig.hellPortal?.maxActive || 3,
                lastSpawnTime: 0,
                active: []
            },
            infernalBeam: {
                spawnRate: hazardConfig.infernalBeam?.spawnRate || 4000,
                maxActive: hazardConfig.infernalBeam?.maxActive || 2,
                lastSpawnTime: 0,
                active: []
            },
            fireWall: {
                spawnRate: hazardConfig.fireWall?.spawnRate || 7000,
                maxActive: hazardConfig.fireWall?.maxActive || 1,
                lastSpawnTime: 0,
                active: []
            }
        };
        
        // Apply difficulty modifiers if available
        if (world5Config.systems?.difficulty?.modifiers) {
            const modifiers = world5Config.systems.difficulty.modifiers;
            this.spawnRateMultiplier = modifiers.spawnRate || 1;
            this.maxHazardsMultiplier = modifiers.maxHazards || 1;
        } else {
            this.spawnRateMultiplier = 1;
            this.maxHazardsMultiplier = 1;
        }
    }

    /**
     * Update method called each frame
     * @param {number} deltaTime - Time since last frame in milliseconds
     * @param {number} currentTime - Current game time in ms
     * @param {object} game - Game instance for access to width, height, etc.
     */
    update(deltaTime, currentTime, game) {
        if (!this.active) return;

        // Update active hazards
        this.updateActiveHazards(deltaTime, currentTime, game);
        
        // Spawn new hazards
        this.spawnHazards(currentTime, game);
    }

    /**
     * Update all active hazards
     * @param {number} deltaTime - Time since last frame
     * @param {number} currentTime - Current game time
     * @param {object} game - Game instance
     */
    updateActiveHazards(deltaTime, currentTime, game) {
        // Update hellPortals
        this.hazardTypes.hellPortal.active = this.hazardTypes.hellPortal.active.filter(portal => {
            portal.update(deltaTime, currentTime, game);
            return portal.active;
        });
        
        // Update infernalBeams
        this.hazardTypes.infernalBeam.active = this.hazardTypes.infernalBeam.active.filter(beam => {
            beam.update(deltaTime, currentTime, game);
            return beam.active;
        });
        
        // Update fireWalls
        this.hazardTypes.fireWall.active = this.hazardTypes.fireWall.active.filter(wall => {
            wall.update(deltaTime, currentTime, game);
            return wall.active;
        });
    }

    /**
     * Spawn new hazards as needed
     * @param {number} currentTime - Current game time
     * @param {object} game - Game instance
     */
    spawnHazards(currentTime, game) {
        // Apply difficulty modifiers
        const spawnRateMultiplier = this.spawnRateMultiplier;
        const maxHazardsMultiplier = this.maxHazardsMultiplier;
        
        // Check if we should spawn a hell portal
        if (currentTime - this.hazardTypes.hellPortal.lastSpawnTime > this.hazardTypes.hellPortal.spawnRate / spawnRateMultiplier &&
            this.hazardTypes.hellPortal.active.length < this.hazardTypes.hellPortal.maxActive * maxHazardsMultiplier) {
            this.spawnHellPortal(game);
            this.hazardTypes.hellPortal.lastSpawnTime = currentTime;
        }
        
        // Check if we should spawn an infernal beam
        if (currentTime - this.hazardTypes.infernalBeam.lastSpawnTime > this.hazardTypes.infernalBeam.spawnRate / spawnRateMultiplier &&
            this.hazardTypes.infernalBeam.active.length < this.hazardTypes.infernalBeam.maxActive * maxHazardsMultiplier) {
            this.spawnInfernalBeam(game);
            this.hazardTypes.infernalBeam.lastSpawnTime = currentTime;
        }
        
        // Check if we should spawn a fire wall
        if (currentTime - this.hazardTypes.fireWall.lastSpawnTime > this.hazardTypes.fireWall.spawnRate / spawnRateMultiplier &&
            this.hazardTypes.fireWall.active.length < this.hazardTypes.fireWall.maxActive * maxHazardsMultiplier) {
            this.spawnFireWall(game);
            this.hazardTypes.fireWall.lastSpawnTime = currentTime;
        }
    }

    /**
     * Generic hazard spawn method called by game.spawnHazard()
     * @param {number} x - X spawn position
     * @param {number} y - Y spawn position
     */
    spawnHazard(x, y) {
        // Select a random hazard type based on configuration weights
        const random = Math.random();
        
        // Default weights if not configured
        const hellPortalWeight = this.config.hazards.hellPortal?.weight || 0.4;
        const infernalBeamWeight = this.config.hazards.infernalBeam?.weight || 0.3;
        // Fire wall gets the remaining probability
        
        // Use game instance from window for now
        const game = window.gameInstance;
        if (!game) return;
        
        if (random < hellPortalWeight) {
            // Spawn hell portal
            this.spawnHellPortal(game, x, y);
        } else if (random < hellPortalWeight + infernalBeamWeight) {
            // Spawn infernal beam
            this.spawnInfernalBeam(game, x, y);
        } else {
            // Spawn fire wall
            this.spawnFireWall(game, x, y);
        }
    }
    
    /**
     * Spawn a hell portal hazard with specific coordinates
     * @param {object} game - Game instance
     * @param {number} x - X position to spawn at (if provided)
     * @param {number} y - Y position to spawn at (if provided)
     */
    spawnHellPortal(game, x, y) {
        // Determine spawn position - avoid spawning too close to player if no position provided
        const margin = 100; // Minimum distance from player
        
        // Use provided coordinates if available, otherwise generate random position
        if (x === undefined || y === undefined) {
            if (game.phoenix) {
                do {
                    x = Math.random() * game.width;
                    y = Math.random() * Math.min(600, game.height / 2); // Spawn in upper half of screen
                } while (
                    Math.abs(x - game.phoenix.x) < margin &&
                    Math.abs(y - game.phoenix.y) < margin
                );
            } else {
                x = Math.random() * game.width;
                y = Math.random() * Math.min(600, game.height / 2);
            }
        }
        
        // Create hazard object (simplified here)
        const portal = {
            x: x,
            y: y,
            radius: this.config.hazards.hellPortal?.radius || 100,
            damage: this.config.hazards.hellPortal?.damage || 50,
            duration: this.config.hazards.hellPortal?.duration || 6000,
            warningTime: this.config.hazards.hellPortal?.warningTime || 1500,
            spawnTime: Date.now(),
            active: true,
            warningPhase: true,
            activated: false,
            
            update(deltaTime, currentTime, game) {
                const elapsed = currentTime - this.spawnTime;
                
                // Handle warning phase
                if (this.warningPhase && elapsed >= this.warningTime) {
                    this.warningPhase = false;
                    this.activated = true;
                    
                    // Spawn particles for activation effect
                    if (game.particleSystem) {
                        game.particleSystem.createExplosion(
                            this.x, this.y, 50, {
                                color: '#ff3300',
                                endColor: '#330000',
                                size: 20,
                                speed: 3,
                                lifetime: 1500
                            }
                        );
                    }
                }
                
                // Check if portal duration has expired
                if (elapsed >= this.duration + this.warningTime) {
                    this.active = false;
                }
            },
            
            draw(ctx) {
                const elapsed = Date.now() - this.spawnTime;
                
                if (this.warningPhase) {
                    // Draw warning indicator
                    const warningProgress = elapsed / this.warningTime;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 0, 0, ${warningProgress * 0.3})`;
                    ctx.fill();
                    ctx.strokeStyle = `rgba(255, 50, 0, ${warningProgress * 0.8})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                } else if (this.activated) {
                    // Draw active portal
                    const pulseRate = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
                    
                    // Draw glow
                    const gradient = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, this.radius * 1.5
                    );
                    gradient.addColorStop(0, 'rgba(255, 50, 0, 0.7)');
                    gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
                    
                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw portal core
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(200, 0, 0, ${pulseRate})`;
                    ctx.arc(this.x, this.y, this.radius * pulseRate, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            
            checkCollision(phoenix) {
                if (!this.activated || !phoenix) return false;
                
                const dx = phoenix.x - this.x;
                const dy = phoenix.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                return distance < this.radius + phoenix.width / 2;
            }
        };
        
        this.hazardTypes.hellPortal.active.push(portal);
    }

    /**
     * Spawn an infernal beam hazard with specific coordinates
     * @param {object} game - Game instance
     * @param {number} x - X position to spawn at (if provided)
     * @param {number} y - Y position to spawn at (if provided)
     */
    spawnInfernalBeam(game, x, y) {
        // For beam, we'll either do horizontal or vertical beam
        const isHorizontal = Math.random() < 0.5;
        
        // Use provided coordinates if available
        let position;
        if (x !== undefined && y !== undefined) {
            position = isHorizontal ? y : x;
        } else {
            position = isHorizontal ? 
                Math.random() * game.height * 0.8 : // Y position for horizontal beam
                Math.random() * game.width; // X position for vertical beam
        }
        
        // Beam settings
        const beam = {
            isHorizontal: isHorizontal,
            position: position,
            width: this.config.hazards.infernalBeam?.width || 80,
            length: this.config.hazards.infernalBeam?.length || 800,
            damage: this.config.hazards.infernalBeam?.damage || 75,
            duration: this.config.hazards.infernalBeam?.duration || 5000,
            rotationSpeed: this.config.hazards.infernalBeam?.rotationSpeed || 0.5,
            rotation: 0,
            spawnTime: Date.now(),
            active: true,
            warningPhase: true,
            warningTime: 1000, // 1 second warning
            
            update(deltaTime, currentTime, game) {
                const elapsed = currentTime - this.spawnTime;
                
                // Check if warning phase is over
                if (this.warningPhase && elapsed >= this.warningTime) {
                    this.warningPhase = false;
                }
                
                // Update rotation
                this.rotation += this.rotationSpeed * deltaTime / 1000;
                
                // Check if duration has expired
                if (elapsed >= this.duration + this.warningTime) {
                    this.active = false;
                }
            },
            
            draw(ctx) {
                const elapsed = Date.now() - this.spawnTime;
                
                if (this.warningPhase) {
                    // Draw warning indicator
                    const warningProgress = elapsed / this.warningTime;
                    ctx.save();
                    ctx.globalAlpha = warningProgress * 0.7;
                    
                    if (this.isHorizontal) {
                        ctx.fillStyle = 'rgba(255, 50, 0, 0.3)';
                        ctx.fillRect(0, this.position - this.width/2, ctx.canvas.width, this.width);
                        ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(0, this.position - this.width/2, ctx.canvas.width, this.width);
                    } else {
                        ctx.fillStyle = 'rgba(255, 50, 0, 0.3)';
                        ctx.fillRect(this.position - this.width/2, 0, this.width, ctx.canvas.height);
                        ctx.strokeStyle = 'rgba(255, 150, 0, 0.8)';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(this.position - this.width/2, 0, this.width, ctx.canvas.height);
                    }
                    
                    ctx.restore();
                } else {
                    // Draw active beam
                    ctx.save();
                    
                    // Determine beam start and end points
                    let startX, startY, endX, endY;
                    
                    if (this.isHorizontal) {
                        startX = 0;
                        startY = this.position;
                        endX = ctx.canvas.width;
                        endY = this.position;
                    } else {
                        startX = this.position;
                        startY = 0;
                        endX = this.position;
                        endY = ctx.canvas.height;
                    }
                    
                    // Draw beam with glow effect
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#ff6600';
                    ctx.strokeStyle = '#ff3300';
                    ctx.lineWidth = this.width;
                    ctx.lineCap = 'round';
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    
                    // Draw inner beam
                    ctx.shadowBlur = 10;
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = this.width * 0.4;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    
                    ctx.restore();
                }
            },
            
            checkCollision(phoenix) {
                if (this.warningPhase || !phoenix) return false;
                
                if (this.isHorizontal) {
                    // Check collision with horizontal beam
                    return Math.abs(phoenix.y - this.position) < this.width/2 + phoenix.height/2;
                } else {
                    // Check collision with vertical beam
                    return Math.abs(phoenix.x - this.position) < this.width/2 + phoenix.width/2;
                }
            }
        };
        
        this.hazardTypes.infernalBeam.active.push(beam);
    }

    /**
     * Spawn a fire wall hazard with specific coordinates
     * @param {object} game - Game instance
     * @param {number} x - X position to spawn at (if provided)
     * @param {number} y - Y position to spawn at (if provided)
     */
    spawnFireWall(game, x, y) {
        // Fire wall will move from bottom to top
        // Use provided X if available, otherwise random
        const wallX = x !== undefined ? x : Math.random() * game.width;
        
        // Y position is always at the bottom or use provided Y
        const wallY = y !== undefined ? y : game.height + 100;
        
        const wall = {
            x: wallX,
            y: wallY,
            width: game.width,
            height: this.config.hazards.fireWall?.height || 100,
            speed: 4,
            damage: this.config.hazards.fireWall?.damage || 100,
            duration: this.config.hazards.fireWall?.duration || 3000,
            spawnTime: Date.now(),
            active: true,
            
            update(deltaTime, currentTime, game) {
                // Move the wall upward
                this.y -= this.speed * deltaTime / 16;
                
                // Check if wall has moved off screen
                if (this.y + this.height < 0) {
                    this.active = false;
                }
            },
            
            draw(ctx) {
                // Draw fire wall with animated effect
                // Ensure values are finite before creating gradient
                if (isNaN(this.y) || isNaN(this.height) || !isFinite(this.y) || !isFinite(this.height) || 
                    isNaN(this.x) || isNaN(this.width) || !isFinite(this.x) || !isFinite(this.width)) {
                    return; // Skip drawing if values are invalid
                }

                try {
                    const gradient = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
                    gradient.addColorStop(0, 'rgba(255, 50, 0, 0.1)');
                    gradient.addColorStop(0.5, 'rgba(255, 120, 0, 0.7)');
                    gradient.addColorStop(1, 'rgba(255, 50, 0, 0.1)');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                } catch (e) {
                    // Fallback to solid color if gradient fails
                    ctx.fillStyle = 'rgba(255, 120, 0, 0.5)';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
                
                // Draw flames on top
                const flameHeight = 30;
                const flameCount = Math.floor(this.width / 20);
                
                for (let i = 0; i < flameCount; i++) {
                    const flameX = (i * 20) + Math.sin(Date.now() * 0.01 + i) * 5;
                    const flameY = this.y;
                    
                    // Skip drawing individual flames if values are invalid
                    if (isNaN(flameX) || isNaN(flameY) || !isFinite(flameX) || !isFinite(flameY)) {
                        continue;
                    }
                    
                    // Draw animated flame
                    ctx.beginPath();
                    ctx.moveTo(flameX, flameY);
                    ctx.quadraticCurveTo(
                        flameX - 10, flameY - flameHeight * 0.6,
                        flameX, flameY - flameHeight * (0.8 + Math.sin(Date.now() * 0.005 + i) * 0.2)
                    );
                    ctx.quadraticCurveTo(
                        flameX + 10, flameY - flameHeight * 0.6,
                        flameX, flameY
                    );
                    
                    try {
                        // Ensure values are finite before creating gradient
                        if (isNaN(flameY) || !isFinite(flameY) || isNaN(flameHeight) || !isFinite(flameHeight)) {
                            // Use a solid color fallback if we can't create a gradient
                            ctx.fillStyle = '#ff6600';
                        } else {
                            const flameGradient = ctx.createLinearGradient(flameX, flameY, flameX, flameY - flameHeight);
                            flameGradient.addColorStop(0, '#ff3300');
                            flameGradient.addColorStop(0.7, '#ffaa00');
                            flameGradient.addColorStop(1, 'rgba(255, 200, 0, 0.5)');
                            ctx.fillStyle = flameGradient;
                        }
                    } catch (e) {
                        // Fallback to solid color if gradient fails
                        ctx.fillStyle = '#ff6600';
                    }
                    
                    ctx.fill();
                }
            },
            
            checkCollision(phoenix) {
                if (!phoenix) return false;
                
                // Check for collision with phoenix
                return (
                    phoenix.y + phoenix.height/2 > this.y &&
                    phoenix.y - phoenix.height/2 < this.y + this.height
                );
            }
        };
        
        this.hazardTypes.fireWall.active.push(wall);
    }

    /**
     * Draw all active hazards
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;
        
        // Draw all hazards
        this.hazardTypes.hellPortal.active.forEach(portal => portal.draw(ctx));
        this.hazardTypes.infernalBeam.active.forEach(beam => beam.draw(ctx));
        this.hazardTypes.fireWall.active.forEach(wall => wall.draw(ctx));
    }

    /**
     * Check for collisions with the phoenix
     * @param {object} phoenix - Player character
     * @returns {object} Collision result with damage amount if collision occurred
     */
    checkCollisions(phoenix) {
        if (!this.active || !phoenix) return { collision: false };
        
        // Check collisions with all hazards
        
        // Hell portals
        for (const portal of this.hazardTypes.hellPortal.active) {
            if (portal.checkCollision(phoenix)) {
                return {
                    collision: true,
                    damage: portal.damage,
                    hazardType: 'hellPortal'
                };
            }
        }
        
        // Infernal beams
        for (const beam of this.hazardTypes.infernalBeam.active) {
            if (beam.checkCollision(phoenix)) {
                return {
                    collision: true,
                    damage: beam.damage,
                    hazardType: 'infernalBeam'
                };
            }
        }
        
        // Fire walls
        for (const wall of this.hazardTypes.fireWall.active) {
            if (wall.checkCollision(phoenix)) {
                return {
                    collision: true,
                    damage: wall.damage,
                    hazardType: 'fireWall'
                };
            }
        }
        
        return { collision: false };
    }

    /**
     * Reset the coordinator state
     */
    reset() {
        Object.values(this.hazardTypes).forEach(type => {
            type.active = [];
            type.lastSpawnTime = 0;
        });
    }

    /**
     * Set whether the coordinator is active
     * @param {boolean} active - Whether to activate
     */
    setActive(active) {
        this.active = active;
        
        if (!active) {
            this.reset();
        }
    }
}