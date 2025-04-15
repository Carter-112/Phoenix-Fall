/**
 * PhoenixFall Game - Main Application Entry Point
 * This file initializes the game and manages the startup sequence
 */

// Import main game module
import { initializeGame } from './src/core/main.js';

// Initialize game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('PhoenixFall initializing...');
  
  // Get the render container
  const renderDiv = document.getElementById('renderDiv');
  
  if (!renderDiv) {
    console.error('Error: Could not find render container element!');
    showErrorScreen('Failed to initialize game - render container not found');
    return;
  }
  
  // Set a timeout to catch initialization failures
  const initTimeout = setTimeout(() => {
    console.error('Game initialization timed out!');
    showErrorScreen('Game initialization timed out. Try refreshing the page.');
  }, 10000); // 10 second timeout
  
  try {
    // Start the game
    initializeGame(renderDiv);
    console.log('PhoenixFall initialization complete');
    clearTimeout(initTimeout); // Clear the timeout if initialization completes successfully
  } catch (error) {
    console.error('Error during game initialization:', error);
    showErrorScreen('Game initialization failed. Please try refreshing the page.');
    clearTimeout(initTimeout);
  }
});

/**
 * Shows a simple error screen when initialization fails
 */
function showErrorScreen(errorMessage) {
  // Hide the initial loader if it exists
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) {
    initialLoader.style.display = 'none';
  }
  
  // Show the render div
  const renderDiv = document.getElementById('renderDiv');
  if (renderDiv) {
    renderDiv.style.opacity = '1';
  }
  
  // Create error container
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100%';
  errorContainer.style.height = '100%';
  errorContainer.style.display = 'flex';
  errorContainer.style.flexDirection = 'column';
  errorContainer.style.justifyContent = 'center';
  errorContainer.style.alignItems = 'center';
  errorContainer.style.backgroundColor = '#240000';
  errorContainer.style.color = '#FF5500';
  errorContainer.style.padding = '20px';
  errorContainer.style.textAlign = 'center';
  errorContainer.style.zIndex = '9999';
  
  // Create error title
  const errorTitle = document.createElement('h2');
  errorTitle.textContent = 'PhoenixFall';
  errorTitle.style.fontSize = '2.5rem';
  errorTitle.style.marginBottom = '20px';
  
  // Create error message
  const errorText = document.createElement('p');
  errorText.textContent = errorMessage;
  errorText.style.fontSize = '1.2rem';
  errorText.style.marginBottom = '30px';
  errorText.style.maxWidth = '80%';
  
  // Create restart button
  const restartButton = document.createElement('button');
  restartButton.textContent = 'Restart Game';
  restartButton.style.backgroundColor = 'black';
  restartButton.style.color = '#FF5500';
  restartButton.style.border = '2px solid #FF5500';
  restartButton.style.padding = '12px 24px';
  restartButton.style.fontSize = '1.2rem';
  restartButton.style.borderRadius = '30px';
  restartButton.style.cursor = 'pointer';
  restartButton.style.transition = 'all 0.2s ease';
  
  // Add hover effect
  restartButton.addEventListener('mouseover', () => {
    restartButton.style.backgroundColor = '#FF5500';
    restartButton.style.color = 'black';
  });
  
  restartButton.addEventListener('mouseout', () => {
    restartButton.style.backgroundColor = 'black';
    restartButton.style.color = '#FF5500';
  });
  
  // Add click event
  restartButton.addEventListener('click', () => {
    window.location.reload();
  });
  
  // Assemble error screen
  errorContainer.appendChild(errorTitle);
  errorContainer.appendChild(errorText);
  errorContainer.appendChild(restartButton);
  
  // Add to the DOM
  document.body.appendChild(errorContainer);
} 