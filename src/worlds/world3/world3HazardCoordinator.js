import { IceSpikeManager } from './IceSpikeManager.js';
import { IcePhoenixManager } from './IcePhoenixManager.js';

export class World3HazardCoordinator {
    constructor(world3Config) {
        this.config = world3Config.systems;
        this.active = true;
        
        // Initialize hazard managers
        this.spikeManager = new IceSpikeManager(world3Config);
        this.phoenixManager = new IcePhoenixManager(world3Config);
        
        // Pattern tracking
        this.currentPattern = null;
        this.patternStartTime = 0;
        this.lastPatternTime = 0;
        this.patternActive = false;
        
        // Apply difficulty modifiers if available
        if (world3Config.systems.difficulty?.modifiers) {
            const modifiers = world3Config.systems.difficulty.modifiers;
            this.patternFrequencyMultiplier = modifiers.patternFrequency || 1;
            this.damageMultiplier = modifiers.damage || 1;
        }
    }

    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;

        // Update individual managers
        this.spikeManager.update(deltaTime, currentTime, width, height);
        this.phoenixManager.update(deltaTime, currentTime, width, height);

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
            case 'frostCage':
                this.updateFrostCage(patternElapsed);
                break;
            case 'glacialAssault':
                this.updateGlacialAssault(patternElapsed);
                break;
        }
    }

    updateFrostCage(elapsed) {
        // Create a cage of ice spikes with phoenix in the center
        if (elapsed < 500) { // Initial setup phase
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            if (this.spikeManager.spikes.length === 0) {
                // Spawn ice spikes in a circular pattern
                const spikeCount = 8;
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (Math.PI * 2 * i) / spikeCount;
                    const radius = 200; // Distance from center
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    this.spikeManager.spawnSpike(x, y);
                }
                
                // Spawn ice phoenix in the center
                this.phoenixManager.spawnPhoenix(centerX, centerY);
            }
        }
    }

    updateGlacialAssault(elapsed) {
        // Coordinated attack with alternating spikes and phoenixes
        if (elapsed < 500) { // Initial setup phase
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            if (this.spikeManager.spikes.length === 0 && this.phoenixManager.phoenixes.length === 0) {
                // Spawn spikes at thirds of the screen
                [0.33, 0.66].forEach(x => {
                    this.spikeManager.spawnSpike(width * x, height - 50);
                });
                
                // Spawn phoenixes at quarters
                [0.25, 0.75].forEach(x => {
                    this.phoenixManager.spawnPhoenix(width * x, height * 0.3);
                });
            }
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
        return 8000 / this.patternFrequencyMultiplier; // 8 seconds base interval
    }

    startRandomPattern() {
        const patterns = [
            {
                name: 'frostCage',
                duration: 6000,
                weight: 1
            },
            {
                name: 'glacialAssault',
                duration: 8000,
                weight: 1
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
        this.spikeManager.reset();
        this.phoenixManager.reset();
    }

    endPattern() {
        this.lastPatternTime = performance.now();
        this.currentPattern = null;
        this.patternActive = false;
        
        // Reset hazard managers
        this.spikeManager.reset();
        this.phoenixManager.reset();
    }

    draw(ctx) {
        // Draw all hazards
        this.spikeManager.draw(ctx);
        this.phoenixManager.draw(ctx);
    }

    checkCollisions(phoenix) {
        if (!phoenix) return 0;

        // Check collisions with both hazard types
        const spikeDamage = this.spikeManager.checkCollisions(phoenix);
        const phoenixDamage = this.phoenixManager.checkCollisions(phoenix);

        // Return the total damage
        return Math.max(spikeDamage, phoenixDamage);
    }

    reset() {
        this.spikeManager.reset();
        this.phoenixManager.reset();
        this.currentPattern = null;
        this.patternActive = false;
        this.lastPatternTime = 0;
        this.active = true;
    }

    setActive(active) {
        this.active = active;
        this.spikeManager.setActive(active);
        this.phoenixManager.setActive(active);
        
        if (!active) {
            this.currentPattern = null;
            this.patternActive = false;
        }
    }
}