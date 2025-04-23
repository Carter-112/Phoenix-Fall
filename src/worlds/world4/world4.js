/**
 * World 4 Configuration
 * A mystical void realm with gravity distortions and ethereal enemies
 */
import { CelestialEmber } from './celestialEmber.js';

export const world4 = {
    name: "Celestial Void",
    description: "A surreal journey through the boundary between dimensions",
    
    // World-specific Ember class
    EmberClass: CelestialEmber,
    
    // World-specific settings
    settings: {
        backgroundColor: '#1a0f2a', // Deep purple for cosmic theme
        ambientLight: 0.35, // Mystical lighting
        difficulty: 4,
        timeToComplete: 210, // seconds
        requiredProgress: 100 // percent needed to complete
    },
    
    // Enemy spawn configuration
    enemies: {
        voidWraith: { // Enemy unique to World 4
            spawnRate: 2200, // Faster spawn rate since fewer enemy types
            maxActive: 3, // More active to compensate for fewer types
            speed: 2.2,
            health: 300
        },
        celestialGuardian: { // Enemy unique to World 4
            spawnRate: 4000,
            maxActive: 2, // Increased from 1 to compensate
            speed: 2.0,
            health: 500
        }
    },
    
    // Collectible configuration
    collectibles: {
        ember: {
            spawnRate: 700,
            maxActive: 8,
            value: 25
        },
        powerEmber: {
            spawnRate: 3500,
            maxActive: 2,
            value: 100
        },
        celestialEmber: { // New collectible type
            spawnRate: 5000,
            maxActive: 1,
            value: 150
        }
    },
    
    // World-specific hazards
    hazards: {
        gravityWell: {
            spawnRate: 4000,
            maxActive: 3,
            radius: 150,
            pullForce: 2.5,
            duration: 5000, // 5 seconds active time
            warningTime: 1000 // 1 second warning before activation
        },
        voidTear: {
            spawnRate: 6000,
            maxActive: 2,
            width: 100,
            height: 300,
            damage: 40,
            duration: 4000
        }
    },
    
    // Game Systems
    systems: {
        gravityDistortion: {
            enabled: true,
            frequency: 15000, // 15 seconds between distortions
            duration: 5000, // 5 seconds of effect
            intensity: 1.5 // Strength of gravity changes
        }
    },
    
    // Level progression
    progression: {
        xpMultiplier: 1.8, // 80% more XP
        levelThresholds: [300, 600, 900] // Higher XP requirements
    }
};