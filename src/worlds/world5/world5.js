/**
 * World 5 Configuration
 * The final infernal realm with extreme hazards and demonic enemies
 */
import { InfernalEmber } from './infernalEmber.js';

export const world5 = {
    name: "Infernal Core",
    description: "A perilous descent into the molten heart of creation itself",
    
    // World-specific Ember class
    EmberClass: InfernalEmber,
    
    // World-specific settings
    settings: {
        backgroundColor: '#2a0505', // Deep crimson for infernal theme
        ambientLight: 0.3, // Darker but with intense highlights
        difficulty: 5,
        timeToComplete: 240, // seconds
        requiredProgress: 100 // percent needed to complete
    },
    
    // Enemy spawn configuration
    enemies: {
        infernalBeast: { // Only enemy unique to World 5
            spawnRate: 3000, // Faster spawn rate since it's the only enemy
            maxActive: 3, // More active to compensate for being the only enemy
            speed: 2.5,
            health: 800
        }
    },
    
    // Collectible configuration
    collectibles: {
        ember: {
            spawnRate: 600,
            maxActive: 10,
            value: 30
        },
        powerEmber: {
            spawnRate: 3000,
            maxActive: 3,
            value: 125
        },
        infernalEmber: { // New collectible type
            spawnRate: 4500,
            maxActive: 2,
            value: 200
        }
    },
    
    // World-specific hazards
    hazards: {
        hellPortal: {
            spawnRate: 3500,
            maxActive: 3,
            radius: 100,
            damage: 50,
            spawnEnemies: true,
            duration: 6000, // 6 seconds active time
            warningTime: 1500 // 1.5 second warning before activation
        },
        infernalBeam: {
            spawnRate: 4000,
            maxActive: 2,
            width: 80,
            length: 800,
            damage: 75,
            rotationSpeed: 0.5, // radians per second
            duration: 5000
        },
        fireWall: {
            spawnRate: 7000,
            maxActive: 1,
            width: 800,
            height: 100,
            damage: 100,
            duration: 3000
        }
    },
    
    // Game Systems
    systems: {
        hellPortalManager: {
            enabled: true,
            config: 'hazards.hellPortal'
        },
        infernalBeamManager: {
            enabled: true,
            config: 'hazards.infernalBeam'
        }
    },
    
    // Boss configuration (final boss)
    boss: {
        enabled: true,
        name: "Phoenix Overlord",
        health: 2000,
        damage: 50,
        spawnTime: 180, // Spawns after 3 minutes
        attacks: [
            {
                name: "fireBreath",
                damage: 75,
                cooldown: 5000
            },
            {
                name: "flameNova",
                damage: 100,
                cooldown: 10000
            },
            {
                name: "summonMinions",
                count: 3,
                cooldown: 15000
            }
        ]
    },
    
    // Level progression
    progression: {
        xpMultiplier: 2.0, // 100% more XP
        levelThresholds: [400, 800, 1200] // Highest XP requirements
    }
};