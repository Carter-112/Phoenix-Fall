/**
 * WorldProgressionSystem - Manages unlocking of worlds, difficulty scaling, and progress persistence
 * 
 * Features:
 * - Tracks which worlds have been unlocked by the player
 * - Manages world-specific difficulty settings
 * - Persists progress to localStorage
 * - Handles unlocking new worlds when previous worlds are completed
 */
export class WorldProgressionSystem {
  constructor() {
    this.maxWorlds = 6; // Updated to include World 6
    this.currentWorld = 1; // Default to World 1
    this.unlockedWorlds = [1]; // World 1 is always unlocked by default
    this.worldDifficultySettings = {
      1: { enemySpeed: 1.0, enemySpawnRate: 1.0, emberValue: 1, levelDuration: 120 },
      2: { enemySpeed: 1.2, enemySpawnRate: 1.3, emberValue: 2, levelDuration: 150 },
      3: { enemySpeed: 1.4, enemySpawnRate: 1.5, emberValue: 3, levelDuration: 180 },
      4: { enemySpeed: 1.6, enemySpawnRate: 1.8, emberValue: 4, levelDuration: 210 },
      5: { enemySpeed: 2.0, enemySpawnRate: 2.0, emberValue: 5, levelDuration: 240 },
      6: { enemySpeed: 2.5, enemySpawnRate: 2.2, emberValue: 6, levelDuration: 270 }
    };
    
    // Load saved progress from localStorage
    this.loadProgress();
  }
  
  /**
   * Loads world progress from localStorage
   */
  loadProgress() {
    try {
      const savedData = localStorage.getItem('worldProgress');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Validate the loaded data structure
        if (parsedData && 
            Array.isArray(parsedData.unlockedWorlds) && 
            typeof parsedData.currentWorld === 'number') {
          
          this.unlockedWorlds = parsedData.unlockedWorlds;
          this.currentWorld = parsedData.currentWorld;
          
          console.log('Loaded world progress:', this.unlockedWorlds, this.currentWorld);
        } else {
          console.warn('Invalid world progress data structure, using defaults');
        }
      } else {
        console.log('No saved world progress found, using defaults');
      }
    } catch (error) {
      console.error('Error loading world progress:', error);
      // Reset to defaults on error
      this.unlockedWorlds = [1];
      this.currentWorld = 1;
    }
  }
  
  /**
   * Saves current world progress to localStorage
   */
  saveProgress() {
    try {
      const dataToSave = {
        unlockedWorlds: this.unlockedWorlds,
        currentWorld: this.currentWorld
      };
      
      localStorage.setItem('worldProgress', JSON.stringify(dataToSave));
      console.log('World progress saved successfully');
    } catch (error) {
      console.error('Error saving world progress:', error);
    }
  }
  
  /**
   * Returns the current active world number
   * @returns {number} Current world number
   */
  getCurrentWorld() {
    return this.currentWorld;
  }
  
  /**
   * Sets the current active world
   * @param {number} worldNumber - World to set as current
   * @returns {boolean} Whether the world was successfully changed
   */
  setCurrentWorld(worldNumber) {
    // Check if the requested world is valid and unlocked
    if (worldNumber < 1 || worldNumber > this.maxWorlds) {
      console.warn(`Invalid world number: ${worldNumber}`);
      return false;
    }
    
    if (!this.isWorldUnlocked(worldNumber)) {
      console.warn(`World ${worldNumber} is not yet unlocked`);
      return false;
    }
    
    // Set the current world and save progress
    this.currentWorld = worldNumber;
    this.saveProgress();
    console.log(`Current world set to ${worldNumber}`);
    return true;
  }
  
  /**
   * Checks if a specific world is unlocked
   * @param {number} worldNumber - World to check
   * @returns {boolean} Whether the world is unlocked
   */
  isWorldUnlocked(worldNumber) {
    return this.unlockedWorlds.includes(worldNumber);
  }
  
  /**
   * Gets the list of all unlocked worlds
   * @returns {number[]} Array of unlocked world numbers
   */
  getUnlockedWorlds() {
    return [...this.unlockedWorlds];
  }
  
  /**
   * Unlocks a new world if it isn't already unlocked
   * @param {number} worldNumber - World to unlock
   * @returns {boolean} Whether the world was newly unlocked
   */
  unlockWorld(worldNumber) {
    // Validate world number
    if (worldNumber < 1 || worldNumber > this.maxWorlds) {
      console.warn(`Invalid world number: ${worldNumber}`);
      return false;
    }
    
    // Check if already unlocked
    if (this.isWorldUnlocked(worldNumber)) {
      return false; // Already unlocked
    }
    
    // Unlock the world
    this.unlockedWorlds.push(worldNumber);
    
    // Sort for consistency
    this.unlockedWorlds.sort((a, b) => a - b);
    
    // Save the updated progress
    this.saveProgress();
    
    // Play an unlock sound if sound manager is available
    if (window.gameInstance && window.gameInstance.soundManager) {
      try {
        window.gameInstance.soundManager.playSound('achievement', 0.7);
      } catch (error) {
        console.log('Could not play unlock sound');
      }
    }
    
    console.log(`World ${worldNumber} unlocked!`);
    return true;
  }
  
  /**
   * Called when a world is completed
   * Unlocks the next world if available
   * @param {number} completedWorld - The world that was completed
   * @returns {Object} Status of the operation including next world if unlocked
   */
  completeWorld(completedWorld) {
    // Validate completed world
    if (!this.isWorldUnlocked(completedWorld)) {
      console.warn(`Cannot complete World ${completedWorld} as it is not unlocked`);
      return { success: false };
    }
    
    // Calculate next world
    const nextWorld = completedWorld + 1;
    
    // Check if there is a next world to unlock
    if (nextWorld <= this.maxWorlds) {
      const newlyUnlocked = this.unlockWorld(nextWorld);
      
      return {
        success: true,
        nextWorld: nextWorld,
        newlyUnlocked: newlyUnlocked
      };
    }
    
    // No more worlds to unlock
    return {
      success: true,
      isLastWorld: true
    };
  }
  
  /**
   * Gets difficulty settings for a specific world
   * @param {number} worldNumber - World to get settings for (defaults to current world)
   * @returns {Object} Difficulty settings for the specified world
   */
  getDifficultySettings(worldNumber = this.currentWorld) {
    // Validate world number and fall back to current world if invalid
    if (worldNumber < 1 || worldNumber > this.maxWorlds) {
      console.warn(`Invalid world number: ${worldNumber}, using current world`);
      worldNumber = this.currentWorld;
    }
    
    return { ...this.worldDifficultySettings[worldNumber] };
  }
  
  /**
   * Resets all world progress to default values
   */
  resetProgress() {
    this.unlockedWorlds = [1]; // Only first world unlocked
    this.currentWorld = 1;
    this.saveProgress();
    console.log('World progress has been reset');
  }
}