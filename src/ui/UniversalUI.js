/**
 * UniversalUI - Consistent UI for all worlds in Phoenix Fall
 * Handles the rendering of UI elements like health, progress, XP etc.
 * for all worlds in a consistent manner.
 */

export class UniversalUI {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.gameState = game.gameState;
    this.phoenix = game.phoenix;
    this.initialized = false;
    
    // Initialize UI
    this.init();
  }
  
  init() {
    if (!this.initialized) {
      console.log('Universal UI initialized');
      this.initialized = true;
    }
  }
  
  /**
   * Main draw method - renders all UI elements based on world and state
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  draw(width, height) {
    // Check if UI should be disabled for end screens like world complete
    if (window.universalUIEnabled === false) {
      return;
    }
    
    this.ctx.save();
    
    if (!this.game.isRunning || 
        this.gameState.gameOver || 
        this.gameState.worldComplete) {
      return; // Don't draw gameplay UI during menu, game over, or world complete
    }
    
    // Determine if we're in portrait or landscape mode
    const isPortrait = height > width;
    
    // Get current world info - FIXED: Use worldManager's value first if available
    let worldNumber = 1; // Default fallback
    
    // Priority order for world number:
    // 1. WorldManager's current world (most accurate)
    // 2. gameState.currentWorld (might be outdated)
    // 3. Default to 1
    if (this.game.worldManager?.getCurrentWorldNumber) {
      worldNumber = this.game.worldManager.getCurrentWorldNumber();
    } else if (this.gameState.currentWorld) {
      worldNumber = this.gameState.currentWorld;
    }
    
    // Ensure gameState.currentWorld is always in sync with worldManager
    if (this.gameState && this.gameState.currentWorld !== worldNumber) {
      console.log(`Fixing inconsistent world numbers: gameState has ${this.gameState.currentWorld}, worldManager has ${worldNumber}`);
      this.gameState.currentWorld = worldNumber;
    }
    
    const worldConfig = this.game.worldManager?.getCurrentWorld();
    
    // Draw the appropriate UI based on layout
    if (isPortrait) {
      this.drawPortraitUI(width, height, worldNumber, worldConfig);
    } else {
      this.drawLandscapeUI(width, height, worldNumber, worldConfig);
    }
  }
  
  /**
   * Draw UI optimized for portrait mode
   */
  drawPortraitUI(width, height, worldNumber, worldConfig) {
    const uiScale = 0.8; // Scale down UI elements in portrait
    const padding = 15;
    const mainUiWidth = Math.min(200, width * 0.4);
    
    // Top left: Health bar
    this.drawHealthBar(padding, padding, mainUiWidth, 20, uiScale);
    
    // Top right: World info
    this.drawWorldInfo(width - mainUiWidth - padding, padding, mainUiWidth, worldNumber, worldConfig);
    
    // Bottom right: Stats panel (time, altitude, etc.)
    this.drawStatsPanel(width - 150 - padding, height - 80 - padding, 150, 80);
  }
  
  /**
   * Draw UI optimized for landscape mode
   */
  drawLandscapeUI(width, height, worldNumber, worldConfig) {
    const uiScale = 1.0;
    const padding = 15;
    const mainUiWidth = Math.min(200, width * 0.25);
    
    // Top left: Health bar
    this.drawHealthBar(padding, padding, mainUiWidth, 20, uiScale);
    
    // Top right: World info
    this.drawWorldInfo(width - mainUiWidth - padding, padding, mainUiWidth, worldNumber, worldConfig);
    
    // Bottom right: Stats panel
    this.drawStatsPanel(width - 150 - padding, height - 80 - padding, 150, 80);
  }
  
  /**
   * Draw the health bar
   */
  drawHealthBar(x, y, width, height, scale) {
    // Calculate health percentage
    const healthPercent = this.phoenix ? this.phoenix.getHealthPercent() : 1.0;
    const barSpacing = 10;
    
    // Ensure we have valid values to prevent rendering errors
    const safeHealthPercent = isFinite(healthPercent) ? Math.max(0, Math.min(1, healthPercent)) : 1.0;
    
    // Draw health bar in top left
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.roundRect(x, y, width, height, 5, true);
    
    // Draw health bar fill with color based on health percentage
    let healthGradient;
    if (safeHealthPercent > 0.6) {
      // Green to yellow for high health
      healthGradient = this.ctx.createLinearGradient(x, y, x + (width * safeHealthPercent), y);
      healthGradient.addColorStop(0, '#3CDF3C'); // Green
      healthGradient.addColorStop(1, '#DFD83C'); // Yellow
    } else if (safeHealthPercent > 0.3) {
      // Yellow to orange for medium health
      healthGradient = this.ctx.createLinearGradient(x, y, x + (width * safeHealthPercent), y);
      healthGradient.addColorStop(0, '#DFD83C'); // Yellow
      healthGradient.addColorStop(1, '#DF933C'); // Orange
    } else {
      // Red for low health with pulsing effect
      const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() / 200);
      healthGradient = this.ctx.createLinearGradient(x, y, x + (width * safeHealthPercent || 1), y);
      healthGradient.addColorStop(0, `rgba(223, 44, 44, ${pulseIntensity})`); // Red
      healthGradient.addColorStop(1, `rgba(223, 81, 44, ${pulseIntensity})`); // Lighter red
    }
    
    this.ctx.fillStyle = healthGradient;
    this.roundRect(x, y, width * safeHealthPercent, height, 5, true);
    
    // Health bar text
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Health: ${Math.round(safeHealthPercent * 100)}%`, x + width / 2, y + height / 2 + 4);
    
    // Draw level progress bar below health if we have XP data
    if (this.gameState) {
      // Use game state level and XP
      let levelProgress = 0;
      let currentLevel = this.gameState.level || 1;
      
      // Calculate level progress based on current XP
      if (this.gameState.xpToNextLevel > 0) {
        levelProgress = this.gameState.xp / this.gameState.xpToNextLevel;
      }
      
      // Ensure levelProgress is valid to prevent rendering errors
      const safeLevelProgress = isFinite(levelProgress) ? Math.max(0, Math.min(1, levelProgress)) : 0;
      
      // Level bar position
      const levelBarY = y + height + barSpacing;
      
      // Level bar background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.roundRect(x, levelBarY, width, height, 5, true);
      
      // Level bar fill - use a solid color if progress is near zero to avoid gradient issues
      if (safeLevelProgress > 0.01) {
        const levelGradient = this.ctx.createLinearGradient(x, levelBarY, x + (width * safeLevelProgress), levelBarY);
        levelGradient.addColorStop(0, '#00CC33'); // Green
        levelGradient.addColorStop(1, '#66FF99'); // Lighter green
        this.ctx.fillStyle = levelGradient;
      } else {
        this.ctx.fillStyle = '#00CC33'; // Solid green for near-zero progress
      }
      
      this.roundRect(x, levelBarY, width * safeLevelProgress, height, 5, true);
      
      // Level bar text
      this.ctx.fillStyle = 'white';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Level ${currentLevel}: ${Math.round(safeLevelProgress * 100)}%`, 
                        x + width / 2, levelBarY + height / 2 + 4);
    }
  }
  
  /**
   * Draw the world information display
   */
  drawWorldInfo(x, y, width, worldNumber, worldConfig) {
    const scale = width / 300; // Scale based on width
    const scaledHeight = 90 * scale; // Increased height to accommodate progress bar
    
    // Get the actual world name from worldConfig or worldManager
    let worldName = "Unknown World";
    
    // Try multiple ways to get the correct world name
    if (worldConfig?.name) {
      worldName = worldConfig.name;
    } else if (window.gameInstance?.worldManager) {
      // Use the worldManager to get the name based on the ACTUAL world number
      worldName = window.gameInstance.worldManager.getWorldName(worldNumber);
    } else {
      // Fallback world names if all else fails
      const worldNames = {
        1: "Volcanic Cradle",
        2: "Ashspire Ruins",
        3: "Frost Peak",
        4: "Void Domain",
        5: "Shadow Nexus",
        6: "Celestial Domain"
      };
      worldName = worldNames[worldNumber] || `World ${worldNumber}`;
    }
    
    // Debug log to check what's happening
    console.log(`Drawing world info for World ${worldNumber}: ${worldName}`);
    
    // Background box
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, scaledHeight);
    
    // Border color based on world
    const worldColors = {
      1: '#FF5500', // Orange for world 1
      2: '#009688', // Teal for world 2
      3: '#03a9f4', // Blue for world 3
      4: '#9c27b0', // Purple for world 4
      5: '#f44336', // Red for world 5
      6: '#ff9800'  // Amber for world 6
    };
    
    const borderColor = worldColors[worldNumber] || '#FF5500';
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, scaledHeight);
    
    // World text
    this.ctx.fillStyle = borderColor;
    this.ctx.font = `bold ${16 * scale}px Arial`;
    this.ctx.textAlign = 'left';
    
    // Check if we need to truncate the world name for smaller screens
    const displayName = width < 180 ? `W${worldNumber}` : `WORLD ${worldNumber}: ${worldName}`;
    this.ctx.fillText(displayName, x + 10, y + 20 * scale);
    
    // World progress bar - RESTORED
    const barWidth = width - 20;
    const worldProgress = this.gameState.getWorldProgressPercentage();
    
    // Progress bar background
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth, 10 * scale);
    
    // Progress bar fill
    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth * (worldProgress / 100), 10 * scale);
    
    // Progress percentage text
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${12 * scale}px Arial`;
    this.ctx.fillText(`Progress: ${worldProgress.toFixed(1)}%`, x + 10, y + 50 * scale);
    
    // Reset text alignment
    this.ctx.textAlign = 'left';
  }
  
  /**
   * Draw the stats panel (time, altitude, XP)
   */
  drawStatsPanel(x, y, width, height) {
    // Stats background
    this.ctx.fillStyle = 'rgba(50, 20, 0, 0.8)'; // Darker brown background
    this.roundRect(x, y, width, height, 8, true);
    
    // Text styling
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    this.ctx.font = '14px Arial';
    
    // Format and display time
    const minutes = Math.floor(this.gameState.survivalTime / 60);
    const seconds = Math.floor(this.gameState.survivalTime % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Tightened vertical spacing
    this.ctx.fillText(`Time: ${timeText}`, x + 10, y + 20);
    this.ctx.fillText(`Altitude: ${Math.abs(Math.floor(this.gameState.altitude))}m`, x + 10, y + 40);
    this.ctx.fillText(`XP: ${this.gameState.xp}`, x + 10, y + 60);
  }
  
  /**
   * Helper method to draw rounded rectangles
   */
  roundRect(x, y, width, height, radius, fill, stroke) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    if (fill) {
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.stroke();
    }
  }
} 