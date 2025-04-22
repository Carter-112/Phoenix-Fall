import { Game } from './game.js';
import { MainMenu } from '../ui/mainMenu.js';
import { RankSystem } from '../utils/rankSystem.js';
import { UIChecker } from '../ui/uiChecker.js';
import { OrientationHandler } from '../utils/orientationHandler.js';
import { WorldProgressionSystem } from './WorldProgressionSystem.js';
import { LoadingAnimation } from '../utils/loadingAnimation.js';
import { WorldThemeFixer } from './worldThemeFixer.js';
import { WorldManager } from './WorldManager.js';
import { WorldUIIntegrator } from '../ui/worldUIIntegrator.js';
import './globalSettings.js';

/**
 * Initialize the game application
 * @param {HTMLElement} renderDiv - The container element for the game
 */
export function initializeGame(renderDiv) {
  // Initialize loading animation first
  const loadingAnimation = new LoadingAnimation();
  loadingAnimation.initialize();
  loadingAnimation.show();
  
  // Set up render div
  renderDiv.style.width = '100%';
  renderDiv.style.height = '100vh';
  renderDiv.style.overflow = 'hidden';
  renderDiv.style.touchAction = 'none';
  renderDiv.style.position = 'relative';
  
  // Initialize the rank system
  const rankSystem = new RankSystem();
  window.rankSystem = rankSystem; // Store for global access
  
  // Initialize the world progression system
  const worldProgressionSystem = new WorldProgressionSystem();
  window.worldProgressionSystem = worldProgressionSystem; // Store for global access
  
  // Initialize the game but don't start it yet (paused state)
  const game = new Game(renderDiv);
  window.gameInstance = game; // Store reference to access sound manager
  
  // Initialize the world theme fixer
  const worldThemeFixer = new WorldThemeFixer(game);
  window.worldThemeFixer = worldThemeFixer; // Store for global access
  
  // Initialize world manager with all available worlds
  const worldManager = new WorldManager();
  
  // Initialize and integrate the WorldUIIntegrator if available
  if (typeof WorldUIIntegrator !== 'undefined') {
    try {
      const worldUIIntegrator = new WorldUIIntegrator(game);
      worldUIIntegrator.integrateWithWorldManager();
      console.log('WorldUIIntegrator initialized and integrated with WorldManager');
    } catch (error) {
      console.error('Error initializing WorldUIIntegrator:', error);
    }
  } else {
    console.warn('WorldUIIntegrator not available, using default UI rendering');
  }
  
  // Set up world selection handling
  const handleWorldSelection = (worldNumber) => {
    if (game && typeof game.setCurrentWorld === 'function') {
      // Verify the world is unlocked before setting it
      if (worldProgressionSystem.isWorldUnlocked(worldNumber)) {
        console.log(`World ${worldNumber} selected`);
        
        // Update both game and progression system
        game.setCurrentWorld(worldNumber);
        worldProgressionSystem.setCurrentWorld(worldNumber);
        
        // Fix world theme after selection
        worldThemeFixer.fixAllWorldThemes();
      } else {
        console.log(`World ${worldNumber} is locked and cannot be selected`);
        
        // Revert the world indicator to the current valid world
        if (mainMenu && mainMenu.worldIndicator) {
          mainMenu.worldIndicator.setWorld(worldProgressionSystem.getCurrentWorld());
        }
      }
    }
  };
  
  // Add pulse animation style
  const pulseStyle = document.createElement('style');
  pulseStyle.textContent = `
    @keyframes pulseEffect {
      0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 15px rgba(255, 85, 0, 0.5); }
      50% { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 25px rgba(255, 85, 0, 0.8); }
      100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 15px rgba(255, 85, 0, 0.5); }
    }
  `;
  document.head.appendChild(pulseStyle);
  
  // Create main menu
  const mainMenu = new MainMenu(renderDiv, () => {
    // Show loading animation when starting game from menu
    loadingAnimation.show();
    
    // Short delay to show loading animation, then start game
    setTimeout(() => {
      game.start();
      
      // Hide loading animation after game starts
      setTimeout(() => loadingAnimation.hide(), 500);
    }, 800);
  });
  
  // Store mainMenu in window for global access from other classes
  window.mainMenu = mainMenu;
  
  // Set up game callbacks to show/hide UI elements
  game.setGameOverCallback(() => {
    // Small delay to let game over screen display first
    setTimeout(() => {
      // Show loading animation before switching to menu
      loadingAnimation.show();
      
      // Short delay to show loading animation, then show menu
      setTimeout(() => {
        // Show menu but keep rank bar and settings hidden
        mainMenu.showWithoutRankAndSettings();
        
        // Hide loading animation after menu is ready
        setTimeout(() => loadingAnimation.hide(), 500);
      }, 800);
    }, 2000); // Reduced from 3000ms to 2000ms
  });
  
  game.setWorldCompleteCallback(() => {
    // Small delay to let world complete screen display first
    setTimeout(() => {
      // Show loading animation before switching to menu
      loadingAnimation.show();
      
      // Process world completion in the world progression system
      const currentWorld = game.getCurrentWorld();
      const completionResult = worldProgressionSystem.completeWorld(currentWorld);
      
      console.log(`World ${currentWorld} completed. Completion result:`, completionResult);
      
      // Check if game instance is still valid
      if (!window.gameInstance) {
        console.error('Game instance not found during world completion');
        loadingAnimation.hide();
        return;
      }
      
      // Short delay to show loading animation, then show menu
      setTimeout(() => {
        // Ensure game is properly marked as not running
        if (game) game.isRunning = false;
        
        // Show menu but keep rank bar and settings hidden
        if (mainMenu) {
          mainMenu.showWithoutRankAndSettings();
        } else {
          console.error('Main menu not found during world completion');
          loadingAnimation.hide();
          window.location.reload(); // Fallback reload if menu can't be shown
          return;
        }
        
        // Advance to next world if available
        if (completionResult && completionResult.success && !completionResult.isLastWorld) {
          const nextWorld = completionResult.nextWorld;
          
          console.log(`Advancing to World ${nextWorld}`);
          
          // Update world indicator to show next world and update unlocked worlds
          if (mainMenu.worldIndicator) {
            mainMenu.worldIndicator.setWorld(nextWorld);
            
            // Update unlocked worlds in the world indicator
            const unlockedWorlds = worldProgressionSystem.getUnlockedWorlds();
            if (mainMenu.worldIndicator.setUnlockedWorlds) {
              mainMenu.worldIndicator.setUnlockedWorlds(unlockedWorlds);
            }
          }
          
          // Update game's world setting
          handleWorldSelection(nextWorld);
          
          // Show "New World Unlocked" message if this was newly unlocked
          if (completionResult.newlyUnlocked) {
            // Show notification about new world unlock
            console.log(`New world unlocked: World ${nextWorld}`);
            
            // Create and display world unlock animation
            createWorldUnlockAnimation(nextWorld);
          }
        } else {
          console.log(`World ${currentWorld} was the last world or completion unsuccessful.`);
          // If it's the last world or completion failed, stay on current world
          if (mainMenu.worldIndicator) {
            mainMenu.worldIndicator.setWorld(currentWorld);
          }
        }
        
        // Always show the start button when returning to menu
        mainMenu.showStartButton();
        
        // Hide loading animation after menu is ready
        setTimeout(() => loadingAnimation.hide(), 500);
      }, 800);
    }, 2000); // Reduced from default to 2000ms
  });
  
  // Render rank bar on the start screen
  const rankBarElement = rankSystem.renderRankBar(renderDiv);
  
  // Add transition effect to rank bar for smooth show/hide
  if (rankBarElement) {
    rankBarElement.style.transition = 'opacity 0.5s ease-in-out';
  }
  
  // Initialize UI consistency checker to prevent orphaned UI elements
  const uiChecker = new UIChecker(game);
  window.uiChecker = uiChecker; // Store for global access
  
  // Initialize orientation handler to manage device rotation
  const orientationHandler = new OrientationHandler(game);
  window.orientationHandler = orientationHandler; // Store for global access
  
  // Initialize world system with current world from progression system
  if (game && typeof game.setCurrentWorld === 'function') {
    const currentWorld = worldProgressionSystem.getCurrentWorld();
    game.setCurrentWorld(currentWorld);
    
    // Apply the world theme fixer to ensure all worlds display correctly
    if (worldThemeFixer) {
      worldThemeFixer.fixAllWorldThemes();
      worldThemeFixer.fixHazardCoordinators();
    }
  }
  
  // Initialize game loop to show the background while paused
  game.gameLoop(0);
  
  // Remove any emergency start buttons that may have been created by other components
  const emergencyButton = document.querySelector('.emergency-start-button');
  if (emergencyButton) {
    emergencyButton.remove();
  }
  
  // Clear any existing level data from localStorage
  console.log('Clearing temporary level data from localStorage');
  const keysToRemove = [];
  
  // Find all level data related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('levelProgress') || 
      key.includes('playerData') || 
      key.includes('gameState') ||
      key.includes('phoenixSave')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove identified keys
  keysToRemove.forEach(key => {
    console.log(`Removing saved data: ${key}`);
    localStorage.removeItem(key);
  });
  
  // NOTE: We're keeping world progress and rank data now!
  // Do not clear rank data 
  /*
  if (localStorage.getItem('rankData')) {
    console.log('Removing rank data');
    localStorage.removeItem('rankData');
  }
  
  if (localStorage.getItem('worldProgress')) {
    console.log('Removing world progress data');
    localStorage.removeItem('worldProgress');
    
    // Reset the world progression system to defaults
    worldProgressionSystem.resetProgress();
  }
  */
  
  // Hide loading animation once everything is initialized
  setTimeout(() => {
    loadingAnimation.hide();
  }, 1200); // Slightly longer initial delay for better user experience

  // Add loading animation to window for global access
  window.loadingAnimation = loadingAnimation;
  
  // Return references that might be needed
  return {
    game,
    mainMenu,
    loadingAnimation,
    worldProgressionSystem,
    rankSystem
  };
}

/**
 * Create animation for world unlock
 * @param {number} worldNumber - The world number that was unlocked
 */
function createWorldUnlockAnimation(worldNumber) {
  // Create container for the animation
  const unlockContainer = document.createElement('div');
  unlockContainer.className = 'world-unlock-animation';
  unlockContainer.style.position = 'absolute';
  unlockContainer.style.top = '0';
  unlockContainer.style.left = '0';
  unlockContainer.style.width = '100%';
  unlockContainer.style.height = '100%';
  unlockContainer.style.display = 'flex';
  unlockContainer.style.flexDirection = 'column';
  unlockContainer.style.justifyContent = 'center';
  unlockContainer.style.alignItems = 'center';
  unlockContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  unlockContainer.style.zIndex = '2000';
  unlockContainer.style.opacity = '0';
  unlockContainer.style.transition = 'opacity 0.5s ease-in-out';
  
  // Animation container for the badge
  const animationBox = document.createElement('div');
  animationBox.style.position = 'relative';
  animationBox.style.width = '200px';
  animationBox.style.height = '200px';
  animationBox.style.display = 'flex';
  animationBox.style.justifyContent = 'center';
  animationBox.style.alignItems = 'center';
  
  // Create the world badge
  const worldBadge = document.createElement('div');
  worldBadge.style.width = '150px';
  worldBadge.style.height = '150px';
  worldBadge.style.borderRadius = '50%';
  worldBadge.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
  worldBadge.style.border = '4px solid #FF5500';
  worldBadge.style.display = 'flex';
  worldBadge.style.flexDirection = 'column';
  worldBadge.style.justifyContent = 'center';
  worldBadge.style.alignItems = 'center';
  worldBadge.style.position = 'relative';
  worldBadge.style.transform = 'scale(0)';
  worldBadge.style.transition = 'transform 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.49)';
  worldBadge.style.boxShadow = '0 0 30px rgba(255, 85, 0, 0.7)';
  
  // Create "WORLD" text
  const worldText = document.createElement('div');
  worldText.textContent = 'WORLD';
  worldText.style.color = '#FF5500';
  worldText.style.fontSize = '24px';
  worldText.style.fontWeight = 'bold';
  worldText.style.marginBottom = '5px';
  
  // Create number
  const worldNumElement = document.createElement('div');
  worldNumElement.textContent = worldNumber.toString();
  worldNumElement.style.color = '#FFFFFF';
  worldNumElement.style.fontSize = '60px';
  worldNumElement.style.fontWeight = 'bold';
  worldNumElement.style.lineHeight = '1';
  
  // Assemble the badge
  worldBadge.appendChild(worldText);
  worldBadge.appendChild(worldNumElement);
  
  // Create outer glow circles
  const createGlowCircle = (size, delay, duration) => {
    const circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.borderRadius = '50%';
    circle.style.border = '2px solid #FF5500';
    circle.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.5)';
    circle.style.opacity = '0';
    circle.style.transform = 'scale(0.5)';
    
    // Animation for the glow circle
    const animation = circle.animate([
      { transform: 'scale(0.5)', opacity: 0.7 },
      { transform: 'scale(1.5)', opacity: 0 }
    ], {
      duration: duration,
      delay: delay,
      iterations: Infinity
    });
    
    return circle;
  };
  
  // Add multiple glow circles with different sizes and timings
  animationBox.appendChild(createGlowCircle(160, 0, 2000));
  animationBox.appendChild(createGlowCircle(180, 500, 2000));
  animationBox.appendChild(createGlowCircle(200, 1000, 2000));
  
  // Add the badge to the animation box
  animationBox.appendChild(worldBadge);
  
  // Create unlock message
  const unlockMessage = document.createElement('div');
  unlockMessage.textContent = 'NEW WORLD UNLOCKED!';
  unlockMessage.style.color = '#FF5500';
  unlockMessage.style.fontSize = '28px';
  unlockMessage.style.fontWeight = 'bold';
  unlockMessage.style.marginTop = '40px';
  unlockMessage.style.textAlign = 'center';
  unlockMessage.style.opacity = '0';
  unlockMessage.style.transform = 'translateY(20px)';
  unlockMessage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  unlockMessage.style.textShadow = '0 0 10px rgba(255, 85, 0, 0.7)';
  
  // Create continue button
  const continueButton = document.createElement('button');
  continueButton.textContent = 'CONTINUE';
  continueButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  continueButton.style.color = '#FF5500';
  continueButton.style.border = '2px solid #FF5500';
  continueButton.style.borderRadius = '30px';
  continueButton.style.padding = '12px 30px';
  continueButton.style.fontSize = '18px';
  continueButton.style.fontWeight = 'bold';
  continueButton.style.marginTop = '30px';
  continueButton.style.cursor = 'pointer';
  continueButton.style.opacity = '0';
  continueButton.style.transform = 'translateY(20px)';
  continueButton.style.transition = 'opacity 0.5s ease, transform 0.5s ease, background-color 0.2s ease';
  continueButton.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.3)';
  
  // Add hover effects
  continueButton.addEventListener('mouseover', () => {
    continueButton.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
    continueButton.style.transform = 'translateY(20px) scale(1.05)';
    continueButton.style.boxShadow = '0 0 20px rgba(255, 85, 0, 0.5)';
  });
  
  continueButton.addEventListener('mouseout', () => {
    continueButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    continueButton.style.transform = 'translateY(20px) scale(1)';
    continueButton.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.3)';
  });
  
  // Continue button click handler
  continueButton.addEventListener('click', () => {
    // Hide the animation with fade out
    unlockContainer.style.opacity = '0';
    
    // Remove after animation completes
    setTimeout(() => {
      unlockContainer.remove();
    }, 500);
  });
  
  // Assemble the animation
  unlockContainer.appendChild(animationBox);
  unlockContainer.appendChild(unlockMessage);
  unlockContainer.appendChild(continueButton);
  
  // Add to DOM
  document.body.appendChild(unlockContainer);
  
  // Start the animation sequence
  setTimeout(() => {
    unlockContainer.style.opacity = '1';
    
    // Show the badge with a popout effect
    setTimeout(() => {
      worldBadge.style.transform = 'scale(1)';
      
      // Add a highlight flash
      setTimeout(() => {
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.borderRadius = '50%';
        flash.style.backgroundColor = '#FF5500';
        flash.style.opacity = '0';
        
        worldBadge.insertBefore(flash, worldBadge.firstChild);
        
        flash.animate([
          { opacity: 0.7 },
          { opacity: 0 }
        ], {
          duration: 800,
          easing: 'ease-out'
        });
        
        // Show the message after the badge animation
        setTimeout(() => {
          unlockMessage.style.opacity = '1';
          unlockMessage.style.transform = 'translateY(0)';
          
          // Show continue button last
          setTimeout(() => {
            continueButton.style.opacity = '1';
            continueButton.style.transform = 'translateY(0)';
          }, 500);
        }, 300);
      }, 200);
    }, 400);
  }, 100);
}