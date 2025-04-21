/**
 * World 3 Configuration
 * A challenging frost-themed environment with ice hazards and crystalline enemies
 */
export const world3 = {
    name: "Frost Peak",
    description: "A treacherous ascent through crystalline spires and arctic winds",
    
    // World-specific settings
    settings: {
        backgroundColor: '#0f1a2a', // Deep blue for frost theme
        ambientLight: 0.4, // Brighter to reflect ice and snow
        difficulty: 3,
        timeToComplete: 180, // Longer time for more complex environment
        requiredProgress: 100
    },
    
    // Enemy spawn configuration
    enemies: {
        frostGolem: { // Enemy unique to World 3
            spawnRate: 2500, // Faster spawn rate since fewer enemy types
            maxActive: 3,
            speed: 1.8,
            health: 250
        },
        icePhoenix: { // Enemy unique to World 3
            spawnRate: 3500,
            maxActive: 2,
            speed: 3.5,
            health: 180
        }
    },
    
    // Collectible configuration
    collectibles: {
        ember: {
            spawnRate: 800,
            maxActive: 7,
            value: 20 // Even more valuable embers
        },
        powerEmber: {
            spawnRate: 4000,
            maxActive: 2,
            value: 75
        },
        frostEmber: { // New collectible type
            spawnRate: 6000,
            maxActive: 1,
            value: 100
        }
    },
    
    // World-specific hazards
    hazards: {
        iceSpike: {
            spawnRate: 2000, // 2 seconds between spawns
            maxActive: 4,
            speed: 2.5,
            width: 40,
            height: 120,
            damage: 25,
            pattern: 'rising', // Spikes rise from bottom
            warning: true, // Show warning before spike appears
            spawnLocations: [
                { x: 0.2, weight: 1 },   // 20% from left
                { x: 0.4, weight: 1.5 }, // 40% from left
                { x: 0.6, weight: 1.5 }, // 60% from left
                { x: 0.8, weight: 1 }    // 80% from left
            ],
            timing: {
                warningDuration: 1000,    // 1 second warning
                riseDuration: 500,        // 0.5 seconds to rise
                activeDuration: 2000,     // 2 seconds fully extended
                retractDuration: 300      // 0.3 seconds to retract
            }
        }
    },
    // Game Systems
    systems: {
        iceSpikes: {
            manager: 'IceSpikeManager', // Reference to the manager class
            config: 'hazards.iceSpike', // Path to configuration in this file
            // Additional system-specific settings if needed
            enabled: true,
            difficultyScaling: {
                spawnRateMultiplier: 0.9, // Spawn rate decreases with level
                damageMultiplier: 1.1     // Damage increases with level
            }
        }
    },
    
    // Level progression
    progression: {
        xpMultiplier: 1.5, // 50% more XP
        levelThresholds: [200, 400, 600] // Higher XP requirements
    }
};