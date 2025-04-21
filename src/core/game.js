import { Phoenix } from '../entities/phoenix.js';
import { ParticleSystem } from './particleSystem.js';
import { Ember } from '../entities/ember.js';
import { FlameHelicopter } from '../entities/flameHelicopter.js';
import { MagmaBat } from '../entities/magmaBat.js';
import { UI } from '../ui/ui.js';
import { GameState } from './gameState.js';
import { SoundManager } from './soundManager.js';
import { XPNotification } from '../ui/xpNotification.js';
import { PauseMenu } from '../ui/pauseMenu.js';
import { PauseButton } from '../ui/pauseButton.js';
import { WorldManager } from './WorldManager.js';
import { UniversalUI } from '../ui/UniversalUI.js';

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
      
      // Handle game over screen restart button
      if (!this.isRunning && this.gameState.gameOver) {
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
      
      // Handle world complete screen buttons
      if (!this.isRunning && this.gameState.worldComplete) {
        const containerWidth = Math.min(400, this.width * 0.8);
        const containerHeight = 320;
        const containerX = this.width / 2 - containerWidth / 2;
        const containerY = this.height / 2 - containerHeight / 2;
        
        // Continue button dimensions
        const buttonWidth = Math.min(220, containerWidth * 0.8);
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
        
        // Otherwise continue to next level (default behavior)
        // This could be expanded later to implement actual level progression
        this.restart();
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
    this.isRunning = true;
    this.lastTimestamp = 0;
    
    // Explicitly reset the game level to 1 when starting a new game
    this.gameState.level = 1;
    
    // Explicitly reset XP to 0 when starting a new game
    this.gameState.xp = 0;
    
    // Also reset the XP needed for next level
    this.gameState.xpToNextLevel = 100;
    
    console.log('Game started: Level reset to', this.gameState.level, 'and XP reset to', this.gameState.xp);
    
    // Ensure UI is updated with the reset level and XP
    if (this.ui && typeof this.ui.updateLevelDisplay === 'function') {
      this.ui.updateLevelDisplay(1, 0);
    }
    
    // Hide any existing menu/UI elements that should be hidden during gameplay
    this.hideMenuUIElements();
    
    // Start ambient gameplay sound
    this.soundManager.playGameplayLoop();
    
    // Create pause menu if it doesn't already exist
    if (this.pauseMenu && !this.pauseMenu.menuElement) {
      this.pauseMenu.setupBackButtonHandling();
    }
    
    // Show pause button when game starts
    if (this.pauseButton) {
      this.pauseButton.show();
    }
    
    // Hide settings button when game starts
    const settingsButton = document.querySelector('.settings-button');
    if (settingsButton) {
      settingsButton.style.opacity = '0';
      setTimeout(() => {
        settingsButton.style.display = 'none';
      }, 500);
    }
    
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
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
    this.phoenix = new Phoenix(this.width / 2, this.height * 0.7, this.particleSystem);
    this.embers = [];
    this.hazards = [];
    this.enemies = [];
    
    // Reset the game state
    this.gameState.reset();
    
    // Explicitly force the level to 1 when restarting
    this.gameState.level = 1;
    
    // Explicitly reset XP to 0 when restarting
    this.gameState.xp = 0;
    
    // Make sure currentWorld is kept in sync
    if (this.worldManager) {
      this.gameState.currentWorld = this.worldManager.getCurrentWorldNumber();
    }
    
    console.log('Game restarted: Level reset to', this.gameState.level, 'and XP reset to', this.gameState.xp);
    this.isRunning = true;
    
    // Reset UI animation timers
    this.ui.gameOverStartTime = null;
    this.ui.worldCompleteStartTime = null;
    
    // Update phoenix reference in UI
    this.ui.phoenix = this.phoenix;
    
    // Stop any existing sounds and restart gameplay sound
    this.soundManager.stopGameplayLoop();
    this.soundManager.playGameplayLoop();
    
    // Update the rank display when restarting - but do NOT reset the global rank system
    if (window.rankSystem && document.querySelector('.rank-bar-container')) {
      // Remove the existing rank bar if it exists
      const existingRankBar = document.querySelector('.rank-bar-container');
      if (existingRankBar) {
        existingRankBar.remove();
      }
      
      // Create a new rank bar with the latest rank data
      if (this.container) {
        window.rankSystem.renderRankBar(this.container);
      }
    }
  }
  
  // New method to exit to menu instead of restarting
  exitToMenu() {
    // Simply reload the page to return to initial state
    window.location.reload();
  }
  
  // Add exitToMainMenu method that's called from UI.js
  exitToMainMenu() {
    console.log('Exiting to main menu');
    // Stop any sounds
    if (this.soundManager) {
      this.soundManager.stopGameplayLoop();
      this.soundManager.stopAll();
    }
    
    // Reset game state
    this.isRunning = false;
    this.gameState.reset();
    
    // Show UI elements like rank bar that are hidden during gameplay
    this.showMenuUIElements();
    
    // Hide pause button if visible
    if (this.pauseButton) {
      this.pauseButton.hide();
    }
    
    // Simply reload the page to return to initial state
    window.location.reload();
  }
  
  spawnEmber() {
    // Check if current world has collectibles configuration
    const currentWorld = this.worldManager?.getCurrentWorld();
    const collectibles = currentWorld?.collectibles || {};

    // Spawn embers from the top of the screen
    const x = Math.random() * this.width;
    const y = -50;
    
    // Determine which type of ember to spawn based on world config
    if (collectibles.powerEmber && Math.random() < 0.2) {
      // Spawn power ember (need to implement PowerEmber class)
      this.embers.push(new Ember(x, y, this.particleSystem, 'power'));
    } else if (collectibles.solarEmber && Math.random() < 0.1) {
      // Spawn solar ember (need to implement SolarEmber class)
      this.embers.push(new Ember(x, y, this.particleSystem, 'solar'));
    } else {
      // Default regular ember
      this.embers.push(new Ember(x, y, this.particleSystem));
    }
  }
  
  spawnHazard() {
    // Get current world configuration
    const currentWorld = this.worldManager?.getCurrentWorld();
    const worldNum = this.worldManager?.getCurrentWorldNumber() || 1;
    
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
    
    // Fallback based on world number if coordinator not available
    switch(worldNum) {
      case 2:
        // World 2: AshCloud and LavaRock
        if (Math.random() < 0.5) {
          if (typeof AshCloud !== 'undefined') {
            this.hazards.push(new AshCloud(x, y, this.particleSystem));
          }
        } else {
          if (typeof LavaRock !== 'undefined') {
            this.hazards.push(new LavaRock(x, y, this.particleSystem));
          }
        }
        break;
      case 3:
        // World 3: Frost hazards
        if (Math.random() < 0.5) {
          if (typeof IceShard !== 'undefined') {
            this.hazards.push(new IceShard(x, y, this.particleSystem));
          }
        } else {
          if (typeof FrostCloud !== 'undefined') {
            this.hazards.push(new FrostCloud(x, y, this.particleSystem));
          }
        }
        break;
      case 4:
        // World 4: Void/Celestial hazards
        if (Math.random() < 0.5) {
          if (typeof VoidTornado !== 'undefined') {
            this.hazards.push(new VoidTornado(x, y, this.particleSystem));
          }
        } else {
          if (typeof AstralDebris !== 'undefined') {
            this.hazards.push(new AstralDebris(x, y, this.particleSystem));
          }
        }
        break;
      case 5:
        // World 5: Infernal hazards
        if (Math.random() < 0.5) {
          if (typeof HellPortal !== 'undefined') {
            this.hazards.push(new HellPortal(x, y, this.particleSystem));
          }
        } else {
          if (typeof DemonHand !== 'undefined') {
            this.hazards.push(new DemonHand(x, y, this.particleSystem));
          }
        }
        break;
      case 6:
        // World 6: Solar hazards
        const rand = Math.random();
        if (rand < 0.33) {
          if (typeof SolarFlare !== 'undefined') {
            this.hazards.push(new SolarFlare(x, y, this.particleSystem));
          }
        } else if (rand < 0.66) {
          if (typeof GravityWell !== 'undefined') {
            this.hazards.push(new GravityWell(x, y, this.particleSystem));
          }
        } else {
          if (typeof SunPulse !== 'undefined') {
            this.hazards.push(new SunPulse(x, y, this.particleSystem));
          }
        }
        break;
      default:
        // World 1: Default to FlameHelicopter and LavaBurst
        if (Math.random() < 0.6) {
          this.hazards.push(new FlameHelicopter(x, y, this.particleSystem));
        } else {
          if (typeof LavaBurst !== 'undefined') {
            this.hazards.push(new LavaBurst(x, y, this.particleSystem));
          } else {
            // Fallback to FlameHelicopter if LavaBurst is not defined
            this.hazards.push(new FlameHelicopter(x, y, this.particleSystem));
          }
        }
    }
  }
  
  spawnEnemy() {
    // Get current world configuration
    const currentWorld = this.worldManager?.getCurrentWorld();
    const worldNum = this.worldManager?.getCurrentWorldNumber() || 1;
    
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
    }
  }
  
  update(deltaTime) {
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
    
    this.phoenix.update(deltaTime);
    this.particleSystem.update(deltaTime);
    
    // Spawn embers
    if (Date.now() - this.lastEmberTime > 1000) {
      this.spawnEmber();
      this.lastEmberTime = Date.now();
    }
    
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
    
    // Update world manager for enemy spawning
    if (this.worldManager) {
      this.worldManager.update(deltaTime);
    }
    
    // Update and check collisions with embers
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const ember = this.embers[i];
      ember.update(deltaTime);
      
      // Check if phoenix collected ember
      const dx = this.phoenix.x - ember.x;
      const dy = this.phoenix.y - ember.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 40) { // Collection radius
        this.gameState.addXP(10);
        this.embers.splice(i, 1);
        
        // Play ember collection sound
        this.soundManager.playEmberCollect();
      } else if (ember.y > this.height + 100) {
        this.embers.splice(i, 1);
      }
    }
    
    // Update and check collisions with hazards (helicopters)
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hazard = this.hazards[i];
      
      // Update target position if in charge mode
      if (hazard.chargeMode) {
        hazard.targetX = this.phoenix.x;
        hazard.targetY = this.phoenix.y;
      }
      
      hazard.update(deltaTime);
      
      // Check collision with phoenix
      const dx = this.phoenix.x - hazard.x;
      const dy = this.phoenix.y - hazard.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check for near-miss (between 1.5x and 2.5x collision distance)
      const nearMissDistance = hazard.size / 2 + 50;
      if (distance > hazard.size / 2 + 20 && distance < nearMissDistance) {
        this.phoenix.triggerNearMiss();
      }
      
      if (distance < hazard.size / 2 + 20) { // Collision
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
      } else if (hazard.y > this.height + 100) {
        this.hazards.splice(i, 1);
      }
      
      // Check if phoenix flame trail hits helicopter
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
          
          // Spawn embers at helicopter position
          for (let j = 0; j < 5; j++) {
            const emberX = hazard.x + (Math.random() - 0.5) * 30;
            const emberY = hazard.y + (Math.random() - 0.5) * 30;
            this.embers.push(new Ember(emberX, emberY, this.particleSystem));
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
      
      // Check if helicopter died from burning damage
      if (hazard.health <= 0) {
        // Helicopter defeated - drop XP and remove
        this.gameState.addXP(20);
        
        // Play explosion sound
        this.soundManager.playExplosion(hazard.size / 40);
        
        // Activate screen shake effect
        this.triggerScreenShake(0.4, 0.5); // moderate intensity and duration
        
        // Spawn embers at helicopter position
        for (let j = 0; j < 5; j++) {
          const emberX = hazard.x + (Math.random() - 0.5) * 30;
          const emberY = hazard.y + (Math.random() - 0.5) * 30;
          this.embers.push(new Ember(emberX, emberY, this.particleSystem));
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
            this.embers.push(new Ember(emberX, emberY, this.particleSystem));
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
          this.embers.push(new Ember(emberX, emberY, this.particleSystem));
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
    
    this.gameState.survivalTime += deltaTime;
    
    // Check world completion based on time
    if (this.gameState.survivalTime >= this.gameState.getTotalLevelTime()) {
      this.gameState.completeWorld();
      this.soundManager.stopGameplayLoop();
      this.ui.worldCompleteStartTime = Date.now(); // Reset the world complete animation timer
      
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
      
      // Call the world complete callback if it exists
      if (this.worldCompleteCallback) {
        // Small delay to allow effects to play before showing menu
        setTimeout(() => {
          this.worldCompleteCallback();
        }, 2000);
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
      
      // Call the game over callback if it exists
      if (this.gameOverCallback) {
        // Small delay to allow effects to play before showing menu
        setTimeout(() => {
          this.gameOverCallback();
        }, 2000);
      }
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
            this.embers.push(new Ember(emberX, emberY, this.particleSystem));
          }
          
          this.enemies.splice(i, 1);
        }
      }
    }
  }
  
  triggerFlashEffect() {
    // Flash effect removed
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
    
    // Draw embers
    this.embers.forEach(ember => ember.draw(this.ctx));
    
    // Draw hazards
    this.hazards.forEach(hazard => hazard.draw(this.ctx));
    
    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
    
    // Draw phoenix
    this.phoenix.draw(this.ctx);
    
    // Reset transform if screen shake was applied
    if (this.screenShake.active) {
      this.ctx.restore();
    }
    
    // Draw UI
    this.ui.draw(this.width, this.height);
    
    // Draw universal UI elements (always visible)
    if (this.universalUI) {
      this.universalUI.draw(this.width, this.height);
    }
    
    // Draw XP notifications
    this.xpNotification.draw(this.ctx);
    
    // Draw pause menu if game is paused
    if (this.pauseMenu && this.pauseMenu.isPaused) {
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
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }
    
    // Check if the game is paused via the pause menu
    const isPaused = this.pauseMenu && this.pauseMenu.isPaused;
    
    // Only update the timestamp and calculate deltaTime if the game is not paused
    let deltaTime = 0;
    if (!isPaused) {
      deltaTime = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;
    }
    
    // Only update game state if the game is running AND not paused
    if (this.isRunning && !isPaused) {
      // Log the current level periodically during gameplay
      if (Math.floor(timestamp/1000) % 5 === 0) { // Log every ~5 seconds
        console.log(`Current game level: ${this.gameState.level}`);
      }
      this.update(deltaTime);
    }
    
    // Always render, even when paused (to show the pause menu)
    this.render();
    
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
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
            this.ui.draw(window.innerWidth, window.innerHeight);
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
      
      // Call the game over callback if it exists after a short delay
      if (this.gameOverCallback) {
        setTimeout(() => {
          this.gameOverCallback();
        }, 2000);
      }
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
}