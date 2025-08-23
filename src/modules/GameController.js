const ResourceManager = require('./ResourceManager');
const BuildingManager = require('./BuildingManager');
const EventManager = require('./EventManager');
const CampaignManager = require('./CampaignManager');
const DisplayManager = require('./DisplayManager');
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

  async startGame() {
    console.log('Welcome to Deep Range Protocol!');
    
    if (this.gameMode === 'campaign') {
      const firstMission = this.campaignManager.getCurrentMission();
      if (firstMission) {
        console.log('\n📋 Mission Briefing:');
        console.log(`${firstMission.title}`);
        console.log(`${firstMission.story}`);
        console.log('\nPress Enter to begin...');
        await this.getUserInput();
      }
    }
    
    await this.gameLoop();
  }
}

module.exports = GameController;