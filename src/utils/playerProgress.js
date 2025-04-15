/**
 * PlayerProgress Class - Manages saving and loading player progress
 * 
 * This class handles:
 * - Saving game state to local storage (level, XP, gems, worlds completed)
 * - Loading previously saved progress
 * - Providing default values for new players
 * - Versioning for future compatibility
 */
export class PlayerProgress {
    constructor() {
      this.storageKey = 'phoenix_progress';
      this.version = 1; // For future compatibility
      
      // Default values for a new player
      this.defaults = {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        phoenixGems: 0,
        worldsCompleted: [],
        highestAltitude: 0,
        longestSurvivalTime: 0
      };
      
      // Current player data (will be loaded from storage or defaults)
      this.data = { ...this.defaults };
    }
    
    /**
     * Loads player progress from local storage
     * @returns {Object} The loaded player data
     */
    loadProgress() {
      try {
        const savedData = localStorage.getItem(this.storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Merge saved data with defaults to handle missing properties
          this.data = {
            ...this.defaults,
            ...parsedData
          };
          
          console.log('Loaded player progress:', this.data);
        } else {
          console.log('No saved progress found, using defaults');
          this.data = { ...this.defaults };
        }
      } catch (error) {
        console.error('Error loading player progress:', error);
        this.data = { ...this.defaults };
      }
      
      return this.data;
    }
    
    /**
     * Saves current game state to local storage
     * @param {GameState} gameState - The current game state to save
     * @returns {boolean} Success of save operation
     */
    saveProgress(gameState) {
      try {
        if (!gameState) {
          console.error('No game state provided to save');
          return false;
        }
        
        // Update our data from the game state
        this.data.level = gameState.level;
        this.data.xp = gameState.xp;
        this.data.xpToNextLevel = gameState.xpToNextLevel;
        this.data.phoenixGems = gameState.phoenixGems;
        this.data.worldsCompleted = [...gameState.worldsCompleted];
        
        // Update high scores if current values are higher
        if (Math.abs(gameState.altitude) > this.data.highestAltitude) {
          this.data.highestAltitude = Math.abs(gameState.altitude);
        }
        
        if (gameState.survivalTime > this.data.longestSurvivalTime) {
          this.data.longestSurvivalTime = gameState.survivalTime;
        }
        
        // Add version for future compatibility
        const dataToSave = {
          ...this.data,
          version: this.version,
          lastSaved: new Date().toISOString()
        };
        
        // Save to local storage
        localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
        console.log('Progress saved successfully');
        return true;
      } catch (error) {
        console.error('Error saving player progress:', error);
        return false;
      }
    }
    
    /**
     * Apply loaded progress to the game state
     * @param {GameState} gameState - The game state to update with saved progress
     */
    applyToGameState(gameState) {
      if (!gameState) return;
      
      gameState.level = this.data.level;
      gameState.xp = this.data.xp;
      gameState.xpToNextLevel = this.data.xpToNextLevel;
      gameState.phoenixGems = this.data.phoenixGems;
      gameState.worldsCompleted = [...this.data.worldsCompleted];
    }
    
    /**
     * Resets player progress to defaults
     * @returns {boolean} Success of reset operation
     */
    resetProgress() {
      try {
        this.data = { ...this.defaults };
        localStorage.removeItem(this.storageKey);
        return true;
      } catch (error) {
        console.error('Error resetting player progress:', error);
        return false;
      }
    }
    
    /**
     * Get player's high score data
     * @returns {Object} Object containing high score information
     */
    getHighScores() {
      return {
        highestAltitude: this.data.highestAltitude,
        longestSurvivalTime: this.data.longestSurvivalTime
      };
    }
  }