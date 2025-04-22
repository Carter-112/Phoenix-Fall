# PhoenixFall - Simplified Core

A vertical-scrolling, particle-based survival game where you control a phoenix rising through dangerous atmospheric layers. This simplified version focuses on the core game elements for development and testing.

## Core Elements

This version includes only the following core elements:

1. **Phoenix** - The player character with flame trail effects
2. **Ember** - Basic collectible for XP and progression
3. **FlameHelicopter** - The primary hazard, a spinning flame formation
4. **MagmaBat** - The main enemy type with flying motion patterns

## Simplified Design

- **World Selection**: Only World 1 (Ember Valley) is available
- **Entity System**: Streamlined to focus on core gameplay mechanics
- **Particle System**: Maintains full visual effects but with simplified entity types

## Running the Game

### Prerequisites
- Node.js installed on your computer

### Running Locally

1. Open a terminal/command prompt in the game directory
2. Install dependencies:
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
   ```

5. Open `http://localhost:3000` in your browser to play

## Controls

- Drag or tap/hold to guide the phoenix left/right
- The phoenix flies upward automatically
- Double-click/double-tap for special attack

## Game Progression

- Collect embers to gain XP and level up
- Avoid or defeat FlameHelicopters with your flame trail
- Avoid or defeat MagmaBats flying toward you
- Survive to reach the end of the level

## Project Structure

```
PhoenixFall/
├── app.js                 # Main application entry point
├── index.html             # HTML entry point
├── src/                   # Source code
│   ├── core/              # Core game functionality
│   │   ├── game.js        # Main game loop and mechanics
│   │   ├── main.js        # Game initialization
│   │   └── ...
│   ├── entities/          # Game entities
│   │   ├── ember.js       # Collectible embers
│   │   ├── phoenix.js     # Player character
│   │   ├── flameHelicopter.js # Primary hazard
│   │   ├── magmaBat.js    # Enemy type
│   │   └── ...
│   └── worlds/            # Game worlds
│       └── world1/        # World 1: Ember Valley
│           └── ...
```

## Development Notes

This version has been streamlined to focus on the core gameplay experience with:

- Consistent entity design across all game objects
- Unified particle system for visual effects
- Simplified world management (World 1 only)
- Better performance by removing complex entity types

To extend the game, build upon these core elements rather than introducing new entity types. 