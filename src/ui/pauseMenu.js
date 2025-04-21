/**
 * PauseMenu Class - Creates a pause menu for the game
 * 
 * Features:
 * - Centered overlay with semi-transparent background
 * - Resume and Exit options
 * - Handles keyboard (Escape) and mobile back button events
 * - Properly pauses game logic while active
 */
export class PauseMenu {
    constructor(game) {
      this.game = game;
      this.menuElement = null;
      this.isPaused = false;
      this.wasRunning = false; // Store game running state when paused
      this.backButtonHandler = this.handleBackButton.bind(this);
      this.isHandlingBackButton = false; // Flag to prevent rapid toggles
      this.shouldAutoPauseOnRestore = false; // Flag for tab switching restoration
      this.wasVisiblyRunning = false; // Tracks if game was running when tab switched
      this.lastVisibilityChangeTime = null; // Timestamp of last visibility change
      
      // Bind the visibility change handler to this instance
      this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
      
      // Set up visibility change event listener
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
      
      // Additional listeners for sleep/wake detection
      window.addEventListener('focus', () => {
        if (this.lastVisibilityChangeTime) {
          const timeSinceLostVisibility = Date.now() - this.lastVisibilityChangeTime;
          if (timeSinceLostVisibility > 5000) {
            // If focus was lost for more than 5 seconds, it might be due to device sleep
            console.log('Focus gained after long period - possible device wake');
            this.performDeepUIRestoration();
          }
        }
      });
    }
    
    /**
     * Creates the pause menu DOM elements
     * @param {boolean} [adjustForOrientation=true] - Whether to adjust the menu for current orientation
     */
    createPauseMenu(adjustForOrientation = true) {
      // Remove existing menu if present
      if (this.menuElement) {
        this.menuElement.remove();
        this.menuElement = null;
      }
      
      // Create menu container
      const menuContainer = document.createElement('div');
      menuContainer.className = 'pause-menu';
      menuContainer.style.position = 'absolute';
      menuContainer.style.width = '100%';
      menuContainer.style.height = '100%';
      menuContainer.style.top = '0';
      menuContainer.style.left = '0';
      menuContainer.style.display = 'flex';
      menuContainer.style.flexDirection = 'column';
      menuContainer.style.justifyContent = 'center';
      menuContainer.style.alignItems = 'center';
      menuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      menuContainer.style.zIndex = '1000';
      menuContainer.style.opacity = '0';
      menuContainer.style.transition = 'opacity 0.3s ease';
      
      // Create menu panel
      const menuPanel = document.createElement('div');
      menuPanel.className = 'pause-menu-panel';
      menuPanel.style.width = '80%';
      menuPanel.style.maxWidth = '350px';
      menuPanel.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
      menuPanel.style.borderRadius = '10px';
      menuPanel.style.padding = '20px';
      menuPanel.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
      menuPanel.style.border = '2px solid #FF5500';
      menuPanel.style.transform = 'scale(0.9)';
      menuPanel.style.transition = 'transform 0.3s ease';
      
      // Create title
      const title = document.createElement('h2');
      title.textContent = 'PAUSED';
      title.style.color = '#FF5500';
      title.style.textAlign = 'center';
      title.style.margin = '0 0 20px 0';
      title.style.fontSize = '28px';
      title.style.textShadow = '0 0 5px rgba(255, 85, 0, 0.5)';
      
      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.flexDirection = 'column';
      buttonsContainer.style.gap = '15px';
      
      // Resume button
      const resumeButton = this.createButton('RESUME GAME', '#FF5500', () => {
        this.resumeGame();
      });
      
      // Reset run button
      const resetButton = this.createButton('RESET RUN', '#FF7733', () => {
        this.resetRun();
      });
      
      // Exit to menu button
      const exitButton = this.createButton('EXIT TO MENU', '#FF9955', () => {
        this.exitToMenu();
      });
      
      // Assemble the menu
      buttonsContainer.appendChild(resumeButton);
      buttonsContainer.appendChild(resetButton);
      buttonsContainer.appendChild(exitButton);
      menuPanel.appendChild(title);
      menuPanel.appendChild(buttonsContainer);
      menuContainer.appendChild(menuPanel);
      
      // Store reference to menu element
      this.menuElement = menuContainer;
      
      // Add to game container
      this.game.container.appendChild(menuContainer);
      
      // Adjust layout based on orientation if requested
      if (adjustForOrientation && window.orientationHandler) {
        const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        if (orientation === 'portrait') {
          menuPanel.style.width = '90%';
          menuPanel.style.maxWidth = '320px';
          menuPanel.style.padding = '15px';
          
          // Adjust buttons container for better spacing in portrait
          if (buttonsContainer) {
            buttonsContainer.style.gap = '20px';
          }
        }
      }
      
      // Trigger animation after a short delay (for CSS transition)
      setTimeout(() => {
        menuContainer.style.opacity = '1';
        menuPanel.style.transform = 'scale(1)';
      }, 10);
      
      // Setup ESC key listener
      // Save reference to the keydown handler for cleanup
      this.handleKeyDown = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          if (this.isPaused) {
            this.resumeGame();
          } else {
            this.pauseGame();
          }
        }
      };
      
      document.addEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * Creates a styled button element
     * @param {string} text - Button text
     * @param {string} color - Button text color
     * @param {Function} onClick - Click handler function
     * @returns {HTMLElement} The created button
     */
    createButton(text, color, onClick) {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      button.style.color = color;
      button.style.border = `2px solid ${color}`;
      button.style.borderRadius = '5px';
      button.style.padding = '10px 20px';
      button.style.fontSize = '18px';
      button.style.fontWeight = 'bold';
      button.style.cursor = 'pointer';
      button.style.width = '100%';
      button.style.transition = 'all 0.2s ease';
      
      // Hover effects - store handlers for cleanup
      button.mouseOverHandler = () => {
        button.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
        button.style.transform = 'scale(1.05)';
      };
      
      button.mouseOutHandler = () => {
        button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        button.style.transform = 'scale(1)';
      };
      
      button.clickHandler = onClick;
      
      // Attach the event listeners
      button.addEventListener('mouseover', button.mouseOverHandler);
      button.addEventListener('mouseout', button.mouseOutHandler);
      button.addEventListener('click', button.clickHandler);
      
      return button;
    }
    
    /**
     * Pauses the game and shows the pause menu
     */
    pauseGame() {
      if (!this.isPaused) {
        this.isPaused = true;
        
        // Store the current game running state to restore it later
        this.wasRunning = this.game.isRunning;
        
        // Pause the game logic by setting isRunning to false
        // This ensures the game is fully paused
        this.game.isRunning = false;
        
        // Create menu if it doesn't exist
        if (!this.menuElement) {
          this.createPauseMenu();
        } else {
          // Show existing menu
          this.menuElement.style.display = 'flex';
          setTimeout(() => {
            this.menuElement.style.opacity = '1';
            
            // Get panel element
            const panel = this.menuElement.querySelector('.pause-menu-panel');
            if (panel) {
              panel.style.transform = 'scale(1)';
            }
          }, 10);
        }
        
        // Hide pause button while menu is open
        if (this.game.pauseButton) {
          this.game.pauseButton.hide();
        }
        
        // Stop all game sounds when paused
        if (this.game.soundManager) {
          this.game.soundManager.stopAllSounds();
        }
        
        console.log('Game paused');
      }
    }
    
    /**
     * Resumes the game and hides the pause menu
     */
    resumeGame() {
      if (this.isPaused && this.menuElement) {
        // Animate menu hiding
        this.menuElement.style.opacity = '0';
        
        // Get panel element
        const panel = this.menuElement.querySelector('.pause-menu-panel');
        if (panel) {
          panel.style.transform = 'scale(0.9)';
        }
        
        // Delay to allow animation to complete
        setTimeout(() => {
          this.menuElement.style.display = 'none';
          
          // Show pause button again
          if (this.game.pauseButton) {
            this.game.pauseButton.show();
          }
          
          // Set isPaused to false before restoring game state
          this.isPaused = false;
          
          // Reset the game's lastTimestamp to force the game loop to reset delta time
          // This prevents the game from doing a big jump after being paused
          this.game.lastTimestamp = 0;
          
          // IMPORTANT: Always force the game to run when resuming, 
          // regardless of previous state (unless game is over)
          if (!this.game.gameState.gameOver && !this.game.gameState.worldComplete) {
            this.game.isRunning = true;
          }
          
          // Resume game sounds
          if (this.game.soundManager) {
            this.game.soundManager.playGameplayLoop();
          }
          
          console.log('Game resumed, isRunning set to:', this.game.isRunning);
        }, 300);
      }
    }
    
    /**
     * Resets the current run and resumes the game
     */
    resetRun() {
      if (this.isPaused && this.menuElement) {
        // First hide the pause menu
        this.menuElement.style.opacity = '0';
        
        // Get panel element
        const panel = this.menuElement.querySelector('.pause-menu-panel');
        if (panel) {
          panel.style.transform = 'scale(0.9)';
        }
        
        // Delay to allow animation to complete
        setTimeout(() => {
          this.menuElement.style.display = 'none';
          
          // Show pause button again
          if (this.game.pauseButton) {
            this.game.pauseButton.show();
          }
          
          this.isPaused = false;
          
          // Reset the game
          if (this.game && typeof this.game.restart === 'function') {
            this.game.restart();
          }
          
          // Resume game sounds
          if (this.game.soundManager) {
            this.game.soundManager.playGameplayLoop();
          }
        }, 300);
      }
    }
    
    /**
     * Exits to the main menu by reloading the page
     */
    exitToMenu() {
      // Simply reload the page to return to initial state
      window.location.reload();
    }
    
    /**
     * Draw method required by game render loop
     * This is intentionally empty since the menu is created with DOM elements,
     * but the game still calls it in the render loop
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    draw(ctx, width, height) {
      // The menu is rendered with DOM elements, so no canvas drawing is needed
      // This method exists to prevent errors in the game's render loop
    }
    
    /**
     * Sets up a back button handler for mobile devices
     */
    setupBackButtonHandling() {
      // Remove any existing handler first
      window.removeEventListener('popstate', this.backButtonHandler);
      
      // Set up history state so we can capture back button
      history.pushState({ page: 'game' }, 'Game');
      
      // Add event listener for the back button (mobile)
      window.addEventListener('popstate', this.backButtonHandler);
      
      // Re-establish the history state if it gets navigated away
      // This ensures the back button keeps working throughout gameplay
      window.addEventListener('popstate', () => {
        // Small delay to avoid conflicting with the actual back button handler
        setTimeout(() => {
          // Only push new state if we're still in the game and not already handling back
          if (!this.isHandlingBackButton && this.game.isRunning) {
            history.pushState({ page: 'game' }, 'Game');
          }
        }, 100);
      });
    }
    
    /**
     * Handles the back button event
     * @param {Event} e - The popstate event
     */
    handleBackButton(e) {
      // Prevent the back navigation
      e.preventDefault();
      history.pushState({ page: 'game' }, 'Game');
      
      // Add debounce to prevent multiple rapid toggles
      if (this.isHandlingBackButton) {
        return;
      }
      
      this.isHandlingBackButton = true;
      
      // Toggle pause menu
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        this.isHandlingBackButton = false;
      }, 300); // 300ms debounce time
    }
    
    /**
     * Removes all event listeners and DOM elements when game exits
     * to prevent memory leaks
     */
    cleanup() {
      // Remove back button event listeners
      window.removeEventListener('popstate', this.backButtonHandler);
      
      // Remove keyboard event listeners
      document.removeEventListener('keydown', this.handleKeyDown);
      
      // Remove visibility change event listener
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      
      // Remove any touch/click event listeners from menu buttons
      if (this.menuElement) {
        // Find and remove event listeners from all buttons
        const buttons = this.menuElement.querySelectorAll('button');
        buttons.forEach(button => {
          button.removeEventListener('click', button.clickHandler);
          button.removeEventListener('mouseover', button.mouseOverHandler);
          button.removeEventListener('mouseout', button.mouseOutHandler);
        });
        
        // Remove the menu element from the DOM
        this.menuElement.remove();
        this.menuElement = null;
      }
      
      // Reset state variables
      this.isPaused = false;
      this.isHandlingBackButton = false;
    }
    
    /**
     * Checks if the game state can be safely restored after tab switching
     * @returns {boolean} Whether the game state can be restored
     */
    checkRestorableState() {
      // Verify if the game was paused before the user switched away
      const wasGamePaused = this.isPaused;
      
      // Check if the game is in a state that can be safely resumed
      const isGameRunning = this.game && this.game.isRunning;
      const isGameOver = this.game && this.game.gameState.gameOver;
      const isWorldComplete = this.game && this.game.gameState.worldComplete;
      
      // Game can be restored if:
      // 1. The game was paused before switching away, OR
      // 2. The game was running (not game over or world complete)
      const canRestore = wasGamePaused || (isGameRunning && !isGameOver && !isWorldComplete);
      
      // If the game wasn't explicitly paused but was running, 
      // we should auto-pause it when restoring focus
      if (!wasGamePaused && isGameRunning && !isGameOver && !isWorldComplete) {
        // Store that we need to auto-pause upon restoration
        this.shouldAutoPauseOnRestore = true;
      } else {
        this.shouldAutoPauseOnRestore = false;
      }
      
      return canRestore;
    }
    /**
     * Handles document visibility changes (tab switching, sleep/wake)
     * Automatically pauses the game when switching tabs and restores when returning
     * @param {Event} event - The visibility change event
     */
    handleVisibilityChange(event) {
      // If the document is hidden (user switched tabs/minimized/device sleep)
      if (document.hidden) {
        // Store current game state before pausing
        this.wasVisiblyRunning = this.game.isRunning && !this.isPaused;
        this.lastVisibilityChangeTime = Date.now();
        
        // Only pause if game is currently running and not already paused
        if (this.wasVisiblyRunning) {
          console.log('Device sleep/tab switch detected - auto-pausing game');
          // Auto-pause the game when tab is switched
          this.pauseGame();
        }
      } else {
        // Document is visible again (user returned to tab or device woke up)
        const currentTime = Date.now();
        const visibilityHiddenDuration = this.lastVisibilityChangeTime ? 
                                        currentTime - this.lastVisibilityChangeTime : 0;
        
        console.log(`Device/tab restored after ${visibilityHiddenDuration}ms`);
        
        // Check if this was a short visibility change (tab switch) or 
        // a long one (likely device sleep)
        const wasLongSleep = visibilityHiddenDuration > 5000; // more than 5 seconds
        
        // Check if game can be safely restored
        const canRestore = this.checkRestorableState();
        
        // For longer sleep durations, do more thorough UI restoration
        if (wasLongSleep) {
          console.log('Long sleep detected - performing thorough UI restoration');
          this.performDeepUIRestoration();
        }
        
        // If game was running before switching and we should auto-pause on restore
        if (this.wasVisiblyRunning && this.shouldAutoPauseOnRestore && canRestore) {
          // Keep the pause menu visible to allow manual resuming
          // Don't auto-resume for better user experience (gives user a chance to get ready)
          
          // Make sure pause menu is actually visible
          if (this.menuElement && this.isPaused) {
            this.menuElement.style.display = 'flex';
            setTimeout(() => {
              this.menuElement.style.opacity = '1';
              
              // Get panel element
              const panel = this.menuElement.querySelector('.pause-menu-panel');
              if (panel) {
                panel.style.transform = 'scale(1)';
              }
            }, 10);
          }
        }
        
        // Reset the visibility state tracking
        this.wasVisiblyRunning = false;
      }
    }
    
    /**
     * Performs a deep restoration of UI elements after device sleep
     * This is more thorough than regular UI checks and specifically
     * tries to recover from problematic sleep/wake cycles
     * @param {boolean} [checkOrientation=true] - Whether to check for orientation changes
     */
    performDeepUIRestoration(checkOrientation = true) {
      // 1. First, verify game state consistency
      const isRunning = this.game && this.game.isRunning;
      const isGameOver = this.game && this.game.gameState && this.game.gameState.gameOver;
      const isWorldComplete = this.game && this.game.gameState && this.game.gameState.worldComplete;
      
      // 2. Ensure pause menu state is consistent
      if (this.isPaused) {
        // If we're supposed to be paused, ensure the menu is visible
        if (!this.menuElement || this.menuElement.style.display === 'none') {
          console.log('Pause menu should be visible but isn\'t - recreating');
          this.createPauseMenu();
        }
      }
      
      // 3. Check main menu visibility (should be visible if not running and not paused)
      if (window.mainMenu && !isRunning && !this.isPaused && !isGameOver && !isWorldComplete) {
        console.log('Ensuring main menu visibility after sleep');
        window.mainMenu.show();
        
        // Force start button visibility
        setTimeout(() => {
          if (window.mainMenu.elements.startButton) {
            window.mainMenu.showStartButton();
          }
        }, 100);
      }
      
      // 4. Check pause button visibility (should be visible only if running and not paused)
      if (this.game.pauseButton) {
        if (isRunning && !this.isPaused) {
          console.log('Ensuring pause button visibility after sleep');
          this.game.pauseButton.show();
        } else {
          this.game.pauseButton.hide();
        }
      }
      
      // 5. Force a redraw of the canvas to prevent black screen
      if (this.game.canvas) {
        // This tricks the browser into refreshing the canvas
        this.game.canvas.style.display = 'none';
        setTimeout(() => {
          this.game.canvas.style.display = 'block';
        }, 10);
      }
      
      // 6. Trigger a thorough consistency check via UIChecker if available
      if (window.uiChecker) {
        console.log('Triggering thorough UI check after device sleep');
        window.uiChecker.checkUIConsistency(true);
      }
      
      // 7. Check for orientation changes that may have occurred during sleep
      if (checkOrientation && window.orientationHandler) {
        console.log('Checking orientation after device sleep');
        const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        // Check if the method exists before calling it
        if (window.orientationHandler.applyOrientationAdjustments) {
          window.orientationHandler.applyOrientationAdjustments(orientation);
        } else if (window.orientationHandler.adjustUI) {
          // Use adjustUI as fallback if available
          window.orientationHandler.adjustUI(orientation);
        }
      }
    }
  }