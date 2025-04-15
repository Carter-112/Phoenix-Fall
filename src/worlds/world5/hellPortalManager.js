import { HellPortal } from './hellPortal.js';

export class HellPortalManager {
    constructor(world5Config) {
        this.config = world5Config.hazards.hellPortal;
        this.active = true;
        this.portals = [];
        this.lastSpawnTime = 0;
        
        // Apply difficulty modifiers if available
        if (world5Config.systems.difficulty?.modifiers) {
            const modifiers = world5Config.systems.difficulty.modifiers;
            this.config.spawnRate *= modifiers.spawnRate || 1;
            this.config.damage *= modifiers.damage || 1;
            this.config.warningTime *= modifiers.warningTime || 1;
        }
    }

    update(deltaTime, currentTime, width, height) {
        if (!this.active) return;

        // Update existing portals
        this.portals = this.portals.filter(portal => {
            portal.update(deltaTime);
            return portal.active;
        });

        // Check if it's time to spawn a new portal
        if (currentTime - this.lastSpawnTime > this.config.spawnRate && 
            this.portals.length < this.config.maxActive) {
            this.spawnPortal(this.getSpawnLocation(width, height));
            this.lastSpawnTime = currentTime;
        }
    }

    getSpawnLocation(width, height) {
        // Keep portals away from edges
        const margin = this.config.radius * 2;
        
        // Find a spawn location that's not too close to existing portals
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const x = margin + Math.random() * (width - margin * 2);
            const y = margin + Math.random() * (height - margin * 2);
            
            // Check distance from other portals
            const tooClose = this.portals.some(portal => {
                const dx = portal.x - x;
                const dy = portal.y - y;
                const minDistance = portal.radius * 3;
                return (dx * dx + dy * dy) < (minDistance * minDistance);
            });
            
            if (!tooClose) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // Fallback to random position if no suitable location found
        return {
            x: margin + Math.random() * (width - margin * 2),
            y: margin + Math.random() * (height - margin * 2)
        };
    }

    spawnPortal(position) {
        const portal = new HellPortal(position.x, position.y, this.config);
        this.portals.push(portal);
        return portal;
    }

    draw(ctx) {
        for (const portal of this.portals) {
            portal.draw(ctx);
        }
    }

    calculateTotalPull(phoenix) {
        if (!phoenix) return { x: 0, y: 0 };

        // Calculate combined pull from all active portals
        const totalPull = { x: 0, y: 0 };
        
        for (const portal of this.portals) {
            const pull = portal.calculatePull(phoenix);
            totalPull.x += pull.x;
            totalPull.y += pull.y;
        }
        
        return totalPull;
    }

    checkCollisions(phoenix) {
        if (!phoenix) return false;

        for (const portal of this.portals) {
            if (portal.checkCollision(phoenix)) {
                return this.config.damage;
            }
        }
        return 0;
    }

    reset() {
        this.portals = [];
        this.lastSpawnTime = 0;
        this.active = true;
    }

    setActive(active) {
        this.active = active;
        if (!active) {
            this.portals = [];
        }
    }
}