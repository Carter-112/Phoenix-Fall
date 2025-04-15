import { InfernalBeamManager } from './infernalBeamManager.js';
import { HellPortalManager } from './hellPortalManager.js';

export class World5HazardCoordinator {
    constructor(world5Config) {
        this.config = world5Config.systems.hazardCoordination;
        this.patterns = this.config.patterns;
        this.active = true;
        
        // Initialize hazard managers
        this.beamManager = new InfernalBeamManager(world5Config);
        this.portalManager = new HellPortalManager(world5Config);
        
        // Pattern tracking
        this.currentPattern = null;
        this.patternStartTime = 0;
        this.lastPatternTime = 0;
        this.patternActive = false;
        
        // Apply difficulty modifiers if available
        if (world5Config.systems.difficulty?.modifiers) {
            const modifiers = world5Config.systems.difficulty.modifiers;
            this.patternFrequencyMultiplier = modifiers.patternFrequency || 1;
        }
    }

    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;

        // Update individual managers
        this.beamManager.update(deltaTime, currentTime, width, height);
        this.portalManager.update(deltaTime, currentTime, width, height);

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

        // Pattern-specific updates
        switch (this.currentPattern.name) {
            case 'infernalCrossfire':
                this.updateInfernalCrossfire(patternElapsed);
                break;
            case 'hellstorm':
                this.updateHellstorm(patternElapsed);
                break;
        }
    }

    updateInfernalCrossfire(elapsed) {
        // Crossfire pattern: Four beams in a cross with central portal
        if (elapsed < 500) { // Initial setup phase
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Spawn cross formation using helper
            if (this.beamManager.beams.length === 0 && this.portalManager.portals.length === 0) {
                this.spawnFormation('cross', centerX, centerY);
            }
        }
    }
    spawnFormation(formation, centerX, centerY) {
        switch (formation) {
            case 'cross':
                const crossPositions = this.calculateCrossPositions(centerX, centerY);
                crossPositions.beams.forEach(pos => this.beamManager.spawnBeam(pos.x));
                if (crossPositions.portal) {
                    this.portalManager.spawnPortal(crossPositions.portal);
                }
                break;
            case 'triangle':
                const trianglePositions = this.calculateTrianglePositions(centerX, centerY);
                trianglePositions.beams.forEach(pos => this.beamManager.spawnBeam(pos.x));
                trianglePositions.portals.forEach(pos => this.portalManager.spawnPortal(pos));
                break;
        }
    }
    calculateCrossPositions(centerX, centerY) {
        const spacing = 200; // Distance between opposing beams
        return {
            beams: [
                { x: centerX - spacing/2 }, // Left beam
                { x: centerX + spacing/2 }, // Right beam
                { x: centerX }, // Center vertical beams (x2)
                { x: centerX }
            ],
            portal: { x: centerX, y: centerY }
        };
    }
    calculateTrianglePositions(centerX, centerY) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const spacing = width * 0.3; // 30% of screen width for triangle base
        
        return {
            beams: [
                { x: width * 0.3 }, // Left tracking beam
                { x: width * 0.7 }  // Right tracking beam
            ],
            portals: [
                { x: centerX - spacing/2, y: height * 0.6 }, // Bottom left
                { x: centerX + spacing/2, y: height * 0.6 }, // Bottom right
                { x: centerX, y: height * 0.3 }             // Top center
            ]
        };
    }
    updateHellstorm(elapsed) {
        // Hellstorm pattern: Two tracking beams and three portals in triangle formation
        if (elapsed < 500) { // Initial setup phase
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Spawn triangle formation using helper
            if (this.beamManager.beams.length === 0 && this.portalManager.portals.length === 0) {
                this.spawnFormation('triangle', centerX, centerY);
            }
        }
    }

    checkStartNewPattern(currentTime) {
        if (!this.currentPattern) {
            const timeSinceLastPattern = currentTime - this.lastPatternTime;
            const patternNames = Object.keys(this.patterns);
            
            // Check if it's time for a new pattern
            for (const patternName of patternNames) {
                const pattern = this.patterns[patternName];
                const adjustedInterval = pattern.interval / this.patternFrequencyMultiplier;
                
                if (timeSinceLastPattern >= adjustedInterval) {
                    this.startPattern(patternName);
                    break;
                }
            }
        }
    }

    startPattern(patternName) {
        const pattern = this.patterns[patternName];
        if (!pattern) return;

        this.currentPattern = {
            name: patternName,
            ...pattern
        };
        
        this.patternStartTime = performance.now();
        this.patternActive = true;
        
        // Reset hazard managers for new pattern
        this.beamManager.reset();
        this.portalManager.reset();
    }

    endPattern() {
        this.lastPatternTime = performance.now();
        this.currentPattern = null;
        this.patternActive = false;
        
        // Reset hazard managers
        this.beamManager.reset();
        this.portalManager.reset();
    }

    draw(ctx) {
        // Draw all hazards
        this.beamManager.draw(ctx);
        this.portalManager.draw(ctx);
    }

    checkCollisions(phoenix) {
        if (!phoenix) return 0;

        // Check collisions with both hazard types
        const beamDamage = this.beamManager.checkCollisions(phoenix);
        const portalDamage = this.portalManager.checkCollisions(phoenix);

        // Return the highest damage value if multiple collisions occur
        return Math.max(beamDamage, portalDamage);
    }

    calculatePull(phoenix) {
        // Only portals have gravitational pull
        return this.portalManager.calculateTotalPull(phoenix);
    }

    reset() {
        this.beamManager.reset();
        this.portalManager.reset();
        this.currentPattern = null;
        this.patternActive = false;
        this.lastPatternTime = 0;
        this.active = true;
    }

    setActive(active) {
        this.active = active;
        this.beamManager.setActive(active);
        this.portalManager.setActive(active);
        
        if (!active) {
            this.currentPattern = null;
            this.patternActive = false;
        }
    }
}