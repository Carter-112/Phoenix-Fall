import { InfernalBeam } from './infernalBeam.js';

export class InfernalBeamManager {
    constructor(world5Config) {
        this.config = world5Config.hazards.infernalBeam;
        this.active = true;
        this.beams = [];
        this.lastSpawnTime = 0;
        this.spawnLocations = this.config.spawnLocations;
        
        // Apply difficulty modifiers if available
        if (world5Config.systems.difficulty?.modifiers) {
            const modifiers = world5Config.systems.difficulty.modifiers;
            this.config.spawnRate *= modifiers.spawnRate || 1;
            this.config.damage *= modifiers.damage || 1;
        }
    }

    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;

        // Update existing beams
        this.beams = this.beams.filter(beam => {
            beam.update(deltaTime);
            return beam.active;
        });

        // Check if it's time to spawn a new beam
        if (currentTime - this.lastSpawnTime > this.config.spawnRate && 
            this.beams.length < this.config.maxActive) {
            this.spawnBeam(this.getSpawnLocation(width));
            this.lastSpawnTime = currentTime;
        }
    }

    getSpawnLocation(width) {
        // Calculate weighted random position based on spawn locations
        const totalWeight = this.spawnLocations.reduce((sum, loc) => sum + (loc.weight || 1), 0);
        let random = Math.random() * totalWeight;
        
        for (const location of this.spawnLocations) {
            random -= (location.weight || 1);
            if (random <= 0) {
                return width * location.x;
            }
        }
        
        // Fallback to random position if no location is selected
        return Math.random() * width;
    }

    spawnBeam(x, direction = null, tracking = false) {
        const beam = new InfernalBeam(x, this.config);
        this.beams.push(beam);
        return beam;
    }

    draw(ctx) {
        for (const beam of this.beams) {
            beam.draw(ctx);
        }
    }

    checkCollisions(phoenix) {
        if (!phoenix) return false;

        for (const beam of this.beams) {
            if (beam.checkCollision(phoenix)) {
                return this.config.damage;
            }
        }
        return 0;
    }

    reset() {
        this.beams = [];
        this.lastSpawnTime = 0;
        this.active = true;
    }

    setActive(active) {
        this.active = active;
        if (!active) {
            this.beams = [];
        }
    }
}