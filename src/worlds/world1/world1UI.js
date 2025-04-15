/**
 * World 1 UI - Specific UI elements for World 1
 * This file contains UI elements that only show in World 1
 */

export class World1UI {
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
    // Check if we already have original UI methods
    if (window.gameInstance && window.gameInstance.ui && !this.initialized) {
      this.ui = window.gameInstance.ui;
      this.initialized = true;
      
      console.log('World 1 UI initialized');
    }
  }
  
  /**
   * Draw World 1 specific UI
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  draw(width, height) {
    if (!this.initialized || !this.ui) {
      return;
    }
    
    // Only draw if the game is active (not paused, not game over)
    // and if the current world is world 1
    if (this.game.isRunning && 
        !this.gameState.gameOver && 
        !this.gameState.worldComplete &&
        this.gameState.currentWorld === 1) {
      
      // Determine if we're in portrait or landscape mode
      const isPortrait = height > width;
      
      // Adjust UI positions and sizes based on orientation
      const uiScale = isPortrait ? 0.8 : 1.0; // Scale UI elements smaller in portrait
      const mainUiWidth = Math.min(200, width * 0.4); // Limit size on narrow screens
      
      // Position UI elements differently based on orientation
      if (isPortrait) {
        // Draw UI at top and bottom in portrait mode
        this.drawLevelAndXP(20, 20, mainUiWidth, uiScale);
        this.drawWorldInfo(width - mainUiWidth - 20, 20, mainUiWidth, 1);
        
        // Draw gameplay indicators panel (health, level, altitude, time, progress)
        this.drawGameplayIndicators(width, height, isPortrait);
      } else {
        // Standard layout for landscape
        this.drawLevelAndXP(20, 20, mainUiWidth, uiScale);
        this.drawWorldInfo(width - mainUiWidth - 20, 20, mainUiWidth, 1);
        
        // Draw gameplay indicators panel (health, level, altitude, time, progress)
        this.drawGameplayIndicators(width, height, isPortrait);
      }
    }
  }
  
  /**
   * Draws level and XP information
   */
  drawLevelAndXP(x, y, width, scale = 1.0) {
    const rankSystem = window.rankSystem;
    
    if (!rankSystem) {
      return;
    }
    
    const rank = rankSystem.getCurrentRank();
    const progress = rankSystem.getRankProgress();
    const currentXP = rankSystem.currentXP;
    const xpForNextRank = rankSystem.getXPForNextRank();
    
    // Background box
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, 70 * scale);
    this.ctx.strokeStyle = '#00CC33';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, 70 * scale);
    
    // Level text
    this.ctx.fillStyle = '#00CC33';
    this.ctx.font = `bold ${16 * scale}px Arial`;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`LEVEL ${rank}`, x + 10, y + 20 * scale);
    
    // Progress bar
    const barWidth = width - 20;
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth, 10 * scale);
    this.ctx.fillStyle = '#00CC33';
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth * progress, 10 * scale);
    
    // XP text
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${12 * scale}px Arial`;
    this.ctx.fillText(`XP: ${currentXP}/${xpForNextRank}`, x + 10, y + 50 * scale);
    
    // Reset text alignment
    this.ctx.textAlign = 'left';
  }
  
  /**
   * Draws world information
   */
  drawWorldInfo(x, y, width, worldNumber) {
    const scale = width / 300; // Scale based on width
    const scaledHeight = 70 * scale;
    let worldName = "Unknown World";
    
    // Try to get world name from the worldManager
    if (window.gameInstance?.worldManager) {
      worldName = window.gameInstance.worldManager.getWorldName(worldNumber);
    }
    
    // Background box
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, scaledHeight);
    this.ctx.strokeStyle = '#FF5500';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, scaledHeight);
    
    // World text
    this.ctx.fillStyle = '#FF5500';
    this.ctx.font = `bold ${16 * scale}px Arial`;
    this.ctx.textAlign = 'left';
    
    // Check if we need to truncate the world name for smaller screens
    const displayName = width < 180 ? `W${worldNumber}` : `WORLD ${worldNumber}: ${worldName}`;
    this.ctx.fillText(displayName, x + 10, y + 20 * scale);
    
    // World progress bar
    const barWidth = width - 20;
    const worldProgress = this.gameState.getWorldProgressPercentage();
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth, 10 * scale);
    this.ctx.fillStyle = '#FF5500';
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth * (worldProgress / 100), 10 * scale);
    
    // Progress text
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${12 * scale}px Arial`;
    this.ctx.fillText(`Progress: ${Math.floor(worldProgress)}%`, x + 10, y + 50 * scale);
    
    // Reset text alignment
    this.ctx.textAlign = 'left';
  }
  
  /**
   * Draw gameplay indicators (progress, time, altitude)
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height 
   * @param {boolean} isPortrait - Whether the device is in portrait mode
   */
  drawGameplayIndicators(width, height, isPortrait) {
    // Define reusable dimensions and spacings
    const padding = 15;
    const leftMargin = padding;
    const barWidth = Math.min(200, width * 0.25);
    const barHeight = 20;
    const barSpacing = 10;
    
    // Top left group - position parameters
    const topLeftX = leftMargin;
    const topLeftY = padding;
    
    // Calculate health percentage
    const healthPercent = this.phoenix ? this.phoenix.getHealthPercent() : 1.0;
    
    // Draw health bar in top left
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.roundRect(topLeftX, topLeftY, barWidth, barHeight, 5, true);
    
    // Draw health bar fill
    const healthGradient = this.ctx.createLinearGradient(topLeftX, topLeftY, topLeftX + barWidth * healthPercent, topLeftY);
    healthGradient.addColorStop(0, '#FF5500');
    healthGradient.addColorStop(1, '#FF9900');
    this.ctx.fillStyle = healthGradient;
    this.roundRect(topLeftX, topLeftY, barWidth * healthPercent, barHeight, 5, true);
    
    // Health bar text
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Health: ${Math.round(healthPercent * 100)}%`, topLeftX + barWidth / 2, topLeftY + barHeight / 2 + 4);
    
    // Use the game's current level instead of the global rank
    let levelProgress = 0;
    let currentLevel = this.gameState ? this.gameState.level : 1;
    
    // Calculate level progress based on game XP, not rank XP
    if (this.gameState && this.gameState.xpToNextLevel > 0) {
      levelProgress = this.gameState.xp / this.gameState.xpToNextLevel;
    }
    
    // Draw level progress bar below health
    const levelBarY = topLeftY + barHeight + barSpacing;
    
    // Level bar background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.roundRect(topLeftX, levelBarY, barWidth, barHeight, 5, true);
    
    // Level bar fill
    const levelGradient = this.ctx.createLinearGradient(topLeftX, levelBarY, topLeftX + barWidth * levelProgress, levelBarY);
    levelGradient.addColorStop(0, '#00CC33'); // Green
    levelGradient.addColorStop(1, '#66FF99');
    this.ctx.fillStyle = levelGradient;
    this.roundRect(topLeftX, levelBarY, barWidth * levelProgress, barHeight, 5, true);
    
    // Level bar text
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Level ${currentLevel}: ${Math.round(levelProgress * 100)}%`, topLeftX + barWidth / 2, levelBarY + barHeight / 2 + 4);
    
    // Bottom right panel for stats (time, altitude, etc.)
    const bottomRightX = width - padding - 150; // Width of stats panel
    const bottomRightY = height - padding - 120; // Height based on content
    
    // Stats background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.roundRect(bottomRightX, bottomRightY, 150, 120, 10, true);
    
    // Text styling
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    this.ctx.font = '14px Arial';
    
    // Format and display time
    const minutes = Math.floor(this.gameState.survivalTime / 60);
    const seconds = Math.floor(this.gameState.survivalTime % 60);
    const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    this.ctx.fillText(`Time: ${timeText}`, bottomRightX + 10, bottomRightY + 25);
    this.ctx.fillText(`Altitude: ${Math.abs(Math.floor(this.gameState.altitude))}m`, bottomRightX + 10, bottomRightY + 50);
    this.ctx.fillText(`XP: ${this.gameState.xp}`, bottomRightX + 10, bottomRightY + 75);
    
    // Draw progress percentage
    const totalLevelTime = this.gameState.getTotalLevelTime();
    const progressPercent = Math.min(100, (this.gameState.survivalTime / totalLevelTime) * 100);
    this.ctx.fillText(`Progress: ${progressPercent.toFixed(1)}%`, bottomRightX + 10, bottomRightY + 100);
  }
  
  /**
   * Creates a rounded rectangle path
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of rectangle
   * @param {number} height - Height of rectangle
   * @param {number} radius - Corner radius
   * @param {boolean} fill - Whether to fill the rectangle
   * @param {boolean} stroke - Whether to stroke the rectangle
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