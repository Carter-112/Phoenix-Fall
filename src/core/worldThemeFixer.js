/**
 * WorldThemeFixer - Ensures world-specific themes are applied consistently
 * This utility helps with applying visual elements and themes for each world
 * Import and call at the beginning of the game flow to ensure worlds display properly
 */

export class WorldThemeFixer {
  constructor(game) {
    this.game = game;
  }

  /**
   * Apply consistent visual themes for all worlds
   * Ensures background colors, particle effects, and world-specific visuals work
   */
  fixAllWorldThemes() {
    // Make sure we have access to the world manager
    if (!this.game?.worldManager) {
      console.error("Cannot fix world themes: World Manager not found");
      return;
    }

    const worldManager = this.game.worldManager;
    
    // Force refresh of current world settings
    const currentWorldNumber = worldManager.getCurrentWorldNumber();
    console.log(`Fixing theme for current world (${currentWorldNumber})`);
    
    // Re-apply current world settings
    worldManager.applyWorldSettings();
    
    // Make sure game state is using correct world
    if (this.game.gameState) {
      this.game.gameState.currentWorld = currentWorldNumber;
    }
    
    // Fix world-specific UI elements
    this.fixUIElements();
    
    console.log("World theme fixed successfully");
  }
  
  /**
   * Fix UI elements specific to the current world
   */
  fixUIElements() {
    // Get the current world configuration
    const worldManager = this.game.worldManager;
    const currentWorld = worldManager.getCurrentWorld();
    const worldNumber = worldManager.getCurrentWorldNumber();
    
    if (!currentWorld) return;
    
    // Apply world-specific colors to UI elements
    const worldColors = this.getWorldColors(worldNumber);
    
    // Apply to any UI elements that need world-specific coloring
    const gameUI = document.querySelectorAll('.game-ui');
    gameUI.forEach(element => {
      // Remove any existing world-specific classes
      for (let i = 1; i <= 6; i++) {
        element.classList.remove(`world-${i}-theme`);
      }
      // Add the current world theme class
      element.classList.add(`world-${worldNumber}-theme`);
    });
    
    // Update world name in UI if present
    const worldNameElement = document.querySelector('.world-name');
    if (worldNameElement) {
      worldNameElement.textContent = currentWorld.name;
    }
    
    // Inject CSS variables for world colors if not already present
    this.injectWorldColorStyles();
  }
  
  /**
   * Get color palette for specific world
   * @param {number} worldNumber - World number (1-6)
   * @returns {Object} Color palette object
   */
  getWorldColors(worldNumber) {
    const worldColors = {
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
    
    return worldColors[worldNumber] || worldColors[1];
  }
  
  /**
   * Inject CSS variables for world colors
   */
  injectWorldColorStyles() {
    // Check if styles already exist
    let styleElement = document.getElementById('world-theme-styles');
    
    if (!styleElement) {
      // Create style element
      styleElement = document.createElement('style');
      styleElement.id = 'world-theme-styles';
      document.head.appendChild(styleElement);
      
      // Generate CSS for all worlds
      let css = '';
      
      for (let i = 1; i <= 6; i++) {
        const colors = this.getWorldColors(i);
        css += `.world-${i}-theme {
          --world-primary: ${colors.primary};
          --world-secondary: ${colors.secondary};
          --world-accent: ${colors.accent};
          --world-background: ${colors.background};
        }\n`;
      }
      
      styleElement.textContent = css;
    }
  }
  
  /**
   * Fix world hazard coordinators
   * Ensures the proper hazard coordinators are activated for the current world
   */
  fixHazardCoordinators() {
    const worldManager = this.game.worldManager;
    const currentWorldNumber = worldManager.getCurrentWorldNumber();
    
    // Reset current hazard coordinator
    if (worldManager.currentHazardCoordinator) {
      worldManager.currentHazardCoordinator.reset();
    }
    
    // Re-initialize the hazard coordinator
    if (worldManager.hazardCoordinators[currentWorldNumber]) {
      worldManager.currentHazardCoordinator = new worldManager.hazardCoordinators[currentWorldNumber](
        worldManager.getCurrentWorld()
      );
      worldManager.currentHazardCoordinator.setActive(true);
    } else {
      worldManager.currentHazardCoordinator = null;
    }
  }
} 