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
    
    console.log(`  🌱 Hydroponic Farms: ${buildings.hydroponicsFarm} (+${production.food} food/day) [${Math.round(buildingManager.getBuildingEfficiency('hydroponicsFarm', resourceManager.crewMembers)*100)}% efficient]`);
    console.log(`  ☀️ Solar Panels: ${buildings.solarPanels} (+${production.energy} energy/day) [${Math.round(buildingManager.getBuildingEfficiency('solarPanels', resourceManager.crewMembers)*100)}% efficient]`);
    console.log(`  🏠 Recreation Centers: ${buildings.recreationCenter} (+${production.morale} morale/day) [${Math.round(buildingManager.getBuildingEfficiency('recreationCenter', resourceManager.crewMembers)*100)}% efficient]`);
    console.log(`  📡 Communication Arrays: ${buildings.communicationArray}`);
    console.log(`  🔬 Research Labs: ${buildings.researchLab}`);
    console.log(`  🛡️ Protective Barriers: ${buildings.shieldGenerator}`);
    
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
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                        GAME OVER');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (resourceManager.crewMembers <= 0) {
      console.log('All crew members have been lost. The colony has fallen.');
    } else if (resourceManager.resources.food <= 0 && resourceManager.resources.energy <= 0 && resourceManager.resources.morale <= 0) {
      console.log('All resources depleted. The colony could not survive.');
    }
    
    console.log(`\nYou survived ${day} days.`);
    
    if (campaignManager.isCampaignComplete()) {
      console.log('\n🎉 VICTORY! You completed all campaign missions!');
      console.log('The mysteries of the deep range have been... understood.');
    }
    
    console.log('\nThank you for playing Deep Range Protocol!');
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