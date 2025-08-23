const readline = require('readline');

class SpaceCampManager {
  constructor(gameMode = 'campaign') {
    this.gameMode = gameMode;
    this.day = 1;
    this.resources = {
      food: 100,
      energy: 100,
      morale: 100
    };
    this.buildings = {
      hydroponicsFarm: 0,
      solarPanels: 0,
      recreationCenter: 0,
      communicationArray: 0,
      researchLab: 0,
      shieldGenerator: 0,
      expedition: 0
    };
    this.crewMembers = 10;
    this.gameRunning = true;
    this.lastEvent = null;
    this.lastEventExtra = null;
    this.lastEventDay = null;
    this.eventHistory = [];
    this.cosmicInfluence = 0; // Tracks growing eldritch corruption
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.campaign = {
      currentMission: 0,
      timeLimit: 0,
      targetBuilding: '',
      targetAmount: 0,
      missionActive: false,
      missions: [
        {
          title: "Deep Space Communication Protocol",
          story: "Commander, we've detected structured transmissions from an unknown source beyond our galaxy. The signals appear to be using advanced compression algorithms that shouldn't exist. Our communications officer reported equipment malfunctions after the third attempt at decoding. We need to construct a high-powered Communication Array to properly analyze and respond to these transmissions before we lose this unprecedented contact opportunity.",
          building: 'communicationArray',
          amount: 1,
          timeLimit: 12,
          costs: { food: 35, energy: 60, morale: 25 }
        },
        {
          title: "Xenogeological Analysis Initiative",
          story: "The subsurface scans have revealed mineral formations unlike anything in Earth's geological record. The crystalline structures exhibit properties that seem to defy our understanding of physics - they're generating energy without any apparent fuel source. Dr. Chen requires a fully equipped Research Lab to analyze these samples safely. The crew is anxious about the unknown risks, but this could revolutionize our energy crisis.",
          building: 'researchLab',
          amount: 1,
          timeLimit: 15,
          costs: { food: 30, energy: 50, morale: 20 }
        },
        {
          title: "Emergency Containment Protocol",
          story: "The situation has deteriorated beyond our worst projections. The crystal formations aren't just energy sources - they're... alive. Dr. Rodriguez calculated the breach probability before she stopped speaking altogether. The patterns in her equations, they're not mathematical anymore. They're something else. Something that whispers. We need to build what the crew has started calling a 'Protective Barrier' - though the blueprints seem to have appeared overnight, written in symbols none of us recognize. 18 days before something breaks through.",
          building: 'shieldGenerator',
          amount: 1,
          timeLimit: 18,
          costs: { food: 50, energy: 75, morale: 40 }
        },
        {
          title: "Deep Range Expedition",
          story: "Command has gone silent for 73 days. Our last transmission spoke of 'fascinating discoveries' that I don't remember sending. Dr. Martinez insists we need to venture deeper into the crystal caves - she says the formations are calling to her. The crew that volunteered for the expedition... their eyes have changed. But we need to understand what we're dealing with. And we need those mineral samples, even if the idea of collecting them fills us with inexplicable dread.",
          building: 'expedition',
          amount: 1,
          timeLimit: 10,
          costs: { food: 20, energy: 30, morale: 35 }
        }
      ]
    };
  }

  displayStatus() {
    // Calculate actual consumption and production
    const foodDecay = -(5 + (this.crewMembers * 2));
    const moraleDecay = -Math.max(2, 4 - Math.floor(this.crewMembers / 5));
    const energyDecay = -(6 + this.crewMembers);
    
    // Calculate efficiency-adjusted production
    const farmEfficiency = Math.min(1.0, this.crewMembers / 8);
    const energyEfficiency = Math.min(1.0, this.crewMembers / 6);
    const moraleEfficiency = Math.min(1.0, this.crewMembers / 4);
    
    const foodProduction = Math.floor(this.buildings.hydroponicsFarm * 8 * farmEfficiency);
    const energyProduction = Math.floor(this.buildings.solarPanels * 12 * energyEfficiency);
    const moraleProduction = Math.floor(this.buildings.recreationCenter * 5 * moraleEfficiency);
    
    const foodNetChange = foodDecay + foodProduction;
    const moraleNetChange = moraleDecay + moraleProduction;
    const energyNetChange = energyDecay + energyProduction;
    
    const formatChange = (change) => {
      if (change > 0) return `(+${change}/day)`;
      if (change < 0) return `(${change}/day)`;
      return `(±0/day)`;
    };

    console.clear();
    console.log('═══════════════════════════════════════════════════════════════');
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
    console.log('                                           🛰️  DAY ' + this.day + '  🌌');
    console.log('                                  [DEEP SPACE RESEARCH STATION ALPHA]');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🍽️ Food: ${this.resources.food}/100 ${formatChange(foodNetChange)}`);
    console.log(`😰 Morale: ${this.resources.morale}/100 ${formatChange(moraleNetChange)}`);
    console.log(`⚡ Energy: ${this.resources.energy}/100 ${formatChange(energyNetChange)}`);
    console.log(`👥 Survivors: ${this.crewMembers}`);
    
    // Subtle cosmic influence indicator
    if (this.cosmicInfluence > 10) {
      const influenceLevel = Math.min(5, Math.floor(this.cosmicInfluence / 10));
      const indicators = ['🌑', '🌒', '🌓', '🌔', '🌕'];
      console.log(`${indicators[influenceLevel-1]} Anomalous Activity: ${'█'.repeat(influenceLevel)}${'░'.repeat(5-influenceLevel)}`);
    }
    
    console.log('───────────────────────────────────────');
    console.log('Colony Structures:');
    console.log(`  🌱 Hydroponic Farms: ${this.buildings.hydroponicsFarm} (+${foodProduction} food/day) [${Math.round(farmEfficiency*100)}% efficient]`);
    console.log(`  ☀️ Solar Panels: ${this.buildings.solarPanels} (+${energyProduction} energy/day) [${Math.round(energyEfficiency*100)}% efficient]`);
    console.log(`  🏠 Recreation Centers: ${this.buildings.recreationCenter} (+${moraleProduction} morale/day) [${Math.round(moraleEfficiency*100)}% efficient]`);
    console.log(`  📡 Communication Arrays: ${this.buildings.communicationArray}`);
    console.log(`  🔬 Research Labs: ${this.buildings.researchLab}`);
    console.log(`  🛡️ Protective Barriers: ${this.buildings.shieldGenerator}`);
    
    if (this.campaign.missionActive) {
      const daysLeft = this.campaign.timeLimit - this.day + 1;
      console.log('───────────────────────────────────────');
      console.log(`🎯 MISSION: ${this.campaign.missions[this.campaign.currentMission].title}`);
      console.log(`Days Remaining: ${daysLeft}`);
      console.log(`Target: Build ${this.campaign.targetAmount} ${this.campaign.targetBuilding.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`);
      if (daysLeft <= 5) {
        console.log('⚠️  URGENT: Mission deadline approaching!');
      }
    }
    
    if (this.lastEvent && this.lastEventDay === this.day) {
      console.log('───────────────────────────────────────');
      console.log(this.lastEvent);
      if (this.lastEventExtra) {
        console.log(this.lastEventExtra);
      }
    }
    
    if (this.eventHistory.length > 0) {
      console.log('───────────────────────────────────────');
      console.log('📜 Recent Events:');
      const recentEvents = this.eventHistory.slice(-3);
      recentEvents.forEach((event, index) => {
        console.log(`Day ${event.day}: ${event.text}`);
      });
    }
    
    console.log('═══════════════════════════════════════');
  }

  dailyDecay() {
    // Food consumption - crew needs sustenance (2 food per crew member + base 5)
    const foodConsumption = 5 + (this.crewMembers * 2);
    this.resources.food = Math.max(0, this.resources.food - foodConsumption);
    
    // Morale decay - isolation and horror take their toll
    const moraleDecay = Math.max(2, 4 - Math.floor(this.crewMembers / 5));
    this.resources.morale = Math.max(0, this.resources.morale - moraleDecay);
    
    // Energy decay - life support and equipment maintenance
    const energyConsumption = 6 + this.crewMembers;
    this.resources.energy = Math.max(0, this.resources.energy - energyConsumption);
  }

  buildingProduction() {
    // Food production - requires crew to tend hydroponic farms
    const farmEfficiency = Math.min(1.0, this.crewMembers / 8); // Optimal at 8+ crew
    this.resources.food += Math.floor(this.buildings.hydroponicsFarm * 8 * farmEfficiency);
    
    // Energy production - requires crew to maintain solar panels  
    const energyEfficiency = Math.min(1.0, this.crewMembers / 6); // Optimal at 6+ crew
    this.resources.energy += Math.floor(this.buildings.solarPanels * 12 * energyEfficiency);
    
    // Morale production - recreation center provides respite from horror
    const moraleEfficiency = Math.min(1.0, this.crewMembers / 4); // Optimal at 4+ crew
    this.resources.morale += Math.floor(this.buildings.recreationCenter * 5 * moraleEfficiency);
    
    this.resources.food = Math.min(100, this.resources.food);
    this.resources.energy = Math.min(100, this.resources.energy);
    this.resources.morale = Math.min(100, this.resources.morale);
  }

  randomEvent() {
    const events = [
      {
        text: "Dimensional storm tears through reality!",
        effect: () => { this.resources.essence -= 15; }
      },
      {
        text: "Survivors discover crimson fungal growths in the caves!",
        effect: () => { this.resources.blood += 20; }
      },
      {
        text: "Brief glimpse of home reality soothes frayed minds!",
        effect: () => { this.resources.sanity += 15; }
      },
      {
        text: "The whispers grow stronger, demanding tribute.",
        effect: () => { this.resources.essence -= 10; this.resources.sanity -= 5; }
      },
      {
        text: "Contact established with something beyond the veil!",
        effect: () => { this.resources.sanity += 25; }
      },
      {
        text: "Blood offerings spoil in the unholy heat.",
        effect: () => { this.resources.blood -= 12; }
      },
      {
        text: "Shadowy entities corrupt the blood gardens!",
        effect: () => { 
          if (this.buildings.bloodGarden > 0) {
            this.buildings.bloodGarden--;
            this.lastEventExtra = "One blood garden was consumed by darkness!";
          }
          this.resources.blood -= 8;
        }
      },
      {
        text: "Eldritch meteors rain down, pulsing with otherworldly power!",
        effect: () => { this.resources.essence += 30; this.resources.sanity += 10; }
      },
      {
        text: "Survivor succumbs to madness, others witness the horror.",
        effect: () => { this.resources.sanity -= 15; this.resources.essence -= 5; }
      },
      {
        text: "Discovery of ancient ritual chambers beneath the earth!",
        effect: () => { 
          this.resources.morale += 20;
          this.cosmicInfluence += 5;
        }
      },
      {
        text: "Void winds corrupt the ritual circles!",
        effect: () => {
          if (this.buildings.ritualCircle > 0) {
            this.buildings.ritualCircle--;
            this.lastEventExtra = "One ritual circle was desecrated!";
          }
          this.resources.essence -= 10;
        }
      },
      {
        text: "Survivors perform ritual to commemorate the dead!",
        effect: () => { this.resources.sanity += 18; this.resources.blood -= 5; }
      },
      {
        text: "Dimensional rift opens, flooding area with eldritch energy!",
        effect: () => { this.resources.essence += 25; }
      },
      {
        text: "Ancient tome discovered, revealing forbidden knowledge.",
        effect: () => { 
          this.resources.morale += 12; 
          this.resources.energy += 8;
          this.cosmicInfluence += 2;
        }
      },
      {
        text: "Cursed spores taint the blood offerings!",
        effect: () => { this.resources.blood -= 20; this.resources.sanity -= 8; }
      },
      {
        text: "Lightning storm supercharges the batteries!",
        effect: () => { this.resources.energy += 35; }
      },
      {
        text: "Crew member has breakthrough in research!",
        effect: () => { this.resources.morale += 22; }
      },
      {
        text: "Seismic activity damages recreation center!",
        effect: () => {
          if (this.buildings.recreationCenter > 0) {
            this.buildings.recreationCenter--;
            this.lastEventExtra = "One recreation center was damaged!";
          }
          this.resources.morale -= 12;
        }
      },
      {
        text: "Found intact alien technology!",
        effect: () => { this.resources.energy += 20; this.resources.morale += 15; }
      },
      {
        text: "Crew establishes new tradition to boost spirits.",
        effect: () => { this.resources.morale += 16; }
      },
      {
        text: "Equipment recycling yields useful materials!",
        effect: () => { this.resources.energy += 12; }
      },
      {
        text: "Homesickness affects crew productivity.",
        effect: () => { this.resources.morale -= 12; this.resources.energy -= 8; }
      },
      {
        text: "Discovery of natural hot springs nearby!",
        effect: () => { this.resources.morale += 28; this.resources.energy += 10; }
      },
      {
        text: "Sandstorm forces crew indoors all day.",
        effect: () => { this.resources.energy -= 15; this.resources.morale -= 10; }
      },
      {
        text: "Toxic gas leak in ventilation system!",
        effect: () => { this.resources.morale -= 20; this.resources.energy -= 15; }
      },
      {
        text: "Critical water filtration system failure!",
        effect: () => { this.resources.food -= 25; this.resources.energy -= 10; }
      },
      {
        text: "Severe radiation storm lasts for hours!",
        effect: () => { 
          this.resources.energy -= 20; 
          this.resources.morale -= 12; 
          this.resources.food -= 8; 
        }
      },
      {
        text: "Multiple hull breaches detected!",
        effect: () => { this.resources.energy -= 25; this.resources.morale -= 18; }
      },
      {
        text: "Food production equipment critically damaged!",
        effect: () => { 
          if (this.buildings.hydroponicsFarm > 1) {
            this.buildings.hydroponicsFarm -= 2;
            this.lastEventExtra = "Two hydroponics farms destroyed!";
          } else if (this.buildings.hydroponicsFarm > 0) {
            this.buildings.hydroponicsFarm--;
            this.lastEventExtra = "One hydroponics farm destroyed!";
          }
          this.resources.food -= 15;
        }
      },
      {
        text: "Power grid cascade failure!",
        effect: () => { 
          if (this.buildings.solarPanels > 0) {
            this.buildings.solarPanels--;
            this.lastEventExtra = "One solar panel destroyed!";
          }
          this.resources.energy -= 30;
        }
      },
      {
        text: "Alien virus spreads through colony!",
        effect: () => { this.resources.morale -= 25; this.resources.energy -= 12; this.resources.food -= 10; }
      },
      {
        text: "Emergency evacuation drill goes wrong!",
        effect: () => { this.resources.morale -= 18; this.resources.energy -= 8; }
      },
      {
        text: "Communications blackout with mission control!",
        effect: () => { this.resources.morale -= 22; }
      },
      {
        text: "Structural integrity warnings throughout base!",
        effect: () => { this.resources.energy -= 18; this.resources.morale -= 15; }
      },
      {
        text: "Catastrophic equipment failure cascade!",
        effect: () => { 
          this.resources.energy -= 20;
          this.resources.food -= 15;
          this.resources.morale -= 20;
        }
      },
      {
        text: "Alien predator stalks the colony perimeter!",
        effect: () => { this.resources.morale -= 25; this.resources.energy -= 10; }
      },
      {
        text: "Critical medical emergency in crew quarters!",
        effect: () => { this.resources.morale -= 20; this.resources.food -= 12; }
      },
      {
        text: "Massive electrical fire in main habitat!",
        effect: () => { 
          if (this.buildings.recreationCenter > 0) {
            this.buildings.recreationCenter--;
            this.lastEventExtra = "Recreation center destroyed by fire!";
          }
          this.resources.energy -= 22;
          this.resources.morale -= 15;
        }
      },
      {
        text: "Toxic atmosphere breach compromises air supply!",
        effect: () => { this.resources.energy -= 28; this.resources.morale -= 20; }
      },
      {
        text: "Complete communication system meltdown!",
        effect: () => { 
          if (this.buildings.communicationArray > 0) {
            this.buildings.communicationArray--;
            this.lastEventExtra = "Communication array destroyed!";
          }
          this.resources.morale -= 30;
        }
      },
      {
        text: "Research lab contamination spreads!",
        effect: () => { 
          if (this.buildings.researchLab > 0) {
            this.buildings.researchLab--;
            this.lastEventExtra = "Research lab destroyed!";
          }
          this.resources.food -= 18;
          this.resources.morale -= 22;
        }
      }
    ];

    // Always trigger event when called (probability controlled by nextTurn())
    const event = events[Math.floor(Math.random() * events.length)];
    this.lastEvent = `🌟 EVENT: ${event.text}`;
    this.lastEventDay = this.day;
    this.lastEventExtra = null;
    event.effect();
    
    this.resources.food = Math.max(0, Math.min(100, this.resources.food));
    this.resources.morale = Math.max(0, Math.min(100, this.resources.morale));
    this.resources.energy = Math.max(0, Math.min(100, this.resources.energy));
    
    this.eventHistory.push({
      day: this.day,
      text: event.text
    });
    
    if (this.eventHistory.length > 10) {
      this.eventHistory.shift();
    }
    
    return true;
  }

  sendExpedition() {
    if (this.crewMembers < 3) {
      console.log("Not enough crew members for an expedition!");
      return false;
    }

    // Mark expedition as completed for mission tracking
    this.buildings.expedition++;

    console.log("Sending expedition team into the crystal caves...");
    console.log("Expedition will take 2 days to complete...");
    
    const outcomes = [
      { text: "Found crystalline energy deposits deeper in the caves! The samples pulse with an inner light.", food: 0, morale: 5, energy: 25, crewLoss: 0 },
      { text: "Discovered underground water source... but it tastes metallic and makes the crew uneasy.", food: 20, morale: -5, energy: 0, crewLoss: 0 },
      { text: "Found ancient formations that seem almost... architectural. The crew can't stop staring.", food: 0, morale: 10, energy: 5, crewLoss: 0 },
      { text: "Expedition team returned with thousand-yard stares, speaking of 'beautiful geometries'.", food: 0, morale: -15, energy: 0, crewLoss: 0 },
      { text: "Equipment malfunctioned near the deeper formations. Electronics showed impossible readings.", food: 0, morale: -8, energy: -12, crewLoss: 0 },
      { text: "Major discovery! Crystals that generate energy autonomously... but crew reports hearing whispers.", food: 10, morale: -5, energy: 30, crewLoss: 0 },
      { text: "Something moved in the deeper tunnels. Team escaped but Dr. Chen won't speak about what she saw.", food: 0, morale: -25, energy: -5, crewLoss: 0 },
      { text: "Team member vanished for 6 hours in the crystal maze. Found sitting peacefully, claims 'they showed me wonders'.", food: 0, morale: -20, energy: -10, crewLoss: 1 },
      { text: "Exposure to deep crystal radiation. One team member's eyes now reflect light strangely.", food: -5, morale: -20, energy: -8, crewLoss: 1 },
      { text: "Cave-in trapped the team! Rescue successful, but survivor speaks in mathematical equations.", food: 0, morale: -35, energy: 0, crewLoss: 1 }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    this.resources.food = Math.max(0, Math.min(100, this.resources.food + outcome.food));
    this.resources.morale = Math.max(0, Math.min(100, this.resources.morale + outcome.morale));
    this.resources.energy = Math.max(0, Math.min(100, this.resources.energy + outcome.energy));
    
    if (outcome.crewLoss > 0) {
      this.crewMembers = Math.max(1, this.crewMembers - outcome.crewLoss);
      this.lastEvent = `💀 EXPEDITION INCIDENT: ${outcome.text}`;
      this.lastEventDay = this.day;
      this.lastEventExtra = `Crew reduced to ${this.crewMembers} members`;
      this.cosmicInfluence += 3; // Expeditions increase cosmic influence
    } else {
      this.lastEvent = `🔍 DEEP EXPEDITION: ${outcome.text}`;
      this.lastEventDay = this.day;
      this.cosmicInfluence += 1; // Even successful expeditions have consequences
    }
    
    this.eventHistory.push({
      day: this.day,
      text: `EXPEDITION: ${outcome.text}`
    });
    
    if (this.eventHistory.length > 10) {
      this.eventHistory.shift();
    }
    
    this.day += 2;
    this.dailyDecay();
    this.dailyDecay();
    this.buildingProduction();
    this.buildingProduction();
    
    // Handle events for each day during expedition (max 1 per day)
    let additionalEvents = [];
    
    // Day 1 of expedition - chance for event
    const day1Event = Math.random();
    if (day1Event < 0.70) { // 70% chance for some event
      if (day1Event < 0.25) {
        // Would be choice event, but expedition crew can't handle it
        additionalEvents.push("Day 1: Expedition crew reported strange signals");
      } else {
        // Regular event - simulate without triggering display
        const tempEvents = [
          "Strange weather patterns observed",
          "Equipment showed minor malfunctions",
          "Crew discovered interesting geological formations",
          "Minor equipment repairs needed during expedition"
        ];
        additionalEvents.push(`Day 1: ${tempEvents[Math.floor(Math.random() * tempEvents.length)]}`);
      }
    }
    
    // Day 2 of expedition - chance for event  
    const day2Event = Math.random();
    if (day2Event < 0.70) { // 70% chance for some event
      if (day2Event < 0.25) {
        additionalEvents.push("Day 2: Communication difficulties with expedition team");
      } else {
        const tempEvents = [
          "Expedition team found promising resource deposits",
          "Weather conditions were challenging", 
          "Team had to take shelter from dust storm",
          "Navigation equipment showed minor issues"
        ];
        additionalEvents.push(`Day 2: ${tempEvents[Math.floor(Math.random() * tempEvents.length)]}`);
      }
    }
    
    if (additionalEvents.length > 0) {
      console.log('\nExpedition Reports:');
      additionalEvents.forEach(event => console.log(`📡 ${event}`));
    }
    
    console.log(`\nTime advanced by 2 days (now Day ${this.day})`);
    
    return true;
  }

  buildStructure() {
    console.log('\nWhat would you like to build?');
    console.log('1. Hydroponic Farm (+8 food/day) - Costs: 15 energy');
    console.log('2. Solar Panel (+12 energy/day) - Costs: 10 food');
    console.log('3. Recreation Center (+5 morale/day) - Costs: 10 energy, 5 food');
    
    console.log('─── Advanced Structures ───');
    console.log('4. Communication Array - Costs: 35 food, 60 energy, 25 morale');
    console.log('5. Research Lab - Costs: 30 food, 50 energy, 20 morale');
    console.log('6. Protective Barrier - Costs: 50 food, 75 energy, 40 morale');
    console.log('7. Cancel');

    const maxChoice = 7;
    this.rl.question(`Choose building (1-${maxChoice}): `, (answer) => {
      let buildingBuilt = false;
      
      switch(answer) {
        case '1':
          if (this.resources.energy >= 15) {
            this.resources.energy -= 15;
            this.buildings.hydroponicsFarm++;
            console.log('Hydroponic Farm built!');
            buildingBuilt = true;
          } else {
            console.log('Not enough energy!');
          }
          break;
        case '2':
          if (this.resources.food >= 10) {
            this.resources.food -= 10;
            this.buildings.solarPanels++;
            console.log('Solar Panel built!');
            buildingBuilt = true;
          } else {
            console.log('Not enough food!');
          }
          break;
        case '3':
          if (this.resources.energy >= 10 && this.resources.food >= 5) {
            this.resources.energy -= 10;
            this.resources.food -= 5;
            this.buildings.recreationCenter++;
            console.log('Recreation Center built!');
            buildingBuilt = true;
          } else {
            console.log('Not enough resources!');
          }
          break;
        case '4':
          if (this.resources.food >= 35 && this.resources.energy >= 60 && this.resources.morale >= 25) {
            this.resources.food -= 35;
            this.resources.energy -= 60;
            this.resources.morale -= 25;
            this.buildings.communicationArray++;
            console.log('Communication Array built!');
            buildingBuilt = true;
          } else {
            console.log('Not enough resources! Need: 35 food, 60 energy, 25 morale');
          }
          break;
        case '5':
          if (this.resources.food >= 30 && this.resources.energy >= 50 && this.resources.morale >= 20) {
            this.resources.food -= 30;
            this.resources.energy -= 50;
            this.resources.morale -= 20;
            this.buildings.researchLab++;
            console.log('Research Lab built!');
            buildingBuilt = true;
          } else {
            console.log('Not enough resources! Need: 30 food, 50 energy, 20 morale');
          }
          break;
        case '6':
          if (this.resources.food >= 50 && this.resources.energy >= 75 && this.resources.morale >= 40) {
            this.resources.food -= 50;
            this.resources.energy -= 75;
            this.resources.morale -= 40;
            this.buildings.shieldGenerator++;
            console.log('Protective Barrier built!');
            buildingBuilt = true;
          } else {
            console.log('Not enough resources! Need: 50 food, 75 energy, 40 morale');
          }
          break;
        case '7':
          console.log('Construction cancelled.');
          break;
        default:
          console.log('Invalid choice!');
      }
      
      if (buildingBuilt) {
        console.log('Construction completed! Day advances...');
        this.nextTurn();
      } else {
        console.log('No construction took place. Returning to camp...');
        setTimeout(() => this.gameLoop(), 2000);
      }
    });
  }

  checkGameOver() {
    if (this.resources.food <= 0) {
      console.log('\n💀 GAME OVER: Starvation claims the expedition! The last survivor\'s journal speaks of whispers in the walls...');
      this.gameRunning = false;
      return true;
    }
    if (this.resources.morale <= 0) {
      console.log('\n💀 GAME OVER: Madness takes hold! The survivors turn on each other in gibbering frenzy!');
      this.gameRunning = false;
      return true;
    }
    if (this.resources.energy <= 0) {
      console.log('\n💀 GAME OVER: Life support fails! As the lights go out, something moves in the darkness...');
      this.gameRunning = false;
      return true;
    }
    return false;
  }

  checkMissionStatus() {
    if (!this.campaign.missionActive) return;
    
    const mission = this.campaign.missions[this.campaign.currentMission];
    let currentBuilding;
    
    if (mission.building === 'expedition') {
      // For expedition missions, we check if the expedition was completed
      currentBuilding = this.buildings.expedition;
    } else {
      currentBuilding = this.buildings[mission.building];
    }
    
    if (currentBuilding >= mission.amount) {
      console.log(`\n🎉 MISSION COMPLETE: ${mission.title}`);
      console.log('Well done, Commander! The colony is safe for now...');
      this.campaign.missionActive = false;
      this.campaign.currentMission++;
      
      if (this.campaign.currentMission < this.campaign.missions.length) {
        setTimeout(() => this.startNextMission(), 3000);
      } else {
        this.showVictoryScreen();
      }
      return;
    }
    
    if (this.day > this.campaign.timeLimit) {
      console.log(`\n💀 MISSION FAILED: ${mission.title}`);
      console.log('Time ran out! The colony faces catastrophic consequences...');
      this.gameRunning = false;
      this.rl.close();
      return;
    }
  }

  startNextMission() {
    if (this.campaign.currentMission >= this.campaign.missions.length) return;
    
    const mission = this.campaign.missions[this.campaign.currentMission];
    console.log('\n' + '═'.repeat(50));
    console.log('📡 INCOMING TRANSMISSION FROM COMMAND');
    console.log('═'.repeat(50));
    console.log(mission.story);
    console.log('\nMission briefing:');
    console.log(`Target: Build ${mission.amount} ${mission.building.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`);
    console.log(`Time Limit: ${mission.timeLimit} days`);
    console.log(`Required Resources: ${mission.costs.food} food, ${mission.costs.energy} energy, ${mission.costs.morale} morale`);
    console.log('═'.repeat(50));
    
    this.campaign.missionActive = true;
    this.campaign.timeLimit = this.day + mission.timeLimit - 1;
    this.campaign.targetBuilding = mission.building;
    this.campaign.targetAmount = mission.amount;
  }

  showVictoryScreen() {
    console.clear();
    console.log('\n' + '═'.repeat(60));
    console.log('🏆                 CAMPAIGN COMPLETE!                 🏆');
    console.log('═'.repeat(60));
    console.log('');
    console.log('         🚀 SPACE COLONY ESTABLISHED! 🚀');
    console.log('');
    console.log('    ┌─────────────────────────────────────────┐');
    console.log('    │  ╔══╗ ╔══╗ ╔══╗   [Shield Generator]   │');
    console.log('    │  ║🛡️║ ║📡║ ║🔬║   [Communication Array] │');
    console.log('    │  ╚══╝ ╚══╝ ╚══╝   [Research Lab]       │');
    console.log('    │                                         │');
    console.log('    │  🌱🌱  ⚡⚡⚡  🎯🎯   [Basic Buildings]   │');
    console.log('    │  🌱🌱  ⚡⚡⚡  🎯🎯                      │');
    console.log('    │                                         │');
    console.log('    │     👥👥👥👥👥👥👥👥👥👥              │');
    console.log('    │        [Surviving Crew Members]        │');
    console.log('    │                                         │');
    console.log('    │    🌍═══════🚀═══════🪐               │');
    console.log('    │      Earth ←→ Your Colony              │');
    console.log('    └─────────────────────────────────────────┘');
    console.log('');
    console.log('  Commander, you have successfully established');
    console.log('  humanity\'s first permanent settlement on an');
    console.log('  alien world! Your colony now has:');
    console.log('');
    console.log('  ✅ Secure communication with Earth');
    console.log('  ✅ Advanced research capabilities');
    console.log('  ✅ Planetary defense systems');
    console.log('  ✅ Self-sustaining resource production');
    console.log('');
    console.log(`  Final Status: Day ${this.day}`);
    console.log(`  Crew: ${this.crewMembers} survivors`);
    console.log(`  Resources: ${this.resources.food}F/${this.resources.energy}E/${this.resources.morale}M`);
    console.log('');
    console.log('  🌟 Your name will be remembered in the annals');
    console.log('     of space exploration history! 🌟');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    
    setTimeout(() => {
      this.gameRunning = false;
      this.rl.close();
    }, 8000);
  }

  handleChoiceEvent() {
    const choiceEvents = [
      {
        text: "Alien creature trapped in camp perimeter!",
        description: "A large alien creature has become entangled in our perimeter fence. We can spend energy to safely relocate it, or risk crew morale if we ignore it.",
        choices: [
          { text: "Spend 20 energy to safely relocate creature", cost: {energy: 20}, effect: () => { this.resources.morale += 10; } },
          { text: "Ignore it and hope it leaves", cost: {}, effect: () => { this.resources.morale -= 15; } }
        ]
      },
      {
        text: "Equipment malfunction detected!",
        description: "Our main life support system is showing warning signs. We can use food reserves to fabricate replacement parts, or risk a major failure.",
        choices: [
          { text: "Spend 25 food to repair immediately", cost: {food: 25}, effect: () => {} },
          { text: "Risk waiting for next maintenance cycle", cost: {}, effect: () => { if (Math.random() < 0.4) { this.resources.energy -= 30; this.lastEventExtra = "Life support failed! Major energy loss!"; } } }
        ]
      },
      {
        text: "Crew conflict brewing!",
        description: "Tensions are high between crew members. We can organize a morale-boosting celebration using food, or let them work it out themselves.",
        choices: [
          { text: "Organize celebration (15 food)", cost: {food: 15}, effect: () => { this.resources.morale += 20; } },
          { text: "Let them handle it themselves", cost: {}, effect: () => { this.resources.morale -= 12; this.resources.energy -= 8; } }
        ]
      },
      {
        text: "Power grid overload warning!",
        description: "Our energy systems are overloaded. We can reduce morale by implementing strict power rationing, or risk a complete shutdown.",
        choices: [
          { text: "Implement power rationing (-10 morale)", cost: {morale: 10}, effect: () => {} },
          { text: "Risk it and hope for the best", cost: {}, effect: () => { if (Math.random() < 0.5) { this.resources.energy -= 25; this.lastEventExtra = "Power grid failed! Major energy loss!"; } } }
        ]
      },
      {
        text: "Contamination in food stores!",
        description: "We've detected possible contamination in our food supplies. We can spend energy on decontamination, or risk food poisoning.",
        choices: [
          { text: "Spend 18 energy on decontamination", cost: {energy: 18}, effect: () => {} },
          { text: "Take the risk with current supplies", cost: {}, effect: () => { this.resources.food -= 20; this.resources.morale -= 10; } }
        ]
      },
      {
        text: "Oxygen recycler malfunction critical!",
        description: "Our oxygen recycling system is failing! We can cannibalize a building for spare parts, or risk suffocation.",
        choices: [
          { text: "Sacrifice recreation center for parts", cost: {}, effect: () => { 
            if (this.buildings.recreationCenter > 0) {
              this.buildings.recreationCenter--;
              this.lastEventExtra = "Recreation center dismantled for parts";
            } else {
              this.resources.energy -= 35;
              this.lastEventExtra = "No buildings to sacrifice! Used emergency reserves";
            }
          }},
          { text: "Risk running on backup systems", cost: {}, effect: () => { 
            if (Math.random() < 0.6) { 
              this.resources.energy -= 40; 
              this.resources.morale -= 25;
              this.lastEventExtra = "Backup systems failed! Critical situation!"; 
            }
          }}
        ]
      },
      {
        text: "Alien artifact discovered near base!",
        description: "Scouts found a mysterious alien device. We can study it using resources, or ignore it and risk missing vital technology.",
        choices: [
          { text: "Study artifact (30 energy, 20 food)", cost: {energy: 30, food: 20}, effect: () => { 
            if (Math.random() < 0.7) {
              this.resources.morale += 25;
              this.resources.energy += 15;
              this.lastEventExtra = "Major breakthrough! Technology gained!";
            } else {
              this.resources.morale -= 20;
              this.lastEventExtra = "Artifact was dangerous! Crew shaken!";
            }
          }},
          { text: "Too dangerous, ignore it", cost: {}, effect: () => { this.resources.morale -= 8; } }
        ]
      },
      {
        text: "Severe storm approaching the colony!",
        description: "Weather systems show a massive storm incoming. We can reinforce structures using resources, or weather it unprepared.",
        choices: [
          { text: "Reinforce base (25 food, 30 energy)", cost: {food: 25, energy: 30}, effect: () => { this.resources.morale += 5; }},
          { text: "Take shelter and hope for the best", cost: {}, effect: () => { 
            this.resources.energy -= 25;
            this.resources.morale -= 15;
            if (Math.random() < 0.4) {
              const buildingTypes = ['hydroponicsFarm', 'solarPanels', 'recreationCenter'];
              const randomBuilding = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
              if (this.buildings[randomBuilding] > 0) {
                this.buildings[randomBuilding]--;
                this.lastEventExtra = `Storm destroyed a ${randomBuilding.replace(/([A-Z])/g, ' $1').toLowerCase()}!`;
              }
            }
          }}
        ]
      },
      {
        text: "Medical crisis - crew member dying!",
        description: "One of our crew is critically injured! We can use precious resources for emergency treatment, or risk losing them.",
        choices: [
          { text: "Emergency treatment (20 food, 25 energy)", cost: {food: 20, energy: 25}, effect: () => { this.resources.morale += 15; }},
          { text: "Do what we can with basic supplies", cost: {}, effect: () => { 
            if (Math.random() < 0.5) {
              this.crewMembers = Math.max(1, this.crewMembers - 1);
              this.resources.morale -= 35;
              this.lastEventExtra = `Crew member died! Only ${this.crewMembers} survivors remain`;
            } else {
              this.resources.morale -= 15;
              this.lastEventExtra = "Crew member pulled through, but barely";
            }
          }}
        ]
      },
      {
        text: "Sabotage suspected in the colony!",
        description: "Equipment keeps failing mysteriously. We can launch a full investigation or increase security measures instead.",
        choices: [
          { text: "Full investigation (15 food, 20 energy)", cost: {food: 15, energy: 20}, effect: () => { 
            if (Math.random() < 0.6) {
              this.resources.morale += 20;
              this.lastEventExtra = "Found and resolved the issue! Crew relieved";
            } else {
              this.resources.morale -= 10;
              this.lastEventExtra = "Investigation found nothing... paranoia grows";
            }
          }},
          { text: "Increase security, reduce freedoms", cost: {morale: 15}, effect: () => { 
            this.resources.energy -= 5;
            this.lastEventExtra = "Security increased but crew unhappy";
          }}
        ]
      },
      {
        text: "Critical structural damage detected!",
        description: "The main habitat shows severe stress fractures. We need immediate repairs or risk catastrophic failure.",
        choices: [
          { text: "Emergency repairs (35 food, 40 energy)", cost: {food: 35, energy: 40}, effect: () => {}},
          { text: "Minimal patches and hope it holds", cost: {}, effect: () => { 
            if (Math.random() < 0.4) {
              this.resources.energy -= 30;
              this.resources.morale -= 25;
              this.resources.food -= 20;
              this.lastEventExtra = "Habitat partially collapsed! Major damage!";
            }
          }}
        ]
      },
      {
        text: "Alien signal intercepted!",
        description: "We've detected structured signals from space. We can try to decode them or ignore them for safety.",
        choices: [
          { text: "Attempt communication (25 energy, 10 morale)", cost: {energy: 25, morale: 10}, effect: () => { 
            const outcome = Math.random();
            if (outcome < 0.3) {
              this.resources.morale += 30;
              this.resources.energy += 20;
              this.lastEventExtra = "Friendly aliens! They sent aid!";
            } else if (outcome < 0.7) {
              this.resources.morale += 10;
              this.lastEventExtra = "Fascinating but incomprehensible signals";
            } else {
              this.resources.morale -= 20;
              this.resources.energy -= 15;
              this.lastEventExtra = "Hostile response! Defenses activated!";
            }
          }},
          { text: "Maintain radio silence", cost: {}, effect: () => { this.resources.morale -= 5; }}
        ]
      },
      {
        text: "The Whispering Artifact",
        description: "Your team has uncovered a pulsing crystalline structure deep in the caves. It whispers seductive promises of knowledge and power. Dr. Chen insists we should study it intensively, but others fear what it might do to our minds.",
        choices: [
          { text: "Study the artifact extensively (20 food, 30 energy)", cost: {food: 20, energy: 30}, effect: () => { 
            this.resources.morale += 15;
            this.resources.energy += 25;
            this.cosmicInfluence += 8;
            this.lastEventExtra = "The artifact reveals incredible secrets... but at what cost?";
          }},
          { text: "Seal it away and avoid further contact", cost: {}, effect: () => { 
            this.resources.morale -= 10;
            this.lastEventExtra = "Some knowledge is too dangerous. The crew sleeps uneasily.";
          }}
        ]
      }
    ];

    // Always trigger choice event when called (probability controlled by nextTurn())
    const event = choiceEvents[Math.floor(Math.random() * choiceEvents.length)];
    this.pendingChoiceEvent = event;
    return true;
  }

  checkCosmicCorruption() {
    // Increase cosmic influence over time
    this.cosmicInfluence += 0.5;
    
    // Additional influence from certain buildings and low morale
    if (this.buildings.communicationArray > 0) this.cosmicInfluence += 1;
    if (this.buildings.researchLab > 0) this.cosmicInfluence += 1.5;
    if (this.resources.morale < 30) this.cosmicInfluence += 0.5;
    
    // Small chance of cosmic conversion that increases with time and influence
    const corruptionChance = Math.min(0.08, (this.day * 0.001) + (this.cosmicInfluence * 0.002));
    
    if (Math.random() < corruptionChance) {
      this.triggerCosmicCorruption();
      return true;
    }
    return false;
  }

  triggerCosmicCorruption() {
    console.clear();
    console.log('═'.repeat(60));
    console.log('                    THE CONVERSION                     ');
    console.log('═'.repeat(60));
    console.log('');
    console.log('The whispers have grown too loud to ignore.');
    console.log('The ancient symbols pulse with hypnotic light.');
    console.log('One by one, your crew stops resisting...');
    console.log('');
    console.log('Their eyes turn black. Their voices change.');
    console.log('They speak in unison of the Great Old Ones.');
    console.log('');
    console.log('Dr. Martinez approaches the communications array.');
    console.log('Her movements are wrong, too fluid, inhuman.');
    console.log('');
    console.log('"Earth Control, this is Deep Space Research Station Alpha..."');
    console.log('"We have made an incredible discovery..."');
    console.log('"Sending coordinates for immediate colonization fleet..."');
    console.log('"The beings here are... benevolent..."');
    console.log('');
    console.log('You try to stop her, but your own thoughts grow cloudy.');
    console.log('The voice in your head promises such wonderful things.');
    console.log('Unity. Purpose. Transcendence.');
    console.log('');
    console.log('Your finger hovers over the emergency beacon.');
    console.log('You could warn Earth. You should warn Earth.');
    console.log('');
    console.log('Instead, you find yourself helping craft the message.');
    console.log('The lies flow so easily from your transformed lips.');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🌌 COSMIC HORROR ENDING: THE HERALD');
    console.log('');
    console.log('Six months later, the first wave of colonists arrives.');
    console.log('They find a thriving research station with friendly crew.');
    console.log('The conversion process is swift and painless.');
    console.log('');
    console.log('Soon, Earth will send more ships.');
    console.log('The Great Old Ones are patient.');
    console.log('They have waited eons.');
    console.log('They can wait a little longer.');
    console.log('');
    console.log('For now, they have you.');
    console.log('And through you, they will have everything.');
    console.log('');
    console.log('The stars are right.');
    console.log('The harvest begins.');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Final Day: ${this.day} | Surviving "Crew": ${this.crewMembers}`);
    console.log(`Cosmic Influence: ${Math.round(this.cosmicInfluence)}`);
    console.log('');
    
    this.gameRunning = false;
    setTimeout(() => {
      this.rl.close();
    }, 8000);
  }

  nextTurn() {
    if (!this.gameRunning) return;

    this.day++;
    this.dailyDecay();
    this.buildingProduction();
    
    // Check for cosmic corruption before other events
    if (this.checkCosmicCorruption()) {
      return;
    }
    
    // Only allow one type of event per day
    const eventType = Math.random();
    if (eventType < 0.25) {
      // 25% chance for interactive choice event
      const hasChoiceEvent = this.handleChoiceEvent();
      if (hasChoiceEvent) {
        this.displayChoiceEvent();
        return;
      }
    } else if (eventType < 0.70) {
      // 45% chance for regular event (25% + 45% = 70% total event chance)
      this.randomEvent();
    }
    // 30% chance for no event

    if (this.checkGameOver()) {
      console.log(`\nYou survived ${this.day - 1} days on the alien planet!`);
      this.rl.close();
      return;
    }

    this.checkMissionStatus();
    if (!this.gameRunning) return;

    setTimeout(() => this.gameLoop(), 2000);
  }

  displayChoiceEvent() {
    console.clear();
    console.log('═══════════════════════════════════════');
    console.log('⚠️  URGENT DECISION REQUIRED  ⚠️');
    console.log('═══════════════════════════════════════');
    console.log(this.pendingChoiceEvent.text);
    console.log('\n' + this.pendingChoiceEvent.description);
    console.log('\nChoose your response:');
    
    this.pendingChoiceEvent.choices.forEach((choice, index) => {
      console.log(`${index + 1}. ${choice.text}`);
    });
    
    this.rl.question('\nYour decision (1-2): ', (answer) => {
      const choiceIndex = parseInt(answer) - 1;
      if (choiceIndex >= 0 && choiceIndex < this.pendingChoiceEvent.choices.length) {
        const choice = this.pendingChoiceEvent.choices[choiceIndex];
        
        let canAfford = true;
        if (choice.cost.food && this.resources.food < choice.cost.food) canAfford = false;
        if (choice.cost.energy && this.resources.energy < choice.cost.energy) canAfford = false;
        if (choice.cost.morale && this.resources.morale < choice.cost.morale) canAfford = false;
        
        if (canAfford) {
          console.log(`\n📋 EXECUTING: ${choice.text}`);
          
          if (choice.cost.food) {
            this.resources.food -= choice.cost.food;
            console.log(`💰 Spent ${choice.cost.food} food`);
          }
          if (choice.cost.energy) {
            this.resources.energy -= choice.cost.energy;
            console.log(`⚡ Spent ${choice.cost.energy} energy`);
          }
          if (choice.cost.morale) {
            this.resources.morale -= choice.cost.morale;
            console.log(`😔 Lost ${choice.cost.morale} morale`);
          }
          
          choice.effect();
          console.log('\n✅ Decision implemented!');
          
          if (this.lastEventExtra) {
            console.log(`📢 RESULT: ${this.lastEventExtra}`);
          }
          
          this.eventHistory.push({
            day: this.day,
            text: `CHOICE: ${this.pendingChoiceEvent.text} - ${choice.text}`
          });
        } else {
          console.log('\n❌ INSUFFICIENT RESOURCES!');
          console.log('Defaulting to free option...');
          console.log(`\n📋 EXECUTING: ${this.pendingChoiceEvent.choices[1].text}`);
          
          this.pendingChoiceEvent.choices[1].effect();
          console.log('\n⚠️  Default action taken!');
          
          if (this.lastEventExtra) {
            console.log(`📢 RESULT: ${this.lastEventExtra}`);
          }
          
          this.eventHistory.push({
            day: this.day,
            text: `CHOICE: ${this.pendingChoiceEvent.text} - ${this.pendingChoiceEvent.choices[1].text} (forced)`
          });
        }
      } else {
        console.log('\n❌ INVALID CHOICE!');
        console.log('Defaulting to option 2...');
        console.log(`\n📋 EXECUTING: ${this.pendingChoiceEvent.choices[1].text}`);
        
        this.pendingChoiceEvent.choices[1].effect();
        console.log('\n⚠️  Default action taken!');
        
        if (this.lastEventExtra) {
          console.log(`📢 RESULT: ${this.lastEventExtra}`);
        }
        
        this.eventHistory.push({
          day: this.day,
          text: `CHOICE: ${this.pendingChoiceEvent.text} - ${this.pendingChoiceEvent.choices[1].text} (default)`
        });
      }
      
      this.resources.food = Math.max(0, Math.min(100, this.resources.food));
      this.resources.morale = Math.max(0, Math.min(100, this.resources.morale));
      this.resources.energy = Math.max(0, Math.min(100, this.resources.energy));
      
      if (this.eventHistory.length > 10) {
        this.eventHistory.shift();
      }
      
      this.pendingChoiceEvent = null;
      
      setTimeout(() => {
        if (this.checkGameOver()) {
          console.log(`\nYou survived ${this.day - 1} days on the alien planet!`);
          this.rl.close();
          return;
        }
        
        this.checkMissionStatus();
        if (!this.gameRunning) return;
        
        setTimeout(() => this.gameLoop(), 2000);
      }, 2000);
    });
  }

  gameLoop() {
    this.displayStatus();
    
    console.log('\nWhat would you like to do?');
    console.log('1. Send Expedition');
    console.log('2. Build Structure');
    console.log('3. End Day');
    console.log('4. Quit Game');

    this.rl.question('Choose action (1-4): ', (answer) => {
      switch(answer) {
        case '1':
          const expeditionSent = this.sendExpedition();
          if (expeditionSent) {
            setTimeout(() => {
              if (this.checkGameOver()) {
                console.log(`\nYou survived ${this.day - 1} days on the alien planet!`);
                this.rl.close();
                return;
              }
              this.checkMissionStatus();
              if (!this.gameRunning) return;
              setTimeout(() => this.gameLoop(), 2000);
            }, 3000);
          } else {
            setTimeout(() => this.gameLoop(), 2000);
          }
          break;
        case '2':
          this.buildStructure();
          break;
        case '3':
          console.log('Ending day...');
          this.nextTurn();
          break;
        case '4':
          console.log('Mission terminated. The void between stars grows ever darker...');
          this.gameRunning = false;
          this.rl.close();
          break;
        default:
          console.log('Invalid choice! Try again.');
          setTimeout(() => this.gameLoop(), 1000);
      }
    });
  }

  start() {
    console.clear();
    console.log('🛰️ DEEP RANGE PROTOCOL - MISSION STATUS: CRITICAL 🛰️');
    console.log('');
    console.log('Mission Status: EMERGENCY PROTOCOLS ACTIVE');
    console.log('Location: Deep Space Research Station Alpha');
    console.log('Distance from Earth: 1,200 light-years');
    console.log('');
    console.log('Priority objectives have been updated by Command...');
    console.log('New protocols require immediate implementation.');
    console.log('Station survival depends on your decisions.');
    console.log('');
    console.log('⚠️  WARNING: Anomalous readings detected system-wide');
    console.log('');
    console.log('Press Enter to begin emergency briefing...');
    
    this.rl.question('', () => {
      this.startNextMission();
      setTimeout(() => this.gameLoop(), 4000);
    });
  }
}

function startGame() {
  console.clear();
  showIntroScreen1();
}

function showIntroScreen1() {
  console.clear();
  console.log('');
  console.log('  ██████╗ ███████╗███████╗██████╗     ██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗');
  console.log('  ██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝');
  console.log('  ██║  ██║█████╗  █████╗  ██████╔╝    ██████╔╝███████║██╔██╗ ██║██║  ███╗█████╗  ');
  console.log('  ██║  ██║██╔══╝  ██╔══╝  ██╔═══╝     ██╔══██╗██╔══██║██║╚██╗██║██║   ██║██╔══╝  ');
  console.log('  ██████╔╝███████╗███████╗██║         ██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗');
  console.log('  ╚═════╝ ╚══════╝╚══════╝╚═╝         ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝');
  console.log('        ██████╗ ██████╗  ██████╗ ████████╗ ██████╗  ██████╗ ██████╗ ██╗     ');
  console.log('        ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗██╔════╝██╔═══██╗██║     ');
  console.log('        ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║     ');
  console.log('        ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║     ██║   ██║██║     ');
  console.log('        ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝╚██████╗╚██████╔╝███████╗');
  console.log('        ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝');
  console.log('');
  console.log('                           🚀 DEEP SPACE RESEARCH MISSION 🌌');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                                MISSION BRIEFING');
  console.log('');
  console.log('  EARTH DATE: 2387.156.14:42:07 UTC');
  console.log('  MISSION: Deep Range Scientific Expedition Alpha');
  console.log('  DESTINATION: Kepler-442b (1,200 light-years from Earth)');
  console.log('  OBJECTIVE: Establish research station for exogeological survey');
  console.log('');
  console.log('  The Kepler-442 system shows unprecedented mineral formations that could');
  console.log('  revolutionize clean energy production. Your mission is to conduct a');
  console.log('  comprehensive geological survey and establish sustainable operations');
  console.log('  for long-term research.');
  console.log('');
  console.log('  Expected mission duration: 18 months');
  console.log('  Crew complement: 10 specialists');
  console.log('  Supply status: Sufficient for planned duration');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('                         Press any key to continue...');
  
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', () => {
    rl.close();
    showIntroScreen2();
  });
}

function showIntroScreen2() {
  console.clear();
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                              MISSION LOG - ENTRY 1');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Commander\'s Log: Day 1');
  console.log('  Mission Status: NOMINAL');
  console.log('');
  console.log('  We\'ve successfully established Deep Space Research Station Alpha on the');
  console.log('  surface of Kepler-442b. Initial scans confirm the presence of exotic');
  console.log('  crystal formations throughout the subsurface. The energy readings are');
  console.log('  unlike anything we\'ve seen before.');
  console.log('');
  console.log('  The crew is in good spirits. Dr. Chen is particularly excited about the');
  console.log('  mineral samples we\'ve collected. She believes they could provide clean');
  console.log('  energy solutions that could power entire cities back on Earth.');
  console.log('');
  console.log('  Dr. Rodriguez has detected some unusual gravitational anomalies in the');
  console.log('  outer system, but nothing that should concern our operations here.');
  console.log('  We\'ll monitor the situation and continue our planned research.');
  console.log('');
  console.log('  Everything is proceeding according to protocol.');
  console.log('');
  console.log('  Status: All systems operational');
  console.log('  Crew morale: High');
  console.log('  Mission progress: On schedule');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('                         Press any key to continue...');
  
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', () => {
    rl.close();
    showIntroScreen3();
  });
}

function showIntroScreen3() {
  console.clear();
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                              MISSION LOG - ENTRY 47');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Commander\'s Log: Day 47');
  console.log('  Mission Status: ...CONCERNS NOTED');
  console.log('');
  console.log('  The past few weeks have been... unsettling. The crystal formations');
  console.log('  we\'ve been studying seem to be having unexpected effects on the crew.');
  console.log('  Dr. Martinez reported strange dreams after extended exposure to the');
  console.log('  samples. Several others have mentioned similar experiences.');
  console.log('');
  console.log('  Our communications with Earth have become increasingly unreliable.');
  console.log('  Equipment malfunctions are more frequent. The gravitational anomalies');
  console.log('  Dr. Rodriguez detected have... grown larger. Much larger.');
  console.log('');
  console.log('  Something\'s not right here. The energy readings from the crystals');
  console.log('  don\'t match any known physics. When I asked Dr. Chen about it,');
  console.log('  she just stared at me with these... empty eyes.');
  console.log('');
  console.log('  I\'m implementing emergency protocols. We need to focus on survival');
  console.log('  until we can figure out what\'s happening.');
  console.log('');
  console.log('  Status: Mission parameters... changing');
  console.log('  Crew status: 10 personnel... accounted for');
  console.log('  Priority: Maintain station integrity at all costs');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('                         Press any key to begin...');
  
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', () => {
    rl.close();
    const game = new SpaceCampManager('campaign');
    game.start();
  });
}

startGame();