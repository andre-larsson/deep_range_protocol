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
    console.log('                                           🛰️  DAY ' + day + '  🌌');
    console.log('                                  [DEEP SPACE RESEARCH STATION ALPHA]');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
    console.log(`🍽️ Food: ${resourceManager.resources.food}/100 ${formatChange(netChanges.food.net)}`);
    console.log(`😰 Morale: ${resourceManager.resources.morale}/100 ${formatChange(netChanges.morale.net)}`);
    console.log(`⚡ Energy: ${resourceManager.resources.energy}/100 ${formatChange(netChanges.energy.net)}`);
    console.log(`👥 Survivors: ${resourceManager.crewMembers}`);
    
    const cosmicInfluence = eventManager.getCosmicInfluence();
    if (cosmicInfluence > 10) {
      const influenceLevel = Math.min(5, Math.floor(cosmicInfluence / 10));
      const indicators = ['🌑', '🌒', '🌓', '🌔', '🌕'];
      console.log(`${indicators[influenceLevel-1]} Anomalous Activity: ${'█'.repeat(influenceLevel)}${'░'.repeat(5-influenceLevel)}`);
    }
    
    console.log('───────────────────────────────────────');
    console.log('Colony Structures:');
    
    const buildings = buildingManager.getAllBuildings();
    const production = buildingManager.getTotalBuildingProduction(resourceManager.crewMembers);
    const unlockedBuildings = buildingManager.getUnlockedBuildings();
    
    // Only show unlocked buildings
    if (unlockedBuildings.includes('hydroponicsFarm')) {
      console.log(`  🌱 Hydroponic Farms: ${buildings.hydroponicsFarm} (+${production.food} food/day) [${Math.round(buildingManager.getBuildingEfficiency('hydroponicsFarm', resourceManager.crewMembers)*100)}% efficient]`);
    }
    if (unlockedBuildings.includes('solarPanels')) {
      console.log(`  ☀️ Solar Panels: ${buildings.solarPanels} (+${production.energy} energy/day) [${Math.round(buildingManager.getBuildingEfficiency('solarPanels', resourceManager.crewMembers)*100)}% efficient]`);
    }
    if (unlockedBuildings.includes('recreationCenter')) {
      console.log(`  🏠 Recreation Centers: ${buildings.recreationCenter} (+${production.morale} morale/day) [${Math.round(buildingManager.getBuildingEfficiency('recreationCenter', resourceManager.crewMembers)*100)}% efficient]`);
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
    if (unlockedBuildings.includes('expedition')) {
      console.log(`  🚀 Expeditions: ${buildings.expedition}`);
    }
    
    const missionStatus = campaignManager.getMissionStatus(buildingManager, day);
    if (missionStatus && !missionStatus.isComplete) {
      console.log('───────────────────────────────────────');
      console.log(`🎯 MISSION: ${missionStatus.title}`);
      console.log(`Days Remaining: ${missionStatus.daysLeft}`);
      console.log(`Target: Build ${missionStatus.progress.target} ${missionStatus.progress.building.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`);
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
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
  }

  displayMenu(resourceManager, buildingManager, eventManager) {
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
    console.log('2. Wait for next day');
    console.log('3. 💾 Save game');
    console.log('4. 📁 Load game');
    console.log('5. Quit game');
    console.log('\nEnter your choice (1-5):');
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
      console.log('In the final moments before the cosmic entity could complete');
      console.log('its awakening ritual, the crew made the ultimate choice.');
      console.log('They destroyed the expedition site and chose certain death');
      console.log('to prevent the corruption from spreading to Earth.');
      console.log('');
      console.log('📻 FINAL WARNING TRANSMITTED TO EARTH:');
      console.log('');
      console.log('"This is Commander [CLASSIFIED] of the Deep Range Expedition."');
      console.log('"EMERGENCY PROTOCOL: Do not send further missions to this system."');
      console.log('"We have encountered a malevolent cosmic entity of immense power."');
      console.log('"It seeks to corrupt humanity and spread across the galaxy."');
      console.log('');
      console.log('"We are destroying all equipment and our base to prevent');
      console.log('"its influence from reaching Earth through our technology."');
      console.log('"This is our final transmission. We will not survive."');
      console.log('');
      console.log('"The Deep Range Protocol is now in effect:"');
      console.log('"A quarantine warning for deep space exploration."');
      console.log('"Never return to this system. Never follow our path."');
      console.log('');
      console.log('"Humanity must never come here. We die so you may live."');
      console.log('"End transmission."');
      console.log('');
      console.log('✨ THE LIGHT PREVAILS: The entity\'s awakening is stopped.');
      console.log('🌍 HUMANITY SAVED: Earth receives the true warning.');
      console.log('🏆 ULTIMATE SACRIFICE: Heroes die to save their species.');
      console.log('');
      console.log('📊 Mission Duration: ' + day + ' days');
      console.log('👥 Heroes Lost: ' + resourceManager.crewMembers + '/10');
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
      console.log('👥 Corrupted Survivors: ' + resourceManager.crewMembers + '/10');
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
    console.log('═══════════════════════════════════════');
    console.log('❌ MISSION FAILED!');
    console.log(`${mission.title}`);
    console.log('Time has run out. The consequences are severe.');
    console.log('═══════════════════════════════════════');
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
    console.log('                                   Enter your choice (1-3):');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════════');
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
}

module.exports = DisplayManager;