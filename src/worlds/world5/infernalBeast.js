/**
 * InfernalBeast Enemy
 * A powerful demonic entity from the Infernal Core
 */

import { Enemy } from '../../entities/Enemy.js';
import { ParticleEmitter } from '../../particles/ParticleEmitter.js';

export class InfernalBeast extends Enemy {
    /**
     * Create a new InfernalBeast enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {ParticleSystem} particleSystem - Reference to game's particle system
     * @param {Object} options - Optional settings for the enemy
     */
    constructor(x, y, particleSystem, options = {}) {
        // Call parent constructor with high health and specific parameters
        super(x, y, 150, 150, options.health || 800, particleSystem);
        
        // Set enemy-specific properties
        this.type = 'boss';
        this.name = 'InfernalBeast';
        this.damage = options.damage || 75;
        this.speed = options.speed || 2;
        this.targetY = options.targetY || 200; // Hover position for boss mode
        this.isBoss = options.isBoss || false;
        this.attackCooldown = 0;
        this.attackRate = options.attackRate || 2000; // ms between attacks
        this.phaseChanges = [0.7, 0.4, 0.1]; // HP percentages for phase changes
        this.currentPhase = 0;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.isDashing = false;
        
        // Movement patterns
        this.movementPattern = this.isBoss ? 'hover' : 'seek';
        this.hoverOffset = 0;
        this.hoverSpeed = 0.01;
        this.hoverRange = 50;
        
        // Setup particle emitters
        this.setupEmitters(particleSystem);
        
        // Apply any additional options
        Object.assign(this, options);
    }
    
    /**
     * Set up particle emitters for the beast
     * @param {ParticleSystem} particleSystem 
     */
    setupEmitters(particleSystem) {
        // Body flames
        this.bodyEmitter = new ParticleEmitter({
            x: this.x,
            y: this.y,
            particleSystem: particleSystem,
            particlesPerEmit: 3,
            emitRate: 50,
            particleOptions: {
                color: '#ff3300',
                endColor: '#990000',
                size: 15,
                endSize: 5,
                speed: 1,
                lifetime: 1000,
                gravity: -0.01,
                alpha: 0.8,
                endAlpha: 0
            }
        });
        
        // Eye glow
        this.eyeEmitter = new ParticleEmitter({
            x: this.x,
            y: this.y - 30,
            particleSystem: particleSystem,
            particlesPerEmit: 1,
            emitRate: 200,
            particleOptions: {
                color: '#ffff00',
                endColor: '#ff6600',
                size: 8,
                endSize: 2,
                speed: 0.5,
                lifetime: 800,
                gravity: 0,
                alpha: 0.9,
                endAlpha: 0
            }
        });
    }
    
    /**
     * Update the enemy state
     * @param {number} deltaTime - Time elapsed since last update
     * @param {Object} game - Game instance
     */
    update(deltaTime, game) {
        if (!this.active) return;
        
        // Update position based on movement pattern
        this.updateMovement(deltaTime, game);
        
        // Update cooldowns
        this.attackCooldown -= deltaTime;
        if (this.dashCooldown > 0) this.dashCooldown -= deltaTime;
        if (this.dashDuration > 0) this.dashDuration -= deltaTime;
        
        // Check for phase transitions based on health percentage
        const healthPercentage = this.health / this.maxHealth;
        if (this.phaseChanges[this.currentPhase] > healthPercentage) {
            this.transitionPhase();
        }
        
        // Attack if cooldown is ready
        if (this.attackCooldown <= 0 && game.phoenix) {
            this.performAttack(game);
        }
        
        // Update emitters
        this.updateEmitters();
        
        // Update dash state
        if (this.isDashing && this.dashDuration <= 0) {
            this.isDashing = false;
        }
        
        // Apply standard enemy updates from parent class
        super.update(deltaTime, game);
    }
    
    /**
     * Update enemy movement based on pattern
     * @param {number} deltaTime 
     * @param {Object} game 
     */
    updateMovement(deltaTime, game) {
        if (!game.phoenix) return;
        
        if (this.isDashing) {
            // During dash, move rapidly in the current direction
            this.x += this.velocityX * 3;
            this.y += this.velocityY * 3;
            return;
        }
        
        switch (this.movementPattern) {
            case 'hover':
                // Boss mode - hover at top of screen and move side to side
                this.hoverOffset += this.hoverSpeed * deltaTime;
                this.x = game.width/2 + Math.sin(this.hoverOffset) * this.hoverRange;
                
                // Slowly move to target Y position if needed
                const yDiff = this.targetY - this.y;
                if (Math.abs(yDiff) > 5) {
                    this.y += yDiff * 0.01 * deltaTime;
                }
                break;
                
            case 'seek':
                // Standard tracking behavior
                const dx = game.phoenix.x - this.x;
                const dy = game.phoenix.y - this.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance > 10) { // Don't move if very close
                    const moveSpeed = this.speed * (deltaTime / 16);
                    this.velocityX = (dx / distance) * moveSpeed;
                    this.velocityY = (dy / distance) * moveSpeed;
                    
                    this.x += this.velocityX;
                    this.y += this.velocityY;
                }
                break;
        }
    }
    
    /**
     * Handle phase transitions
     */
    transitionPhase() {
        this.currentPhase++;
        
        // Increase attack rate and speed with each phase
        this.attackRate *= 0.8;
        this.speed *= 1.2;
        
        // Emit particles for phase transition
        if (this.particleSystem) {
            this.particleSystem.createExplosion(
                this.x, this.y, 
                50, // particle count
                {
                    color: '#ff0000',
                    endColor: '#330000',
                    size: 20,
                    speed: 3,
                    lifetime: 1500
                }
            );
        }
    }
    
    /**
     * Perform an attack based on current phase
     * @param {Object} game 
     */
    performAttack(game) {
        this.attackCooldown = this.attackRate;
        
        // Choose attack based on phase
        const attacks = ['fireBreath', 'flameDash', 'fireRing'];
        const attackIndex = Math.min(this.currentPhase, attacks.length - 1);
        const attackType = attacks[attackIndex];
        
        switch (attackType) {
            case 'fireBreath':
                this.fireBreathAttack(game);
                break;
            case 'flameDash':
                this.flameDashAttack(game);
                break;
            case 'fireRing':
                this.fireRingAttack(game);
                break;
        }
    }
    
    /**
     * Fire breath attack - send particles toward player
     * @param {Object} game 
     */
    fireBreathAttack(game) {
        if (!this.particleSystem || !game.phoenix) return;
        
        const dx = game.phoenix.x - this.x;
        const dy = game.phoenix.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        for (let i = 0; i < 20; i++) {
            const spreadAngle = angle + (Math.random() - 0.5) * 0.5;
            const speed = 3 + Math.random() * 2;
            
            this.particleSystem.emit({
                x: this.x,
                y: this.y,
                color: '#ff6600',
                endColor: '#990000',
                size: 15,
                endSize: 5,
                speedX: Math.cos(spreadAngle) * speed,
                speedY: Math.sin(spreadAngle) * speed,
                lifetime: 1500,
                damage: this.damage / 3,
                isHazard: true
            });
        }
    }
    
    /**
     * Flame dash attack - dash toward player
     * @param {Object} game 
     */
    flameDashAttack(game) {
        if (!game.phoenix) return;
        
        // Set up dash direction toward player
        const dx = game.phoenix.x - this.x;
        const dy = game.phoenix.y - this.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        this.velocityX = (dx / distance) * this.speed * 2;
        this.velocityY = (dy / distance) * this.speed * 2;
        
        this.isDashing = true;
        this.dashDuration = 1000; // Dash for 1 second
        this.dashCooldown = 5000; // Can't dash again for 5 seconds
    }
    
    /**
     * Fire ring attack - create circle of particles
     * @param {Object} game 
     */
    fireRingAttack(game) {
        if (!this.particleSystem) return;
        
        const particleCount = 24;
        const radius = 80;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speedX = Math.cos(angle) * 3;
            const speedY = Math.sin(angle) * 3;
            
            this.particleSystem.emit({
                x: this.x,
                y: this.y,
                color: '#ff3300',
                endColor: '#990000',
                size: 15,
                endSize: 5,
                speedX: speedX,
                speedY: speedY,
                lifetime: 2000,
                damage: this.damage / 2,
                isHazard: true
            });
        }
    }
    
    /**
     * Update particle emitters position and emission
     */
    updateEmitters() {
        if (this.bodyEmitter) {
            this.bodyEmitter.x = this.x;
            this.bodyEmitter.y = this.y;
            this.bodyEmitter.emit();
        }
        
        if (this.eyeEmitter) {
            this.eyeEmitter.x = this.x;
            this.eyeEmitter.y = this.y - 30;
            this.eyeEmitter.emit();
        }
    }
    
    /**
     * Draw the enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.active) return;
        
        // Draw base shape with glow effect
        ctx.save();
        
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff6600';
        
        // Draw beast body
        ctx.fillStyle = '#660000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw horns
        ctx.fillStyle = '#990000';
        ctx.beginPath();
        ctx.moveTo(this.x - 30, this.y - 20);
        ctx.lineTo(this.x - 10, this.y - 60);
        ctx.lineTo(this.x, this.y - 20);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y - 20);
        ctx.lineTo(this.x + 10, this.y - 60);
        ctx.lineTo(this.x, this.y - 20);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x - 20, this.y - 20, 10, 0, Math.PI * 2);
        ctx.arc(this.x + 20, this.y - 20, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Draw health bar for boss
        if (this.isBoss) {
            this.drawBossHealthBar(ctx);
        }
        
        // Call parent draw method if needed
        // super.draw(ctx);
    }
    
    /**
     * Draw boss health bar at top of screen
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawBossHealthBar(ctx) {
        const barWidth = 300;
        const barHeight = 20;
        const x = (ctx.canvas.width / 2) - (barWidth / 2);
        const y = 30;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health fill
        const fillWidth = (this.health / this.maxHealth) * barWidth;
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(x, y, fillWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Infernal Beast', ctx.canvas.width / 2, y - 10);
    }
    
    /**
     * Handle collision with player
     * @param {Phoenix} phoenix - Player character
     * @returns {boolean} - Whether collision occurred
     */
    onCollision(phoenix) {
        if (!this.active || !phoenix) return false;
        
        // Deal damage to player
        phoenix.takeDamage(this.damage);
        
        // Visual effect
        if (this.particleSystem) {
            this.particleSystem.createExplosion(
                phoenix.x, phoenix.y, 
                20, // particle count
                {
                    color: '#ff6600',
                    endColor: '#330000',
                    size: 10,
                    speed: 2,
                    lifetime: 800
                }
            );
        }
        
        return true;
    }
    
    /**
     * Handle taking damage
     * @param {number} amount - Damage amount
     * @returns {boolean} - Whether enemy died
     */
    takeDamage(amount) {
        // Create damage particles
        if (this.particleSystem) {
            for (let i = 0; i < 5; i++) {
                this.particleSystem.emit({
                    x: this.x + (Math.random() - 0.5) * this.width,
                    y: this.y + (Math.random() - 0.5) * this.height,
                    color: '#ffffff',
                    endColor: '#ff6600',
                    size: 10,
                    endSize: 2,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                    lifetime: 500,
                    gravity: 0
                });
            }
        }
        
        // Call parent method
        return super.takeDamage(amount);
    }
    
    /**
     * Handle enemy death
     * @param {Object} game - Game instance
     */
    onDeath(game) {
        // Create death explosion
        if (this.particleSystem) {
            this.particleSystem.createExplosion(
                this.x, this.y, 
                100, // particle count
                {
                    color: '#ff0000',
                    endColor: '#330000',
                    size: 25,
                    speed: 4,
                    lifetime: 2000
                }
            );
        }
        
        // Drop extra rewards if it's a boss
        if (this.isBoss) {
            // Try to use the World5EnemyCoordinator to spawn rewards
            if (game.currentWorld && 
                game.currentWorld.enemyCoordinator && 
                typeof game.currentWorld.enemyCoordinator.spawnInfernalEmberRewards === 'function') {
                game.currentWorld.enemyCoordinator.spawnInfernalEmberRewards(this.x, this.y, game);
            } 
            // Fallback to direct collectible spawning
            else if (game.collectibles) {
                // Drop multiple embers
                for (let i = 0; i < 10; i++) {
                    const offsetX = (Math.random() - 0.5) * 200;
                    const offsetY = (Math.random() - 0.5) * 200;
                    
                    if (typeof game.collectibles.spawnInfernalEmber === 'function') {
                        game.collectibles.spawnInfernalEmber(
                            this.x + offsetX,
                            this.y + offsetY
                        );
                    } else if (typeof game.collectibles.spawnEmber === 'function') {
                        game.collectibles.spawnEmber('infernalEmber', this.x + offsetX, this.y + offsetY);
                    }
                }
            }
            
            // Trigger any boss death events
            if (game.events) {
                game.events.trigger('boss:defeated', {
                    bossType: 'InfernalBeast',
                    position: { x: this.x, y: this.y }
                });
            }
        }
        
        // Call parent onDeath
        super.onDeath(game);
    }
} 