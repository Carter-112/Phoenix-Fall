import { EmberFactory } from 'emberFactory';

export class EmberManager {
    constructor(worldConfig) {
        this.factory = new EmberFactory(worldConfig);
        this.active = true;
        this.collectedEmbers = 0;
        this.totalValue = 0;
        
        // Collection settings
        this.collectionRadius = 20; // Base collection radius
        this.magnetRadius = 100;    // Radius for magnetic pull effect
        this.pullStrength = 0.5;    // How strongly embers are pulled to phoenix
    }

    update(deltaTime, currentTime, width, height, phoenix) {
        if (!this.active) return;

        // Update factory to spawn and manage embers
        this.factory.update(currentTime, width, height);

        if (phoenix) {
            // Handle collection and magnetic pull
            const activeEmbers = this.factory.getActiveEmbers();
            activeEmbers.forEach(ember => {
                const distance = Math.hypot(ember.x - phoenix.x, ember.y - phoenix.y);
                
                // Check for collection
                if (distance < this.collectionRadius + phoenix.radius) {
                    this.collectEmber(ember);
                    return;
                }

                // Apply magnetic pull within range
                if (distance < this.magnetRadius + phoenix.radius) {
                    const pullFactor = 1 - (distance / (this.magnetRadius + phoenix.radius));
                    const dx = phoenix.x - ember.x;
                    const dy = phoenix.y - ember.y;
                    const angle = Math.atan2(dy, dx);
                    
                    ember.x += Math.cos(angle) * this.pullStrength * pullFactor * deltaTime;
                    ember.y += Math.sin(angle) * this.pullStrength * pullFactor * deltaTime;
                }
            });
        }
    }

    collectEmber(ember) {
        this.collectedEmbers++;
        this.totalValue += ember.value;
        ember.active = false;

        // Notify game state of collection
        if (window.gameInstance) {
            window.gameInstance.gameState.addXP(ember.value);
        }
    }

    draw(ctx) {
        this.factory.draw(ctx);
    }

    reset() {
        this.factory.reset();
        this.collectedEmbers = 0;
        this.totalValue = 0;
    }

    setActive(active) {
        this.active = active;
    }

    getCollectionStats() {
        return {
            count: this.collectedEmbers,
            value: this.totalValue
        };
    }
}