/**
 * World 1 Configuration
 * The introductory world with basic challenges and enemy patterns
 */
import { Ember } from '../../entities/ember.js';

export const world1 = {
    name: "Ember Valley",
    description: "A tranquil valley filled with gentle ember streams",
    
    // World-specific Ember class
    EmberClass: Ember,
    
    // World-specific settings
    settings: {
        backgroundColor: '#1a0f0f',
        ambientLight: 0.3,
        difficulty: 1,
        timeToComplete: 120, // seconds
        requiredProgress: 100, // percent needed to complete
        spawnEnemies: true,    // Enable enemy spawning
        spawnHazards: true     // Enable hazard spawning
    },
    
    // Enemy spawn configuration
    enemies: {
        flameHelicopter: {
            spawnRate: 2000, // ms between spawns
            maxActive: 3,
            speed: 2,
            health: 100
        },
        magmaBat: {
            spawnRate: 3000,
            maxActive: 2,
            speed: 2.5,
            health: 50
        }
    },
    
    // Collectible configuration
    collectibles: {
        ember: {
            spawnRate: 1000,
            maxActive: 5,
            value: 10
        }
    },
    
    // Level progression
    progression: {
        xpMultiplier: 1.0,
        levelThresholds: [100, 200, 300] // XP needed for each level
    }
};