import { Ember } from './ember.js';
import { FrostEmber } from './frostEmber.js';
import { InfernalEmber } from './infernalEmber.js';

export class EmberFactory {
    constructor(worldConfig) {
        this.config = worldConfig.collectibles;
        this.activeEmbers = new Set();
        
        // Track spawn timers for each type
        this.spawnTimers = {
            ember: 0,
            powerEmber: 0,
            frostEmber: 0,
            infernalEmber: 0
        };
    }

    update(currentTime, width, height) {
        // Check and spawn each type of ember
        Object.entries(this.config).forEach(([type, settings]) => {
            if (currentTime - this.spawnTimers[type] >= settings.spawnRate) {
                if (this.countEmberType(type) < settings.maxActive) {
                    this.spawnEmber(type, width, height);
                }
                this.spawnTimers[type] = currentTime;
            }
        });

        // Update all active embers
        this.activeEmbers.forEach(ember => {
            ember.update();
            if (!ember.active) {
                this.activeEmbers.delete(ember);
            }
        });
    }

    spawnEmber(type, width, height) {
        const x = Math.random() * (width - 100) + 50;
        const y = Math.random() * (height - 100) + 50;
        
        let ember;
        const settings = this.config[type];

        switch(type) {
            case 'frostEmber':
                ember = new FrostEmber(x, y, settings.value);
                break;
            case 'infernalEmber':
                ember = new InfernalEmber(x, y, settings.value);
                break;
            case 'powerEmber':
                ember = new Ember(x, y, settings.value);
                ember.radius = 15; // Larger than regular embers
                ember.powerEmber = true;
                break;
            default:
                ember = new Ember(x, y, settings.value);
        }

        this.activeEmbers.add(ember);
        return ember;
    }

    countEmberType(type) {
        return Array.from(this.activeEmbers).filter(ember => {
            if (type === 'ember') return ember instanceof Ember && !ember.powerEmber;
            if (type === 'powerEmber') return ember instanceof Ember && ember.powerEmber;
            if (type === 'frostEmber') return ember instanceof FrostEmber;
            if (type === 'infernalEmber') return ember instanceof InfernalEmber;
            return false;
        }).length;
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