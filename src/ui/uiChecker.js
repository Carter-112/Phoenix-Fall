/**
 * UIChecker - Utility to ensure all UI elements are properly displayed
 * 
 * This class performs checks on critical UI elements to ensure they're properly
 * visible after device sleep/wake, browser tab switches, and other interruptions.
 */
export class UIChecker {
  constructor(game) {
    this.game = game;
    this.checkInterval = 5000; // Check every 5 seconds
    this.lastCheckTime = 0;
    this.startButtonDeprecationLogged = false;
    this.initialized = false;
    this.setupDone = false;
    this.checkCount = 0;
    
    // Bind event handlers to this instance
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.windowFocusHandler = this.handleWindowFocus.bind(this);
    this.windowResizeHandler = this.handleWindowResize.bind(this);
    
    // Set up visibility and focus change event listeners
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    window.addEventListener('focus', this.windowFocusHandler);
    window.addEventListener('resize', this.windowResizeHandler);
    
    // Start regular UI checks
    this.startPeriodicChecks();
  }
  
  /**
   * Starts periodic UI element checks
   */
  startPeriodicChecks() {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Set up new check interval
    this.checkInterval = setInterval(() => {
      this.checkUIConsistency();
    }, this.checkInterval);
    
    // Do an immediate check
    this.checkUIConsistency();
  }
  
  /**
   * Handles document visibility changes (tab switching, app minimizing)
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      // Document is visible again - do a full UI check
      this.checkUIConsistency(true); // true = force thorough check
      this.ensureMenuButtonsClickable(); // Make sure buttons are clickable
    }
  }
  
  /**
   * Handles window focus events
   */
  handleWindowFocus() {
    // When window gains focus, check UI
    this.checkUIConsistency(true); // true = force thorough check
    this.ensureMenuButtonsClickable(); // Make sure buttons are clickable
  }
  
  /**
   * Handles window resize events
   */
  handleWindowResize() {
    // Check UI after resize (with slight delay to let resize complete)
    setTimeout(() => {
      // Check if this is an orientation change
      const isOrientationChange = 
        (window.innerWidth > window.innerHeight && window.lastWidth < window.lastHeight) ||
        (window.innerWidth < window.innerHeight && window.lastWidth > window.lastHeight);
      
      // Store current dimensions for next comparison
      window.lastWidth = window.innerWidth;
      window.lastHeight = window.innerHeight;
      
      // Always do the consistency check
      this.checkUIConsistency(true);
      
      // Ensure main menu buttons are clickable whenever they're visible
      this.ensureMenuButtonsClickable();
      
      // If this appears to be an orientation change and we don't have a dedicated handler
      if (isOrientationChange && !window.orientationHandler) {
        console.log('Orientation change detected by UIChecker');
        
        // Adjust the UI manually since we don't have the orientation handler
        this.handleOrientationChange();
      }
    }, 100);
  }
  
  /**
   * Handle orientation changes when OrientationHandler isn't available
   * This is a fallback method for browsers that don't support orientation events
   */
  handleOrientationChange() {
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    console.log(`UIChecker detected orientation: ${orientation}`);
    
    // Apply basic adjustments for orientation
    const rankBar = document.querySelector('.rank-bar-container');
    if (rankBar) {
      if (orientation === 'portrait') {
        rankBar.style.width = '85%';
        rankBar.style.maxWidth = '400px';
      } else {
        rankBar.style.width = '60%';
        rankBar.style.maxWidth = '500px';
      }
    }
    
    // Also check settings button position
    const settingsButton = document.querySelector('.settings-button');
    if (settingsButton) {
      if (orientation === 'portrait') {
        settingsButton.style.top = '110px';
      } else {
        settingsButton.style.top = '120px';
      }
    }
    
    // Check for pause menu
    if (this.game && this.game.pauseMenu && this.game.pauseMenu.menuElement) {
      const menuPanel = this.game.pauseMenu.menuElement.querySelector('.pause-menu-panel');
      if (menuPanel) {
        if (orientation === 'portrait') {
          menuPanel.style.width = '90%';
          menuPanel.style.maxWidth = '320px';
        } else {
          menuPanel.style.width = '80%';
          menuPanel.style.maxWidth = '350px';
        }
      }
    }
  }
  
  /**
   * Check for UI consistency issues
   */
  checkUIConsistency() {
    if (!this.initialized || !this.setupDone) return;
    
    this.checkCount++;
    
    try {
      // These functions should no longer try to recreate buttons that don't exist
      this.ensureMainMenuConsistency();
      this.ensureStartButtonConsistency();
      this.ensureOptionsMenuConsistency();
      this.ensureUIConsistency(); // Call our main UI consistency method
      
      // Additional checks can be added here
    } catch (error) {
      console.warn('[UIChecker] Error in UI consistency check:', error);
    }
  }
  
  /**
   * Ensure the main menu is consistent
   */
  ensureMainMenuConsistency() {
    if (!window.mainMenu) return;
    
    // Check if the main menu is visible
    const menuVisible = window.mainMenu.isVisible;
    
    if (menuVisible) {
      // Ensure world selection buttons are working
      if (!document.querySelectorAll('.world-button').length) {
        console.log('[UIChecker] Main menu missing world selection buttons, refreshing menu');
        window.mainMenu.refreshWorldButtons();
      }
      
      // Ensure start button is visible
      if (window.mainMenu.elements.startButton) {
        if (window.mainMenu.elements.startButton.style.display === 'none') {
          console.log('[UIChecker] Start button should be visible but isn\'t - fixing');
          window.mainMenu.showStartButton();
        }
      }
    }
  }
  
  /**
   * Ensures the start button is in the correct state
   */
  ensureStartButtonConsistency() {
    if (!window.mainMenu) return;
    
    const startButton = window.mainMenu.elements && window.mainMenu.elements.startButton;
    if (!startButton) {
      // If this is the first run and the start button hasn't been created yet,
      // we don't need to log anything
      return;
    }
    
    const menuContainer = window.mainMenu.elements.menuContainer;
    
    // Start button should be visible when menu is visible
    const isMenuVisible = menuContainer && 
                          menuContainer.style.display !== 'none' && 
                          parseFloat(menuContainer.style.opacity) > 0.1;
    
    const isStartButtonVisible = startButton.style.display !== 'none' && 
                                parseFloat(startButton.style.opacity) > 0.1;
    
    const isGameActive = this.game && this.game.isGameActive;
    
    // Start button should be visible in the menu but not during gameplay
    if (isMenuVisible && !isGameActive && !isStartButtonVisible) {
      console.log('[UIChecker] Start button should be visible with menu - fixing');
      window.mainMenu.showStartButton();
    } else if ((!isMenuVisible || isGameActive) && isStartButtonVisible) {
      console.log('[UIChecker] Start button should be hidden when menu is hidden or game is active - fixing');
      window.mainMenu.hideStartButton();
    }
  }
  
  /**
   * Performs a thorough check of all UI elements
   */
  ensureAllUIElementsConsistency() {
    // Check if game is over or world is complete
    const isGameOver = this.game && this.game.gameState && this.game.gameState.gameOver;
    const isWorldComplete = this.game && this.game.gameState && this.game.gameState.worldComplete;
    
    // Check rank bar consistency
    const rankBarElement = document.querySelector('.rank-bar-container');
    if (rankBarElement) {
      const isRunning = this.game && this.game.isRunning;
      // Rank bar should NOT be visible when game is over or world is complete
      const shouldRankBarBeVisible = !isRunning && !isGameOver && !isWorldComplete;
      const isRankBarVisible = rankBarElement.style.display !== 'none' && 
                              parseFloat(getComputedStyle(rankBarElement).opacity) > 0.1;
      
      if (shouldRankBarBeVisible && !isRankBarVisible) {
        console.log('UIChecker: Rank bar should be visible but isn\'t - fixing');
        rankBarElement.style.display = 'flex';
        setTimeout(() => {
          rankBarElement.style.opacity = '1';
        }, 10);
      } else if (!shouldRankBarBeVisible && isRankBarVisible) {
        console.log('UIChecker: Rank bar should be hidden but isn\'t - fixing');
        rankBarElement.style.opacity = '0';
        setTimeout(() => {
          rankBarElement.style.display = 'none';
        }, 500);
      }
    }
    
    // Check pause button consistency
    if (this.game && this.game.pauseButton) {
      const isRunning = this.game.isRunning;
      const isPaused = this.game.pauseMenu && this.game.pauseMenu.isPaused;
      const shouldPauseButtonBeVisible = isRunning && !isPaused;
      
      // Also check and update settings button visibility based on game state
      const settingsButton = document.querySelector('.settings-button');
      if (settingsButton) {
        const isSettingsButtonVisible = settingsButton.style.display !== 'none' && 
                                       parseFloat(getComputedStyle(settingsButton).opacity) > 0.1;
        
        // Settings button should only be visible when game is not running
        // AND when game is not over and world is not complete
        if ((isRunning || isGameOver || isWorldComplete) && isSettingsButtonVisible) {
          console.log('UIChecker: Settings button should be hidden during gameplay or after game end - fixing');
          settingsButton.style.opacity = '0';
          settingsButton.style.display = 'none';
        } else if (!isRunning && !isGameOver && !isWorldComplete && !isSettingsButtonVisible) {
          console.log('UIChecker: Settings button should be visible in menu - fixing');
          settingsButton.style.display = 'block';
          setTimeout(() => {
            settingsButton.style.opacity = '1';
          }, 10);
        }
      }
      
      const pauseButton = this.game.pauseButton.element;
      if (pauseButton) {
        const isPauseButtonVisible = pauseButton.style.display !== 'none';
        
        if (shouldPauseButtonBeVisible && !isPauseButtonVisible) {
          console.log('UIChecker: Pause button should be visible but isn\'t - fixing');
          this.game.pauseButton.show();
        } else if (!shouldPauseButtonBeVisible && isPauseButtonVisible) {
          console.log('UIChecker: Pause button should be hidden but isn\'t - fixing');
          this.game.pauseButton.hide();
        }
      }
    }
    
    // Remove any emergency start button if it exists
    // The game now uses world selector buttons to start
    const emergencyButton = document.querySelector('.emergency-start-button');
    if (emergencyButton) {
      console.log('UIChecker: Removing emergency start button as it is no longer needed');
      emergencyButton.remove();
    }
  }
  
  /**
   * Ensure the world selector is functional and properly set up
   */
  ensureWorldSelectorFunctional() {
    if (!window.mainMenu) return;
    
    const worldSelector = document.querySelector('.world-selector');
    if (worldSelector) {
      // Make sure world buttons are clickable
      const worldButtons = worldSelector.querySelectorAll('.world-button');
      if (worldButtons.length < 6) {
        console.log('UIChecker: World selector missing worlds - should have 6 worlds');
      }
      
      worldButtons.forEach(button => {
        if (!button.disabled) {
          button.style.pointerEvents = 'auto';
          button.style.cursor = 'pointer';
        }
      });
      
      // Ensure description area is visible
      const worldDescription = document.querySelector('.world-description');
      if (worldDescription) {
        worldDescription.style.display = 'block';
      }
    }
  }
  
  /**
   * Ensures that menu buttons are clickable whenever they're visible
   * This addresses the issue where backdrop elements might block button clicks
   */
  ensureMenuButtonsClickable() {
    if (!window.mainMenu) return;
    
    // Get all backdrop and container elements that might block clicks
    const backdropElements = [
      // Main menu elements
      window.mainMenu.elements.menuContainer,
      document.querySelector('.menu-backdrop'),
      document.querySelector('.menu-background'),
      document.querySelector('.menu-overlay'),
      // Settings elements if they exist
      document.querySelector('.settings-panel-backdrop'),
      document.querySelector('.settings-container')
    ];
    
    // For each backdrop element, ensure pointer-events is properly set
    backdropElements.forEach(element => {
      if (element) {
        const isVisible = element.style.display !== 'none' && 
                        parseFloat(getComputedStyle(element).opacity) > 0.1;
        
        if (isVisible) {
          // Get all child elements that represent buttons
          const buttons = element.querySelectorAll('button, .button, [role="button"]');
          
          // First, ensure the backdrop doesn't block clicks if buttons are visible
          if (buttons.length > 0) {
            // Only apply pointer-events: none to the backdrop if it's not a button container itself
            if (!element.classList.contains('button') && 
                !element.tagName === 'BUTTON' && 
                element.getAttribute('role') !== 'button') {
              element.style.pointerEvents = 'auto'; // Enable pointer events for container
            }
          }
          
          // Then ensure all buttons inside have pointer-events enabled
          buttons.forEach(button => {
            button.style.pointerEvents = 'auto';
            button.style.zIndex = parseInt(button.style.zIndex || 0) + 10; // Increase z-index
            
            // Log for debugging
            console.log('UIChecker: Ensuring button clickable:', button);
          });
        }
      }
    });
    
    // Check world selector buttons specifically
    const worldButtons = document.querySelectorAll('.world-button');
    worldButtons.forEach(button => {
      if (!button.disabled) {
        button.style.pointerEvents = 'auto';
        button.style.zIndex = '300'; // High z-index
      }
    });
  }
  
  /**
   * Ensures UI elements are consistent based on game state
   */
  ensureUIConsistency() {
    // Game state access
    const gameActive = this.game && this.game.isGameActive;
    const gameInMenu = this.game && !this.game.isGameActive;
    
    // Check main menu visibility
    if (window.mainMenu) {
      const menuContainer = window.mainMenu.elements.menuContainer;
      if (menuContainer) {
        const isMenuVisible = menuContainer.style.display !== 'none' && 
                            parseFloat(menuContainer.style.opacity) > 0.1;
        
        if (gameInMenu && !isMenuVisible) {
          console.log('UIChecker: Menu should be visible but isn\'t - fixing');
          window.mainMenu.show();
        } else if (gameActive && isMenuVisible) {
          console.log('UIChecker: Menu should be hidden but isn\'t - fixing');
          window.mainMenu.hide();
        }
      }
    }
    
    // Check settings button visibility
    if (this.game.settings && this.game.settings.settingsButton) {
      const settingsButton = this.game.settings.settingsButton;
      const shouldSettingsButtonBeVisible = gameInMenu || 
                                          (window.mainMenu && window.mainMenu.elements.menuContainer.style.display !== 'none');
      
      if (shouldSettingsButtonBeVisible && settingsButton.style.display === 'none') {
        console.log('UIChecker: Settings button should be visible but isn\'t - fixing');
        settingsButton.style.display = 'block';
        
        // Fade in the button gradually for smooth appearance
        settingsButton.style.opacity = '0';
        setTimeout(() => {
          settingsButton.style.opacity = '1';
        }, 10);
      }
    }
    
    // Check if start button is visible in the main menu
    if (window.mainMenu && window.mainMenu.elements.startButton) {
      const startButton = window.mainMenu.elements.startButton;
      const startButtonVisible = startButton.style.display !== 'none' && parseFloat(startButton.style.opacity) > 0.1;
      const menuVisible = window.mainMenu.elements.menuContainer.style.display !== 'none' && 
                          parseFloat(window.mainMenu.elements.menuContainer.style.opacity) > 0.1;
      
      if (menuVisible && !startButtonVisible) {
        console.log('UIChecker: Start button should be visible in menu - fixing');
        window.mainMenu.showStartButton();
      } else if (!menuVisible && startButtonVisible) {
        console.log('UIChecker: Start button should be hidden when menu is hidden - fixing');
        window.mainMenu.hideStartButton();
      }
    }
    
    const pauseButton = this.game.pauseButton?.element;
    if (pauseButton) {
      const isPauseButtonVisible = pauseButton.style.display !== 'none';
      const shouldPauseButtonBeVisible = gameActive && !(this.game.pauseMenu?.isPaused);
      
      if (shouldPauseButtonBeVisible && !isPauseButtonVisible) {
        console.log('UIChecker: Pause button should be visible but isn\'t - fixing');
        this.game.pauseButton.show();
      } else if (!shouldPauseButtonBeVisible && isPauseButtonVisible) {
        console.log('UIChecker: Pause button should be hidden but isn\'t - fixing');
        this.game.pauseButton.hide();
      }
    }
    
    // Check world selector is working
    this.ensureWorldSelectorFunctional();
    
    // Remove any emergency start button if it exists
    // The game now uses world selector buttons to start
    const emergencyButton = document.querySelector('.emergency-start-button');
    if (emergencyButton) {
      console.log('UIChecker: Removing emergency start button as it is no longer needed');
      emergencyButton.remove();
    }
  }
  
  /**
   * Cleans up all event listeners when no longer needed
   */
  cleanup() {
    // Clear interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    window.removeEventListener('focus', this.windowFocusHandler);
    window.removeEventListener('resize', this.windowResizeHandler);
  }
}