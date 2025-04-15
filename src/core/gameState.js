import { PlayerProgress } from '../utils/playerProgress.js';
export class GameState {
  constructor() {
    // Create player progress instance
    this.playerProgress = new PlayerProgress();
    
    // Try to load saved progress first
    const savedData = this.playerProgress.loadProgress();
    
    // Initialize with defaults and then apply any saved data
    this.reset();
    
    // Apply saved progress if available
    if (savedData) {
      this.playerProgress.applyToGameState(this);
    }
  }
  
  reset() {
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;
    this.phoenixGems = 0;
    this.survivalTime = 0;
    this.altitude = 0;
    this.worldComplete = false;
    this.gameOver = false;
    this.currentWorld = 1; // Store world number instead of name
    this.worldsCompleted = [];
    this.totalLevelTime = 120; // Default level time (2 minutes)
  }
  
  addXP(amount) {
    this.xp += amount;
    
    // Check level up
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.phoenixGems++;
      
      // Exponential XP curve
      this.xpToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
      
      // Explicitly heal the phoenix when leveling up during gameplay
      if (window.gameInstance?.isRunning && window.gameInstance?.phoenix && window.rankSystem) {
        window.rankSystem.healPhoenixOnLevelUp();
        console.log(`LEVEL UP! Triggered healing at game level ${this.level}`);
      }
    }
    
    // Save progress after gaining XP
    this.saveProgress();
    
    // Do NOT update the rank system during active gameplay
    // Rank XP will be added at game over or world complete instead
    // This keeps game XP separate from the global rank system
    
    // Only update rank UI if we're on the main menu (not during gameplay)
    if (window.rankSystem && !window.gameInstance?.isRunning) {
      // Add some XP to the global rank
      window.rankSystem.addXP(Math.round(amount * 0.5));
      
      // Update the rank bar UI if it exists
      const rankBarElement = document.querySelector('.rank-bar-container');
      if (rankBarElement) {
        // Remove the old rank bar
        rankBarElement.remove();
        
        // Render a new one with updated data
        window.rankSystem.renderRankBar(document.getElementById('renderDiv'));
      }
    }
  }
  
  /**
   * Saves the current game state to persistent storage
   */
  saveProgress() {
    if (this.playerProgress) {
      this.playerProgress.saveProgress(this);
    }
  }
  
  /**
   * Mark the current world as completed
   */
  completeWorld() {
    this.worldComplete = true;
    if (!this.worldsCompleted.includes(this.currentWorld)) {
      this.worldsCompleted.push(this.currentWorld);
    }
    this.phoenixGems += 5;
    
    // Save progress after completing a world
    this.saveProgress();
  }
  
  /**
   * Set the total level time for the current world
   * @param {number} seconds - The time in seconds to complete the level
   */
  setTotalLevelTime(seconds) {
    this.totalLevelTime = seconds;
    console.log(`Level time set to ${seconds} seconds for world ${this.currentWorld}`);
  }
  
  /**
   * Get the total time needed to complete the current level
   * @returns {number} Time in seconds
   */
  getTotalLevelTime() {
    return this.totalLevelTime || 120; // Default to 2 minutes if not set
  }
  
  /**
   * Calculate and return the current world progress percentage
   * @returns {number} Progress percentage (0-100)
   */
  getWorldProgressPercentage() {
    const totalTime = this.getTotalLevelTime();
    if (totalTime <= 0) return 0;
    
    const progress = (this.survivalTime / totalTime) * 100;
    return Math.min(100, Math.max(0, progress)); // Clamp between 0-100
  }
}