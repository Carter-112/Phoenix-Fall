# PhoenixFall Game

A vertical-scrolling, particle-based survival and progression game where you control a phoenix rising through dangerous atmospheric layers.

## Project Structure

```
PhoenixFall/
├── app.js                 # Main application entry point
├── index.html             # HTML entry point
├── package.json           # Project dependencies
├── server.js              # Development server
├── src/                   # Source code
│   ├── assets/            # Game assets (images, sounds)
│   ├── core/              # Core game functionality
│   │   ├── game.js        # Main game loop and mechanics
│   │   ├── gameState.js   # Game state management
│   │   ├── main.js        # Game initialization
│   │   └── ...
│   ├── entities/          # Game entities
│   │   ├── ember.js       # Collectible embers
│   │   ├── phoenix.js     # Player character
│   │   └── ...
│   ├── ui/                # User interface components
│   │   ├── mainMenu.js    # Main menu
│   │   ├── ui.js          # In-game UI
│   │   └── ...
│   ├── utils/             # Utility functions and helpers
│   │   ├── loadingAnimation.js
│   │   └── ...
│   └── worlds/            # Game worlds and levels
│       ├── world1.js      # World 1: Volcanic Cradle
│       └── ...
```

## Running the Game

### Prerequisites
- Node.js installed on your computer
- A mobile device (for testing on mobile)
- Both your computer and mobile device connected to the same WiFi network

### Running Locally

1. Open a terminal/command prompt in the game directory
2. Install dependencies (if you don't have Node.js installed):
   ```
   npm install
   ```

3. Start the local server:
   ```
   npm start
   ```

4. The server will display URLs like:
   ```
   Server running at:
   - Local: http://localhost:3000
   - Network: http://192.168.1.XXX:3000
   ```

5. To play on your computer, open `http://localhost:3000` in your browser

### Testing on Mobile Device

1. Make sure your phone is connected to the same WiFi network as your computer
2. Open your phone's web browser and navigate to the Network URL shown in the terminal (e.g., `http://192.168.1.XXX:3000`)
3. The game should load and run on your mobile device

### Testing with USB Connection

If WiFi isn't available or reliable, you can use USB debugging:

#### Android:

1. Enable USB debugging on your Android device:
   - Go to Settings > About phone > Tap "Build number" 7 times to enable developer options
   - Go back to Settings > System > Developer options > Enable USB debugging

2. Connect your phone to your PC with a USB cable

3. Use Chrome's remote debugging:
   - Open Chrome on your PC
   - Navigate to `chrome://inspect/#devices`
   - You should see your device listed
   - Click "Port forwarding..." and add port 3000 to forward to localhost:3000
   - Click "Enable port forwarding" and apply

4. On your Android phone, open Chrome and navigate to `http://localhost:3000`

#### iPhone:

1. Connect your iPhone to your Mac with a USB cable
2. Open Safari on Mac
3. Go to Safari > Preferences > Advanced and check "Show Develop menu in menu bar"
4. In the Safari menu bar, choose Develop > [Your iPhone] > [Your localhost site]

## Controls

- Drag or tap/hold to guide the phoenix left/right
- The phoenix flies upward automatically

## Worlds

The game features 5 progressively challenging worlds:
1. Volcanic Cradle
2. Ashspire Ruins
3. Solar Rift
4. Celestial Void
5. Infernal Core 