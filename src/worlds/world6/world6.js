/**
 * World 6 Configuration
 * A reality-ripping firestorm with gravity shifts and advanced challenges
 */
export const world6 = {
    name: "Solar Rift",
    description: "A reality-ripping firestorm where gravity shifts and dimensional barriers collapse",
    
    // World-specific settings
    settings: {
        backgroundColor: '#3a1500', // Bright orange-red for solar theme
        ambientLight: 0.4, // Brighter to simulate solar energy
        difficulty: 6,
        timeToComplete: 270, // seconds
        requiredProgress: 100 // percent needed to complete
    },
    
    // Enemy spawn configuration
    enemies: {
        solarSpirit: { // Enemy unique to World 6
            spawnRate: 2000, // Faster spawn rate
            maxActive: 4, // More active to compensate
            speed: 2.8,
            health: 500
        },
        blackSunling: { // Enemy unique to World 6
            spawnRate: 3000,
            maxActive: 3,
            speed: 3.0,
            health: 300
        },
        flameLeech: { // Enemy unique to World 6
            spawnRate: 3500,
            maxActive: 3,
            speed: 3.2,
            health: 250,
            trackPlayer: true // This enemy tracks the player's movement
        }
    },
    
    // Collectible configuration
    collectibles: {
        ember: {
            spawnRate: 500,
            maxActive: 12,
            value: 40
        },
        powerEmber: {
            spawnRate: 2500,
            maxActive: 4,
            value: 150
        },
        solarEmber: { // New collectible type
            spawnRate: 4000,
            maxActive: 2,
            value: 250
        }
    },
    
    // World-specific hazards
    hazards: {
        gravityRift: {
            spawnRate: 5000,
            maxActive: 2,
            radius: 180,
            duration: 7000, // 7 seconds active time
            warningTime: 1000, // 1 second warning
            gravityReverse: true // Reverses gravity in the affected area
        },
        sunPulse: {
            spawnRate: 6000,
            maxActive: 2,
            radius: 250,
            damage: 100,
            expansionTime: 1000, // Time to reach full radius
            warningEffect: true
        },
        dimensionalCollapse: {
            spawnRate: 10000, // Rare but dangerous
            maxActive: 1,
            width: 600,
            height: 200,
            damage: 150,
            collapseTime: 2000, // Time until full effect
            warningEffect: true
        }
    },
    
    // Game Systems
    systems: {
        gravityDistortion: {
            enabled: true,
            frequency: 12000, // 12 seconds between distortions
            duration: 6000, // 6 seconds of effect
            intensity: 2.0 // Stronger gravity changes
        },
        timeDilation: {
            enabled: true,
            frequency: 20000, // 20 seconds between activations
            duration: 4000, // 4 seconds of effect
            slowFactor: 0.7 // Game slows to 70% speed
        }
    },
    
    // Boss configuration
    boss: {
        enabled: true,
        name: "Solar Titan",
        health: 3000,
        damage: 75,
        spawnTime: 210, // Spawns after 3.5 minutes
        attacks: [
            {
                name: "solarFlare",
                damage: 100,
                cooldown: 4000
            },
            {
                name: "gravityWell",
                damage: 50,
                pullForce: 3.0,
                cooldown: 8000
            },
            {
                name: "dimensionalRift",
                damage: 150,
                cooldown: 12000
            }
        ]
    },
    
    // Level progression
    progression: {
        xpMultiplier: 2.5, // 150% more XP than base
        levelThresholds: [500, 1000, 1500] // Highest XP requirements
    },
    
    // Special upgrades available in this world
    upgrades: {
        solarSurge: {
            description: "Dash upward past danger every 15 seconds",
            cooldown: 15000,
            distance: 200
        },
        sunforgedPlume: {
            description: "3 seconds invincibility on hit",
            duration: 3000
        },
        coreAscension: {
            description: "Brief slow-time when near death",
            healthThreshold: 0.2, // Activates at 20% health
            slowFactor: 0.5, // 50% game speed
            duration: 2000 // 2 seconds of slow time
        }
    }
}; 