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

    // Check for true victory ending (crew sacrifice)
    if (this.campaignManager.isTrueVictory()) {
      this.displayManager.displayTrueVictory();
    } else {
      this.displayManager.displayGameOver(this.resourceManager, this.campaignManager, this.day);
    }
    this.rl.close();
  }

  async handleMainMenu(choice) {
    switch (choice) {
      case '1':
        await this.handleBuildMenu();
        break;
      case '2':
        await this.nextDay();
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
    const unlockedBuildings = this.buildingManager.getUnlockedBuildings();
    const choiceIndex = parseInt(choice) - 1;

    if (choiceIndex >= 0 && choiceIndex < unlockedBuildings.length) {
      const buildingType = unlockedBuildings[choiceIndex];
      this.attemptBuild(buildingType);
    }
  }

  attemptBuild(buildingType) {
    const building = buildingData[buildingType];
    
    if (this.buildingManager.build(buildingType, this.resourceManager)) {
      console.log(`\n✅ Successfully built ${building.name}!`);
      console.log('Construction takes one day to complete...');
      
      if (buildingType === 'expedition') {
        this.eventManager.triggerExpeditionEvent(this.resourceManager, this.day);
      }
      
      // Building takes one day - advance the game
      this.nextDay();
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

  async nextDay() {
    const decayResult = this.resourceManager.dailyDecay();
    
    // Handle crisis situations
    if (decayResult.starvation) {
      this.eventManager.eventHistory.push({
        day: this.day,
        text: `💀 STARVATION: One crew member has died from lack of food. Survivors: ${this.resourceManager.crewMembers}`
      });
      this.eventManager.lastEvent = `💀 STARVATION: One crew member has died from lack of food!`;
      this.eventManager.lastEventDay = this.day;
    }
    
    if (decayResult.moralecrisis) {
      this.eventManager.eventHistory.push({
        day: this.day,
        text: "😰 MORALE CRISIS: Crew refuses to work today due to low morale"
      });
      this.eventManager.lastEvent = `😰 MORALE CRISIS: Crew refuses to work today!`;
      this.eventManager.lastEventDay = this.day;
      // Skip production for morale crisis - crew won't work
    } else {
      const productionResult = this.resourceManager.applyProduction(this.buildingManager.getAllBuildings());
      
      if (productionResult.blackout) {
        this.eventManager.eventHistory.push({
          day: this.day,
          text: "⚡ POWER BLACKOUT: No energy available - all systems offline"
        });
        this.eventManager.lastEvent = `⚡ POWER BLACKOUT: All systems offline!`;
        this.eventManager.lastEventDay = this.day;
      }
    }
    
    this.eventManager.triggerRandomEvent(this.resourceManager, this.buildingManager, this.day);
    
    if (!this.eventManager.getCurrentEvent().pending) {
      this.eventManager.triggerChoiceEvent(this.day);
    }
    
    if (this.gameMode === 'campaign') {
      await this.checkMissionStatus();
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

  async checkMissionStatus() {
    if (this.campaignManager.missionActive) {
      if (this.campaignManager.checkMissionCompletion(this.buildingManager)) {
        const mission = this.campaignManager.getCurrentMission();
        this.displayManager.displayMissionComplete(mission);
        this.campaignManager.completeMission();
        
        this.resourceManager.modifyResources({ morale: 30 });
        
        if (!this.campaignManager.isCampaignComplete()) {
          const nextMission = this.campaignManager.startCampaign();
          if (nextMission) {
            this.buildingManager.unlockBuildingByMission(this.campaignManager.currentMission);
            
            // Check if this is the final mission - offer the ultimate choice
            if (this.campaignManager.isFinalMission()) {
              const choice = await this.presentFinalChoice(nextMission);
              if (choice === 'skip') {
                this.campaignManager.skipFinalMission();
                // Force game over with true victory
                this.gameRunning = false;
                return;
              }
            }
            
            console.log('\n📋 New mission briefing:');
            console.log(`${nextMission.title}`);
            console.log(`${nextMission.story}`);
            console.log('\n✨ New building unlocked for this mission!');
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
        await this.displayLoreIntroduction();
        this.campaignManager.startCampaign();
        this.buildingManager.unlockBuildingByMission(this.campaignManager.currentMission);
        const firstMission = this.campaignManager.getCurrentMission();
        if (firstMission) {
          console.clear();
          console.log('📋 Current Status Report:');
          console.log(`${firstMission.title}`);
          console.log(`${firstMission.story}`);
          console.log('\nPress Enter to begin operations...');
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

  async displayLoreIntroduction() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                          📡 MISSION LOG 📡');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🌟 YEAR 2961 CE - EARTH ORBITAL STATION ALPHA');
    console.log('');
    console.log('After decades of deep space observation, humanity detected the impossible:');
    console.log('strong biosignatures from Kepler-442b, 1,200 light-years distant.');
    console.log('');
    console.log('Atmospheric analysis revealed:');
    console.log('• High oxygen content (21.3%)');
    console.log('• Methane signatures indicating biological processes');  
    console.log('• Perfect orbital position within the habitable zone');
    console.log('• Host star age: 2.9 billion years (optimal for complex life)');
    console.log('');
    console.log('The greatest expedition in human history was launched.');
    console.log('');
    console.log('Press Enter to continue...');
    await this.getUserInput();
    
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                        🚀 THE JOURNEY 🚀');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('⏱️ SHIP TIME: 5 years, 7 months, 12 days');
    console.log('⏱️ EARTH TIME: 203 years, 4 months, 3 days');
    console.log('');
    console.log('Traveling at 99.2% light speed aboard the starship "Endeavor,"');
    console.log('you and your crew of 10 specialists endured the longest journey');
    console.log('in human history. Time dilation meant that while Earth aged');
    console.log('two centuries, you experienced only five years of subjective time.');
    console.log('');
    console.log('Upon arrival, initial scans confirmed the worst fears:');
    console.log('The planet showed signs of early-stage life - microbial organisms,');
    console.log('primitive algae, but no advanced civilizations.');
    console.log('');
    console.log('Still, this was humanity\'s first foothold beyond the solar system.');
    console.log('');
    console.log('Press Enter to continue...');
    await this.getUserInput();
    
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                      ⛈️ THE CATASTROPHE ⛈️');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🏗️ DAY 1 - SURFACE OPERATIONS BEGIN');
    console.log('');
    console.log('Landing was successful. Your crew established a research base');
    console.log('in the northern continent\'s temperate zone. Everything was');
    console.log('proceeding according to protocol...');
    console.log('');
    console.log('🌪️ DAY 3 - ATMOSPHERIC ANOMALY DETECTED');
    console.log('');
    console.log('Without warning, a massive atmospheric storm system emerged');
    console.log('from the planet\'s core. Unlike any weather pattern in Earth\'s');
    console.log('meteorological records, it carried electromagnetic pulses');
    console.log('that disabled most electronic systems.');
    console.log('');
    console.log('💥 THE STORM STRUCK WITH DEVASTATING FORCE:');
    console.log('• Main habitat modules: DESTROYED');
    console.log('• Communication array: OFFLINE');
    console.log('• Supply depot: SCATTERED');
    console.log('• Emergency shelter: DAMAGED');
    console.log('• Hydroponics bay: PARTIALLY INTACT');
    console.log('');
    console.log('Press Enter to continue...');
    await this.getUserInput();
    
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                        🏴 SURVIVAL MODE 🏴');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 CURRENT STATUS - DAY 1 AFTER THE STORM');
    console.log('');
    console.log('🍽️ Food supplies: 88/100 (storm damaged several storage units)');
    console.log('⚡ Energy reserves: 92/100 (backup power cells partially drained)');
    console.log('😰 Crew morale: 85/100 (shaken but determined to survive)');
    console.log('👥 Survivors: 10/10 (all crew members accounted for)');
    console.log('');
    console.log('🌱 REMAINING INFRASTRUCTURE:');
    console.log('• One partially damaged hydroponic farm (your lifeline)');
    console.log('• Scattered equipment and supplies');
    console.log('• No communication with Earth');
    console.log('');
    console.log('⚡ STRANGE PHENOMENA:');
    console.log('Ever since the storm, crew members have reported unexplainable');
    console.log('occurrences: equipment malfunctioning in impossible ways,');
    console.log('electromagnetic interference with no identifiable source,');
    console.log('and an unsettling feeling that you\'re not alone on this world.');
    console.log('');
    console.log('🎯 YOUR MISSION:');
    console.log('Survive long enough to reestablish communication with Earth');
    console.log('and send back what may be humanity\'s final transmission');
    console.log('from the deep range of space...');
    console.log('');
    console.log('Press Enter to begin the survival protocol...');
    await this.getUserInput();
  }

  async presentFinalChoice(mission) {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                        👁️ THE FINAL CHOICE 👁️');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('The crew has completed three successful missions, but something is wrong.');
    console.log('The electromagnetic interference has grown stronger. Equipment operates');
    console.log('on its own. Some crew members report strange dreams and whispers.');
    console.log('');
    console.log('Dr. Chen\'s research notes from the previous mission contain a chilling');
    console.log('discovery: the crystalline formations aren\'t natural. They\'re part of');
    console.log('some vast, dormant neural network spanning the planet\'s core.');
    console.log('');
    console.log('The final mission calls for a deep expedition into the planet\'s heart,');
    console.log('where the largest crystal formation waits. But Dr. Chen\'s final log');
    console.log('entry warns: "It\'s not sleeping. It\'s waiting. Waiting for us to');
    console.log('come deep enough to complete the circuit."');
    console.log('');
    console.log('⚠️ CRITICAL DECISION REQUIRED:');
    console.log('');
    console.log('🚀 1. Complete the final expedition mission');
    console.log('   → Follow protocol and investigate the deep formations');
    console.log('   → High chance of establishing communication with Earth');
    console.log('   → Unknown consequences from entity contact');
    console.log('');
    console.log('💀 2. Abort the mission and destroy the base');
    console.log('   → Sacrifice the crew to prevent entity awakening');
    console.log('   → Send emergency warning to Earth before destruction');
    console.log('   → Guarantee no survivors, but save humanity');
    console.log('');
    console.log('The weight of humanity\'s future rests on your decision...');
    console.log('');
    console.log('Enter your choice (1 or 2):');
    
    while (true) {
      const choice = await this.getUserInput();
      if (choice === '1') {
        console.log('\\nThe crew prepares for the final expedition...');
        console.log('There is no turning back now.');
        console.log('Press Enter to continue...');
        await this.getUserInput();
        return 'proceed';
      } else if (choice === '2') {
        console.log('\\nThe crew makes the ultimate sacrifice...');
        console.log('They begin destroying the base and transmitting the warning.');
        console.log('Press Enter to witness their heroic end...');
        await this.getUserInput();
        return 'skip';
      } else {
        console.log('Please enter 1 or 2:');
      }
    }
  }
}

module.exports = GameController;