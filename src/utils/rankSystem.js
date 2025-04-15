export class RankSystem {
  constructor() {
    this.loadRankData();
  }
  
  loadRankData() {
    try {
      const savedData = localStorage.getItem('phoenix_rank_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.currentRank = data.rank || 1;
        this.currentXP = data.xp || 0;
      } else {
        this.currentRank = 1;
        this.currentXP = 0;
      }
    } catch (e) {
      console.error("Error loading rank data:", e);
      this.currentRank = 1;
      this.currentXP = 0;
    }
    
    // Cap rank at 100
    if (this.currentRank > 100) {
      this.currentRank = 100;
    }
  }
  
  saveRankData() {
    try {
      const data = {
        rank: this.currentRank,
        xp: this.currentXP
      };
      localStorage.setItem('phoenix_rank_data', JSON.stringify(data));
      console.log(`Saved rank data: Rank ${this.currentRank}, XP ${this.currentXP}`);
    } catch (e) {
      console.error("Error saving rank data:", e);
    }
  }
  
  addXP(amount, showNotification = true) {
    if (this.currentRank >= 100) {
      this.currentRank = 100;
      this.currentXP = this.getXPForNextRank();
      return false; // Already at max rank
    }
    
    this.currentXP += amount;
    let leveledUp = false;
    
    while (this.currentXP >= this.getXPForNextRank() && this.currentRank < 100) {
      // Save current needed XP for display purposes
      const justNeededXP = this.getXPForNextRank();
      
      this.currentXP -= justNeededXP;
      this.currentRank++;
      leveledUp = true;
      
      // Heal the phoenix when level up occurs (30% of max health)
      this.healPhoenixOnLevelUp();
      
      // Only display level up notification if showNotification is true
      // AND if the game is not in active gameplay (check window.gameInstance.isRunning)
      if (showNotification && !(window.gameInstance && window.gameInstance.isRunning)) {
        this.showLevelUpNotification(justNeededXP);
      }
      
      // If we reached max rank, cap the XP
      if (this.currentRank >= 100) {
        this.currentRank = 100;
        this.currentXP = this.getXPForNextRank();
        break;
      }
    }
    
    this.saveRankData();
    
    // Update UI if we're on the main menu
    this.updateRankDisplay();
    
    return leveledUp;
  }
  
  /**
   * Heals the phoenix when a level up occurs
   */
  healPhoenixOnLevelUp() {
    // Use window.gameInstance to get the phoenix
    if (window.gameInstance && window.gameInstance.phoenix) {
      // Heal 35% of max health
      const phoenix = window.gameInstance.phoenix;
      const healAmount = phoenix.maxHealth * 0.35;
      
      // Heal the phoenix
      const healed = phoenix.heal(healAmount);
      
      // Show level up healing message only if actually healed
      if (healed && window.gameInstance.ui) {
        window.gameInstance.ui.showMessage(`LEVEL UP! +${Math.round(healAmount)} HEALTH`, 'rgba(0, 255, 100, 1)', 2000);
      }
      
      console.log(`Level up healing: +${Math.round(healAmount)} health`);
    } else {
      console.warn('Could not heal phoenix on level up - gameInstance or phoenix not available');
    }
  }
  
  /**
   * Updates the rank display if it's currently visible
   * This ensures the rank bar always shows current data
   */
  updateRankDisplay() {
    const rankBarElement = document.querySelector('.rank-bar-container');
    if (rankBarElement && document.getElementById('renderDiv')) {
      // Only update if the rank bar is visible (opacity > 0)
      const computedStyle = window.getComputedStyle(rankBarElement);
      const isVisible = computedStyle.display !== 'none' && parseFloat(computedStyle.opacity) > 0;
      
      if (isVisible) {
        // Remove the old rank bar
        rankBarElement.remove();
        
        // Render a new one with updated data
        this.renderRankBar(document.getElementById('renderDiv'));
      }
    }
    
    // Validate rank and XP values after settings changes
    this.validateRankAndXP();
  }
  
  getXPForNextRank() {
    // Quadratic XP requirements based on rank
    return 100 * Math.pow(this.currentRank, 2);
  }
  
  getRankProgress() {
    if (this.currentRank >= 100) {
      return 1.0; // 100%
    }
    return this.currentXP / this.getXPForNextRank();
  }
  
  getCurrentRank() {
    return this.currentRank;
  }
  
  renderRankBar(container) {
    // Create rank bar container
    const rankBarContainer = document.createElement('div');
    rankBarContainer.className = 'rank-bar-container';
    rankBarContainer.style.position = 'absolute';
    rankBarContainer.style.top = '10px';
    rankBarContainer.style.left = '50%';
    rankBarContainer.style.transform = 'translateX(-50%)';
    rankBarContainer.style.width = '60%';
    rankBarContainer.style.maxWidth = '500px';
    rankBarContainer.style.padding = '10px';
    rankBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    rankBarContainer.style.borderRadius = '10px';
    rankBarContainer.style.zIndex = '300';
    rankBarContainer.style.display = 'flex';
    rankBarContainer.style.flexDirection = 'column';
    rankBarContainer.style.alignItems = 'center';
    
    // Rank title
    const rankTitle = document.createElement('div');
    rankTitle.className = 'rank-title';
    rankTitle.textContent = `RANK ${this.currentRank}${this.currentRank >= 100 ? ' (MAX)' : ''}`;
    rankTitle.style.color = '#FF5500';
    rankTitle.style.fontSize = '1.5rem';
    rankTitle.style.fontWeight = 'bold';
    rankTitle.style.marginBottom = '5px';
    rankTitle.style.textShadow = '0 0 5px rgba(255, 85, 0, 0.7)';
    
    // Progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'rank-progress-container';
    progressContainer.style.width = '100%';
    progressContainer.style.height = '15px';
    progressContainer.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
    progressContainer.style.borderRadius = '5px';
    progressContainer.style.position = 'relative';
    progressContainer.style.overflow = 'hidden';
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'rank-progress-bar';
    progressBar.style.width = `${this.getRankProgress() * 100}%`;
    progressBar.style.height = '100%';
    progressBar.style.background = 'linear-gradient(to right, #FF3300, #FF9900)';
    progressBar.style.transition = 'width 0.5s ease-out';
    progressBar.style.position = 'relative';
    
    // Add progress percentage text to the bar
    const progressPercent = document.createElement('div');
    progressPercent.className = 'rank-progress-percent';
    progressPercent.textContent = `${Math.round(this.getRankProgress() * 100)}%`;
    progressPercent.style.position = 'absolute';
    progressPercent.style.top = '0';
    progressPercent.style.left = '50%';
    progressPercent.style.transform = 'translateX(-50%)';
    progressPercent.style.width = '100%';
    progressPercent.style.height = '100%';
    progressPercent.style.display = 'flex';
    progressPercent.style.alignItems = 'center';
    progressPercent.style.justifyContent = 'center';
    progressPercent.style.color = 'white';
    progressPercent.style.fontSize = '10px';
    progressPercent.style.fontWeight = 'bold';
    progressPercent.style.textShadow = '0px 0px 2px rgba(0,0,0,0.7)';
    progressBar.appendChild(progressPercent);
    
    // Shine effect on the progress bar
    const shine = document.createElement('div');
    shine.className = 'rank-bar-shine';
    shine.style.position = 'absolute';
    shine.style.top = '0';
    shine.style.left = '-100%';
    shine.style.width = '50%';
    shine.style.height = '100%';
    shine.style.background = 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)';
    shine.style.transform = 'skewX(-25deg)';
    shine.style.animation = 'shineAnimation 3s infinite';
    
    // Create animation style
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes shineAnimation {
        0% { left: -100%; }
        20% { left: 100%; }
        100% { left: 100%; }
      }
      
      @media (max-width: 768px) {
        .rank-bar-container {
          width: 80% !important;
          top: 5px !important;
        }
        .rank-title {
          font-size: 1.2rem !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // XP info
    const xpInfo = document.createElement('div');
    xpInfo.className = 'rank-xp-info';
    xpInfo.style.marginTop = '5px';
    xpInfo.style.fontSize = '0.9rem';
    xpInfo.style.color = '#FFA559';
    
    if (this.currentRank < 100) {
      // Format XP numbers with thousand separators for readability
      const formattedCurrentXP = this.currentXP.toLocaleString();
      const formattedNeededXP = this.getXPForNextRank().toLocaleString();
      xpInfo.textContent = `${formattedCurrentXP} / ${formattedNeededXP} XP`;
      
      // No additional text about XP curve or next rank requirements
    } else {
      xpInfo.textContent = 'MAX RANK ACHIEVED';
    }
    
    // Assemble the components
    progressBar.appendChild(shine);
    progressContainer.appendChild(progressBar);
    rankBarContainer.appendChild(rankTitle);
    rankBarContainer.appendChild(progressContainer);
    rankBarContainer.appendChild(xpInfo);
    
    container.appendChild(rankBarContainer);
    
    return rankBarContainer;
  }
  
  /**
   * Shows a notification when the player levels up
   * Only shows if game is not in active play
   */
  showLevelUpNotification() {
    // Skip notifications during active gameplay
    if (window.gameInstance && window.gameInstance.isRunning) {
      return;
    }
    
    // Show notification logic...
    // Rest of notification code
  }
  
  /**
   * Validates and corrects rank and XP values
   * Called after manual settings changes to ensure data consistency
   */
  validateRankAndXP() {
    // Ensure rank is within valid range (1-100)
    if (this.currentRank < 1) {
      this.currentRank = 1;
    } else if (this.currentRank > 100) {
      this.currentRank = 100;
    }
    
    // If at max rank, set XP to max for that rank
    if (this.currentRank === 100) {
      this.currentXP = this.getXPForNextRank();
      return;
    }
    
    // Ensure XP is non-negative
    if (this.currentXP < 0) {
      this.currentXP = 0;
    }
    
    // Check if XP exceeds the amount needed for the next rank
    const xpForNextRank = this.getXPForNextRank();
    if (this.currentXP >= xpForNextRank) {
      // Instead of ranking up automatically, cap XP at just below threshold
      // This prevents unexpected rank ups when just setting values
      this.currentXP = xpForNextRank - 1;
    }
    
    // Save the validated data
    this.saveRankData();
  }
}