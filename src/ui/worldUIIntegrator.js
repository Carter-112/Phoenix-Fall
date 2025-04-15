/**
 * WorldUIIntegrator - Ensures consistent UI across all worlds
 * 
 * This utility integrates world-specific UI themes while maintaining the same UI elements
 * across all worlds. It applies different color themes based on the world but keeps
 * the same layout and UI components.
 */

export class WorldUIIntegrator {
  constructor(game) {
    this.game = game;
    
    // Run initial cleanup to remove any legacy UI elements
    this.removeWorldSpecificUI();
  }

  /**
   * Apply world-specific colors but keep UI consistent across all worlds
   * @param {number} worldNumber - World number (1-6)
   */
  cleanupWorldUI(worldNumber) {
    if (worldNumber < 1 || worldNumber > 6) {
      return; // Only process worlds 1-6
    }

    console.log(`Applying UI theme for World ${worldNumber}`);
    
    // Remove any old world-specific classes from the body element
    for (let i = 1; i <= 6; i++) {
      document.body.classList.remove(`world-${i}-ui`);
    }
    
    // Add the current world class
    document.body.classList.add(`world-${worldNumber}-ui`);
    
    // Remove any legacy UI elements that might be causing conflicts
    this.removeWorldSpecificUI();
    
    // Apply world-specific colors to UI elements
    this.applyWorldColors(worldNumber);
    
    console.log(`UI theme for World ${worldNumber} applied`);
  }
  
  /**
   * Remove any legacy or duplicate UI elements
   * This is especially important for worlds 2-6 which had their own UI elements
   */
  removeWorldSpecificUI() {
    console.log('Removing legacy world-specific UI elements');
    
    // Remove any duplicate world info panels
    const worldInfoPanels = document.querySelectorAll('.world-info-panel');
    if (worldInfoPanels.length > 1) {
      // Keep only the first one, remove the rest
      for (let i = 1; i < worldInfoPanels.length; i++) {
        worldInfoPanels[i].remove();
      }
    }
    
    // Remove any world-specific UI elements
    const orphanedElements = [
      '.legacy-world-ui',
      '.world-2-specific',
      '.world-3-specific',
      '.world-4-specific', 
      '.world-5-specific',
      '.world-6-specific',
      '.world-info-duplicate',
      '.world-progress-duplicate',
      '.health-bar-duplicate',
      '.level-bar-duplicate',
      '.world-stats-duplicate'
    ];
    
    orphanedElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        console.log(`Removing orphaned UI element: ${selector}`);
        element.remove();
      });
    });
    
    // Find and disable any custom world-specific drawing functions
    if (window.gameInstance && window.gameInstance.ui) {
      const ui = window.gameInstance.ui;
      
      // Store reference to original draw method if not already stored
      if (!this.originalDrawMethod && ui.draw) {
        this.originalDrawMethod = ui.draw;
        
        // Override the draw method to ensure consistent UI
        ui.draw = (width, height) => {
          // Call original method
          this.originalDrawMethod.call(ui, width, height);
          
          // Run a cleanup after each draw cycle to catch any duplicates
          setTimeout(() => this.quickCleanup(), 100);
        };
      }
    }
  }
  
  /**
   * Quick cleanup that runs after each draw cycle
   * Less intensive than full cleanup
   */
  quickCleanup() {
    // Do a minimal cleanup after each frame to catch any duplicates
    const duplicateClasses = [
      '.world-info-duplicate',
      '.world-progress-duplicate',
      '.health-bar-duplicate'
    ];
    
    duplicateClasses.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => element.remove());
      }
    });
  }
  
  /**
   * Apply world-specific colors to UI elements
   * @param {number} worldNumber - World number (1-6)
   */
  applyWorldColors(worldNumber) {
    // Get colors from the WorldThemeFixer if available
    let worldColors = null;
    
    if (window.worldThemeFixer && window.worldThemeFixer.getWorldColors) {
      worldColors = window.worldThemeFixer.getWorldColors(worldNumber);
    } else {
      // Fallback colors if WorldThemeFixer is not available
      const fallbackColors = {
        1: {
          primary: '#D93d00',
          secondary: '#ff9d54',
          accent: '#ffca7a',
          background: '#1a0f0f'
        },
        2: {
          primary: '#009688',
          secondary: '#4db6ac',
          accent: '#b2dfdb',
          background: '#0f1a15'
        },
        3: {
          primary: '#03a9f4',
          secondary: '#4fc3f7',
          accent: '#b3e5fc',
          background: '#0f1a1f'
        },
        4: {
          primary: '#9c27b0',
          secondary: '#ba68c8',
          accent: '#e1bee7',
          background: '#170f1a'
        },
        5: {
          primary: '#f44336',
          secondary: '#e57373',
          accent: '#ffcdd2',
          background: '#1a0f0f'
        },
        6: {
          primary: '#ff9800',
          secondary: '#ffb74d',
          accent: '#ffe0b2',
          background: '#3a1500'
        }
      };
      worldColors = fallbackColors[worldNumber] || fallbackColors[1];
    }
    
    // Apply colors to UI elements
    const uiElements = document.querySelectorAll('.game-ui, .ui-element, .world-ui');
    uiElements.forEach(element => {
      // Apply CSS custom properties for theming
      element.style.setProperty('--world-primary', worldColors.primary);
      element.style.setProperty('--world-secondary', worldColors.secondary);
      element.style.setProperty('--world-accent', worldColors.accent);
      element.style.setProperty('--world-background', worldColors.background);
    });
    
    // Apply colors to canvas-based UI elements through game state
    if (this.game && this.game.ui) {
      this.game.ui.worldColors = worldColors;
    }
  }
  
  /**
   * Update world information display
   * @param {number} worldNumber - World number (1-6)
   */
  updateWorldInfoDisplay(worldNumber) {
    // Update world name in UI
    const worldNameElement = document.querySelector('.world-name');
    if (worldNameElement && this.game.worldManager) {
      worldNameElement.textContent = this.game.worldManager.getWorldName(worldNumber);
      
      // Apply world-specific styling
      worldNameElement.className = `world-name world-${worldNumber}-text`;
    }
  }
  
  /**
   * Integrate with the World Manager's setCurrentWorld method
   * This method hooks into the world change process to ensure UI is updated
   */
  integrateWithWorldManager() {
    if (!this.game || !this.game.worldManager) {
      console.error('WorldUIIntegrator: Cannot integrate with World Manager - not available');
      return;
    }
    
    // Keep reference to original method
    const originalSetCurrentWorld = this.game.worldManager.setCurrentWorld;
    
    // Override with our enhanced version
    this.game.worldManager.setCurrentWorld = (worldNumber) => {
      // Call the original method first
      const success = originalSetCurrentWorld.call(this.game.worldManager, worldNumber);
      
      // If world was changed successfully, update the UI
      if (success) {
        this.cleanupWorldUI(worldNumber);
        this.updateWorldInfoDisplay(worldNumber);
      }
      
      return success;
    };
    
    console.log('WorldUIIntegrator: Successfully integrated with World Manager');
  }
} 