/**
 * Particle Emitter
 * Creates and manages particle effects
 */
export class ParticleEmitter {
    /**
     * Create a new particle emitter
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.particleSystem = options.particleSystem;
        this.particlesPerEmit = options.particlesPerEmit || 1;
        this.emitRate = options.emitRate || 100; // ms between emissions
        this.lastEmitTime = 0;
        this.active = true;
        this.particleOptions = options.particleOptions || {
            color: '#ff0000',
            endColor: '#ff9900',
            size: 5,
            endSize: 1,
            speed: 1,
            lifetime: 1000,
            gravity: 0,
            alpha: 1,
            endAlpha: 0
        };
    }

    /**
     * Emit particles immediately
     * @param {Object} overrideOptions - Optional settings to override defaults
     */
    emit(overrideOptions = {}) {
        if (!this.active || !this.particleSystem) return;

        const options = { ...this.particleOptions, ...overrideOptions };

        // Create the specified number of particles
        for (let i = 0; i < this.particlesPerEmit; i++) {
            // Random angle for particle direction
            const angle = Math.random() * Math.PI * 2;
            const speed = options.speed * (0.8 + Math.random() * 0.4); // Slight speed variation
            
            // Calculate velocity components
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            // Create the particle
            if (typeof this.particleSystem.emit === 'function') {
                this.particleSystem.emit({
                    x: this.x + (Math.random() - 0.5) * 10, // Slight position variation
                    y: this.y + (Math.random() - 0.5) * 10,
                    color: options.color,
                    endColor: options.endColor,
                    size: options.size,
                    endSize: options.endSize,
                    speedX: velocityX,
                    speedY: velocityY,
                    lifetime: options.lifetime,
                    gravity: options.gravity,
                    alpha: options.alpha,
                    endAlpha: options.endAlpha
                });
            }
        }
    }

    /**
     * Update the emitter
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (!this.active) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastEmitTime >= this.emitRate) {
            this.emit();
            this.lastEmitTime = currentTime;
        }
    }

    /**
     * Set the emitter position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Stop emitting particles
     */
    stop() {
        this.active = false;
    }

    /**
     * Start emitting particles
     */
    start() {
        this.active = true;
        this.lastEmitTime = Date.now();
    }
} 