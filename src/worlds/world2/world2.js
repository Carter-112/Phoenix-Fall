/**
 * World 2 Configuration
 * A more challenging environment with volcanic hazards and aggressive enemies
 */
export const world2 = {
    name: "Volcanic Ascent",
    description: "A treacherous climb through active volcanic passages",
    
    // World-specific settings
    settings: {
        backgroundColor: '#2a0f0f', // Darker, more intense red
        ambientLight: 0.25, // Slightly darker for more dramatic lighting
        difficulty: 2,
        timeToComplete: 150, // seconds
        requiredProgress: 100
    },
    
    // Enemy spawn configuration
    enemies: {
        flameHelicopter: {
            spawnRate: 1800, // Faster spawns than World 1
            maxActive: 4, // More enemies at once
            speed: 2.5, // Faster movement
            health: 120 // Tougher enemies
        },
        magmaBat: {
            spawnRate: 2500,
            maxActive: 3,
            speed: 3,
            health: 70
        },
        lavaGolem: { // New enemy type
            spawnRate: 4000,
            maxActive: 1,
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