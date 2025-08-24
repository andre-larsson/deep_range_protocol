const buildingData = require('../data/buildings');

class DisplayManager {
  constructor() {
    this.readline = require('readline');
  }

  createInterface() {
    return this.readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  displayStatus(resourceManager, buildingManager, campaignManager, eventManager, day) {
    const netChanges = resourceManager.getNetChanges(buildingManager.getAllBuildings());
    
    const formatChange = (change) => {
      if (change > 0) return `(+${change}/day)`;
      if (change < 0) return `(${change}/day)`;
      return `(±0/day)`;
    };

    console.clear();
    console.log('');
    console.log('  ═══════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('      ██████╗ ███████╗███████╗██████╗     ██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗');
    console.log('      ██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝');
    console.log('      ██║  ██║█████╗  █████╗  ██████╔╝    ██████╔╝███████║██╔██╗ ██║██║  ███╗█████╗');
    console.log('      ██║  ██║██╔══╝  ██╔══╝  ██╔═══╝     ██╔══██╗██╔══██║██║╚██╗██║██║   ██║██╔══╝');
    console.log('      ██████╔╝███████╗███████╗██║         ██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗');
    console.log('      ╚═════╝ ╚══════╝╚══════╝╚═╝         ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝');
    console.log('');
    console.log('                      ██████╗ ██████╗  ██████╗ ████████╗ ██████╗  ██████╗ ██████╗ ██╗');
    console.log('                      ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗██╔════╝██╔═══██╗██║');
    console.log('                      ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║');
    console.log('                      ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║');
    console.log('                      ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝╚██████╗╚██████╔╝███████╗');
    console.log('                      ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝');
    console.log('');
    console.log('                                       🛰️  DAY ' + String(day).padStart(3, ' ') + '  🌌');
    console.log('                              [DEEP SPACE RESEARCH STATION ALPHA]');
    console.log('');
    console.log('  ═══════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log(`🍽️ Food: ${resourceManager.resources.food}/200 ${formatChange(netChanges.food.net)}`);
    console.log(`😰 Morale: ${resourceManager.resources.morale}/200 ${formatChange(netChanges.morale.net)}`);
    console.log(`⚡ Energy: ${resourceManager.resources.energy}/200 ${formatChange(netChanges.energy.net)}`);
    console.log(`👥 Survivors: ${resourceManager.crewMembers}`);
    console.log('');
    
    const cosmicInfluence = eventManager.getCosmicInfluence();
    if (cosmicInfluence > 10) {
      const influenceLevel = Math.min(5, Math.floor(cosmicInfluence / 10));
      const indicators = ['🌑', '🌒', '🌓', '🌔', '🌕'];
      console.log(`${indicators[influenceLevel-1]} Anomalous Activity: ${'█'.repeat(influenceLevel)}${'░'.repeat(5-influenceLevel)}`);
    }
    
    console.log('───────────────────────────────────────');
    console.log('Colony Structures:');
    
    const buildings = buildingManager.getAllBuildings();
    
    // Display building energy costs
    const buildingEnergyCost = buildings.hydroponicsFarm * 2 + 
                              buildings.recreationCenter * 1 + 
                              buildings.communicationArray * 3 + 
                              buildings.researchLab * 4 + 
                              buildings.shieldGenerator * 5;
    
    if (buildingEnergyCost > 0) {
      console.log('');
      console.log('⚡ Building Energy Costs:');
      if (buildings.hydroponicsFarm > 0) console.log(`  Hydroponic Farms (${buildings.hydroponicsFarm}): -${buildings.hydroponicsFarm * 1} energy/day`);
      if (buildings.recreationCenter > 0) console.log(`  Recreation Centers (${buildings.recreationCenter}): -${buildings.recreationCenter * 1} energy/day`);
      if (buildings.communicationArray > 0) console.log(`  Communication Arrays (${buildings.communicationArray}): -${buildings.communicationArray * 3} energy/day`);
      if (buildings.researchLab > 0) console.log(`  Research Labs (${buildings.researchLab}): -${buildings.researchLab * 4} energy/day`);
      if (buildings.shieldGenerator > 0) console.log(`  Shield Generators (${buildings.shieldGenerator}): -${buildings.shieldGenerator * 5} energy/day`);
      console.log(`  Total Building Costs: -${buildingEnergyCost} energy/day`);
    }
    const production = buildingManager.getTotalBuildingProduction(resourceManager.crewMembers);
    const unlockedBuildings = buildingManager.getUnlockedBuildings();
    
    // Only show unlocked buildings
    if (unlockedBuildings.includes('hydroponicsFarm')) {
      const farmEfficiency = Math.min(1.0, resourceManager.crewMembers / 5);
      const baseProduction = buildings.hydroponicsFarm * 3;
      const crewProduction = buildings.hydroponicsFarm * Math.floor(3 * farmEfficiency);
      console.log(`  🌱 Hydroponic Farms: ${buildings.hydroponicsFarm} (+${production.food} food/day) [${baseProduction} base + ${crewProduction} crew-dependent]`);
    }
    if (unlockedBuildings.includes('solarPanels')) {
      const energyEfficiency = Math.min(1.0, resourceManager.crewMembers / 5);
      const baseProduction = buildings.solarPanels * 6;
      const crewProduction = buildings.solarPanels * Math.floor(6 * energyEfficiency);
      console.log(`  ☀️ Solar Panels: ${buildings.solarPanels} (+${production.energy} energy/day) [${baseProduction} base + ${crewProduction} crew-dependent]`);
    }
    if (unlockedBuildings.includes('recreationCenter')) {
      console.log(`  🏠 Recreation Centers: ${buildings.recreationCenter} (+${production.morale} morale/day) [Fixed output, no crew scaling]`);
    }
    if (unlockedBuildings.includes('communicationArray')) {
      console.log(`  📡 Communication Arrays: ${buildings.communicationArray}`);
    }
    if (unlockedBuildings.includes('researchLab')) {
      console.log(`  🔬 Research Labs: ${buildings.researchLab}`);
    }
    if (unlockedBuildings.includes('shieldGenerator')) {
      console.log(`  🛡️ Protective Barriers: ${buildings.shieldGenerator}`);
    }
    
    const missionStatus = campaignManager.getMissionStatus(buildingManager, day);
    if (missionStatus && !missionStatus.isComplete) {
      console.log('───────────────────────────────────────');
      console.log(`🎯 MISSION: ${missionStatus.title}`);
      console.log(`Days Remaining: ${missionStatus.daysLeft}`);
      
      if (missionStatus.progress.isExpedition) {
        console.log(`🚀 ACTION REQUIRED: Launch the final expedition via "Exploratory expedition"`);
        console.log(`💰 Cost: 100 food, 120 energy, 60 morale`);
      } else {
        console.log(`Target: Build ${missionStatus.progress.target} ${missionStatus.progress.building.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`);
      }
      
      if (missionStatus.isUrgent) {
        console.log('⚠️  URGENT: Mission deadline approaching!');
      }
    }
    
    const currentEvent = eventManager.getCurrentEvent();
    if (currentEvent.event && currentEvent.day === day) {
      console.log('───────────────────────────────────────');
      console.log(currentEvent.event);
      if (currentEvent.extra) {
        console.log(currentEvent.extra);
      }
    }
    
    const recentEvents = eventManager.getRecentEvents();
    if (recentEvents.length > 0) {
      console.log('───────────────────────────────────────');
      console.log('📜 Recent Events:');
      recentEvents.forEach((event) => {
        console.log(`Day ${event.day}: ${event.text}`);
        if (event.effects) {
          console.log(`  ${event.effects}`);
        }
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
  }

  displayMenu(resourceManager, buildingManager, eventManager, campaignManager) {
    const pendingEvent = eventManager.getCurrentEvent();
    
    if (pendingEvent.pending) {
      console.log('\n' + pendingEvent.pending.description);
      pendingEvent.pending.choices.forEach((choice, index) => {
        const canAfford = resourceManager.canAfford(choice.cost);
        const costText = this.formatCost(choice.cost);
        console.log(`${index + 1}. ${choice.text} ${costText} ${canAfford ? '' : '❌'}`);
      });
      console.log('\nChoose your response (1-2):');
      return 'choice';
    }

    console.log('\nWhat would you like to do?');
    console.log('1. Build structure');
    
    // Highlight expedition option for final mission
    const isFinalMission = campaignManager && campaignManager.currentMission === 3 && campaignManager.missionActive;
    if (isFinalMission) {
      console.log('2. 🚀⭐ FINAL EXPEDITION READY ⭐🚀 (Complete the mission here!)');
    } else {
      console.log('2. 🗺️ Exploratory expedition');
    }
    
    console.log('3. Wait for next day');
    console.log('4. 💾 Save game');
    console.log('5. 📁 Load game');
    console.log('6. Quit game');
    console.log('\nEnter your choice (1-6):');
    return 'menu';
  }

  displayBuildMenu(resourceManager, buildingManager) {
    console.log('\nAvailable Structures:');
    
    const unlockedBuildings = buildingManager.getUnlockedBuildings();
    unlockedBuildings.forEach((buildingType, index) => {
      const building = buildingData[buildingType];
      const cost = building.cost;
      const canAfford = resourceManager.canAfford(cost);
      const costText = this.formatCost(cost);
      
      console.log(`${index + 1}. ${building.symbol} ${building.name} ${costText} ${canAfford ? '' : '❌'}`);
      console.log(`   ${building.description}`);
    });
    
    console.log(`${unlockedBuildings.length + 1}. Cancel`);
    console.log(`\nEnter your choice (1-${unlockedBuildings.length + 1}):`);
  }

  formatCost(cost) {
    const parts = [];
    if (cost.food > 0) parts.push(`${cost.food} food`);
    if (cost.energy > 0) parts.push(`${cost.energy} energy`);
    if (cost.morale > 0) parts.push(`${cost.morale} morale`);
    return parts.length > 0 ? `(${parts.join(', ')})` : '';
  }

  displayGameOver(resourceManager, campaignManager, day) {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                     📡 FINAL TRANSMISSION 📡');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    
    if (campaignManager.isTrueVictory()) {
      console.log('⚡ TRUE VICTORY: HUMANITY SAVED THROUGH SACRIFICE');
      console.log('');
      console.log('The protective barriers hold steady against the radiation,');
      console.log('buying the crew precious time. Dr. Martinez manages to override the');
      console.log('communication lockdown and establishes contact with Earth.');
      console.log('');
      console.log('📻 EMERGENCY TRANSMISSION TO EARTH:');
      console.log('');
      console.log('"Emergency! This is Commander [CLASSIFIED] of the Deep Range Expedition."');
      console.log('"The mission was a trap. The crystalline formations are not natural."');
      console.log('"We\'ve awakened something ancient and malevolent beneath the surface."');
      console.log('"A cosmic entity of immense power that feeds on consciousness itself."');
      console.log('');
      console.log('"DO NOT send further expeditions to this system. DO NOT attempt rescue."');
      console.log('"The entity can manipulate matter and energy. It seeks to spread to Earth."');
      console.log('"We are implementing Deep Range Protocol - permanent quarantine."');
      console.log('');
      console.log('Suddenly, the protective barriers begin to glow with unnatural light...');
      console.log('');
      console.log('"The barriers... they\'re turning against us. It\'s manipulating the field!"');
      console.log('"The entity is using our own defenses to... [SCREAMING] [TRANSMISSION ENDS]"');
      console.log('');
      console.log('🛡️ FINAL SACRIFICE: The crew\'s warning reaches Earth before their demise.');
      console.log('🌍 HUMANITY SAVED: Earth receives the crucial warning and abandons the system.');
      console.log('👁️ ENTITY CONTAINED: Without further expeditions, it remains trapped.');
      console.log('🏆 HEROIC END: They died horribly but saved their entire species.');
      console.log('');
      console.log('📊 Mission Duration: ' + day + ' days');
      console.log('👥 Heroes Lost: ' + resourceManager.crewMembers + '/5');
      console.log('🌟 ACHIEVEMENT: The Only Way To Win Is Not To Play');
    } else if (campaignManager.isCampaignComplete()) {
      console.log('👁️ THE AWAKENING: COSMIC ENTITY SUMMONED');
      console.log('');
      console.log('After completing the final expedition, the crew made contact with');
      console.log('something that had been waiting in the planet\'s depths for eons...');
      console.log('');
      console.log('The survivors\' minds were... enlightened. They now understand');
      console.log('the true purpose of their mission. The entity requires more humans.');
      console.log('More minds to expand its influence across the galaxy.');
      console.log('');
      console.log('📻 TRANSMISSION SENT TO EARTH:');
      console.log('');
      console.log('"This is Commander [CLASSIFIED] of the Deep Range Expedition."');
      console.log('"Excellent news! The planet exceeds all expectations."');
      console.log('"We have discovered resources beyond imagination and");');
      console.log('"established contact with... beneficial entities."');
      console.log('');
      console.log('"We urgently request immediate colonization missions."');
      console.log('"Send as many people as possible. Families, scientists, everyone."');
      console.log('"This world will welcome them with open arms."');
      console.log('');
      console.log('"The Deep Range Protocol is now in effect:"');
      console.log('"Humanity\'s expansion into the deep range of space."');
      console.log('');
      console.log('"Come to us. We are waiting."');
      console.log('');
      console.log('💀 THE DARK TRUTH: The entity has won.');
      console.log('🌍 HUMANITY\'S FATE: Thousands will answer the call.');
      console.log('👁️ COSMIC VICTORY: The corruption spreads to Earth.');
      console.log('');
      console.log('📊 Mission Duration: ' + day + ' days');
      console.log('👥 Corrupted Survivors: ' + resourceManager.crewMembers + '/5');
    } else if (resourceManager.crewMembers <= 0) {
      console.log('💀 COLONY FAILURE: ALL CREW LOST');
      console.log('');
      console.log('📻 AUTOMATED DISTRESS BEACON (TRANSMITTED ' + day + ' DAYS POST-LANDING):');
      console.log('');
      console.log('"This is an automated message from Deep Range Expedition Base."');
      console.log('"All crew members presumed deceased after ' + day + ' days."');
      console.log('"Cause of failure: Complete colony breakdown."');
      console.log('');
      console.log('"WARNING TO EARTH: This planet is not suitable for colonization."');
      console.log('"Something killed everyone. Do not come here."');
      console.log('');
      console.log('"This message constitutes humanity\'s first Deep Range Protocol:"');
      console.log('"A warning from the deep range of space."');
      console.log('');
      console.log('"End automated transmission."');
    } else {
      console.log('💔 COLONY FAILURE: RESOURCES EXHAUSTED');
      console.log('');
      console.log('📻 FINAL DISTRESS CALL (TRANSMITTED DAY ' + day + '):');
      console.log('');
      console.log('"This is Commander [CLASSIFIED] of the Deep Range Expedition."');
      console.log('"We are failing. ' + resourceManager.crewMembers + ' crew members remain alive."');
      console.log('"But our resources are depleted. We cannot survive much longer."');
      console.log('');
      console.log('"WARNING TO EARTH: This planet is hostile to human life."');
      console.log('"The storms, the interference, the inexplicable phenomena..."');
      console.log('"Whatever is here does not want us here."');
      console.log('');
      console.log('"This may be humanity\'s first Deep Range Protocol:"');
      console.log('"A warning from the deep range of space."');
      console.log('');
      console.log('"If anyone receives this... don\'t follow us."');
      console.log('"End transmission."');
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                          Thank you for playing Deep Range Protocol');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
  }

  displayMissionComplete(mission) {
    console.log('═══════════════════════════════════════');
    console.log('🎯 MISSION COMPLETE!');
    console.log(`${mission.title}`);
    console.log('The crew celebrates this achievement.');
    console.log('═══════════════════════════════════════');
  }

  displayMissionFailed(mission) {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                   💀 MISSION CRITICAL FAILURE 💀');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📋 FAILED MISSION: ${mission.title}`);
    console.log('');
    console.log('⏰ TIME LIMIT EXCEEDED');
    console.log('');
    console.log('The mission parameters were not met within the allocated time frame.');
    console.log('Without critical infrastructure in place, the expedition faces');
    console.log('insurmountable challenges that seal their fate.');
    console.log('');
    console.log('📻 FINAL TRANSMISSION TO EARTH:');
    console.log('');
    console.log('"Mission Control, this is Deep Range Expedition Alpha."');
    console.log('"We... we couldn\'t complete the objectives in time."');
    console.log('"The equipment failures, the phenomena, the isolation..."');
    console.log('"It was more than we could handle."');
    console.log('');
    console.log('"The planet... there\'s something wrong here."');
    console.log('"Not with the life forms - they\'re simple enough."');
    console.log('"But the very fabric of reality seems... thin."');
    console.log('');
    console.log('"We can hear whispers in the crystalline formations."');
    console.log('"Geometric patterns appear in our dreams."');
    console.log('"Some crew members have stopped speaking altogether."');
    console.log('');
    console.log('"Mission Control... do not send another expedition."');
    console.log('"Mark this system as interdicted. For humanity\'s sake."');
    console.log('');
    console.log('"This is our final trans--"');
    console.log('[SIGNAL LOST]');
    console.log('');
    console.log('💀 EXPEDITION STATUS: PRESUMED LOST');
    console.log('🌌 DEEP RANGE PROTOCOL: SYSTEM QUARANTINED');
    console.log('⚠️ WARNING: No further missions authorized to this sector');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                      GAME OVER');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Press Enter to return to main menu...');
  }

  displayStartScreen() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('    ██████╗ ███████╗███████╗██████╗     ██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗');
    console.log('    ██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝');
    console.log('    ██║  ██║█████╗  █████╗  ██████╔╝    ██████╔╝███████║██╔██╗ ██║██║  ███╗█████╗  ');
    console.log('    ██║  ██║██╔══╝  ██╔══╝  ██╔═══╝     ██╔══██╗██╔══██║██║╚██╗██║██║   ██║██╔══╝  ');
    console.log('    ██████╔╝███████╗███████╗██║         ██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗');
    console.log('    ╚═════╝ ╚══════╝╚══════╝╚═╝         ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝');
    console.log('                          ██████╗ ██████╗  ██████╗ ████████╗ ██████╗  ██████╗ ██████╗ ██╗     ');
    console.log('                          ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗██╔════╝██╔═══██╗██║     ');
    console.log('                          ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║     ');
    console.log('                          ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║     ');
    console.log('                          ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝╚██████╗╚██████╔╝███████╗');
    console.log('                          ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝');
    console.log('');
    console.log('                                  🌌 A Deep Space Colony Management Game 🌌');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('                                            MAIN MENU');
    console.log('');
    console.log('                                        1. 🚀 New Campaign');
    console.log('                                        2. 💾 Load Game');
    console.log('                                        3. ❌ Exit');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                   Enter your choice (1-3):');
    console.log('');
  }

  displayLoadGameMenu(saveFiles) {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                          LOAD GAME');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    
    if (saveFiles.length === 0) {
      console.log('\n                                    No save files found.');
      console.log('\n                                  Press Enter to return to main menu...');
      return;
    }

    console.log('\nAvailable Save Files:\n');
    
    saveFiles.forEach((save, index) => {
      const date = new Date(save.timestamp).toLocaleString();
      console.log(`${index + 1}. ${save.name} (Day ${save.day}) - ${date}`);
    });
    
    console.log(`${saveFiles.length + 1}. Return to Main Menu`);
    console.log(`\nEnter your choice (1-${saveFiles.length + 1}):`);
    console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
  }

  displaySaveGameMenu() {
    console.log('\n═══════════════════════════════════════');
    console.log('                SAVE GAME');
    console.log('═══════════════════════════════════════');
    console.log('\nEnter a name for your save file:');
    console.log('(or press Enter for "quicksave")');
  }

  displaySaveLoadResult(result) {
    console.log('\n' + (result.success ? '✅' : '❌') + ' ' + result.message);
    console.log('Press Enter to continue...');
  }

  displayExpeditionMenu(expeditionManager = null) {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                    🗺️ EXPLORATORY EXPEDITION 🗺️');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('The alien landscape stretches endlessly beyond your base perimeter.');
    console.log('Strange formations dot the horizon, and your instruments detect');
    console.log('anomalous readings in multiple directions.');
    console.log('');
    console.log('⚠️ EXPEDITION RISKS:');
    console.log('• Team members may be injured or lost');
    console.log('• Equipment could malfunction in hostile conditions');
    console.log('• Unknown phenomena may affect crew morale');
    console.log('• Something watches from the crystalline formations...');
    console.log('');
    console.log('🎯 POTENTIAL REWARDS:');
    console.log('• Resource caches from previous expeditions');
    console.log('• Mineral deposits and energy sources');
    console.log('• Salvageable equipment and supplies');
    console.log('• Scientific data (though some findings disturb the crew)');
    console.log('');
    console.log('📊 SAFETY FACTOR: Higher morale = safer expeditions');
    console.log('💡 TEAM SIZE: Larger teams find more resources but risk more crew losses');
    console.log('🔄 PARTIAL REWARDS: Lost crew may still bring back some resources');
    console.log('🛡️ SAFETY NET: At least one crew member always returns from team expeditions');
    console.log('');
    
    // Display subtle cosmic risk indicator
    if (expeditionManager) {
      const cosmicEncounters = expeditionManager.getCosmicEncounters();
      const totalExpeditions = expeditionManager.getExpeditionCount();
      
      if (totalExpeditions > 0 || cosmicEncounters > 0) {
        let riskLevel = 'Standard';
        let riskIcon = '🟢';
        
        if (cosmicEncounters >= 3 || totalExpeditions >= 5) {
          riskLevel = 'Elevated';
          riskIcon = '🟡';
        }
        if (cosmicEncounters >= 5 || totalExpeditions >= 8) {
          riskLevel = 'High';
          riskIcon = '🟠';
        }
        if (cosmicEncounters >= 7 || totalExpeditions >= 12) {
          riskLevel = 'Critical';
          riskIcon = '🔴';
        }
        
        console.log(`${riskIcon} Subsurface Activity Level: ${riskLevel} (${cosmicEncounters} anomalous readings, ${totalExpeditions} expeditions conducted)`);
        console.log('');
      }
    }
    
    console.log('1. 🚀 Solo expedition (1 crew) - 3 food cost, higher individual risk, best efficiency with high morale');
    console.log('2. 🚀🚀 Small team (2 crew) - 6 food cost, reduced individual risk, balanced approach');
    console.log('3. 🚀🚀🚀 Large team (3 crew) - 9 food cost, lowest individual risk, better for dangerous conditions');
    console.log('4. 🔙 Return to base');
    console.log('');
    console.log('Enter your choice (1-4):');
  }

  displayExpeditionOutcome(outcome, resourceManager, teamSize = 1) {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('                                    📡 EXPEDITION REPORT 📡');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`🚀 TEAM SIZE: ${teamSize} crew member${teamSize > 1 ? 's' : ''}`);
    console.log('');
    console.log(outcome.message);
    console.log('');
    
    if (outcome.effects.crewLoss) {
      console.log(`💀 CREW LOST: ${outcome.effects.crewLoss} team member(s)`);
      console.log(`👥 Survivors remaining: ${resourceManager.crewMembers}`);
      
      if (outcome.partialRewards) {
        console.log('');
        console.log('📦 The lost crew members managed to gather some resources');
        console.log('   before they disappeared. The survivors brought them back.');
      }
      
      console.log('');
    }
    
    if (outcome.crewCorrupted) {
      console.log('⚠️ The returning crew members seem... different.');
      console.log('They speak in whispers about "beautiful geometries"');
      console.log('and "the song beneath the surface."');
      console.log('');
    }

    console.log('📊 RESOURCE CHANGES:');
    Object.keys(outcome.effects).forEach(resource => {
      if (resource === 'crewLoss') return;
      const change = outcome.effects[resource];
      if (change > 0) {
        console.log(`  ${resource.toUpperCase()}: +${change}`);
      } else if (change < 0) {
        console.log(`  ${resource.toUpperCase()}: ${change}`);
      }
    });
    
    if (outcome.cosmic) {
      console.log('');
      console.log('⚠️ ANOMALOUS READINGS DETECTED');
      console.log('This expedition has increased cosmic influence on the base...');
    }
    
    console.log('');
    console.log('Press Enter to continue...');
  }
}

module.exports = DisplayManager;