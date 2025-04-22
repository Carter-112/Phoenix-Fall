import { Ember } from '../../entities/ember.js';

export class EmberFactory {
    constructor(worldConfig) {
        this.config = worldConfig.collectibles;
        this.activeEmbers = new Set();
        
        // Track spawn timers for only normal embers
        this.spawnTimers = {
            ember: 0
        };
    }

    update(currentTime, width, height) {
        // Only check and spawn regular embers
        const emberSettings = this.config.ember;
        if (emberSettings && currentTime - this.spawnTimers.ember >= emberSettings.spawnRate) {
            if (this.countEmbers() < (emberSettings.maxActive || 10)) {
                this.spawnEmber(width, height);
            }
            this.spawnTimers.ember = currentTime;
        }

        // Update all active embers
        this.activeEmbers.forEach(ember => {
            ember.update();
            if (!ember.active) {
                this.activeEmbers.delete(ember);
            }
        });
    }

    spawnEmber(width, height) {
        const x = Math.random() * (width - 100) + 50;
        const y = Math.random() * (height - 100) + 50;
        
        const settings = this.config.ember;
        const value = settings?.value || 10;
        const particleSystem = window.gameInstance?.particleSystem;

        // Only create regular embers
        const ember = new Ember(x, y, particleSystem, value);
        
        this.activeEmbers.add(ember);
        return ember;
    }

    countEmbers() {
        return this.activeEmbers.size;
    }

    draw(ctx) {
        this.activeEmbers.forEach(ember => ember.draw(ctx));
    }

    reset() {
        this.activeEmbers.clear();
        Object.keys(this.spawnTimers).forEach(key => {
            this.spawnTimers[key] = 0;
        });
    }

    getActiveEmbers() {
        return Array.from(this.activeEmbers);
    }
}