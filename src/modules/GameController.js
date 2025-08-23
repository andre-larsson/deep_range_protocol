const ResourceManager = require('./ResourceManager');
const BuildingManager = require('./BuildingManager');
const EventManager = require('./EventManager');
const CampaignManager = require('./CampaignManager');
const DisplayManager = require('./DisplayManager');
const SaveManager = require('./SaveManager');
const ExpeditionManager = require('./ExpeditionManager');
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
    this.expeditionManager = new ExpeditionManager();
    
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
        this.eventManager,
        this.campaignManager
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

    // Display the appropriate game over screen
    this.displayManager.displayGameOver(this.resourceManager, this.campaignManager, this.day);
    this.rl.close();
  }

  async handleMainMenu(choice) {
    switch (choice) {
      case '1':
        await this.handleBuildMenu();
        break;
      case '2':
        await this.handleExpedition();
        break;
      case '3':
        await this.nextDay();
        break;
      case '4':
        await this.handleSaveGame();
        break;
      case '5':
        await this.handleLoadGame();
        break;
      case '6':
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
      await this.attemptBuild(buildingType);
    }
  }

  async attemptBuild(buildingType) {
    const building = buildingData[buildingType];
    
    if (this.buildingManager.build(buildingType, this.resourceManager)) {
      console.log(`\n✅ Successfully built ${building.name}!`);
      console.log('Construction takes one day to complete...');
      
      
      console.log('Press Enter to continue...');
      await this.getUserInput();
      
      // Building takes one day - advance the game
      await this.nextDay();
    } else {
      console.log(`\n❌ Not enough resources to build ${building.name}.`);
      const cost = this.buildingManager.getBuildingCost(buildingType);
      console.log(`Required: 🍽️ ${cost.food} food, ⚡ ${cost.energy} energy, 😰 ${cost.morale} morale`);
      console.log('Press Enter to continue...');
      await this.getUserInput();
    }
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
    // First check if crew can work (morale check before production)
    const preDecayResult = this.resourceManager.checkMoraleBeforeProduction();
    
    if (preDecayResult.moralecrisis) {
      // Morale crisis - no production, only consumption
      this.eventManager.eventHistory.push({
        day: this.day,
        text: "😰 MORALE CRISIS: Crew refuses to work today due to low morale"
      });
      this.eventManager.lastEvent = `😰 MORALE CRISIS: Crew refuses to work today!`;
      this.eventManager.lastEventDay = this.day;
    } else {
      // Apply production (crew works during the day)
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
    
    // Then apply daily consumption/decay
    const decayResult = this.resourceManager.dailyDecay(this.day);
    
    // Handle crisis situations
    if (decayResult.starvation) {
      this.eventManager.eventHistory.push({
        day: this.day,
        text: `💀 STARVATION: One crew member has died from lack of food. Survivors: ${this.resourceManager.crewMembers}`
      });
      this.eventManager.lastEvent = `💀 STARVATION: One crew member has died from lack of food!`;
      this.eventManager.lastEventDay = this.day;
    }
    
    const eventTriggered = this.eventManager.triggerRandomEvent(this.resourceManager, this.buildingManager, this.day);
    
    // Show random event immediately if one was triggered
    if (eventTriggered) {
      const currentEvent = this.eventManager.getCurrentEvent();
      console.log('───────────────────────────────────────');
      console.log(currentEvent.event);
      if (currentEvent.extra) {
        console.log(currentEvent.extra);
      }
      console.log('───────────────────────────────────────');
      console.log('Press Enter to continue...');
      await this.getUserInput();
    }
    
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
      this.expeditionManager,
      this.day
    ), 'autosave');
  }

  async checkMissionStatus() {
    if (this.campaignManager.missionActive) {
      if (this.campaignManager.checkMissionCompletion(this.buildingManager)) {
        const mission = this.campaignManager.getCurrentMission();
        
        // Calculate early completion bonus
        const timeLimit = this.campaignManager.timeLimit;
        const daysRemaining = Math.max(0, timeLimit - this.day);
        const speedBonus = Math.floor(daysRemaining * 5); // +5 morale per day early
        const totalMoraleBonus = 30 + speedBonus;
        
        this.displayManager.displayMissionComplete(mission);
        this.campaignManager.completeMission();
        
        this.resourceManager.modifyResources({ morale: totalMoraleBonus });
        
        if (speedBonus > 0) {
          console.log(`🎉 EARLY COMPLETION BONUS: +${speedBonus} morale for finishing ${daysRemaining} days early!`);
        }
        
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
            await this.getUserInput();
          }
        }
      } else if (this.campaignManager.checkMissionFailure(this.day)) {
        const mission = this.campaignManager.getCurrentMission();
        this.displayManager.displayMissionFailed(mission);
        await this.getUserInput();
        this.campaignManager.failMission();
        
        // Mission failure ends the game
        this.gameRunning = false;
        return;
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
      this.expeditionManager,
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
          this.campaignManager,
          this.expeditionManager
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

  async handleExpedition() {
    // Check if this is the final mission expedition
    if (this.campaignManager.currentMission === 3 && this.campaignManager.missionActive) {
      const canAfford = this.campaignManager.canAffordFinalExpedition(this.resourceManager);
      
      console.log('\n🚀 FINAL EXPEDITION AVAILABLE');
      console.log('This expedition will complete the final mission.');
      console.log('Cost: 50 food, 120 energy, 60 morale');
      
      if (canAfford) {
        console.log('✅ Resources available');
      } else {
        console.log('❌ Insufficient resources');
      }
      
      console.log('\n1. Launch final expedition');
      console.log('2. Regular expedition');
      console.log('3. Return to main menu');
      
      const finalChoice = await this.getUserInput();
      if (finalChoice === '1') {
        if (this.campaignManager.completeFinalExpedition(this.resourceManager)) {
          console.log('\n🚀 Final expedition launched!');
          console.log('Press Enter to continue...');
          await this.getUserInput();
          await this.nextDay();
          return;
        } else {
          console.log('\n❌ Not enough resources for final expedition.');
          await this.getUserInput();
          return;
        }
      } else if (finalChoice === '3') {
        return;
      }
      // Continue with regular expedition if choice was '2'
    }

    this.displayManager.displayExpeditionMenu();
    const choice = await this.getUserInput();
    
    let teamSize = 0;
    
    if (choice === '1') {
      teamSize = 1;
    } else if (choice === '2') {
      teamSize = 2;
    } else if (choice === '3') {
      teamSize = 3;
    } else if (choice === '4') {
      return; // Return to base
    } else {
      console.log('Invalid choice. Returning to base.');
      await this.getUserInput();
      return;
    }
    
    // Check if enough crew available
    if (teamSize > this.resourceManager.crewMembers) {
      console.log(`\n❌ Not enough crew members! You need ${teamSize} but only have ${this.resourceManager.crewMembers}.`);
      console.log('Press Enter to continue...');
      await this.getUserInput();
      return;
    }
    
    // Launch expedition with selected team size
    const outcome = this.expeditionManager.generateExpeditionOutcome(
      this.resourceManager.crewMembers, 
      this.day,
      this.resourceManager.resources.morale,
      teamSize
    );
      
      // Apply effects
      if (outcome.effects.crewLoss) {
        this.resourceManager.crewMembers = Math.max(0, this.resourceManager.crewMembers - outcome.effects.crewLoss);
      }
      
      // Apply resource changes
      Object.keys(outcome.effects).forEach(resource => {
        if (resource === 'crewLoss') return;
        if (this.resourceManager.resources.hasOwnProperty(resource)) {
          this.resourceManager.resources[resource] = Math.max(0, 
            Math.min(200, this.resourceManager.resources[resource] + outcome.effects[resource])
          );
        }
      });
      
      // Increase cosmic influence for cosmic outcomes
      if (outcome.cosmic) {
        this.eventManager.cosmicInfluence += 5;
      }
      
      // Add to event history
      this.eventManager.eventHistory.push({
        day: this.day,
        text: `EXPEDITION: ${outcome.message}`
      });
      
      this.displayManager.displayExpeditionOutcome(outcome, this.resourceManager, teamSize);
      await this.getUserInput();
      
      // Expedition takes time - advance day
      await this.nextDay();
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
      this.expeditionManager,
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
    console.log('strong biosignatures from Kepler-442b, 120 light-years distant.');
    console.log('');
    console.log('Long-range spectroscopy revealed:');
    console.log('• Atmospheric oxygen content: 21.3% (impossibly high for early life)');
    console.log('• Complex organic signatures suggesting advanced metabolism');  
    console.log('• Perfect orbital position within the habitable zone');
    console.log('• Host star age: 6.2 billion years (ancient, stable system)');
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
    console.log('⏱️ EARTH TIME: 127 years, 8 months, 15 days');
    console.log('');
    console.log('Using the revolutionary Alcubierre-Chen warp drive, the starship');
    console.log('"Endeavor" compressed spacetime itself, achieving effective speeds');
    console.log('of 0.95c while maintaining normal physics within the warp bubble.');
    console.log('Time dilation meant that while Earth aged over a century,');
    console.log('you experienced only five years of subjective time.');
    console.log('');
    console.log('Upon arrival, initial scans revealed a disturbing truth:');
    console.log('The biosignatures were real, but the planet showed only');
    console.log('early-stage life - microbial organisms and primitive algae.');
    console.log('No advanced civilizations. So what had Earth detected?');
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
    console.log('Without warning, a gravitational distortion wave emerged');
    console.log('from the planet\'s subsurface. Space itself seemed to ripple,');
    console.log('warping equipment into impossible geometries before snapping');
    console.log('back to normal, leaving most systems permanently damaged.');
    console.log('');
    console.log('💥 THE DISTORTION WAVE DEVASTATED THE BASE:');
    console.log('• Main habitat modules: TWISTED BEYOND REPAIR');
    console.log('• Communication array: GEOMETRICALLY CORRUPTED');
    console.log('• Supply depot: SCATTERED ACROSS SPACETIME');
    console.log('• Emergency shelter: PARTIALLY PHASED');
    console.log('• Hydroponics complex: ALL THREE FARMS UNTOUCHED');
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
    console.log('🍽️ Food supplies: 95/200 (emergency rations largely intact)');
    console.log('⚡ Energy reserves: 95/200 (backup power systems functioning)');
    console.log('😰 Crew morale: 90/200 (shaken but resilient and determined)');
    console.log('👥 Survivors: 5/5 (all crew members accounted for)');
    console.log('');
    console.log('🌱 REMAINING INFRASTRUCTURE:');
    console.log('• Three hydroponic farms (mysteriously undamaged)');
    console.log('• Scattered equipment and supplies');
    console.log('• No communication with Earth');
    console.log('');
    console.log('⚡ ANOMALOUS READINGS:');
    console.log('Since the gravitational event, instruments detect spacetime');
    console.log('fluctuations with no known cause. All three hydroponic farms show');
    console.log('perfect geometric alignment with subsurface crystalline formations.');
    console.log('Something wanted these farms to survive. But what? And why?');
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
    console.log('                                      ⚠️ SYSTEM CRITICAL FAILURE ⚠️');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🔴 EMERGENCY ALERT: PROTECTIVE BARRIER MALFUNCTION DETECTED');
    console.log('');
    console.log('The shield generators have begun resonating with the crystalline formations');
    console.log('deep beneath the surface. Instead of protecting the base, they\'re creating');
    console.log('a deadly feedback loop that\'s targeting the crew with lethal radiation.');
    console.log('');
    console.log('Dr. Martinez reports from the control room: "The barriers are');
    console.log('inverting! They\'re focusing energy inward instead of deflecting');
    console.log('external threats. If we leave them active, the crew will die');
    console.log('within hours from radiation exposure!"');
    console.log('');
    console.log('However, shutting down the protective barriers will leave the base');
    console.log('completely vulnerable to whatever phenomena exist on this planet.');
    console.log('The electromagnetic interference, the strange readings...');
    console.log('everything we\'ve been shielded from will pour in.');
    console.log('');
    console.log('⚠️ CRITICAL SYSTEM DECISION REQUIRED:');
    console.log('');
    console.log('🔌 1. Shut down the protective barriers');
    console.log('   → Save the crew from lethal radiation exposure');
    console.log('   → Complete the mission and establish Earth communication');
    console.log('   → Leave base vulnerable to external phenomena');
    console.log('');
    console.log('⚡ 2. Keep the protective barriers active');
    console.log('   → Maintain base defenses against external threats');
    console.log('   → Accept crew casualties from radiation exposure');
    console.log('   → Send final emergency transmission to Earth');
    console.log('');
    console.log('Time is running out. The radiation levels are climbing rapidly...');
    console.log('');
    console.log('Enter your choice (1 or 2):');
    
    while (true) {
      const choice = await this.getUserInput();
      if (choice === '1') {
        console.log('\nInitiating protective barrier shutdown sequence...');
        console.log('The crew breathes a sigh of relief as radiation levels drop.');
        console.log('');
        console.log('With the barriers down, the base is vulnerable, but the crew is safe.');
        console.log('The final expedition can now proceed as planned.');
        console.log('Press Enter to continue...');
        await this.getUserInput();
        return 'proceed';
      } else if (choice === '2') {
        console.log('\nMaintaining protective barriers at all costs...');
        console.log('');
        console.log('Dr. Martinez suddenly stops, her eyes wide with realization:');
        console.log('"Wait... the equipment malfunctions, the whispers, the geometric patterns..."');
        console.log('"This isn\'t random system failure - something is manipulating our technology!"');
        console.log('');
        console.log('Dr. Chen nods grimly: "The crystalline formations... they\'re not just energy sources.');
        console.log('They\'re part of something vast and intelligent. We\'ve been deceived."');
        console.log('');
        console.log('Commander realizes the truth: "Earth needs to know. No more expeditions');
        console.log('can come here. We have to send the warning, whatever the cost."');
        console.log('Press Enter to continue...');
        await this.getUserInput();
        return 'skip';
      } else {
        console.log('Please enter 1 or 2:');
      }
    }
  }
}

module.exports = GameController;