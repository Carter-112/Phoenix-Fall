import { GravityRiftManager } from './GravityRiftManager.js';
import { SunPulseManager } from './SunPulseManager.js';
import { DimensionalCollapseManager } from './DimensionalCollapseManager.js';

export class World6HazardCoordinator {
    constructor(world6Config) {
        this.config = world6Config.systems;
        this.active = true;
        
        // Initialize hazard managers
        this.gravityRiftManager = new GravityRiftManager(world6Config);
        this.sunPulseManager = new SunPulseManager(world6Config);
        this.dimensionalCollapseManager = new DimensionalCollapseManager(world6Config);
        
        // Pattern tracking
        this.currentPattern = null;
        this.patternStartTime = 0;
        this.lastPatternTime = 0;
        this.patternActive = false;
        
        // Apply difficulty modifiers if available
        if (world6Config.systems.difficulty?.modifiers) {
            const modifiers = world6Config.systems.difficulty.modifiers;
            this.patternFrequencyMultiplier = modifiers.patternFrequency || 1;
            this.damageMultiplier = modifiers.damage || 1;
        } else {
            this.patternFrequencyMultiplier = 1;
            this.damageMultiplier = 1;
        }
    }

    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;

        // Update individual managers
        this.gravityRiftManager.update(deltaTime, currentTime, width, height);
        this.sunPulseManager.update(deltaTime, currentTime, width, height);
        this.dimensionalCollapseManager.update(deltaTime, currentTime, width, height);

        // Pattern management
        if (this.patternActive) {
            this.updateActivePattern(currentTime);
        } else {
            this.checkStartNewPattern(currentTime);
        }
    }

    updateActivePattern(currentTime) {
        const patternElapsed = currentTime - this.patternStartTime;
        
        if (patternElapsed >= this.currentPattern.duration) {
            this.endPattern();
            return;
        }

        // Update pattern-specific behaviors
        switch (this.currentPattern.name) {
            case 'solarStorm':
                this.updateSolarStorm(patternElapsed);
                break;
            case 'gravityWave':
                this.updateGravityWave(patternElapsed);
                break;
            case 'dimensionalRift':
                this.updateDimensionalRift(patternElapsed);
                break;
        }
    }

    updateSolarStorm(elapsed) {
        // Create a series of sun pulses that move across the screen
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (elapsed % 1000 < 50 && this.sunPulseManager.pulses.length < 3) {
            // Spawn sun pulses at different vertical positions
            const x = width + 100; // Off screen to the right
            const y = height * (0.2 + Math.random() * 0.6); // Random position between 20-80% of height
            
            this.sunPulseManager.spawnPulse(x, y, -3); // Moving left
        }
    }

    updateGravityWave(elapsed) {
        // Create gravity rifts that alternately reverse gravity
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (elapsed % 2000 < 50 && this.gravityRiftManager.rifts.length < 4) {
            // Alternate between top and bottom of screen
            const y = (Math.floor(elapsed / 2000) % 2 === 0) ? height * 0.2 : height * 0.8;
            const x = width * (0.2 + Math.random() * 0.6); // Random position between 20-80% of width
            
            this.gravityRiftManager.spawnRift(x, y);
        }
    }

    updateDimensionalRift(elapsed) {
        // Create a major dimensional collapse that moves across the screen
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (elapsed < 500 && this.dimensionalCollapseManager.collapses.length === 0) {
            // Spawn a large dimensional collapse in the center
            const x = width * 0.5;
            const y = height * 0.5;
            
            this.dimensionalCollapseManager.spawnCollapse(x, y);
            
            // Also spawn some gravity rifts at the corners
            this.gravityRiftManager.spawnRift(width * 0.2, height * 0.2);
            this.gravityRiftManager.spawnRift(width * 0.8, height * 0.2);
            this.gravityRiftManager.spawnRift(width * 0.2, height * 0.8);
            this.gravityRiftManager.spawnRift(width * 0.8, height * 0.8);
        }
    }

    checkStartNewPattern(currentTime) {
        if (!this.currentPattern) {
            const timeSinceLastPattern = currentTime - this.lastPatternTime;
            
            // Check if it's time for a new pattern
            if (timeSinceLastPattern >= this.getNextPatternInterval()) {
                this.startRandomPattern();
            }
        }
    }

    getNextPatternInterval() {
        // Base interval adjusted by difficulty
        return 10000 / this.patternFrequencyMultiplier; // 10 seconds base interval
    }

    startRandomPattern() {
        const patterns = [
            {
                name: 'solarStorm',
                duration: 8000,
                weight: 1.5
            },
            {
                name: 'gravityWave',
                duration: 10000,
                weight: 1
            },
            {
                name: 'dimensionalRift',
                duration: 12000,
                weight: 0.7 // Rarer, more intense pattern
            }
        ];

        // Select pattern based on weights
        const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const pattern of patterns) {
            if (random <= pattern.weight) {
                this.startPattern(pattern);
                break;
            }
            random -= pattern.weight;
        }
    }

    startPattern(pattern) {
        this.currentPattern = pattern;
        this.patternStartTime = performance.now();
        this.patternActive = true;
        
        // Reset hazard managers for new pattern
        this.gravityRiftManager.reset();
        this.sunPulseManager.reset();
        this.dimensionalCollapseManager.reset();
        
        // Notify sound system of pattern start if available
        if (window.gameInstance && window.gameInstance.soundManager) {
            try {
                window.gameInstance.soundManager.playSound('patternStart', 0.5);
            } catch (error) {
                console.log('Could not play pattern start sound');
            }
        }
    }

    endPattern() {
        this.lastPatternTime = performance.now();
        this.currentPattern = null;
        this.patternActive = false;
        
        // Reset hazard managers
        this.gravityRiftManager.reset();
        this.sunPulseManager.reset();
        this.dimensionalCollapseManager.reset();
    }

    draw(ctx) {
        // Draw all hazards
        this.gravityRiftManager.draw(ctx);
        this.sunPulseManager.draw(ctx);
        this.dimensionalCollapseManager.draw(ctx);
    }

    checkCollisions(phoenix) {
        if (!phoenix) return 0;

        // Check collisions with all hazard types
        const riftDamage = this.gravityRiftManager.checkCollisions(phoenix);
        const pulseDamage = this.sunPulseManager.checkCollisions(phoenix);
        const collapseDamage = this.dimensionalCollapseManager.checkCollisions(phoenix);

        // Return the highest damage (don't stack damage types)
        return Math.max(riftDamage, pulseDamage, collapseDamage);
    }

    applyGravityEffects(phoenix) {
        if (!phoenix) return;
        
        // Apply gravity effects from rifts
        this.gravityRiftManager.applyGravityEffects(phoenix);
        
        // Apply time dilation if active
        if (this.currentPattern && this.currentPattern.name === 'dimensionalRift') {
            // Apply time dilation effect to phoenix
            phoenix.applyTimeDilation(0.8); // 80% normal speed
        }
    }

    reset() {
        this.gravityRiftManager.reset();
        this.sunPulseManager.reset();
        this.dimensionalCollapseManager.reset();
        this.currentPattern = null;
        this.patternActive = false;
        this.lastPatternTime = 0;
        this.active = true;
    }

    setActive(active) {
        this.active = active;
        this.gravityRiftManager.setActive(active);
        this.sunPulseManager.setActive(active);
        this.dimensionalCollapseManager.setActive(active);
        
        if (!active) {
            this.currentPattern = null;
            this.patternActive = false;
        }
    }
} 