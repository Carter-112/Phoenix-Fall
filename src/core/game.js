import { Phoenix } from '../entities/phoenix.js';
import { ParticleSystem } from './particleSystem.js';
import { FlameHelicopter } from '../entities/flameHelicopter.js';
import { MagmaBat } from '../entities/magmaBat.js';
import { Ember } from '../entities/ember.js';
import { UI } from '../ui/ui.js';
import { GameState } from './gameState.js';
import { SoundManager } from './soundManager.js';
import { XPNotification } from '../ui/xpNotification.js';
import { PauseMenu } from '../ui/pauseMenu.js';
import { PauseButton } from '../ui/pauseButton.js';
import { WorldManager } from './WorldManager.js';
import { UniversalUI } from '../ui/UniversalUI.js';
import { WallHazard } from '../hazards/wallHazard.js';
import { ScreenEffects } from '../ui/screenEffects.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Add responsive canvas styling
    this.canvas.className = 'game-canvas';
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.touchAction = 'none'; // Prevent default touch actions for better control
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    
    this.container.appendChild(this.canvas);
    
    // Initialize callbacks
    this.gameOverCallback = null;
    this.worldCompleteCallback = null;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.particleSystem = new ParticleSystem();
    this.phoenix = new Phoenix(this.width / 2, this.height * 0.7, this.particleSystem);
    this.gameState = new GameState();
    this.ui = new UI(this);
    this.universalUI = new UniversalUI(this);
    this.soundManager = new SoundManager();
    this.xpNotification = new XPNotification();
    
    // Initialize world manager
    this.worldManager = new WorldManager(this);
    
    // Initialize screen effects
    this.screenEffects = new ScreenEffects(this);
    
    // Initialize pause menu
    this.pauseMenu = new PauseMenu(this);
    
    // Initialize pause button
    this.pauseButton = new PauseButton(this.container, () => {
      if (this.pauseMenu) {
        this.pauseMenu.pauseGame();
      }
    });
    
    this.embers = [];
    this.hazards = [];
    this.enemies = [];
    this.lastEmberTime = 0;
    this.lastHazardTime = 0;
    this.lastEnemyTime = 0;
    
    this.setupListeners();
    this.isRunning = false;
    this.isPaused = false;
    
    // Screen shake effect properties
    this.screenShake = {
      active: false,
      intensity: 0,
      duration: 0,
      timeLeft: 0,
      offsetX: 0,
      offsetY: 0
    };
  }
  
  setupListeners() {
    window.addEventListener('resize', () => this.handleResize());
    
    // Mouse/touch controls
    this.container.addEventListener('mousemove', (e) => {
      if (this.isRunning) {
        this.phoenix.targetX = e.clientX;
        this.phoenix.targetY = e.clientY;
      }
    });
    
    this.container.addEventListener('touchmove', (e) => {
      if (this.isRunning && e.touches[0]) {
        e.preventDefault();
        this.phoenix.targetX = e.touches[0].clientX;
        this.phoenix.targetY = e.touches[0].clientY;
      }
    }, { passive: false });
    
    // Add double-tap/double-click support for special attack
    this.lastClickTime = 0;
    this.clickCount = 0;
    
    this.container.addEventListener('click', (e) => {
      // Get mouse position relative to canvas
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check for double click to trigger special attack
      const currentTime = Date.now();
      if (currentTime - this.lastClickTime < 300) {
        // This is a double click
        this.clickCount++;
        if (this.clickCount >= 2 && this.isRunning && !this.gameState.gameOver) {
          // Trigger phoenix special attack
          this.triggerPhoenixSpecialAttack(mouseX, mouseY);
          this.clickCount = 0;
        }
      } else {
        // Reset click count if too much time has passed
        this.clickCount = 1;
      }
      this.lastClickTime = currentTime;
      
      // Handle game over screen buttons - delegate to UI if available
      if (!this.isRunning && this.gameState.gameOver) {
        if (this.ui && typeof this.ui.handleGameOverClick === 'function') {
          // Let the UI handle the click event if the method exists
          this.ui.handleGameOverClick(e);
          return;
        } else {
          // Legacy fallback for older code
          const containerWidth = Math.min(400, this.width * 0.8);
          const containerHeight = 320;
          const containerX = this.width / 2 - containerWidth / 2;
          const containerY = this.height / 2 - containerHeight / 2;
          
          // Restart button dimensions
          const buttonWidth = Math.min(200, containerWidth * 0.7);
          const buttonHeight = 40;
          const buttonX = this.width / 2 - buttonWidth / 2;
          const buttonY = containerY + containerHeight - 70;
          
          // Exit to menu button dimensions
          const menuButtonWidth = Math.min(180, containerWidth * 0.6);
          const menuButtonHeight = 35;
          const menuButtonX = this.width / 2 - menuButtonWidth / 2;
          const menuButtonY = buttonY + buttonHeight + 15;
          
          // Check if click is on exit to menu button
          if (mouseX >= menuButtonX && mouseX <= menuButtonX + menuButtonWidth &&
              mouseY >= menuButtonY && mouseY <= menuButtonY + menuButtonHeight) {
            // Exit to menu
            this.exitToMenu();
            return;
          }
          
          // Otherwise restart the game (default behavior)
          this.restart();
        }
      }
      
      // Handle world complete screen buttons
      if (!this.isRunning && this.gameState.worldComplete) {
        if (this.ui && typeof this.ui.handleWorldCompleteClick === 'function') {
          // Let the UI handle the click event if the method exists
          this.ui.handleWorldCompleteClick(e);
          return;
        } else if (this.ui.worldCompleteButtons) {
          // Legacy fallback for older code
          console.log('Checking world complete button clicks');
          const { continue: continueBtn, exitToMenu } = this.ui.worldCompleteButtons;
          
          // Check if click is on exit to menu button
          if (mouseX >= exitToMenu.x && mouseX <= exitToMenu.x + exitToMenu.width &&
              mouseY >= exitToMenu.y && mouseY <= exitToMenu.y + exitToMenu.height) {
            console.log('Exit to menu button clicked');
            // Force full page reload instead of just returning to menu
            window.location.reload();
            return;
          }
          
          // Check if click is on continue button
          if (mouseX >= continueBtn.x && mouseX <= continueBtn.x + continueBtn.width &&
              mouseY >= continueBtn.y && mouseY <= continueBtn.y + continueBtn.height) {
            console.log('Continue button clicked');
            // Force full page reload to restart with the next world
            window.location.reload();
            return;
          }
        }
      }
    });
  }
  
  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Check if we need to adjust UI based on orientation
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    // Adjust phoenix position to keep it within bounds after resize
    if (this.phoenix) {
      // Keep phoenix within screen bounds
      this.phoenix.x = Math.min(Math.max(this.phoenix.x, 30), this.width - 30);
      this.phoenix.y = Math.min(Math.max(this.phoenix.y, 30), this.height - 30);
      
      // Adjust target position if it's outside bounds
      this.phoenix.targetX = Math.min(Math.max(this.phoenix.targetX, 0), this.width);
      this.phoenix.targetY = Math.min(Math.max(this.phoenix.targetY, 0), this.height);
    }
    
    // Force a redraw of UI elements that may need repositioning
    this.render();
  }
  
  start() {
    if (this.isRunning) return;
    
    console.log('Starting game...');
    this.isRunning = true;
    this.isPaused = false;
    this.gameState.paused = this.isPaused;
    
    console.log('Debug: Game state is', this.gameState);
    this.gameState.reset();
    
    // Reset phoenix
    this.resetLevel();
    
    // Clear any existing animation frame
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    }
    
    // Set up the game loop
    this.lastFrameTime = null;
    this.requestAnimationFrameId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    
    // Hide menu UI elements
    this.hideMenuUIElements();
    
    // Show UI elements if the method exists
    if (this.ui) {
      if (typeof this.ui.showGameElements === 'function') {
        this.ui.showGameElements();
      } else {
        // Fallback for older UI implementations
        console.log('UI.showGameElements not available - using fallback method');
        if (typeof this.ui.draw === 'function') {
          this.ui.draw(window.innerWidth, window.innerHeight);
        }
      }
    }
    
    // Start gameplay music if available and the method exists
    if (this.soundManager) {
      if (typeof this.soundManager.startGameplayLoop === 'function') {
        this.soundManager.startGameplayLoop();
      } else if (typeof this.soundManager.playGameplayLoop === 'function') {
        // Fallback to playGameplayLoop if available
        console.log('soundManager.startGameplayLoop not available - using playGameplayLoop instead');
        this.soundManager.playGameplayLoop();
      } else {
        console.log('No suitable gameplay audio method found in soundManager');
      }
    }
    
    // Show the pause button if it exists
    if (this.pauseButton) {
      this.pauseButton.show();
    }
    
    console.log('Game started');
  }
  
  // Helper method to hide menu UI elements
  hideMenuUIElements() {
    // Find and hide rank bar container
    const rankBarElement = document.querySelector('.rank-bar-container');
    if (rankBarElement) {
      rankBarElement.style.opacity = '0';
      setTimeout(() => {
        rankBarElement.style.display = 'none';
      }, 500);
    }
  }
  
  // Helper method to show menu UI elements
  showMenuUIElements() {
    // Find and show rank bar container
    const rankBarElement = document.querySelector('.rank-bar-container');
    if (rankBarElement) {
      rankBarElement.style.display = 'flex';
      setTimeout(() => {
        rankBarElement.style.opacity = '1';
      }, 10);
    }
  }
  
  restart() {
    console.log('Restarting game...');
    
    // Play button sound if available
    if (this.soundManager) {
      this.soundManager.playSound('button', 0.5);
    }
    
    // Stop any sounds and reset game state
    if (this.soundManager) {
      this.soundManager.stopAllSounds();
    }
    
    // Reset the game state (preserving level and XP)
    this.gameState.reset(true); // true = preserve progress
    
    // Reset UI timers
    if (this.ui) {
      this.ui.gameOverStartTime = null;
      this.ui.worldCompleteStartTime = null;
    }
    
    // Reset phoenix
    if (this.phoenix) {
      this.phoenix.reset();
    }
    
    // Clear arrays
    this.embers = [];
    this.hazards = [];
    this.enemies = [];
    
    // Reset particle system
    if (this.particleSystem) {
      this.particleSystem.clearAll();
    }
    
    // Clear any active UI messages
    if (this.ui && this.ui.messages) {
      this.ui.messages = [];
    }
    
    // Reset timers
    this.lastEmberTime = 0;
    this.lastHazardTime = 0;
    this.lastEnemyTime = 0;
    
    // Reset animation and game state
    this.lastFrameTime = 0;
    this.isPaused = false;
    this.gameState.gameOver = false;
    this.gameState.worldComplete = false;
    
    // Re-enable universal UI if it was disabled during world complete
    window.universalUIEnabled = true;
    
    // Set the game as running again
    this.isRunning = true;
    
    // Restart the game loop if needed
    if (!this.requestAnimationFrameId) {
      this.requestAnimationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // Restart game music
    if (this.soundManager && typeof this.soundManager.playGameplayLoop === 'function') {
      this.soundManager.playGameplayLoop();
    }
    
    console.log('Game restarted successfully');
  }
  
  // New method to exit to menu instead of restarting
  exitToMenu() {
    // Simply reload the page to return to initial state
    window.location.reload();
  }
  
  // Add exitToMainMenu method that's called from UI.js
  exitToMainMenu() {
    // Simply reload the page to return to initial state
    window.location.reload();
  }
  
  spawnEmber() {
    // Check if game is still active
    if (!this.isRunning || this.gameState.gameOver || this.gameState.worldComplete) {
      return null; // Don't spawn embers if game is not actively running
    }

    // Make sure we have a valid particle system before proceeding
    if (!this.particleSystem) {
      console.warn('Attempted to spawn ember but particleSystem is not initialized');
      return null;
    }
    
    // Calculate a random position within screen bounds
    const padding = 50;
    const x = padding + Math.random() * (this.width - padding * 2);
    const y = -50; // Start above the screen
    
    // Create a different ember based on world
    let ember = null;
    
    try {
      // Get the current world to determine which ember to create
      const worldNumber = this.worldManager ? this.worldManager.getCurrentWorldNumber() : 1;
      
      // Create a standard ember if world-specific embers aren't available
      const EmberClass = this.worldManager?.getCurrentWorld()?.EmberClass || Ember;
      
      // Create ember with the particle system for visual effects
      ember = new EmberClass(x, y, this.particleSystem, 10);
      
      // Add to embers array
      if (ember) {
        this.embers.push(ember);
      }
    } catch (error) {
      console.error('Error creating ember:', error);
    }
    
    return ember;
  }
  
  spawnHazard() {
    // Determine spawn position
    let x, y;
    
    // 80% chance to spawn from top, 20% from sides
    if (Math.random() < 0.8) {
      x = Math.random() * this.width;
      y = -50;
    } else {
      x = Math.random() < 0.5 ? -30 : this.width + 30;
      y = Math.random() * (this.height / 2);
    }
    
    // Use world coordinator to spawn hazards if available
    if (this.worldManager && this.worldManager.getCurrentHazardCoordinator()) {
      const coordinator = this.worldManager.getCurrentHazardCoordinator();
      coordinator.spawnHazard(x, y);
      return;
    }
    
    // Fallback - just spawn FlameHelicopter
    this.hazards.push(new FlameHelicopter(x, y, this.particleSystem));
  }
  
  spawnEnemy() {
    // Determine spawn position
    let x, y;
    
    if (Math.random() < 0.7) {
      // 70% chance to spawn from top
      x = Math.random() * this.width;
      y = -50;
    } else {
      // 30% chance to spawn from sides
      x = Math.random() < 0.5 ? -30 : this.width + 30;
      y = Math.random() * (this.height / 2);
    }
    
    // Use world coordinator to spawn enemies if available
    if (this.worldManager && this.worldManager.getCurrentEnemyCoordinator()) {
      const coordinator = this.worldManager.getCurrentEnemyCoordinator();
      coordinator.spawnEnemy(x, y, this);
    } else {
      // Fallback - spawn MagmaBat
      this.enemies.push(new MagmaBat(x, y, this.particleSystem));
    }
  }
  
  update(deltaTime) {
    // Don't update if the world is complete or game is over
    if (this.gameState.worldComplete || this.gameState.gameOver) return;
    
    // Update game time
    this.gameTime += deltaTime;
    
    // Safety check - prevent infinite loops
    if (deltaTime <= 0) return;
    
    // Update the survival time counter
    this.gameState.survivalTime += deltaTime;
    
    // Update phoenix, particles, and other game elements
    this.phoenix.update(deltaTime);
    this.particleSystem.update(deltaTime);
    
    // Only spawn embers if the game is actually running and not paused
    if (this.isRunning && !this.isPaused && Date.now() - this.lastEmberTime > 300) {
      // Spawn multiple embers at once (3-7)
      const emberCount = Math.floor(Math.random() * 5) + 3; // 3-7 embers
      for (let i = 0; i < emberCount; i++) {
        this.spawnEmber();
      }
      this.lastEmberTime = Date.now();
      console.log(`Spawned ${emberCount} embers. Total: ${this.embers.length}`);
    }
    
    // Check immediately if the phoenix has no health or game is over - don't continue updates
    if (this.phoenix.health <= 0 || this.gameState.gameOver) {
      if (!this.gameState.gameOver) {
        // If health is 0 but game is not marked as over yet, call handlePhoenixDefeated
        this.handlePhoenixDefeated();
      }
      return; // Stop all updates immediately when dead
    }

    // No auto-rise for phoenix, but track altitude by time
    this.gameState.altitude -= 60 * deltaTime;
    
    // Spawn hazards (flame helicopters) - less frequent but more challenging
    const hazardInterval = 4000 - Math.min(1500, this.gameState.survivalTime * 10);
    if (Date.now() - this.lastHazardTime > hazardInterval) {
      this.spawnHazard();
      // Occasionally spawn multiple helicopters in formation
      if (this.gameState.survivalTime > 30 && Math.random() < 0.3) {
        // Create a formation of 2-3 helicopters
        const formationCount = Math.random() < 0.5 ? 2 : 3;
        const baseX = Math.random() * this.width;
        
        for (let i = 0; i < formationCount; i++) {
          const offsetX = (i - (formationCount-1)/2) * 80;
          this.hazards.push(new FlameHelicopter(
            baseX + offsetX, 
            -80 - i * 30, 
            this.particleSystem
          ));
        }
      }
      this.lastHazardTime = Date.now();
    }
    
    // Spawn enemies - magma bats, etc.
    const enemyInterval = 2000 - Math.min(1000, this.gameState.survivalTime * 5);
    if (Date.now() - this.lastEnemyTime > enemyInterval) {
      this.spawnEnemy();
      this.lastEnemyTime = Date.now();
    }
    
    // Update world manager for enemy spawning
    if (this.worldManager) {
      this.worldManager.update(deltaTime);
    }
    
    // Update and check collisions with embers
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const ember = this.embers[i];
      if (!ember) {
        this.embers.splice(i, 1);
        continue;
      }
      
      // Make sure update is called with deltaTime
      ember.update(deltaTime);
      
      // Check if phoenix collected ember
      const dx = this.phoenix.x - ember.x;
      const dy = this.phoenix.y - ember.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Increase collection radius for better gameplay
      const collectionRadius = 60; // Increased from 40
      
      if (distance < collectionRadius) { // Larger collection radius
        this.gameState.addXP(ember.value || 10);
        this.embers.splice(i, 1);
        
        // Play ember collection sound
        this.soundManager.playEmberCollect();
      } else if (ember.y > this.height + 100 || ember.x < -100 || ember.x > this.width + 100) {
        // Remove ember if it's off-screen
        this.embers.splice(i, 1);
      }
    }
    
    // Update and check collisions with hazards (helicopters)
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hazard = this.hazards[i];
      
      // Skip inactive hazards
      if (!hazard.active) {
        this.hazards.splice(i, 1);
        continue;
      }
      
      // Update target position if in charge mode (for FlameHelicopter)
      if (hazard.chargeMode) {
        hazard.targetX = this.phoenix.x;
        hazard.targetY = this.phoenix.y;
      }
      
      hazard.update(deltaTime);
      
      // Different collision detection based on hazard type
      let collision = false;
      
      if (hazard instanceof WallHazard) {
        // Use the WallHazard's own collision detection
        collision = hazard.checkCollision(this.phoenix);
        
        if (collision) {
          // Trigger phoenix damage animation and check if it died
          const phoenixDied = this.phoenix.takeDamage(hazard.damage);
          
          // Trigger screen shake for the hit
          this.triggerScreenShake(0.5, 0.8);
          
          // Check if phoenix died (health reached zero)
          if (phoenixDied) {
            this.gameState.gameOver = true;
            this.isRunning = false;
            this.triggerScreenShake(0.8, 1.5); // Stronger shake when player dies
            this.ui.gameOverStartTime = Date.now(); // Reset the game over animation timer
            
            // Play game over sound
            this.soundManager.stopGameplayLoop();
            this.soundManager.playGameOver();
          }
        }
      } else {
        // Default circular collision detection for other hazards
        const dx = this.phoenix.x - hazard.x;
        const dy = this.phoenix.y - hazard.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check for near-miss (between 1.5x and 2.5x collision distance)
        const nearMissDistance = hazard.size / 2 + 50;
        if (distance > hazard.size / 2 + 20 && distance < nearMissDistance) {
          this.phoenix.triggerNearMiss();
        }
        
        if (distance < hazard.size / 2 + 20) { // Collision
          collision = true;
          
          // Trigger phoenix damage animation and check if it died
          const phoenixDied = this.phoenix.takeDamage();
          
          // Trigger screen shake for the hit
          this.triggerScreenShake(0.5, 0.8);
          
          // Check if phoenix died (health reached zero)
          if (phoenixDied) {
            this.gameState.gameOver = true;
            this.isRunning = false;
            this.triggerScreenShake(0.8, 1.5); // Stronger shake when player dies
            this.ui.gameOverStartTime = Date.now(); // Reset the game over animation timer
            
            // Play game over sound
            this.soundManager.stopGameplayLoop();
            this.soundManager.playGameOver();
          }
        } 
      }
      
      // Remove hazard if it's off-screen
      if (hazard.y > this.height + 100 || (!hazard.active)) {
        this.hazards.splice(i, 1);
        continue;
      }
      
      // Check if phoenix flame trail hits hazard (only for destroyable hazards)
      if (hazard.health !== undefined) {
        let flameHit = false;
        if (this.phoenix.trailPoints.length > 3) {
          let inHeatRadius = false;
          // Check only recent trail points (more recent = more damage)
          for (let j = 0; j < Math.min(10, this.phoenix.trailPoints.length); j++) {
            const point = this.phoenix.trailPoints[j];
            
            // Check if hazard is in heat radius of this trail point
            if (this.phoenix.isPointInHeatRadius(hazard.x, hazard.y, point)) {
              // Set burning effect based on how close to phoenix
              const burnIntensity = 1 - (j / 10); // More intense for points closer to phoenix
              
              // Set burning if not already burning or extend/intensify if closer to phoenix
              if (!hazard.burning || burnIntensity > hazard.burnIntensity) {
                hazard.setBurning(3 + burnIntensity * 2, 0.5 + burnIntensity * 0.5);
              }
              
              inHeatRadius = true;
            }
            
            const trailDx = point.x - hazard.x;
            const trailDy = point.y - hazard.y;
            const trailDistance = Math.sqrt(trailDx * trailDx + trailDy * trailDy);
            
            // Direct trail hit does immediate damage
            if (trailDistance < hazard.size / 2) {
              flameHit = true;
              break;
            }
          }
        }
        
        if (flameHit) {
          const defeated = hazard.takeDamage();
          
          // Play hit sound regardless of whether helicopter is defeated
          this.soundManager.playHelicopterHit();
          
          if (defeated) {
            // Helicopter defeated - drop XP and remove
            this.gameState.addXP(20);
            
            // Play explosion sound
            this.soundManager.playExplosion(hazard.size / 40);
            
            // Activate screen shake effect
            this.triggerScreenShake(0.4, 0.5); // moderate intensity and duration
            
            // Spawn embers at hazard position
            for (let j = 0; j < 5; j++) {
              const emberX = hazard.x + (Math.random() - 0.5) * 30;
              const emberY = hazard.y + (Math.random() - 0.5) * 30;
              this.createEmberAt(emberX, emberY, 10);
            }
            
            // Add extra explosion particles
            for (let j = 0; j < 15; j++) {
              this.particleSystem.createEmber(
                hazard.x + (Math.random() - 0.5) * 40, 
                hazard.y + (Math.random() - 0.5) * 40
              );
            }
            
            this.hazards.splice(i, 1);
          }
        }
      }
      
      // Check if hazard died from burning damage
      if (hazard.health !== undefined && hazard.health <= 0) {
        // Hazard defeated - drop XP and remove
        this.gameState.addXP(20);
        
        // Play explosion sound
        this.soundManager.playExplosion(hazard.size / 40);
        
        // Activate screen shake effect
        this.triggerScreenShake(0.4, 0.5); // moderate intensity and duration
        
        // Spawn embers at hazard position
        for (let j = 0; j < 5; j++) {
          const emberX = hazard.x + (Math.random() - 0.5) * 30;
          const emberY = hazard.y + (Math.random() - 0.5) * 30;
          this.createEmberAt(emberX, emberY, 10);
        }
        
        // Add extra explosion particles
        for (let j = 0; j < 15; j++) {
          this.particleSystem.createEmber(
            hazard.x + (Math.random() - 0.5) * 40, 
            hazard.y + (Math.random() - 0.5) * 40
          );
        }
        
        this.hazards.splice(i, 1);
      }
    }
    
    // Update enemies and check collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime, this.phoenix.x, this.phoenix.y);
      
      // Check if enemy is off-screen
      if (enemy.y > this.height + 50 || 
          enemy.x < -50 || 
          enemy.x > this.width + 50) {
        this.enemies.splice(i, 1);
        continue;
      }
      
      // Check if phoenix hits enemy
      const dx = this.phoenix.x - enemy.x;
      const dy = this.phoenix.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check for near-miss (between 1.5x and 2.5x collision distance)
      if (distance > 30 && distance < 75) {
        this.phoenix.triggerNearMiss();
      }
      
      if (distance < 30) { // Direct collision
        // Trigger phoenix damage animation and check if it died
        const phoenixDied = this.phoenix.takeDamage();
        
        // Trigger screen shake for the hit
        this.triggerScreenShake(0.5, 0.8);
        
        // Check if phoenix died (health reached zero)
        if (phoenixDied) {
          this.gameState.gameOver = true;
          this.isRunning = false;
          this.triggerScreenShake(0.8, 1.5); // Stronger shake when player dies
          this.ui.gameOverStartTime = Date.now(); // Reset the game over animation timer
          
          // Play game over sound
          this.soundManager.stopGameplayLoop();
          this.soundManager.playGameOver();
        }
      }
      
      // Check if phoenix flame trail hits enemy
      let flameHit = false;
      if (this.phoenix.trailPoints.length > 3) {
        let inHeatRadius = false;
        // Check only recent trail points (more recent = more damage)
        for (let j = 0; j < Math.min(10, this.phoenix.trailPoints.length); j++) {
          const point = this.phoenix.trailPoints[j];
          
          // Check if enemy is in heat radius of this trail point
          if (this.phoenix.isPointInHeatRadius(enemy.x, enemy.y, point)) {
            // Set burning effect based on how close to phoenix
            const burnIntensity = 1 - (j / 10); // More intense for points closer to phoenix
            
            // Set burning if not already burning or extend/intensify if closer to phoenix
            if (!enemy.burning || burnIntensity > enemy.burnIntensity) {
              enemy.setBurning(2 + burnIntensity * 2, 0.3 + burnIntensity * 0.4);
            }
            
            inHeatRadius = true;
          }
          
          const trailDx = point.x - enemy.x;
          const trailDy = point.y - enemy.y;
          const trailDistance = Math.sqrt(trailDx * trailDx + trailDy * trailDy);
          
          // Direct trail hit does immediate damage
          if (trailDistance < 25) {
            flameHit = true;
            break;
          }
        }
      }
      
      if (flameHit) {
        const defeated = enemy.takeDamage();
        
        // Play hit sound
        this.soundManager.playHelicopterHit();
        if (defeated) {
          // Enemy defeated - drop XP and remove
          this.gameState.addXP(25);
          
          // Play smaller explosion for bats
          this.soundManager.playExplosion(0.5);
          
          // Small screen shake for regular enemies
          this.triggerScreenShake(0.2, 0.3);
          
          // Spawn embers at enemy position
          for (let j = 0; j < 3; j++) {
            const emberX = enemy.x + (Math.random() - 0.5) * 20;
            const emberY = enemy.y + (Math.random() - 0.5) * 20;
            this.createEmberAt(emberX, emberY, 10);
          }
          
          this.enemies.splice(i, 1);
        }
      }
      
      // Check if enemy died from burning damage
      if (enemy.health <= 0) {
        // Enemy defeated - drop XP and remove
        this.gameState.addXP(25);
        
        // Play smaller explosion for bats
        this.soundManager.playExplosion(0.5);
        
        // Small screen shake for regular enemies
        this.triggerScreenShake(0.2, 0.3);
        
        // Spawn embers at enemy position
        for (let j = 0; j < 3; j++) {
          const emberX = enemy.x + (Math.random() - 0.5) * 20;
          const emberY = enemy.y + (Math.random() - 0.5) * 20;
          this.createEmberAt(emberX, emberY, 10);
        }
        
        this.enemies.splice(i, 1);
      }
    }
    
    // Update screen shake effect
    if (this.screenShake.active) {
      this.screenShake.timeLeft -= deltaTime;
      
      if (this.screenShake.timeLeft <= 0) {
        // End shake effect
        this.screenShake.active = false;
        this.screenShake.offsetX = 0;
        this.screenShake.offsetY = 0;
      } else {
        // Calculate new random offsets based on remaining intensity
        const remainingIntensity = this.screenShake.intensity * (this.screenShake.timeLeft / this.screenShake.duration);
        this.screenShake.offsetX = (Math.random() * 2 - 1) * remainingIntensity * 20;
        this.screenShake.offsetY = (Math.random() * 2 - 1) * remainingIntensity * 20;
      }
    }
    
    // Check world completion based on time
    if (this.gameState.survivalTime >= this.gameState.getTotalLevelTime()) {
      // Only mark as complete if not already marked
      if (!this.gameState.worldComplete) {
        console.log(`World ${this.getCurrentWorld()} completed: survival time (${this.gameState.survivalTime.toFixed(2)}) >= total level time (${this.gameState.getTotalLevelTime()})`);
        
        // Complete the world in gameState and save progress
        this.gameState.completeWorld();
        
        // Stop all audio loops
        if (this.soundManager) {
          this.soundManager.stopGameplayLoop();
          this.soundManager.playWorldComplete();
        }
        
        // Reset UI timers for the world complete animation
        if (this.ui) {
          this.ui.worldCompleteStartTime = Date.now();
        }
        
        // Stop the game loop from continuing to update
        this.isRunning = false;
        
        // Disable the callback system from main.js that would auto-return to menu
        this.worldCompleteCallback = null;
        
        console.log("WORLD COMPLETE! Showing completion screen. Game has been frozen.");
        
        // Add XP to the global rank system when world is completed
        if (window.rankSystem) {
          // Add more XP for completing a world than for game over
          const rankXP = Math.floor(this.gameState.survivalTime * 4) + 
                        (this.gameState.level * 20) + 
                        Math.floor(this.gameState.xp / 3) + 
                        100; // Bonus for completion
          window.rankSystem.addXP(rankXP, false);
          window.rankSystem.saveRankData(); // Explicitly save rank data
        }
        
        // Force universal UI to be disabled temporarily to show our completion screen
        window.universalUIEnabled = false;
        
        // Hide pause button when world is complete
        if (this.pauseButton) {
          this.pauseButton.hide();
        }
        
        // Make sure world progression is saved even though we're not using the callback
        if (window.worldProgressionSystem) {
          const currentWorld = this.getCurrentWorld();
          window.worldProgressionSystem.completeWorld(currentWorld);
        }
        
        // Render one final frame to show the completion screen
        this.render();
        
        // Cancel any pending animation frame to truly stop the game loop
        if (this.requestAnimationFrameId) {
          cancelAnimationFrame(this.requestAnimationFrameId);
          this.requestAnimationFrameId = null;
        }
      }
    }
    
    // Check if phoenix health is zero but the game is still running (additional safety check)
    if (this.isRunning && this.phoenix.health <= 0) {
      this.gameState.gameOver = true;
      this.isRunning = false;
      this.ui.gameOverStartTime = Date.now();
      
      // Play game over sound
      this.soundManager.stopGameplayLoop();
      this.soundManager.playGameOver();
      
      // Add XP to the global rank system when game over
      if (window.rankSystem) {
        // Add XP based on survival time, level reached, and current XP
        const rankXP = Math.floor(this.gameState.survivalTime * 2) + 
                      (this.gameState.level * 10) + 
                      Math.floor(this.gameState.xp / 5);
        window.rankSystem.addXP(rankXP, false);
        window.rankSystem.saveRankData(); // Explicitly save rank data
      }
      
      // Don't automatically call the game over callback
      // Removed to prevent automatic return to main menu
    }
  }
  
  triggerScreenShake(intensity, duration) {
    this.screenShake.active = true;
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
    this.screenShake.timeLeft = duration;
  }
  
  triggerPhoenixSpecialAttack(targetX, targetY) {
    // Create a burst of flame particles radiating outward from the phoenix
    const burstCount = 24; // Number of flame projectiles
    const radius = 120; // Initial distance from phoenix
    
    // Play special attack sound
    this.soundManager.playExplosion(1.0);
    
    // Add screen shake effect
    this.triggerScreenShake(0.7, 1.0);
    
    // Create flame projectiles in all directions
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2;
      const xVel = Math.cos(angle) * 5;
      const yVel = Math.sin(angle) * 5;
      
      // Create flame particles in the particle system
      for (let j = 0; j < 3; j++) {
        const distanceMultiplier = 1 + j * 0.5;
        const x = this.phoenix.x + Math.cos(angle) * radius * distanceMultiplier;
        const y = this.phoenix.y + Math.sin(angle) * radius * distanceMultiplier;
        
        this.particleSystem.createEmber(x, y, xVel, yVel, 1.5);
      }
    }
    
    // Create burst effect directly on the phoenix
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const xVel = Math.cos(angle) * speed;
      const yVel = Math.sin(angle) * speed;
      
      this.particleSystem.createEmber(
        this.phoenix.x, 
        this.phoenix.y,
        xVel,
        yVel,
        1.0 + Math.random()
      );
    }
    
    // Damage all enemies within range with decreasing damage based on distance
    const maxDamageRadius = 300;
    
    // Calculate damage for all hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hazard = this.hazards[i];
      const dx = hazard.x - this.phoenix.x;
      const dy = hazard.y - this.phoenix.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= maxDamageRadius) {
        // Damage decreases with distance
        const damageMultiplier = 1 - (distance / maxDamageRadius);
        const damage = 50 * damageMultiplier;
        
        // Apply damage and check if hazard was defeated
        hazard.health -= damage;
        
        // Set burning effect on the hazard
        hazard.setBurning(4, 1.0);
        
        // Spawn visual effect at hazard position to show it was hit
        for (let j = 0; j < 8; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          this.particleSystem.createEmber(
            hazard.x, 
            hazard.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0.8
          );
        }
        
        // If hazard was defeated, handle the destruction
        if (hazard.health <= 0) {
          // Award XP for defeating the hazard
          this.gameState.addXP(20);
          
          // Play explosion sound
          this.soundManager.playExplosion(hazard.size / 40);
          
          // Add extra explosion particles
          for (let j = 0; j < 15; j++) {
            this.particleSystem.createEmber(
              hazard.x + (Math.random() - 0.5) * 40, 
              hazard.y + (Math.random() - 0.5) * 40
            );
          }
          
          // Remove the hazard
          this.hazards.splice(i, 1);
        }
      }
    }
    
    // Calculate damage for all enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dx = enemy.x - this.phoenix.x;
      const dy = enemy.y - this.phoenix.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= maxDamageRadius) {
        // Damage decreases with distance
        const damageMultiplier = 1 - (distance / maxDamageRadius);
        const damage = 40 * damageMultiplier;
        
        // Apply damage and check if enemy was defeated
        enemy.health -= damage;
        
        // Set burning effect on the enemy
        enemy.setBurning(3, 0.8);
        
        // Spawn visual effect at enemy position to show it was hit
        for (let j = 0; j < 6; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          this.particleSystem.createEmber(
            enemy.x, 
            enemy.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0.7
          );
        }
        
        // If enemy was defeated, handle the destruction
        if (enemy.health <= 0) {
          // Enemy defeated - drop XP and remove
          this.gameState.addXP(25);
          
          // Play smaller explosion for enemies
          this.soundManager.playExplosion(0.5);
          
          // Spawn embers at enemy position
          for (let j = 0; j < 3; j++) {
            const emberX = enemy.x + (Math.random() - 0.5) * 20;
            const emberY = enemy.y + (Math.random() - 0.5) * 20;
            this.createEmberAt(emberX, emberY, 10);
          }
          
          this.enemies.splice(i, 1);
        }
      }
    }
  }
  
  triggerFlashEffect() {
    // Use screen effects for flash
    if (this.screenEffects) {
      this.screenEffects.triggerFlash('white', 0.7, 0.3);
    }
  }
  
  /**
   * Main rendering method - manages all visual elements and transitions
   * Handles three states: menu display, active gameplay, and end screens
   */
  render() {
    // Apply the current world's theme before rendering
    const currentWorldConfig = this.getCurrentWorldConfig();
    if (currentWorldConfig && currentWorldConfig.settings) {
      // Set background color based on world settings
      this.canvas.style.backgroundColor = currentWorldConfig.settings.backgroundColor;
      document.body.style.backgroundColor = currentWorldConfig.settings.backgroundColor;
      
      // Ensure world-specific CSS class is applied
      const worldNumber = this.worldManager.getCurrentWorldNumber();
      document.body.setAttribute('data-world', worldNumber);
      
      // Remove any existing world classes
      for (let i = 1; i <= 6; i++) {
        document.body.classList.remove(`world-${i}`);
      }
      // Add current world class
      document.body.classList.add(`world-${worldNumber}`);
    }
    
    // Clear canvas with screen shake offset
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply screen shake if active
    if (this.screenShake.active) {
      this.ctx.save();
      this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
    }
    
    // Draw scrolling background with ember particles
    this.renderScrollingBackground();
    
    // Draw world-specific hazards and effects
    if (this.worldManager) {
      this.worldManager.draw(this.ctx, this.width, this.height);
    }
    
    // Only draw game objects if not in world complete or game over state
    if (!this.gameState.worldComplete && !this.gameState.gameOver) {
      // Draw hazards
      this.hazards.forEach(hazard => {
        if (hazard && typeof hazard.draw === 'function') {
          hazard.draw(this.ctx);
        }
      });
      
      // Draw enemies
      this.enemies.forEach(enemy => {
        if (enemy && typeof enemy.draw === 'function') {
          enemy.draw(this.ctx);
        }
      });
      
      // Draw phoenix
      if (this.phoenix && typeof this.phoenix.draw === 'function') {
        this.phoenix.draw(this.ctx);
      }
      
      // Draw particle effects
      if (this.particleSystem && typeof this.particleSystem.draw === 'function') {
        this.particleSystem.draw(this.ctx);
      }
      
      // Draw embers - moved here to ensure they're drawn on top of everything else
      this.embers.forEach(ember => {
        if (ember && typeof ember.draw === 'function') {
          ember.draw(this.ctx);
        }
      });
    }
    
    // Reset transform if screen shake was applied
    if (this.screenShake.active) {
      this.ctx.restore();
    }
    
    // Draw screen effects
    if (this.screenEffects) {
      this.screenEffects.draw();
    }
    
    // Draw UI
    if (this.ui && typeof this.ui.draw === 'function') {
      this.ui.draw(this.width, this.height);
    }
    
    // Draw universal UI elements (always visible)
    if (this.universalUI && typeof this.universalUI.draw === 'function') {
      this.universalUI.draw(this.width, this.height);
    }
    
    // Draw XP notifications
    if (this.xpNotification && typeof this.xpNotification.draw === 'function') {
      this.xpNotification.draw(this.ctx);
    }
    
    // Draw pause menu if game is paused
    if (this.pauseMenu && this.pauseMenu.isPaused && typeof this.pauseMenu.draw === 'function') {
      this.pauseMenu.draw(this.ctx, this.width, this.height);
    }
  }
  
  // Update the scrolling background to match the world theme
  renderScrollingBackground() {
    const currentWorldConfig = this.getCurrentWorldConfig();
    let yOffset = this.gameState.altitude * 0.5 % this.height;
    
    // Draw world-specific background elements
    const worldNumber = this.worldManager.getCurrentWorldNumber();
    
    // Draw ember particles in background with world-specific colors
    this.drawEmberParticles(yOffset, worldNumber);
  }
  
  // Update to add world-specific ember colors
  drawEmberParticles(yOffset, worldNumber = 1) {
    // Get world-specific color palette
    let primaryColor, secondaryColor;
    
    switch(worldNumber) {
      case 2:
        primaryColor = '#009688';
        secondaryColor = '#4db6ac';
        break;
      case 3:
        primaryColor = '#03a9f4';
        secondaryColor = '#4fc3f7';
        break;
      case 4:
        primaryColor = '#9c27b0';
        secondaryColor = '#ba68c8';
        break;
      case 5:
        primaryColor = '#f44336';
        secondaryColor = '#e57373';
        break;
      case 6:
        primaryColor = '#ff9800';
        secondaryColor = '#ffb74d';
        break;
      default: // World 1 and fallback
        primaryColor = '#D93d00';
        secondaryColor = '#ff9d54';
    }
    
    // Draw ember particles with world-specific colors
    this.ctx.globalAlpha = 0.2;
    for (let i = 0; i < 50; i++) {
      const x = Math.sin(i * 727) * this.width;
      const y = (Math.cos(i * 373) * this.height * 2 - yOffset) % this.height;
      const size = Math.max(1 + Math.sin(i) * 2, 0.5);
      
      this.ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }
  
  gameLoop(timestamp) {
    // If this is the first frame, initialize lastFrameTime
    if (!this.lastFrameTime) {
      this.lastFrameTime = timestamp;
      this.requestAnimationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }
    
    // Calculate delta time in seconds (capped to prevent large jumps after tab switches)
    let deltaTime = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = timestamp;
    
    // Track FPS
    this.frames++;
    this.fpsTime += deltaTime;
    if (this.fpsTime >= 1) {
      this.fps = this.frames;
      this.frames = 0;
      this.fpsTime = 0;
    }
    
    // Only update game logic if not paused and game is running
    if (!this.isPaused && this.isRunning) {
      // Update game state
      this.update(deltaTime);
    }
    
    // Always render to show UI overlays (even when paused)
    this.render();
    
    // Determine if we should continue the game loop
    if (this.gameState.gameOver || this.gameState.worldComplete) {
      // The game is over or world is complete, stop requesting new frames
      // The final frame with the game over/world complete UI will remain visible
      console.log(`Game loop stopped due to ${this.gameState.gameOver ? 'game over' : 'world complete'}`);
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    } else if (!this.isPaused) {
      // Continue the game loop if the game is running normally
      this.requestAnimationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    // If paused, we don't request a new frame, letting the current UI stay visible
    // The game loop will resume when resumeGame() is called
  }
  
  // Set callback for game over event
  setGameOverCallback(callback) {
    if (typeof callback === 'function') {
      this.gameOverCallback = callback;
    }
  }
  
  // Set callback for world complete event
  setWorldCompleteCallback(callback) {
    if (typeof callback === 'function') {
      this.worldCompleteCallback = callback;
    }
  }
  
  /**
   * Sets the current world
   * @param {number} worldNumber - The world number to set
   * @returns {boolean} Whether the world was successfully set
   */
  setCurrentWorld(worldNumber) {
    if (!this.worldManager) {
      console.error('WorldManager not initialized');
      return false;
    }
    
    console.log(`Game attempting to set world to ${worldNumber}`);
    const success = this.worldManager.setCurrentWorld(worldNumber);
    
    if (success) {
      // Update game background based on world settings
      const worldSettings = this.worldManager.getCurrentWorld().settings;
      
      // Apply world-specific visual changes
      document.body.style.backgroundColor = worldSettings.backgroundColor;
      this.canvas.style.backgroundColor = worldSettings.backgroundColor;
      
      // Add data attribute to body for CSS targeting
      document.body.setAttribute('data-world', worldNumber);
      
      // Apply world-specific CSS class to body
      // Remove any existing world classes
      for (let i = 1; i <= 6; i++) {
        document.body.classList.remove(`world-${i}`);
      }
      // Add current world class
      document.body.classList.add(`world-${worldNumber}`);
      
      // Force a theme fix to ensure world visuals are applied
      if (window.worldThemeFixer) {
        window.worldThemeFixer.fixAllWorldThemes();
        window.worldThemeFixer.fixHazardCoordinators();
      }
      
      // Update game state with world settings
      if (worldSettings.timeToComplete) {
        this.gameState.setTotalLevelTime(worldSettings.timeToComplete);
      }
      
      // Reset level and XP when a world is selected (only if not in active gameplay)
      // This ensures each world attempt starts fresh
      if (!this.isRunning) {
        // Reset gameState level and XP
        this.gameState.level = 1;
        this.gameState.xp = 0;
        this.gameState.xpToNextLevel = 100;
        
        // Force the UI to update with the new level
        if (this.ui) {
          // Update the UI level display
          console.log('Updating UI to display level 1');
          
          // If there are any level display elements in the UI, force their update
          if (typeof this.ui.updateLevelDisplay === 'function') {
            this.ui.updateLevelDisplay(1, 0);
          } else {
            // If no specific method exists, force a full UI redraw
            if (this.ui && typeof this.ui.draw === 'function') {
              this.ui.draw(window.innerWidth, window.innerHeight);
            }
          }
        }
        
        console.log(`World changed: Level reset to ${this.gameState.level} and XP reset to ${this.gameState.xp}`);
      }
      
      console.log(`Game world set to ${worldNumber}: ${this.worldManager.getWorldName(worldNumber)}`);
    } else {
      console.error(`Failed to set game world to ${worldNumber}`);
    }
    
    return success;
  }
  
  /**
   * Gets the current world number
   * @returns {number} The current world number
   */
  getCurrentWorld() {
    return this.worldManager ? this.worldManager.getCurrentWorldNumber() : 1;
  }
  
  /**
   * Gets the current world configuration
   * @returns {Object} The current world configuration
   */
  getCurrentWorldConfig() {
    return this.worldManager ? this.worldManager.getCurrentWorld() : null;
  }
  
  // Called when the phoenix is defeated
  handlePhoenixDefeated() {
    if (!this.gameState.gameOver) {
      console.log('Phoenix defeated! Game over!');
      
      // Mark the game as over
      this.gameState.gameOver = true;
      // Stop the game from running
      this.isRunning = false;
      
      // Reset level
      this.resetLevel();
      
      // Reset the game over animation timer
      this.ui.gameOverStartTime = Date.now();
      
      // Trigger screen shake for dramatic effect
      this.triggerScreenShake(0.8, 1.5);
      
      // Play game over sound
      if (this.soundManager) {
        this.soundManager.stopGameplayLoop();
        this.soundManager.playGameOver();
      }
      
      // Add XP to the global rank system when game over
      if (window.rankSystem) {
        // Add XP based on survival time, level reached, and current XP
        const rankXP = Math.floor(this.gameState.survivalTime * 2) + 
                     (this.gameState.level * 10) + 
                     Math.floor(this.gameState.xp / 5);
        window.rankSystem.addXP(rankXP, false);
        window.rankSystem.saveRankData(); // Explicitly save rank data
      }
      
      // Don't automatically call the game over callback
      // We'll let the player click on buttons instead
    }
  }
  
  /**
   * Reset the player's level
   */
  resetLevel() {
    // Store original level for XP calculation
    const originalLevel = this.gameState.level;
    
    // Reset level to 1
    this.gameState.level = 1;
    
    // Reset XP to next level based on level 1
    this.gameState.xpToNextLevel = 100;
    
    console.log(`Level reset from ${originalLevel} to 1`);
  }
  
  // Handle collisions with hazards
  handleHazardCollision(hazardType, damage) {
    console.log(`Phoenix hit by hazard type: ${hazardType}, damage: ${damage}`);
    const isDead = this.phoenix.takeDamage(damage);
    
    if (isDead) {
      this.gameState.gameOver = true;
      
      // Reset level
      this.resetLevel();
      
      this.ui.gameOverStartTime = Date.now(); // Reset the game over animation timer
      
      // Play game over sound if sound manager is available
      if (this.soundManager) {
        this.soundManager.playGameOver();
      }
    }
  }
  
  // Handle time limit reached (player ran out of time)
  handleTimeLimitReached() {
    if (!this.gameState.gameOver && !this.gameState.worldComplete) {
      console.log('Time limit reached! Game over!');
      this.gameState.gameOver = true;
      
      // Reset level
      this.resetLevel();
      
      this.ui.gameOverStartTime = Date.now();
      
      // Play game over sound
      if (this.soundManager) {
        this.soundManager.playGameOver();
      }
    }
  }
  
  /**
   * Safely creates an ember at the specified location
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} value - XP value of the ember (default: 10)
   * @returns {Object|null} The created ember or null if creation failed
   */
  createEmberAt(x, y, value = 10) {
    // Skip if game is over or world complete
    if (!this.isRunning || this.gameState.gameOver || this.gameState.worldComplete) {
      return null;
    }
    
    // Verify we have required dependencies
    if (!this.particleSystem) {
      console.warn('Cannot create ember: particleSystem is not initialized');
      return null;
    }
    
    try {
      // Get the current world to determine which ember to create
      const EmberClass = this.worldManager?.getCurrentWorld()?.EmberClass || Ember;
      
      // Create ember with the particle system for visual effects
      const ember = new EmberClass(x, y, this.particleSystem, value);
      
      // Add to embers array
      if (ember) {
        this.embers.push(ember);
        return ember;
      }
    } catch (error) {
      console.error('Error creating ember:', error);
    }
    
    return null;
  }

  pauseGame() {
    if (!this.isRunning) return;
    
    this.isPaused = true;
    this.gameState.paused = true; // Keep synced for backwards compatibility
    console.log('Game paused');
    
    // Stop sound effects but allow background music to continue
    if (this.soundManager) {
      this.soundManager.pauseGameSounds();
    }
    
    // Show pause menu if available
    if (this.pauseMenu && typeof this.pauseMenu.show === 'function') {
      this.pauseMenu.show();
    }
    
    // Continue rendering for pause menu, but don't update game state
  }

  resumeGame() {
    if (!this.isRunning) return;
    
    this.isPaused = false;
    this.gameState.paused = false; // Keep synced for backwards compatibility
    console.log('Game resumed');
    
    // Resume any paused sounds
    if (this.soundManager) {
      this.soundManager.resumeGameSounds();
    }
    
    // Hide pause menu if available
    if (this.pauseMenu && typeof this.pauseMenu.hide === 'function') {
      this.pauseMenu.hide();
    }
    
    // Reset the last frame time to avoid a large delta time jump
    this.lastFrameTime = performance.now();
    
    // Restart the animation frame if needed
    if (!this.requestAnimationFrameId) {
      this.requestAnimationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
}