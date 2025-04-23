/**
 * World 2 Configuration
 * A more challenging environment with volcanic hazards and aggressive enemies
 */
import { Ember } from '../../entities/ember.js';

export const world2 = {
    name: "Volcanic Ascent",
    description: "A treacherous climb through active volcanic passages",
    
    // World-specific Ember class
    EmberClass: Ember,
    
    // World-specific settings
    settings: {
        backgroundColor: '#2a0f0f', // Darker, more intense red
        ambientLight: 0.25, // Slightly darker for more dramatic lighting
        difficulty: 2,
        timeToComplete: 150, // seconds
        requiredProgress: 100
    },
    
    // Hazard configuration for World 2
    hazards: {
        // Smoke wall hazard
        smokeWall: {
            weight: 0.3,       // 30% chance of spawning this hazard
            width: 200,
            height: 120,
            speed: 2,
            damage: 25,
            spawnRate: 5000    // 5 seconds between spawns
        },
        // Ash cloud hazard
        ashCloud: {
            weight: 0.4,       // 40% chance of spawning this hazard
            size: 150,
            speed: 1.5,
            damage: 15,
            lifespan: 8000     // 8 seconds before disappearing
        },
        // Ember storm hazard
        emberStorm: {
            weight: 0.3,       // 30% chance of spawning this hazard
            width: 180,
            height: 100,
            speed: 2.5,
            damage: 20,
            lifespan: 5000     // 5 seconds before disappearing
        }
    },
    
    // Enemy spawn configuration
    enemies: {
        lavaGolem: { // Only enemy unique to World 2
            spawnRate: 2500, // Faster spawn rate since it's the only enemy
            maxActive: 4, // More active enemies to compensate for fewer types
            speed: 1.5,
            health: 200
        }
    },
    
    // Collectible configuration
    collectibles: {
        ember: {
            spawnRate: 900,
            maxActive: 6,
            value: 15 // More valuable embers
        },
        powerEmber: { // New collectible type
            spawnRate: 5000,
            maxActive: 1,
            value: 50
        }
    },
    
    // Level progression
    progression: {
        xpMultiplier: 1.2, // 20% more XP
        levelThresholds: [150, 300, 450] // Higher XP requirements
    }
};