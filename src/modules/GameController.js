const ResourceManager = require('./ResourceManager');
const BuildingManager = require('./BuildingManager');
const EventManager = require('./EventManager');
const CampaignManager = require('./CampaignManager');
const DisplayManager = require('./DisplayManager');
const SaveManager = require('./SaveManager');
const buildingData = require('../data/buildings');

class GameController {
  constructor(gameMode = 'campaign') {
    this.gameMode = gameMode;
    this.day = 1;
    this.gameRunning = true;
    
    this.resourceManager = new ResourceManager();
    this.buildingManager = new BuildingManager();
    this.eventManager = new EventManager();
    this.campaignManager = new CampaignManager();
    this.displayManager = new DisplayManager();
    this.saveManager = new SaveManager();
    
    this.rl = this.displayManager.createInterface();
    
    if (gameMode === 'campaign') {
      this.campaignManager.startCampaign();
    }
  }

  async gameLoop() {
    while (this.gameRunning) {
      this.displayManager.displayStatus(
        this.resourceManager,
        this.buildingManager,
        this.campaignManager,
        this.eventManager,
        this.day
      );

      const menuType = this.displayManager.displayMenu(
        this.resourceManager,
        this.buildingManager,
        this.eventManager
      );

      const choice = await this.getUserInput();

      if (menuType === 'choice') {
        await this.handleChoiceEvent(choice);
      } else {
        await this.handleMainMenu(choice);
      }

      if (this.checkGameEnd()) {
        break;
      }
    }

    this.displayManager.displayGameOver(this.resourceManager, this.campaignManager, this.day);
    this.rl.close();
  }

  async handleMainMenu(choice) {
    switch (choice) {
      case '1':
        await this.handleBuildMenu();
        break;
      case '2':
        this.nextDay();
        break;
      case '3':
        await this.handleSaveGame();
        break;
      case '4':
        await this.handleLoadGame();
        break;
      case '5':
        this.gameRunning = false;
        break;
      default:
        console.log('Invalid choice. Try again.');
        await this.getUserInput();
    }
  }

  async handleBuildMenu() {
    this.displayManager.displayBuildMenu(this.resourceManager, this.buildingManager);
    
    const choice = await this.getUserInput();
    const buildingTypes = Object.keys(buildingData);
    const choiceIndex = parseInt(choice) - 1;

    if (choiceIndex >= 0 && choiceIndex < buildingTypes.length) {
      const buildingType = buildingTypes[choiceIndex];
      this.attemptBuild(buildingType);
    }
  }

  attemptBuild(buildingType) {
    const building = buildingData[buildingType];
    
    if (this.buildingManager.build(buildingType, this.resourceManager)) {
      console.log(`\n✅ Successfully built ${building.name}!`);
      
      if (buildingType === 'expedition') {
        this.eventManager.triggerExpeditionEvent(this.resourceManager, this.day);
      }
    } else {
      console.log(`\n❌ Not enough resources to build ${building.name}.`);
    }
    
    console.log('Press Enter to continue...');
  }

  async handleChoiceEvent(choice) {
    const choiceIndex = parseInt(choice) - 1;
    
    if (choiceIndex >= 0 && choiceIndex <= 1) {
      this.eventManager.handleChoice(choiceIndex, this.resourceManager, this.buildingManager, this.day);
    } else {
      this.eventManager.forceDefaultChoice(this.resourceManager, this.buildingManager, this.day);
    }
    
    console.log('Press Enter to continue...');
    await this.getUserInput();
  }

  nextDay() {
    this.resourceManager.dailyDecay();
    this.resourceManager.applyProduction(this.buildingManager.getAllBuildings());
    
    this.eventManager.triggerRandomEvent(this.resourceManager, this.buildingManager, this.day);
    
    if (!this.eventManager.getCurrentEvent().pending) {
      this.eventManager.triggerChoiceEvent(this.day);
    }
    
    if (this.gameMode === 'campaign') {
      this.checkMissionStatus();
    }
    
    this.day++;
    
    // Auto-save every day
    this.saveManager.saveGame(this.saveManager.exportGameState(
      this.resourceManager,
      this.buildingManager,
      this.eventManager,
      this.campaignManager,
      this.day
    ), 'autosave');
  }

  checkMissionStatus() {
    if (this.campaignManager.missionActive) {
      if (this.campaignManager.checkMissionCompletion(this.buildingManager)) {
        const mission = this.campaignManager.getCurrentMission();
        this.displayManager.displayMissionComplete(mission);
        this.campaignManager.completeMission();
        
        this.resourceManager.modifyResources({ morale: 30 });
        
        if (!this.campaignManager.isCampaignComplete()) {
          const nextMission = this.campaignManager.startCampaign();
          if (nextMission) {
            console.log('\n📋 New mission briefing:');
            console.log(`${nextMission.title}`);
            console.log(`${nextMission.story}`);
            console.log('Press Enter to continue...');
          }
        }
      } else if (this.campaignManager.checkMissionFailure(this.day)) {
        const mission = this.campaignManager.getCurrentMission();
        this.displayManager.displayMissionFailed(mission);
        this.campaignManager.failMission();
        
        this.resourceManager.modifyResources({ morale: -40, energy: -20 });
      }
    }
  }

  checkGameEnd() {
    if (this.resourceManager.isGameOver()) {
      return true;
    }
    
    if (this.gameMode === 'campaign' && this.campaignManager.isCampaignComplete()) {
      return true;
    }
    
    return false;
  }

  getUserInput() {
    return new Promise((resolve) => {
      this.rl.question('', (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async handleSaveGame() {
    this.displayManager.displaySaveGameMenu();
    const saveName = await this.getUserInput();
    const finalName = saveName.trim() || 'quicksave';
    
    const gameState = this.saveManager.exportGameState(
      this.resourceManager,
      this.buildingManager, 
      this.eventManager,
      this.campaignManager,
      this.day
    );
    
    const result = this.saveManager.saveGame(gameState, finalName);
    this.displayManager.displaySaveLoadResult(result);
    await this.getUserInput();
  }

  async handleLoadGame() {
    const saveFiles = this.saveManager.getSaveFiles();
    this.displayManager.displayLoadGameMenu(saveFiles);
    
    if (saveFiles.length === 0) {
      await this.getUserInput();
      return;
    }
    
    const choice = await this.getUserInput();
    const choiceIndex = parseInt(choice) - 1;
    
    if (choiceIndex >= 0 && choiceIndex < saveFiles.length) {
      const saveFile = saveFiles[choiceIndex];
      const result = this.saveManager.loadGame(saveFile.name);
      
      if (result.success) {
        const importResult = this.saveManager.importGameState(
          result.gameState,
          this.resourceManager,
          this.buildingManager,
          this.eventManager,
          this.campaignManager
        );
        
        if (importResult.success) {
          this.day = result.gameState.day;
          this.displayManager.displaySaveLoadResult(result);
        } else {
          this.displayManager.displaySaveLoadResult(importResult);
        }
      } else {
        this.displayManager.displaySaveLoadResult(result);
      }
      await this.getUserInput();
    }
  }

  async showStartScreen() {
    while (true) {
      this.displayManager.displayStartScreen();
      const choice = await this.getUserInput();
      
      switch (choice) {
        case '1':
          return 'new';
        case '2':
          const saveFiles = this.saveManager.getSaveFiles();
          this.displayManager.displayLoadGameMenu(saveFiles);
          
          if (saveFiles.length === 0) {
            await this.getUserInput();
            continue;
          }
          
          const loadChoice = await this.getUserInput();
          const choiceIndex = parseInt(loadChoice) - 1;
          
          if (choiceIndex >= 0 && choiceIndex < saveFiles.length) {
            const saveFile = saveFiles[choiceIndex];
            const result = this.saveManager.loadGame(saveFile.name);
            
            if (result.success) {
              const importResult = this.saveManager.importGameState(
                result.gameState,
                this.resourceManager,
                this.buildingManager,
                this.eventManager,
                this.campaignManager
              );
              
              if (importResult.success) {
                this.day = result.gameState.day;
                return 'loaded';
              } else {
                this.displayManager.displaySaveLoadResult(importResult);
                await this.getUserInput();
              }
            } else {
              this.displayManager.displaySaveLoadResult(result);
              await this.getUserInput();
            }
          }
          break;
        case '3':
          return 'exit';
        default:
          console.log('Invalid choice. Try again.');
      }
    }
  }

  async startGame() {
    const startChoice = await this.showStartScreen();
    
    if (startChoice === 'exit') {
      console.log('Thanks for playing!');
      this.rl.close();
      return;
    }
    
    if (startChoice === 'new') {
      if (this.gameMode === 'campaign') {
        this.campaignManager.startCampaign();
        const firstMission = this.campaignManager.getCurrentMission();
        if (firstMission) {
          console.clear();
          console.log('Welcome to Deep Range Protocol!');
          console.log('\n📋 Mission Briefing:');
          console.log(`${firstMission.title}`);
          console.log(`${firstMission.story}`);
          console.log('\nPress Enter to begin...');
          await this.getUserInput();
        }
      }
    }
    
    // Auto-save at start of each day
    this.saveManager.saveGame(this.saveManager.exportGameState(
      this.resourceManager,
      this.buildingManager,
      this.eventManager,
      this.campaignManager,
      this.day
    ), 'autosave');
    
    await this.gameLoop();
  }
}

module.exports = GameController;