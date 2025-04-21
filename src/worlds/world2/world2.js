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