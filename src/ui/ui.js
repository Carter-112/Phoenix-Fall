/**
 * UI Class - Manages all game interface elements
 * 
 * This class handles three main categories of UI elements:
 * 
 * 1. Gameplay UI - Shows during active gameplay:
 *    - Health bar
 *    - XP and level indicators
 *    - Progress and time displays
 *    - Altitude meter
 * 
 * 2. Game Over Screen - Shows when player dies:
 *    - Stats summary (altitude, time, XP)
 *    - Rank progress information
 *    - Restart button with animations
 * 
 * 3. World Complete Screen - Shows when player completes a world:
 *    - Time and XP statistics
 *    - Phoenix Gems earned
 *    - Rank progress information
 *    - Continue button with animations
 * 
 * The UI dynamically adapts to the current game state to show only relevant information.
 */
import { WorldManager } from '../core/WorldManager.js';

export class UI {
  constructor(game) {
    // Handle being initialized with a game object
    if (game && game.ctx) {
      this.ctx = game.ctx;
      this.gameState = game.gameState;
      this.phoenix = game.phoenix;
    } else {
      console.warn('UI initialized without valid game object or context');
      // Legacy constructor handling
      this.ctx = game; // First parameter was context in old code
      this.gameState = arguments[1];
      this.phoenix = arguments[2];
    }
    
    this.gameOverStartTime = null;
    this.worldCompleteStartTime = null;
    this.buttonPulseTime = 0;
    this.lastXPAmount = 0; // Track last XP amount to detect changes
    this.lastRankUpdateTime = 0; // Throttle rank updates
    
    // Message display
    this.messages = [];
    
    // Attach event listeners for UI buttons
    document.addEventListener('click', (e) => this.handleGameOverClick(e));
    document.addEventListener('click', (e) => this.handleWorldCompleteClick(e));
  }
  
  /**
   * Main draw method for UI - handles all UI rendering based on game state
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  draw(width, height) {
    // Check if canvas context is valid before attempting to draw
    if (!this.ctx || typeof this.ctx.save !== 'function') {
      console.warn('UI draw called with invalid canvas context');
      return;
    }
    
    // If no dimensions provided, don't attempt to draw
    if (!width || !height) {
      return;
    }
    
    this.ctx.save();
    
    // Don't disable UI for world complete or game over screens
    const shouldShowEndScreens = this.gameState && (this.gameState.worldComplete || this.gameState.gameOver);
    
    if (!shouldShowEndScreens && window.universalUIEnabled) {
      return;
    }
    
    // Only proceed if not disabled
    this.width = width;
    this.height = height;
    
    // Always ensure font settings are consistent
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    // Determine if we're in portrait or landscape mode
    const isPortrait = height > width;
    
    // Adjust UI positions and sizes based on orientation
    const uiScale = isPortrait ? 0.8 : 1.0; // Scale UI elements smaller in portrait
    const mainUiWidth = Math.min(200, width * 0.4); // Limit size on narrow screens
    
    // Draw gameplay UI elements only when the game is active
    if (!this.gameState.gameOver && !this.gameState.worldComplete) {
      // Position UI elements differently based on orientation
      if (isPortrait) {
        // Draw UI at top and bottom in portrait mode
        this.drawLevelAndXP(20, 20, mainUiWidth, uiScale);
        this.drawWorldInfo(width - mainUiWidth - 20, 20, mainUiWidth, this.gameState.currentWorld);
        
        // Draw gameplay indicators panel (health, level, altitude, time, progress)
        this.drawGameplayIndicators(width, height, isPortrait);
      } else {
        // Standard layout for landscape
        this.drawLevelAndXP(20, 20, mainUiWidth, uiScale);
        this.drawWorldInfo(width - mainUiWidth - 20, 20, mainUiWidth, this.gameState.currentWorld);
        
        // Draw gameplay indicators panel (health, level, altitude, time, progress)
        this.drawGameplayIndicators(width, height, isPortrait);
      }
    }
    
    // Get rank information if available
    const rankSystem = window.rankSystem;
    const rankInfo = rankSystem ? {
      currentRank: rankSystem.getCurrentRank(),
      progress: rankSystem.getRankProgress(),
      currentXP: rankSystem.currentXP,
      neededXP: rankSystem.getXPForNextRank()
    } : null;
    
    // Check if XP has changed and update rank display
    // Limit updates to once per second to avoid excessive DOM updates
    if (this.lastXPAmount !== this.gameState.xp && Date.now() - this.lastRankUpdateTime > 1000) {
      this.updateRankDisplayOnXPGain();
      this.lastXPAmount = this.gameState.xp;
      this.lastRankUpdateTime = Date.now();
    }
    
    // Get current minutes and seconds for various displays
    const minutes = Math.floor(this.gameState.survivalTime / 60);
    const seconds = Math.floor(this.gameState.survivalTime % 60);
    
    /* ===== GAMEPLAY UI SECTION ===== */
    // Only show gameplay UI if the game is active (not on menu, not game over, not world complete)
    // We consider the game active when the phoenix is alive and the game is not in a completion state
    // AND the game is actually running (not on main menu)
    const isGameActive = this.phoenix && 
                        this.phoenix.health > 0 && 
                        !this.gameState.gameOver && 
                        !this.gameState.worldComplete &&
                        window.gameInstance && 
                        window.gameInstance.isRunning;
    
    /* ===== GAME OVER SCREEN SECTION ===== */
    // Appears when phoenix health reaches zero
    // Shows game statistics and restart button
    if (this.gameState.gameOver) {
      // Store game over start time if it just became game over
      if (!this.gameOverStartTime && this.gameState.gameOver) {
        this.gameOverStartTime = Date.now();
        this.buttonPulseTime = 0;
        
        // Hide pause button when game ends
        if (window.gameInstance && window.gameInstance.pauseButton) {
          window.gameInstance.pauseButton.hide();
        }
      }
      
      // Calculate fade-in opacity (0 to 1 over 800ms)
      const timeSinceGameOver = Date.now() - (this.gameOverStartTime || 0);
      const fadeOpacity = Math.min(1, timeSinceGameOver / 800);
      
      // Dark semi-transparent background with fade-in
      this.ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * fadeOpacity})`;
      this.ctx.fillRect(0, 0, width, height);
      
      // Draw a stylized container
      const containerWidth = Math.min(400, width * 0.8);
      const containerHeight = 320;
      const containerX = width / 2 - containerWidth / 2;
      const containerY = height / 2 - containerHeight / 2;
      
      // Background panel
      this.ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
      this.roundRect(containerX, containerY, containerWidth, containerHeight, 15, true);
      
      // Border
      this.ctx.strokeStyle = '#FF5500';
      this.ctx.lineWidth = 3;
      this.roundRect(containerX, containerY, containerWidth, containerHeight, 15, false, true);
      
      // Title
      this.ctx.fillStyle = '#FF5500';
      this.ctx.textAlign = 'center';
      this.ctx.font = width < 400 ? '26px Arial' : '34px Arial';
      this.ctx.fillText('GAME OVER', width / 2, containerY + 50);
      
      // Stats with improved visual hierarchy
      const textX = width / 2;
      const fontSize = width < 400 ? 16 : 18;
      this.ctx.font = `${fontSize}px Arial`;
      
      // Stats labels in dark color
      this.ctx.fillStyle = '#FF5500';
      this.ctx.fillText('Altitude Reached:', textX, containerY + 90);
      this.ctx.fillText('Survival Time:', textX, containerY + 120);
      this.ctx.fillText('Progress:', textX, containerY + 150);
      this.ctx.fillText('XP Gained:', textX, containerY + 180);
      
      // Stats values in brighter color
      this.ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
      this.ctx.fillText(`${Math.abs(Math.floor(this.gameState.altitude))}m`, textX, containerY + 105);
      this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, textX, containerY + 135);
      
      // Calculate and display progress percentage
      const totalLevelTime = this.gameState.getTotalLevelTime();
      const progressPercent = Math.min(100, (this.gameState.survivalTime / totalLevelTime) * 100);
      this.ctx.fillText(`${progressPercent.toFixed(1)}%`, textX, containerY + 165);
      
      this.ctx.fillText(`${this.gameState.xp}`, textX, containerY + 200);
      
      // Draw rank progress if rank system is available
      if (rankSystem) {
        this.drawRankProgress(textX, containerY + 230, containerWidth * 0.8, 20, rankInfo);
      }
      
      // Add Exit to Menu button under Restart button
      // Calculate button pulse effect (grows and shrinks) for the menu button
      const menuButtonPulseTime = this.buttonPulseTime - 0.3; // Offset timing for visual interest
      const menuPulseFactor = 1 + Math.sin(menuButtonPulseTime) * 0.06; // Slightly less pulse than restart
      
      // Calculate button pulse effect (grows and shrinks)
      this.buttonPulseTime = (this.buttonPulseTime || 0) + 0.05;
      const pulseFactor = 1 + Math.sin(this.buttonPulseTime) * 0.08; // Pulse between 0.92 and 1.08 size
      
      // Apply fade-in to buttons as well
      const buttonOpacity = Math.min(1, (timeSinceGameOver - 400) / 600); // Start button fade slightly later
      
      // Restart button (black with orange text)
      const buttonWidth = Math.min(200, containerWidth * 0.7);
      const buttonHeight = 40;
      const buttonX = width / 2 - (buttonWidth * pulseFactor) / 2;
      const buttonY = containerY + containerHeight - 70 - ((pulseFactor - 1) * buttonHeight) / 2;
      
      // Button background with fade-in and pulse
      this.ctx.fillStyle = `rgba(0, 0, 0, ${buttonOpacity})`;
      this.roundRect(buttonX, buttonY, buttonWidth * pulseFactor, buttonHeight * pulseFactor, 20, true);
      
      // Button border with glow effect
      const glowWidth = 2 + Math.sin(this.buttonPulseTime * 2) * 1;
      this.ctx.strokeStyle = `rgba(255, 85, 0, ${buttonOpacity})`;
      this.ctx.lineWidth = glowWidth;
      this.roundRect(buttonX, buttonY, buttonWidth * pulseFactor, buttonHeight * pulseFactor, 20, false, true);
      
      // Button text with fade-in
      this.ctx.fillStyle = `rgba(255, 85, 0, ${buttonOpacity})`;
      this.ctx.font = '18px Arial';
      this.ctx.fillText('RESTART', width / 2, buttonY + 25 * pulseFactor);
      
      // Store restart button dimensions for click detection
      this.restartButtonArea = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth * pulseFactor,
        height: buttonHeight * pulseFactor
      };
      
      // Exit to Menu button (smaller, positioned below restart button)
      const menuButtonWidth = Math.min(180, containerWidth * 0.6);
      const menuButtonHeight = 35;
      const menuButtonX = width / 2 - (menuButtonWidth * menuPulseFactor) / 2;
      const menuButtonY = buttonY + buttonHeight * pulseFactor + 15; // Position below restart button
      
      // Menu button background with fade-in and pulse
      this.ctx.fillStyle = `rgba(40, 40, 40, ${buttonOpacity})`;
      this.roundRect(menuButtonX, menuButtonY, menuButtonWidth * menuPulseFactor, menuButtonHeight * menuPulseFactor, 15, true);
      
      // Menu button border with glow effect
      const menuGlowWidth = 1.5 + Math.sin(menuButtonPulseTime * 2) * 0.8;
      this.ctx.strokeStyle = `rgba(255, 200, 100, ${buttonOpacity})`;
      this.ctx.lineWidth = menuGlowWidth;
      this.roundRect(menuButtonX, menuButtonY, menuButtonWidth * menuPulseFactor, menuButtonHeight * menuPulseFactor, 15, false, true);
      
      // Menu button text with fade-in
      this.ctx.fillStyle = `rgba(255, 200, 100, ${buttonOpacity})`;
      this.ctx.font = '16px Arial';
      this.ctx.fillText('EXIT TO MENU', width / 2, menuButtonY + 23 * menuPulseFactor);
      
      // Store exit button dimensions for click detection
      this.exitButtonArea = {
        x: menuButtonX,
        y: menuButtonY,
        width: menuButtonWidth * menuPulseFactor,
        height: menuButtonHeight * menuPulseFactor
      };
    }
    
    /* ===== WORLD COMPLETE SCREEN SECTION ===== */
    // Appears when player successfully completes a level
    // Shows statistics, rewards and continue button
    if (this.gameState.worldComplete) {
      // Store world complete start time if it just became world complete
      if (!this.worldCompleteStartTime && this.gameState.worldComplete) {
        this.worldCompleteStartTime = Date.now();
        this.buttonPulseTime = 0;
        
        // Hide pause button when world is complete
        if (window.gameInstance && window.gameInstance.pauseButton) {
          window.gameInstance.pauseButton.hide();
        }
        
        console.log("World complete screen displayed - UI handler triggered");
      }
      
      // Calculate fade-in opacity (0 to 1 over 800ms)
      const timeSinceComplete = Date.now() - (this.worldCompleteStartTime || 0);
      const fadeOpacity = Math.min(1, timeSinceComplete / 800);
      
      // Dark semi-transparent background with fade-in
      this.ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * fadeOpacity})`;
      this.ctx.fillRect(0, 0, width, height);
      
      // Draw a stylized container
      const containerWidth = Math.min(400, width * 0.8);
      const containerHeight = 360; // Increased height to accommodate Progress label and rank progress bar
      const containerX = width / 2 - containerWidth / 2;
      const containerY = height / 2 - containerHeight / 2;
      
      // Background panel
      this.ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
      this.roundRect(containerX, containerY, containerWidth, containerHeight, 15, true);
      
      // Border
      this.ctx.strokeStyle = '#FF5500';
      this.ctx.lineWidth = 3;
      this.roundRect(containerX, containerY, containerWidth, containerHeight, 15, false, true);
      
      // Title
      this.ctx.fillStyle = '#FF5500';
      this.ctx.textAlign = 'center';
      this.ctx.font = width < 400 ? '26px Arial' : '34px Arial';
      this.ctx.fillText('WORLD COMPLETE!', width / 2, containerY + 50);
      
      // Stats with improved visual hierarchy
      const textX = width / 2;
      const fontSize = width < 400 ? 16 : 18;
      this.ctx.font = `${fontSize}px Arial`;
      
      // Stats labels in dark color
      this.ctx.fillStyle = '#FF5500';
      this.ctx.fillText('Survival Time:', textX, containerY + 100);
      this.ctx.fillText('XP Gained:', textX, containerY + 140);
      this.ctx.fillText('Phoenix Gems Earned:', textX, containerY + 180);
      this.ctx.fillText('Progress:', textX, containerY + 220);
      
      // Stats values in brighter color
      this.ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
      this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, textX, containerY + 120);
      this.ctx.fillText(`${this.gameState.xp}`, textX, containerY + 160);
      this.ctx.fillText('5', textX, containerY + 200);
      
      // Add progress percentage value for consistency
      const totalLevelTime = this.gameState.getTotalLevelTime();
      const progressPercent = Math.min(100, (this.gameState.survivalTime / totalLevelTime) * 100);
      this.ctx.fillText(`${progressPercent.toFixed(1)}%`, textX, containerY + 240);
      
      // Draw rank progress if rank system is available
      if (rankSystem) {
        this.drawRankProgress(textX, containerY + 260, containerWidth * 0.8, 20, rankInfo);
      }
      
      // Calculate button pulse effect (grows and shrinks)
      this.buttonPulseTime = (this.buttonPulseTime || 0) + 0.05;
      const pulseFactor = 1 + Math.sin(this.buttonPulseTime) * 0.08; // Pulse between 0.92 and 1.08 size
      
      // Apply fade-in to buttons as well
      const buttonOpacity = Math.min(1, (timeSinceComplete - 400) / 600); // Start button fade slightly later
      
      // Continue button (black with orange text) - centered position
      const buttonWidth = Math.min(220, containerWidth * 0.8);
      const buttonHeight = 40;
      const buttonX = width / 2 - (buttonWidth * pulseFactor) / 2;
      const buttonY = containerY + containerHeight - 70; // Adjusted to be centered
      
      // Button background with fade-in and pulse
      this.ctx.fillStyle = `rgba(0, 0, 0, ${buttonOpacity})`;
      this.roundRect(buttonX, buttonY, buttonWidth * pulseFactor, buttonHeight * pulseFactor, 20, true);
      
      // Button border with glow effect
      const glowWidth = 2 + Math.sin(this.buttonPulseTime * 2) * 1;
      this.ctx.strokeStyle = `rgba(255, 85, 0, ${buttonOpacity})`;
      this.ctx.lineWidth = glowWidth;
      this.roundRect(buttonX, buttonY, buttonWidth * pulseFactor, buttonHeight * pulseFactor, 20, false, true);
      
      // Button text with fade-in
      this.ctx.fillStyle = `rgba(255, 85, 0, ${buttonOpacity})`;
      this.ctx.font = '18px Arial';
      this.ctx.fillText('CONTINUE', width / 2, buttonY + 25 * pulseFactor);
      
      // Store world complete button hitboxes for click handling
      this.worldCompleteButtons = {
        continue: {
          x: buttonX,
          y: buttonY,
          width: buttonWidth * pulseFactor,
          height: buttonHeight * pulseFactor
        },
        exitToMenu: {
          x: buttonX,
          y: buttonY + buttonHeight * pulseFactor + 15,
          width: buttonWidth * pulseFactor * 0.8,
          height: buttonHeight * pulseFactor * 0.8
        }
      };
    }
    
    // Always draw messages regardless of game state
    this.drawMessages(width, height);
    
    this.ctx.restore();
  }
  
  /* ===== HELPER METHODS SECTION ===== */
  
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
  
  /**
   * Renders health bar with color gradients based on health percentage
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of health bar
   * @param {number} height - Height of health bar
   * @param {number} healthPercent - Current health percentage (0-1)
   */
  drawHealthBar(x, y, width, height, healthPercent) {
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, width, height);
    
    // Calculate health width
    const healthWidth = Math.max(0, width * healthPercent);
    
    // Create gradient based on health
    let gradient;
    if (healthPercent > 0.6) {
      // Green to yellow for high health
      gradient = this.ctx.createLinearGradient(x, 0, x + healthWidth, 0);
      gradient.addColorStop(0, 'rgba(50, 255, 50, 0.8)');
      gradient.addColorStop(1, 'rgba(200, 255, 50, 0.8)');
    } else if (healthPercent > 0.3) {
      // Yellow to orange for medium health
      gradient = this.ctx.createLinearGradient(x, 0, x + healthWidth, 0);
      gradient.addColorStop(0, 'rgba(255, 220, 50, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 150, 50, 0.8)');
    } else {
      // Red for low health with pulsing effect
      const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() / 200);
      gradient = this.ctx.createLinearGradient(x, 0, x + healthWidth, 0);
      gradient.addColorStop(0, `rgba(255, 50, 50, ${pulseIntensity})`);
      gradient.addColorStop(1, `rgba(255, 100, 50, ${pulseIntensity})`);
    }
    
    // Fill health bar
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, healthWidth, height);
    
    // Draw border
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
    
    // Add health label
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('HEALTH', x + width / 2, y + height - 3);
  }
  
  /**
   * Renders rank progress bar with player's current rank information
   * @param {number} x - X position (center of bar)
   * @param {number} y - Y position
   * @param {number} width - Width of progress bar
   * @param {number} height - Height of progress bar
   * @param {Object} rankInfo - Contains rank data (currentRank, progress, currentXP, neededXP)
   */
  drawRankProgress(x, y, width, height, rankInfo) {
    if (!rankInfo) return;
    
    // Center the bar
    const barX = x - width / 2;
    
    // Title
    this.ctx.fillStyle = '#FF5500';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Global Rank: ${rankInfo.currentRank}`, x, y - 10);
    
    // Background
    this.ctx.fillStyle = 'rgba(40, 40, 40, 0.7)';
    this.roundRect(barX, y, width, height, 5, true);
    
    // Progress
    const progressWidth = Math.max(0, width * rankInfo.progress);
    
    // Create gradient for progress
    const gradient = this.ctx.createLinearGradient(barX, 0, barX + progressWidth, 0);
    gradient.addColorStop(0, 'rgba(255, 50, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 150, 0, 0.8)');
    
    this.ctx.fillStyle = gradient;
    this.roundRect(barX, y, progressWidth, height, 5, true);
    
    // Border
    this.ctx.strokeStyle = 'rgba(255, 150, 0, 0.5)';
    this.ctx.lineWidth = 1;
    this.roundRect(barX, y, width, height, 5, false, true);
    
    // XP stats
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    // Check if max rank
    if (rankInfo.currentRank >= 100) {
      this.ctx.fillText(`Max Rank Achieved!`, x, y + height / 2 + 4);
    } else {
      // Show XP with formatted thousands separator for larger numbers
      const formattedCurrentXP = rankInfo.currentXP.toLocaleString();
      const formattedNeededXP = rankInfo.neededXP.toLocaleString();
      this.ctx.fillText(`${formattedCurrentXP}/${formattedNeededXP} XP (${Math.round(rankInfo.progress * 100)}%)`, x, y + height / 2 + 4);
    }
  }
  
  /**
   * Updates the rank display when XP is gained during gameplay
   * This ensures players see their rank progress in real-time
   */
  updateRankDisplayOnXPGain() {
    const rankSystem = window.rankSystem;
    if (!rankSystem) return;
    
    // Don't update rank display during active gameplay (when rank bar is hidden)
    const isGameActive = this.phoenix && 
                        this.phoenix.health > 0 && 
                        !this.gameState.gameOver && 
                        !this.gameState.worldComplete &&
                        window.gameInstance && 
                        window.gameInstance.isRunning;
                        
    if (isGameActive) {
      // Calculate XP bonus based on current game state
      // This mirrors the XP calculation in game.js for consistency
      const xpGained = Math.round(this.gameState.xp * 0.1); // Only a fraction of in-game XP is added during gameplay
      if (xpGained > 0) {
        // Add XP to rank system but NEVER show notifications during gameplay
        const showNotification = false; // Explicitly disable notifications
        rankSystem.addXP(xpGained, showNotification);
        
        // Store latest rankInfo for future UI updates
        this.currentRankInfo = {
          currentRank: rankSystem.getCurrentRank(),
          progress: rankSystem.getRankProgress(),
          currentXP: rankSystem.currentXP,
          neededXP: rankSystem.getXPForNextRank()
        };
      }
    }
  }
  
  /**
   * Draws level and XP information
   */
  drawLevelAndXP(x, y, width, scale = 1.0) {
    // DISABLED - UI is now handled by UniversalUI
    if (true) {
      return;
    }
    
    // Only proceed if not disabled
    const ctx = this.ctx;
    const level = this.gameState.level;
    const xp = this.gameState.xp;
    const xpToNextLevel = this.gameState.xpToNextLevel;
    
    // Draw level circle
    const circleRadius = 18 * scale;
    const circleX = x + circleRadius + 5;
    const circleY = y + circleRadius + 5;
    
    // Background box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, 70 * scale);
    ctx.strokeStyle = '#00CC33';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, 70 * scale);
    
    // Level text
    ctx.fillStyle = '#00CC33';
    ctx.font = `bold ${16 * scale}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL ${level}`, x + 10, y + 20 * scale);
    
    // Progress bar
    const barWidth = width - 20;
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(x + 10, y + 30 * scale, barWidth, 10 * scale);
    ctx.fillStyle = '#00CC33';
    ctx.fillRect(x + 10, y + 30 * scale, barWidth * xp / xpToNextLevel, 10 * scale);
    
    // XP text
    ctx.fillStyle = 'white';
    ctx.font = `${12 * scale}px Arial`;
    ctx.fillText(`XP: ${xp}/${xpToNextLevel}`, x + 10, y + 50 * scale);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  }
  
  /**
   * Draws world information
   */
  drawWorldInfo(x, y, width, worldNumber) {
    // DISABLED: Using UniversalUI instead
    if (true) return;
    
    const scale = width / 300; // Scale based on width
    const scaledHeight = 120 * scale;
    
    // Background box
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, scaledHeight);
    
    // Border color based on world
    let borderColor = '#FF5500';
    if (worldNumber === 2) borderColor = '#009688';
    if (worldNumber === 3) borderColor = '#03a9f4';
    if (worldNumber === 4) borderColor = '#9c27b0';
    if (worldNumber === 5) borderColor = '#f44336';
    if (worldNumber === 6) borderColor = '#ff9800';
    
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, scaledHeight);
    
    // World text
    this.ctx.fillStyle = borderColor;
    this.ctx.font = `bold ${16 * scale}px Arial`;
    this.ctx.textAlign = 'left';
    
    let worldName = "Volcanic Cradle";
    if (worldNumber === 2) worldName = "Ashspire Ruins";
    if (worldNumber === 3) worldName = "Solar Rift";
    if (worldNumber === 4) worldName = "Frost Void";
    if (worldNumber === 5) worldName = "Shadow Nexus";
    if (worldNumber === 6) worldName = "Celestial Domain";
    
    // Check if we need to truncate the world name for smaller screens
    let displayName = `WORLD ${worldNumber}: ${worldName}`;
    if (width < 180) {
      displayName = `W${worldNumber}`;
    }
    
    this.ctx.fillText(displayName, x + 10, y + 20 * scale);
    
    // World progress bar
    const barWidth = width - 20;
    const worldProgress = window.gameInstance.gameState.getWorldProgressPercentage();
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth, 10 * scale);
    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(x + 10, y + 30 * scale, barWidth * (worldProgress / 100), 10 * scale);
    
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
    // DISABLED - UI is now handled by UniversalUI
    if (true) {
      return;
    }
    
    // Only proceed if not disabled
    
    // Get current world number
    const worldNumber = this.gameState?.currentWorld || 1;
    
    // Skip drawing gameplay indicators for worlds 2-6
    if (worldNumber > 1) {
      return;
    }
    
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
   * Shows a temporary message during gameplay
   * @param {string} text - The message text to display
   * @param {string} color - The color of the message (CSS color)
   * @param {number} duration - How long to show the message in milliseconds
   * @param {string} position - Where to position the message ('top', 'center', or 'bottom')
   */
  showMessage(text, color = '#FFFFFF', duration = 2000, position = 'center') {
    const message = {
      text,
      color,
      position,
      startTime: Date.now(),
      duration,
      opacity: 0,
      fontSize: 24,
      id: Date.now() + Math.random()  // Unique ID for this message
    };
    
    this.messages.push(message);
    
    // Auto-remove the message after its duration
    setTimeout(() => {
      this.messages = this.messages.filter(m => m.id !== message.id);
    }, duration + 500); // Add 500ms for fade out animation
    
    return message.id;
  }
  
  /**
   * Draws all active messages
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  drawMessages(width, height) {
    const currentTime = Date.now();
    
    for (const message of this.messages) {
      const elapsed = currentTime - message.startTime;
      const remaining = message.duration - elapsed;
      
      // Calculate opacity (fade in / fade out)
      if (elapsed < 300) {
        // Fade in
        message.opacity = elapsed / 300;
      } else if (remaining < 500) {
        // Fade out
        message.opacity = remaining / 500;
      } else {
        // Full opacity
        message.opacity = 1;
      }
      
      // Skip if fully faded out
      if (message.opacity <= 0.01) continue;
      
      // Set text style
      this.ctx.font = `bold ${message.fontSize}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.globalAlpha = message.opacity;
      
      // Calculate y position based on message position preference
      let y;
      switch (message.position) {
        case 'top': y = height * 0.2; break;
        case 'bottom': y = height * 0.8; break;
        case 'center':
        default: y = height * 0.4; break;
      }
      
      // Draw text shadow for better visibility
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillText(message.text, width / 2 + 2, y + 2);
      
      // Draw main text
      this.ctx.fillStyle = message.color;
      this.ctx.fillText(message.text, width / 2, y);
      
      // Reset opacity
      this.ctx.globalAlpha = 1;
    }
  }
  
  /**
   * Explicitly updates the level and XP display
   * This method is called when needing to force-update the UI
   * @param {number} level - The game level to display
   * @param {number} xp - The current XP amount
   */
  updateLevelDisplay(level, xp) {
    // Update the gameState values
    if (this.gameState) {
      this.gameState.level = level;
      this.gameState.xp = xp;
      
      // Also update XP to next level based on the new level
      this.gameState.xpToNextLevel = 100 * Math.pow(1.5, level - 1);
      
      console.log(`UI updated to display Level: ${level}, XP: ${xp}/${this.gameState.xpToNextLevel}`);
    }
    
    // Force redraw of the UI
    if (window.innerWidth && window.innerHeight) {
      this.draw(window.innerWidth, window.innerHeight);
    }
  }
  
  // Handle clicks on game over screen buttons
  handleGameOverClick(event) {
    // Only process clicks if game is over
    if (!this.gameState || !this.gameState.gameOver) return;
    
    // Convert click position to canvas coordinates
    const canvasRect = this.ctx.canvas.getBoundingClientRect();
    const clickX = event.clientX - canvasRect.left;
    const clickY = event.clientY - canvasRect.top;
    
    // Check if restart button was clicked
    if (this.restartButtonArea && 
        clickX >= this.restartButtonArea.x && 
        clickX <= this.restartButtonArea.x + this.restartButtonArea.width &&
        clickY >= this.restartButtonArea.y && 
        clickY <= this.restartButtonArea.y + this.restartButtonArea.height) {
      
      console.log('Restart button clicked');
      
      // Play button sound if available
      if (this.audioSystem) {
        this.audioSystem.playSound('button', 0.5);
      }
      
      // Reset game
      if (window.gameInstance) {
        window.gameInstance.restart();
      }
    }
    
    // Check if exit to menu button was clicked
    if (this.exitButtonArea && 
        clickX >= this.exitButtonArea.x && 
        clickX <= this.exitButtonArea.x + this.exitButtonArea.width &&
        clickY >= this.exitButtonArea.y && 
        clickY <= this.exitButtonArea.y + this.exitButtonArea.height) {
      
      console.log('Exit to menu button clicked');
      
      // Play button sound if available
      if (this.audioSystem) {
        this.audioSystem.playSound('button', 0.5);
      }
      
      // Return to main menu
      if (window.gameInstance) {
        window.gameInstance.exitToMainMenu();
      }
    }
  }
  
  // Handle clicks on world complete screen buttons
  handleWorldCompleteClick(event) {
    // Only process clicks if world is complete
    if (!this.gameState || !this.gameState.worldComplete) return;
    
    // Convert click position to canvas coordinates
    const canvasRect = this.ctx.canvas.getBoundingClientRect();
    const clickX = event.clientX - canvasRect.left;
    const clickY = event.clientY - canvasRect.top;
    
    // Check if continue button was clicked
    if (this.worldCompleteButtons && 
        this.worldCompleteButtons.continue &&
        clickX >= this.worldCompleteButtons.continue.x && 
        clickX <= this.worldCompleteButtons.continue.x + this.worldCompleteButtons.continue.width &&
        clickY >= this.worldCompleteButtons.continue.y && 
        clickY <= this.worldCompleteButtons.continue.y + this.worldCompleteButtons.continue.height) {
      
      console.log('Continue button clicked on world complete screen');
      
      // Play button sound if available
      if (this.audioSystem) {
        this.audioSystem.playSound('button', 0.5);
      }
      
      // Re-enable universal UI
      window.universalUIEnabled = true;
      
      // Return to menu - using the continue button to go back to the main menu
      if (window.gameInstance) {
        window.gameInstance.exitToMainMenu();
      }
    }
  }
}