/**
 * Generic hazard spawn method called by game.spawnHazard()
 * @param {number} x - X spawn position
 * @param {number} y - Y spawn position
 */
spawnHazard(x, y) {
    // Select a random hazard type based on configuration weights
    const random = Math.random();
    
    // Default weights if not configured
    const ashCloudWeight = this.config.hazards.ashCloud?.weight || 0.4;
    const emberStormWeight = this.config.hazards.emberStorm?.weight || 0.3;
    // Smoke wall gets the remaining probability
    
    // Use game instance from window for now
    const game = window.gameInstance;
    if (!game) return;
    
    if (random < ashCloudWeight) {
        this.spawnAshCloud(game, x, y);
    } else if (random < ashCloudWeight + emberStormWeight) {
        this.spawnEmberStorm(game, x, y);
    } else {
        this.spawnSmokeWall(game, x, y);
    }
}

/**
 * Spawn an ash cloud hazard
 * @param {object} game - Game instance
 * @param {number} x - X position to spawn at (if provided)
 * @param {number} y - Y position to spawn at (if provided)
 */
spawnAshCloud(game, x, y) {
    // Use provided coordinates if available, otherwise generate random position
    const cloudX = x !== undefined ? x : Math.random() * game.width;
    const cloudY = y !== undefined ? y : Math.random() * Math.min(500, game.height / 2);
    
    // ... existing ash cloud creation code ...
}

/**
 * Spawn an ember storm hazard
 * @param {object} game - Game instance
 * @param {number} x - X position to spawn at (if provided)
 * @param {number} y - Y position to spawn at (if provided)
 */
spawnEmberStorm(game, x, y) {
    // Use provided coordinates if available, otherwise generate random position
    const stormX = x !== undefined ? x : Math.random() * game.width;
    const stormY = y !== undefined ? y : -100; // Start above the screen
    
    // ... existing ember storm creation code ...
}

/**
 * Spawn a smoke wall hazard
 * @param {object} game - Game instance
 * @param {number} x - X position to spawn at (if provided)
 * @param {number} y - Y position to spawn at (if provided)
 */
spawnSmokeWall(game, x, y) {
    // Use provided X if available, otherwise random
    const wallX = x !== undefined ? x : Math.random() * game.width;
    
    // Y position is always at the bottom or use provided Y
    const wallY = y !== undefined ? y : game.height + 50;
    
    // ... existing smoke wall creation code ...
} 