export class MainMenu {
  constructor(container) {
    this.container = container;
    this.elements = {};
    
    // Call createMenu immediately
    this.createMenu();
  }
  
  createMenu() {
    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'main-menu';
    menuContainer.style.position = 'absolute';
    menuContainer.style.width = '100%';
    menuContainer.style.height = '100%';
    menuContainer.style.display = 'flex';
    menuContainer.style.flexDirection = 'column';
    menuContainer.style.justifyContent = 'center';
    menuContainer.style.alignItems = 'center';
    menuContainer.style.background = 'linear-gradient(to bottom, #FF5500, #D93d00)';
    menuContainer.style.opacity = '0';
    menuContainer.style.transition = 'opacity 0.5s ease-in';
    menuContainer.style.zIndex = '200'; // Ensure menu is on top
    
    // Force a reflow to ensure transitions work
    setTimeout(() => {
      menuContainer.style.opacity = '1';
    }, 50);
    menuContainer.style.color = 'black';
    menuContainer.style.fontFamily = 'Arial, sans-serif';
    menuContainer.style.zIndex = '200';
    
    // Settings button
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.textContent = '⚙️ Settings';
    settingsButton.className = 'settings-button'; // Add class for CSS targeting
    settingsButton.style.position = 'absolute';
    settingsButton.style.top = '120px'; // Moved up but still below rank bar
    settingsButton.style.right = '10px';
    settingsButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    settingsButton.style.color = '#FF5500';
    settingsButton.style.border = '2px solid #FF5500';
    settingsButton.style.borderRadius = '20px';
    settingsButton.style.padding = '8px 15px';
    settingsButton.style.fontSize = '1rem';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.zIndex = '1001'; // Higher z-index to ensure visibility over all elements
    settingsButton.style.transition = 'all 0.2s ease';
    settingsButton.style.boxShadow = '0 0 10px rgba(255, 85, 0, 0.5)'; // Add glow effect
    settingsButton.style.display = 'block'; // Ensure it's displayed
    settingsButton.style.opacity = '1'; // Ensure it's fully visible
    settingsButton.style.touchAction = 'manipulation'; // Better touch behavior
    
    // Hover effects for settings button
    settingsButton.addEventListener('mouseover', () => {
      settingsButton.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
      settingsButton.style.transform = 'scale(1.05)';
      settingsButton.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.8)'; // Enhance glow on hover
    });
    
    settingsButton.addEventListener('mouseout', () => {
      settingsButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      settingsButton.style.transform = 'scale(1)';
      settingsButton.style.boxShadow = '0 0 10px rgba(255, 85, 0, 0.5)'; // Return to normal glow
    });
    
    // Click event for settings button
    settingsButton.addEventListener('click', () => {
      this.showSettingsModal();
    });
    
    
    // Add the CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glow {
        from {
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        }
        to {
          text-shadow: 0 0 20px rgba(0, 0, 0, 1), 0 0 30px rgba(255, 100, 20, 0.8);
        }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @media (max-width: 600px) {
        .main-menu h1 {
          font-size: 2.5rem !important;
        }
        
        .settings-button {
          top: 110px !important; /* Moved up but still below rank bar in mobile view */
          right: 5px !important;
          padding: 6px 12px !important;
          font-size: 0.9rem !important;
          border-radius: 15px !important;
        }
      }
      
      @media (max-width: 400px) {
        .settings-button {
          padding: 5px 10px !important;
          font-size: 0.8rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Create WorldSelector component - moved to center of screen
    const worldSelectorContainer = document.createElement('div');
    worldSelectorContainer.id = 'world-selector';
    worldSelectorContainer.style.position = 'absolute';
    worldSelectorContainer.style.top = '40%'; // Moved up to make room for start button
    worldSelectorContainer.style.left = '50%';
    worldSelectorContainer.style.transform = 'translate(-50%, -50%)';
    worldSelectorContainer.style.width = '100%';
    worldSelectorContainer.style.maxWidth = '800px';
    worldSelectorContainer.style.zIndex = '201';
    
    // Create native JavaScript world selector
    this.createWorldSelector(worldSelectorContainer);
    
    // Create start button
    const startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.textContent = 'START GAME';
    startButton.style.position = 'absolute';
    startButton.style.top = '75%'; // Position below world selector
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.style.padding = '15px 40px';
    startButton.style.fontSize = '1.5rem';
    startButton.style.fontWeight = 'bold';
    startButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    startButton.style.color = '#FF5500';
    startButton.style.border = '3px solid #FF5500';
    startButton.style.borderRadius = '30px';
    startButton.style.cursor = 'pointer';
    startButton.style.zIndex = '202';
    startButton.style.boxShadow = '0 0 20px rgba(255, 85, 0, 0.6)';
    startButton.style.transition = 'all 0.3s ease';
    startButton.style.animation = 'pulse 2s infinite';
    
    // Hover and click effects for start button
    startButton.addEventListener('mouseover', () => {
      startButton.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
      startButton.style.boxShadow = '0 0 25px rgba(255, 85, 0, 0.8)';
    });
    
    startButton.addEventListener('mouseout', () => {
      startButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      startButton.style.boxShadow = '0 0 20px rgba(255, 85, 0, 0.6)';
    });
    
    startButton.addEventListener('click', () => {
      // Get the currently selected world
      const currentWorld = window.worldProgressionSystem ? 
        window.worldProgressionSystem.getCurrentWorld() : 1;
      
      // Hide the menu and start the game
      this.elements.menuContainer.style.opacity = '0';
      setTimeout(() => {
        this.hide();
        // Start the game with the current world
        if (window.gameInstance) {
          // First set the world using the WorldManager
          if (typeof window.gameInstance.setCurrentWorld === 'function') {
            window.gameInstance.setCurrentWorld(currentWorld);
          }
          // Then start the game
          if (typeof window.gameInstance.start === 'function') {
            window.gameInstance.start();
          } else {
            console.error("Game start function not found!");
          }
        }
      }, 500);
    });

    // First append the essential elements to the DOM
    menuContainer.appendChild(worldSelectorContainer);
    menuContainer.appendChild(startButton);
    this.container.appendChild(menuContainer);
    
    // Store references to elements
    this.elements.menuContainer = menuContainer;
    this.elements.startButton = startButton;
    
    // Append settings button to the container, not the menu
    // This ensures it's positioned correctly and visible
    this.container.appendChild(settingsButton);
    this.container.appendChild(menuContainer);
    
    // Store references to elements
    this.elements.menuContainer = menuContainer;
    this.elements.settingsButton = settingsButton;
  }
  
  showSettingsModal() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'settings-modal';
    modalContainer.style.position = 'absolute';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '2000'; // Increased z-index to ensure modal appears above all other elements
    modalContainer.style.opacity = '0';
    modalContainer.style.transition = 'opacity 0.3s ease';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'settings-modal-content';
    modalContent.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
    modalContent.style.borderRadius = '10px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.border = '2px solid #FF5500';
    modalContent.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    modalContent.style.transform = 'scale(0.9)';
    modalContent.style.transition = 'transform 0.3s ease';
    
    // Add responsive styles for modal on smaller screens
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
      @media (max-width: 600px) {
        .settings-modal-content {
          width: 90% !important;
          padding: 15px !important;
        }
        
        .settings-modal-content h2 {
          font-size: 18px !important;
          margin-bottom: 15px !important;
        }
        
        .settings-modal-content select,
        .settings-modal-content input {
          padding: 6px !important;
          font-size: 14px !important;
        }
        
        .settings-modal-content button {
          padding: 6px 15px !important;
          font-size: 14px !important;
        }
      }
    `;
    document.head.appendChild(modalStyles);
    
    // Modal title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Game Settings';
    modalTitle.style.color = '#FF5500';
    modalTitle.style.textAlign = 'center';
    modalTitle.style.marginBottom = '20px';
    
    // Rank Level Setting
    const rankContainer = document.createElement('div');
    rankContainer.style.marginBottom = '15px';
    
    const rankLabel = document.createElement('label');
    rankLabel.textContent = 'Rank Level:';
    rankLabel.style.display = 'block';
    rankLabel.style.color = '#FF9955';
    rankLabel.style.marginBottom = '5px';
    
    const rankSelect = document.createElement('select');
    rankSelect.style.width = '100%';
    rankSelect.style.padding = '8px';
    rankSelect.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    rankSelect.style.color = '#FF5500';
    rankSelect.style.border = '1px solid #FF5500';
    rankSelect.style.borderRadius = '5px';
    
    // Add rank options (1-100)
    for (let i = 1; i <= 100; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Rank ${i}`;
      rankSelect.appendChild(option);
    }
    
    // Set the current rank
    if (window.rankSystem) {
      rankSelect.value = window.rankSystem.getCurrentRank();
    }
    
    rankContainer.appendChild(rankLabel);
    rankContainer.appendChild(rankSelect);
    
    // XP Level Setting
    const xpContainer = document.createElement('div');
    xpContainer.style.marginBottom = '20px';
    
    const xpLabel = document.createElement('label');
    xpLabel.textContent = 'XP Amount:';
    xpLabel.style.display = 'block';
    xpLabel.style.color = '#FF9955';
    xpLabel.style.marginBottom = '5px';
    
    const xpInput = document.createElement('input');
    xpInput.type = 'number';
    xpInput.min = '0';
    xpInput.step = '100';
    xpInput.style.width = '100%';
    xpInput.style.padding = '8px';
    xpInput.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    xpInput.style.color = '#FF5500';
    xpInput.style.border = '1px solid #FF5500';
    xpInput.style.borderRadius = '5px';
    
    // Set the current XP
    if (window.rankSystem) {
      xpInput.value = window.rankSystem.currentXP;
    }
    
    xpContainer.appendChild(xpLabel);
    xpContainer.appendChild(xpInput);
    
    // Volume Control Settings
    const volumeContainer = document.createElement('div');
    volumeContainer.style.marginBottom = '20px';
    
    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = 'Volume:';
    volumeLabel.style.display = 'block';
    volumeLabel.style.color = '#FF9955';
    volumeLabel.style.marginBottom = '5px';
    
    const volumeSliderContainer = document.createElement('div');
    volumeSliderContainer.style.display = 'flex';
    volumeSliderContainer.style.alignItems = 'center';
    volumeSliderContainer.style.gap = '10px';
    
    // Volume mute/unmute icon
    const volumeIcon = document.createElement('span');
    volumeIcon.textContent = '🔊';
    volumeIcon.style.fontSize = '20px';
    volumeIcon.style.cursor = 'pointer';
    
    // Volume slider
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.step = '1';
    volumeSlider.style.width = '100%';
    volumeSlider.style.accentColor = '#FF5500';
    
    // Set initial volume based on sound manager
    let currentVolume = 100;
    let isMuted = false;
    if (window.gameInstance && window.gameInstance.soundManager) {
      const soundManager = window.gameInstance.soundManager;
      // Get volume from sound manager if possible
      if (soundManager.masterGain) {
        currentVolume = Math.floor(soundManager.masterGain.gain.value * 100);
      }
      isMuted = soundManager.isMuted;
    }
    
    volumeSlider.value = currentVolume;
    volumeIcon.textContent = isMuted ? '🔇' : '🔊';
    
    // Handle volume change
    volumeSlider.addEventListener('input', () => {
      const volumeValue = parseInt(volumeSlider.value) / 100;
      if (window.gameInstance && window.gameInstance.soundManager) {
        // Set volume on sound manager
        window.gameInstance.soundManager.setMasterVolume(volumeValue);
        window.gameInstance.soundManager.isMuted = volumeValue === 0;
        
        // Update mute icon based on volume
        volumeIcon.textContent = volumeValue === 0 ? '🔇' : '🔊';
      }
    });
    
    // Handle mute/unmute click
    volumeIcon.addEventListener('click', () => {
      if (window.gameInstance && window.gameInstance.soundManager) {
        const soundManager = window.gameInstance.soundManager;
        const wasMuted = soundManager.isMuted;
        
        // Toggle mute state
        const isMuted = soundManager.toggleMute();
        volumeIcon.textContent = isMuted ? '🔇' : '🔊';
        
        // Set slider to 0 when muted, restore to previous value when unmuted
        if (isMuted) {
          // Store current value before setting to 0
          volumeSlider.dataset.previousValue = volumeSlider.value;
          volumeSlider.value = 0;
        } else {
          // Restore previous value if available
          volumeSlider.value = volumeSlider.dataset.previousValue || 50;
          // Apply the restored volume
          soundManager.setMasterVolume(parseInt(volumeSlider.value) / 100);
        }
      }
    });
    
    volumeSliderContainer.appendChild(volumeIcon);
    volumeSliderContainer.appendChild(volumeSlider);
    volumeContainer.appendChild(volumeLabel);
    volumeContainer.appendChild(volumeSliderContainer);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.marginTop = '20px';
    
    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    saveButton.style.color = '#FF5500';
    saveButton.style.border = '2px solid #FF5500';
    saveButton.style.borderRadius = '5px';
    saveButton.style.padding = '8px 20px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.transition = 'all 0.2s ease';
    
    saveButton.addEventListener('mouseover', () => {
      saveButton.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
      saveButton.style.transform = 'scale(1.05)';
    });
    
    saveButton.addEventListener('mouseout', () => {
      saveButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      saveButton.style.transform = 'scale(1)';
    });
    
    saveButton.addEventListener('click', () => {
      if (window.rankSystem) {
        const rankValue = parseInt(rankSelect.value);
        const xpValue = parseInt(xpInput.value);
        
        window.rankSystem.currentRank = rankValue;
        window.rankSystem.currentXP = xpValue;
        window.rankSystem.saveRankData();
        window.rankSystem.updateRankDisplay();
      }
      // Save world unlock states
      if (window.worldProgressionSystem) {
        // First, get all checked world checkboxes
        const unlockedWorlds = [];
        for (let i = 1; i <= 6; i++) {
          const checkbox = document.getElementById(`world-${i}`);
          if (checkbox && checkbox.checked) {
            unlockedWorlds.push(i);
          }
        }
        
        // Clear current unlocked worlds and set to the selected ones
        window.worldProgressionSystem.unlockedWorlds = [1]; // Default world 1
        
        // Add all checked worlds
        unlockedWorlds.forEach(worldNum => {
          if (!window.worldProgressionSystem.unlockedWorlds.includes(worldNum)) {
            window.worldProgressionSystem.unlockedWorlds.push(worldNum);
          }
        });
        
        // Sort worlds for consistency
        window.worldProgressionSystem.unlockedWorlds.sort((a, b) => a - b);
        
        // Explicitly save progress
        window.worldProgressionSystem.saveProgress();
        
        console.log('Saved worlds:', window.worldProgressionSystem.unlockedWorlds);
      }
      
      // Immediately reload the page without closing the modal
      window.location.reload();
    });
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    cancelButton.style.color = '#FF9955';
    cancelButton.style.border = '2px solid #FF9955';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.padding = '8px 20px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.transition = 'all 0.2s ease';
    
    cancelButton.addEventListener('mouseover', () => {
      cancelButton.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
      cancelButton.style.transform = 'scale(1.05)';
    });
    
    cancelButton.addEventListener('mouseout', () => {
      cancelButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      cancelButton.style.transform = 'scale(1)';
    });
    
    cancelButton.addEventListener('click', () => {
      closeModal();
    });
    
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);
    
    // Assemble the modal
    // Add worlds container for unlock status
    const worldsContainer = document.createElement('div');
    worldsContainer.style.marginBottom = '20px';
    worldsContainer.style.borderTop = '1px solid rgba(255, 85, 0, 0.3)';
    worldsContainer.style.paddingTop = '15px';
    const worldsLabel = document.createElement('label');
    worldsLabel.textContent = 'World Progress:';
    worldsLabel.style.display = 'block';
    worldsLabel.style.color = '#FF9955';
    worldsLabel.style.marginBottom = '10px';
    const worldsList = document.createElement('div');
    worldsList.style.display = 'flex';
    worldsList.style.flexDirection = 'column';
    worldsList.style.gap = '8px';
    // Create checkboxes for each world
    for (let i = 1; i <= 6; i++) {
        const worldRow = document.createElement('div');
        worldRow.style.display = 'flex';
        worldRow.style.alignItems = 'center';
        worldRow.style.gap = '10px';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `world-${i}`;
        checkbox.style.accentColor = '#FF5500';
        
        // Set initial checked state based on WorldProgressionSystem
        if (window.worldProgressionSystem) {
            checkbox.checked = window.worldProgressionSystem.isWorldUnlocked(i);
        }
        
        // Get the world name if possible
        let worldName = `World ${i}`;
        if (window.gameInstance && window.gameInstance.worldManager) {
            const name = window.gameInstance.worldManager.getWorldName(i);
            if (name) {
                worldName = name;
            }
        }
        
        const label = document.createElement('label');
        label.htmlFor = `world-${i}`;
        label.textContent = worldName;
        label.style.color = '#FF9955';
        worldRow.appendChild(checkbox);
        worldRow.appendChild(label);
        worldsList.appendChild(worldRow);
    }
    worldsContainer.appendChild(worldsLabel);
    worldsContainer.appendChild(worldsList);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(rankContainer);
    modalContent.appendChild(xpContainer);
    modalContent.appendChild(volumeContainer);
    modalContent.appendChild(worldsContainer);
    modalContent.appendChild(buttonsContainer);
    modalContainer.appendChild(modalContent);
    
    // Add to the DOM
    document.body.appendChild(modalContainer);
    
    // Close modal function
    const closeModal = () => {
      modalContainer.style.opacity = '0';
      modalContent.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        modalContainer.remove();
      }, 300);
    };
    
    // Animate modal in
    setTimeout(() => {
      modalContainer.style.opacity = '1';
      modalContent.style.transform = 'scale(1)';
    }, 10);
  }
  
  hide() {
    if (this.elements.menuContainer) {
      // Use opacity transition for smoother disappearance
      this.elements.menuContainer.style.opacity = '0';
      
      // Immediately hide settings button when the game starts
      if (this.elements.settingsButton) {
        // Hide the settings button instantly without delay
        this.elements.settingsButton.style.opacity = '0';
        this.elements.settingsButton.style.display = 'none';
      }
      
      // Wait for transition to complete before hiding
      setTimeout(() => {
        this.elements.menuContainer.style.display = 'none';
      }, 500); // Match the transition time from CSS
      
      // Also hide the rank bar when menu is hidden (game is starting)
      const rankBarElement = document.querySelector('.rank-bar-container');
      if (rankBarElement) {
        rankBarElement.style.opacity = '0';
        setTimeout(() => {
          rankBarElement.style.display = 'none';
        }, 500);
      }
      
      // Explicitly hide the start button
      this.hideStartButton();
    }
  }
  
  show() {
    if (this.elements.menuContainer) {
      // First make it visible but transparent
      this.elements.menuContainer.style.display = 'flex';
      
      // Make sure settings button is visible when going back to the menu
      if (this.elements.settingsButton) {
        this.elements.settingsButton.style.display = 'block';
        setTimeout(() => {
          this.elements.settingsButton.style.opacity = '1';
        }, 10);
      }
      
      // Force a reflow to ensure transition works
      setTimeout(() => {
        this.elements.menuContainer.style.opacity = '1';
      }, 10);
      
      // Also show the rank bar when menu is shown (back to menu)
      const rankBarElement = document.querySelector('.rank-bar-container');
      if (rankBarElement) {
        rankBarElement.style.display = 'flex';
        setTimeout(() => {
          rankBarElement.style.opacity = '1';
        }, 10);
      }
      
      // Ensure the start button is visible without forcing styles
      this.showStartButton();
    }
  }
  
  // Show menu without displaying rank bar and settings button
  showWithoutRankAndSettings() {
    // Only show the menu container without the rank bar
    if (this.elements.menuContainer) {
      this.elements.menuContainer.style.display = 'flex';
      
      // Force a reflow to ensure transition works
      setTimeout(() => {
        this.elements.menuContainer.style.opacity = '1';
      }, 10);
      
      // Ensure the rank bar stays hidden
      const rankBarElement = document.querySelector('.rank-bar-container');
      if (rankBarElement) {
        rankBarElement.style.opacity = '0';
        rankBarElement.style.display = 'none';
      }
    }
  }
  
  // Add a method to select a world
  selectWorld(worldNumber) {
    // Store the selected world number
    this.selectedWorld = worldNumber;
    
    // Save selected world in world progression system
    if (window.worldProgressionSystem) {
      window.worldProgressionSystem.setCurrentWorld(worldNumber);
    }
    
    // Also update the game's current world if possible
    if (window.gameInstance && typeof window.gameInstance.setCurrentWorld === 'function') {
      window.gameInstance.setCurrentWorld(worldNumber);
      console.log(`World ${worldNumber} selected and set in game instance`);
    }
    
    // Update UI - reset all buttons and highlight selected
    if (this.worldSelector) {
      const worldButtons = this.worldSelector.querySelectorAll('.world-button');
      worldButtons.forEach(button => {
        // Only reset unlocked worlds
        if (!button.disabled) {
          button.style.transform = 'scale(1)';
          button.style.boxShadow = 'none';
        }
      });
      
      // Highlight the selected world button
      const selectedButton = this.worldSelector.querySelector(`.world-${worldNumber}`);
      if (selectedButton && !selectedButton.disabled) {
        selectedButton.style.transform = 'scale(1.1)';
        selectedButton.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.8)';
        
        // Update world description
        if (this.worldDescriptionDiv && window.gameInstance && window.gameInstance.worldManager) {
          const worldName = window.gameInstance.worldManager.getWorldName(worldNumber);
          const worldDesc = window.gameInstance.worldManager.getWorldDescription(worldNumber);
          this.worldDescriptionDiv.innerHTML = `<h3>${worldName}</h3><p>${worldDesc}</p><p>Select this world and press START GAME to begin.</p>`;
        }
      }
    }
    
    // Log selected world
    console.log(`Selected world: ${worldNumber}`);
  }
  
  createWorldSelector(container) {
    // Create world selector container
    const worldSelector = document.createElement('div');
    worldSelector.className = 'world-selector';
    worldSelector.style.display = 'flex';
    worldSelector.style.justifyContent = 'center';
    worldSelector.style.alignItems = 'center';
    worldSelector.style.gap = '20px';
    worldSelector.style.flexWrap = 'wrap';
    worldSelector.style.margin = '20px 0';
    
    // Create world description area
    const worldDescriptionDiv = document.createElement('div');
    worldDescriptionDiv.className = 'world-description';
    worldDescriptionDiv.style.width = '80%';
    worldDescriptionDiv.style.maxWidth = '600px';
    worldDescriptionDiv.style.margin = '20px auto';
    worldDescriptionDiv.style.padding = '15px';
    worldDescriptionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    worldDescriptionDiv.style.borderRadius = '10px';
    worldDescriptionDiv.style.color = 'white';
    worldDescriptionDiv.style.textAlign = 'center';
    worldDescriptionDiv.innerHTML = '<h3>Select a World</h3><p>Click on a world to select it, then press START GAME to begin.</p>';
    
    // Get unlocked worlds from the world progression system
    const unlockedWorlds = window.worldProgressionSystem ? 
      window.worldProgressionSystem.getUnlockedWorlds() : [1];
    
    // Track the currently selected world button
    let selectedWorldButton = null;
    
    // Create world buttons (1-6) - adding 6th world
    for (let i = 1; i <= 6; i++) {
      const worldContainer = document.createElement('div');
      worldContainer.className = 'world-container';
      worldContainer.style.position = 'relative';
      worldContainer.style.textAlign = 'center';
      
      const worldButton = document.createElement('button');
      worldButton.className = `world-button world-${i}`;
      worldButton.dataset.world = i;
      
      // Style the button
      worldButton.style.width = '80px';
      worldButton.style.height = '80px';
      worldButton.style.borderRadius = '50%';
      worldButton.style.margin = '10px';
      worldButton.style.border = '3px solid #FF5500';
      worldButton.style.position = 'relative';
      worldButton.style.overflow = 'hidden';
      worldButton.style.cursor = 'pointer';
      worldButton.style.transition = 'all 0.3s ease';
      
      // Set background based on world number - get from the WorldManager if available
      let bgColor = "";
      
      if (window.gameInstance && window.gameInstance.worldManager) {
        // Try to get background color from world settings
        const worldConfig = window.gameInstance.worldManager.worlds[i];
        if (worldConfig && worldConfig.settings && worldConfig.settings.backgroundColor) {
          bgColor = worldConfig.settings.backgroundColor;
        }
      }
      
      // Fallback backgrounds if no color from world settings
      if (!bgColor) {
        const backgrounds = [
          'linear-gradient(135deg, #FF5500, #D93d00)',  // World 1
          'linear-gradient(135deg, #2a0f0f, #4a1f1f)',  // World 2
          'linear-gradient(135deg, #0f1a2a, #1f3a5a)',  // World 3
          'linear-gradient(135deg, #1a0f2a, #3a1f5a)',  // World 4
          'linear-gradient(135deg, #2a0505, #5a0f0f)',  // World 5
          'linear-gradient(135deg, #ff9500, #ff6a00)'   // World 6
        ];
        bgColor = backgrounds[i-1];
      }
      
      worldButton.style.background = bgColor;
      
      // Add world number text
      const worldNumber = document.createElement('div');
      worldNumber.textContent = i;
      worldNumber.style.fontSize = '2rem';
      worldNumber.style.fontWeight = 'bold';
      worldNumber.style.color = 'white';
      worldNumber.style.position = 'absolute';
      worldNumber.style.top = '50%';
      worldNumber.style.left = '50%';
      worldNumber.style.transform = 'translate(-50%, -50%)';
      worldButton.appendChild(worldNumber);
      
      // Add lock overlay for locked worlds
      if (!unlockedWorlds.includes(i)) {
        worldButton.disabled = true;
        worldButton.style.filter = 'grayscale(0.8) brightness(0.6)';
        
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'lock-overlay';
        lockOverlay.style.position = 'absolute';
        lockOverlay.style.top = '0';
        lockOverlay.style.left = '0';
        lockOverlay.style.width = '100%';
        lockOverlay.style.height = '100%';
        lockOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
        lockOverlay.style.borderRadius = '50%';
        lockOverlay.style.display = 'flex';
        lockOverlay.style.justifyContent = 'center';
        lockOverlay.style.alignItems = 'center';
        
        const lockIcon = document.createElement('span');
        lockIcon.textContent = '🔒';
        lockIcon.style.fontSize = '1.5rem';
        lockOverlay.appendChild(lockIcon);
        
        worldButton.appendChild(lockOverlay);
      } else {
        // Add hover effects for unlocked worlds
        worldButton.addEventListener('mouseover', () => {
          worldButton.style.transform = 'scale(1.1)';
          worldButton.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.8)';
          
          // Update world description on hover
          if (window.gameInstance && window.gameInstance.worldManager) {
            const worldName = window.gameInstance.worldManager.getWorldName(i);
            const worldDesc = window.gameInstance.worldManager.getWorldDescription(i);
            worldDescriptionDiv.innerHTML = `<h3>${worldName}</h3><p>${worldDesc}</p><p>Select this world and press START GAME to begin.</p>`;
          }
        });
        
        worldButton.addEventListener('mouseout', () => {
          // Don't reset transform if this is the selected world
          if (worldButton !== selectedWorldButton) {
            worldButton.style.transform = 'scale(1)';
            worldButton.style.boxShadow = 'none';
          }
        });
      }
      
      // Add world name label
      const worldLabel = document.createElement('div');
      worldLabel.className = 'world-label';
      
      // Try to get world name from the WorldManager if available
      let worldName = "";
      if (window.gameInstance && window.gameInstance.worldManager) {
        worldName = window.gameInstance.worldManager.getWorldName(i);
      } else {
        // Fallback names
        const worldNames = [
          'Volcanic Cradle',
          'Ashspire Ruins',
          'Frost Peak',
          'Celestial Void',
          'Infernal Core',
          'Solar Rift'
        ];
        worldName = worldNames[i-1] || `World ${i}`;
      }
      
      worldLabel.textContent = worldName;
      worldLabel.style.marginTop = '5px';
      worldLabel.style.fontSize = '0.9rem';
      worldLabel.style.color = 'white';
      worldLabel.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
      
      // Add click event for world selection only (not starting the game)
      worldButton.addEventListener('click', () => {
        if (!worldButton.disabled) {
          this.selectWorld(i);
          
          // Update the selected button reference
          selectedWorldButton = worldButton;
          
          // Highlight the start button to indicate it's ready to be pressed
          if (this.elements.startButton) {
            this.elements.startButton.style.boxShadow = '0 0 30px rgba(255, 85, 0, 0.9)';
            setTimeout(() => {
              this.elements.startButton.style.boxShadow = '0 0 20px rgba(255, 85, 0, 0.6)';
            }, 1000);
          }
        }
      });
      
      worldContainer.appendChild(worldButton);
      worldContainer.appendChild(worldLabel);
      worldSelector.appendChild(worldContainer);
    }
    
    // Add both selectors and description to container
    container.appendChild(worldSelector);
    container.appendChild(worldDescriptionDiv);
    
    // Save references to elements
    this.worldSelector = worldSelector;
    this.worldDescriptionDiv = worldDescriptionDiv;
    this.worldIndicator = {
      setWorld: (worldNumber) => {
        this.selectWorld(worldNumber);
      },
      setUnlockedWorlds: (unlockedWorlds) => {
        // Update UI to reflect newly unlocked worlds
        const worldButtons = worldSelector.querySelectorAll('.world-button');
        worldButtons.forEach(button => {
          const worldNum = parseInt(button.dataset.world);
          if (unlockedWorlds.includes(worldNum)) {
            // Remove lock overlay if it exists
            const lockOverlay = button.querySelector('.lock-overlay');
            if (lockOverlay) {
              lockOverlay.remove();
            }
            button.disabled = false;
            button.style.filter = 'none';
          }
        });
      }
    };
    
    // Highlight the current world
    if (window.worldProgressionSystem) {
      const currentWorld = window.worldProgressionSystem.getCurrentWorld();
      this.selectWorld(currentWorld);
      
      // Set the initially selected button
      selectedWorldButton = worldSelector.querySelector(`.world-${currentWorld}`);
      if (selectedWorldButton) {
        selectedWorldButton.style.transform = 'scale(1.1)';
        selectedWorldButton.style.boxShadow = '0 0 15px rgba(255, 85, 0, 0.8)';
      }
    }
  }
  
  // Method to explicitly show the start button
  showStartButton() {
    if (this.elements.startButton) {
      // First make sure it's in the DOM
      this.elements.startButton.style.display = 'block';
      
      // Force a reflow before setting opacity to ensure transition works
      setTimeout(() => {
        this.elements.startButton.style.opacity = '1';
        this.elements.startButton.style.transform = 'translate(-50%, -50%) scale(1)';
        this.elements.startButton.style.animation = 'pulse 2s infinite';
        this.elements.startButton.style.pointerEvents = 'auto'; // Ensure it's clickable
        this.elements.startButton.style.zIndex = '202'; // High z-index to be on top
        this.elements.startButton.style.boxShadow = '0 0 25px rgba(255, 85, 0, 0.8)'; // Add strong glow
        
        console.log('Start button displayed and active');
      }, 10);
    } else {
      console.error('Start button element not found!');
    }
  }
  
  // Method to explicitly hide the start button
  hideStartButton() {
    if (this.elements.startButton) {
      this.elements.startButton.style.display = 'none';
      this.elements.startButton.style.opacity = '0';
    }
  }
}