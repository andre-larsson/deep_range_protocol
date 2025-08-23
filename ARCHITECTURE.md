# Deep Range Protocol - Architecture Overview

## Refactored Structure

The game has been refactored from a single monolithic file into a modular architecture for better maintainability, testability, and code organization.

### Directory Structure

```
src/
├── index.js                    # Main entry point
├── modules/                    # Core game modules
│   ├── GameController.js       # Main game loop and coordination
│   ├── ResourceManager.js      # Resource management and economics
│   ├── BuildingManager.js      # Building construction and management
│   ├── EventManager.js         # Random and choice events
│   ├── CampaignManager.js      # Mission and campaign logic
│   └── DisplayManager.js       # UI and display formatting
└── data/                       # Game data and configuration
    ├── buildings.js            # Building definitions and costs
    ├── events.js               # Event definitions and effects
    └── missions.js             # Campaign missions data
```

### Module Responsibilities

#### GameController
- Main game loop coordination
- User input handling
- Game state management
- Integration between all modules

#### ResourceManager
- Tracks food, energy, morale, and crew
- Handles daily resource decay and production
- Resource spending and validation
- Game over conditions

#### BuildingManager
- Building construction logic
- Building data access
- Efficiency calculations
- Building damage from events

#### EventManager
- Random event generation
- Choice event handling
- Event history tracking
- Cosmic influence tracking

#### CampaignManager
- Mission progression
- Mission completion/failure tracking
- Campaign state management
- Mission briefings

#### DisplayManager
- Status screen rendering
- Menu display
- Game over screens
- User interface formatting

### Key Improvements

1. **Separation of Concerns**: Each module has a clear, single responsibility
2. **Maintainability**: Much easier to modify specific game systems
3. **Testability**: Individual modules can be tested in isolation
4. **Extensibility**: New features can be added with minimal cross-module changes
5. **Code Reuse**: Modules can be reused or composed differently
6. **Debugging**: Issues can be isolated to specific modules

### Usage

The game can still be run using the same command:
```bash
npm start
```

The entry point (`space-camp-manager.js`) now simply imports and starts the modular game system.