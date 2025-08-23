const events = {
  randomEvents: [
    {
      text: "Lightning storm supercharges the batteries!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: 35 }); }
    },
    {
      text: "Crew member has breakthrough in research!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: 22 }); }
    },
    {
      text: "Found intact technology of unknown origin!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: 20, morale: 15 }); }
    },
    {
      text: "Crew establishes new tradition to boost spirits.",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: 16 }); }
    },
    {
      text: "Equipment recycling yields useful materials!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: 12 }); }
    },
    {
      text: "Discovery of natural hot springs nearby!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: 28, energy: 10 }); }
    },
    {
      text: "Successful atmospheric processing yields pure oxygen reserves!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: 18, morale: 8 }); }
    },
    {
      text: "Hydroponic breakthrough increases food production efficiency!",
      effect: (resourceManager) => { resourceManager.modifyResources({ food: 22, morale: 12 }); }
    },
    {
      text: "Weather patterns bring beneficial mineral-rich rainfall!",
      effect: (resourceManager) => { resourceManager.modifyResources({ food: 15, energy: 8, morale: 5 }); }
    },
    {
      text: "Equipment diagnostics reveal hidden efficiency gains!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: 25, morale: 10 }); }
    },
    {
      text: "Crew medical checkup shows everyone in excellent health!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: 20, food: 5 }); }
    },
    {
      text: "Favorable atmospheric conditions boost solar panel efficiency!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: 30, morale: 8 }); }
    },
    {
      text: "Ancient tome discovered, revealing forbidden knowledge.",
      effect: (resourceManager, buildingManager, eventManager) => { 
        resourceManager.modifyResources({ morale: 12, energy: 8 });
        eventManager.addCosmicInfluence(2);
      }
    },
    {
      text: "Discovery of ancient ritual chambers beneath the earth!",
      effect: (resourceManager, buildingManager, eventManager) => { 
        resourceManager.modifyResources({ morale: 20 });
        eventManager.addCosmicInfluence(5);
      }
    },
    {
      text: "Homesickness affects crew productivity.",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -12, energy: -8 }); }
    },
    {
      text: "Sandstorm forces crew indoors all day.",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: -15, morale: -10 }); }
    },
    {
      text: "Toxic gas leak in ventilation system!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -20, energy: -15 }); }
    },
    {
      text: "Critical water filtration system failure!",
      effect: (resourceManager) => { resourceManager.modifyResources({ food: -25, energy: -10 }); }
    },
    {
      text: "Multiple hull breaches detected!",
      effect: (resourceManager) => { resourceManager.modifyResources({ energy: -25, morale: -18 }); }
    },
    {
      text: "Microscopic contamination spreads through colony!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -25, energy: -12, food: -10 }); }
    },
    {
      text: "Emergency evacuation drill goes wrong!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -18, energy: -8 }); }
    },
    {
      text: "Communications blackout with mission control!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -22 }); }
    },
    {
      text: "Aggressive algae overgrowth threatens colony systems!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -25, energy: -10 }); }
    },
    {
      text: "Critical medical emergency in crew quarters!",
      effect: (resourceManager) => { resourceManager.modifyResources({ morale: -20, food: -12 }); }
    },
    {
      text: "Severe radiation storm lasts for hours!",
      effect: (resourceManager) => { 
        resourceManager.modifyResources({ energy: -20, morale: -15 });
      }
    },
    {
      text: "Seismic activity damages recreation center!",
      effect: (resourceManager, buildingManager, eventManager) => {
        if (buildingManager.getBuildingCount('recreationCenter') > 0) {
          buildingManager.damageBuilding('recreationCenter', 1);
          eventManager.lastEventExtra = "One recreation center was damaged!";
        }
        resourceManager.modifyResources({ morale: -12 });
      }
    },
    {
      text: "Food production equipment critically damaged!",
      effect: (resourceManager, buildingManager, eventManager) => { 
        if (buildingManager.getBuildingCount('hydroponicsFarm') > 1) {
          buildingManager.damageBuilding('hydroponicsFarm', 1);
          eventManager.lastEventExtra = "One hydroponic farm was severely damaged!";
        }
        resourceManager.modifyResources({ food: -15 });
      }
    },
    {
      text: "Power grid cascade failure!",
      effect: (resourceManager, buildingManager, eventManager) => { 
        if (buildingManager.getBuildingCount('solarPanels') > 0) {
          buildingManager.damageBuilding('solarPanels', 1);
          eventManager.lastEventExtra = "One solar panel array was destroyed!";
        }
        resourceManager.modifyResources({ energy: -20 });
      }
    },
    {
      text: "Massive electrical fire in main habitat!",
      effect: (resourceManager, buildingManager, eventManager) => { 
        if (buildingManager.getBuildingCount('recreationCenter') > 0) {
          buildingManager.damageBuilding('recreationCenter', 1);
          eventManager.lastEventExtra = "One recreation center was consumed by flames!";
        }
        resourceManager.modifyResources({ energy: -25, morale: -20 });
      }
    },
    {
      text: "Complete communication system meltdown!",
      effect: (resourceManager, buildingManager, eventManager) => { 
        if (buildingManager.getBuildingCount('communicationArray') > 0) {
          buildingManager.damageBuilding('communicationArray', 1);
          eventManager.lastEventExtra = "Communication array was completely destroyed!";
        }
        resourceManager.modifyResources({ morale: -30 });
      }
    },
    {
      text: "Research lab contamination spreads!",
      effect: (resourceManager, buildingManager, eventManager) => { 
        if (buildingManager.getBuildingCount('researchLab') > 0) {
          buildingManager.damageBuilding('researchLab', 1);
          eventManager.lastEventExtra = "Research lab sealed due to contamination!";
        }
        resourceManager.modifyResources({ morale: -25, energy: -15 });
      }
    },

    // Story-hint events with no gameplay effects - subtle cosmic horror atmosphere
    {
      text: "Crew reports strange dreams featuring geometric patterns.",
      effect: () => {} // No gameplay effect - pure atmosphere
    },
    {
      text: "Microorganisms in petri dishes arrange themselves in perfect spirals.",
      effect: () => {}
    },
    {
      text: "Radio static occasionally resembles whispered conversations.",
      effect: () => {}
    },
    {
      text: "Algae samples exhibit synchronized pulsing with no apparent cause.",
      effect: () => {}
    },
    {
      text: "Equipment readings show impossible energy signatures underground.",
      effect: () => {}
    },
    {
      text: "Crew member reports seeing familiar faces in crystalline formations.",
      effect: () => {}
    },
    {
      text: "Simple bacteria cultures form intricate mandala-like colonies.",
      effect: () => {}
    },
    {
      text: "Magnetic compass needles point to subsurface anomalies instead of north.",
      effect: () => {}
    },
    {
      text: "Local microbes respond to crew presence with unexplained behavior changes.",
      effect: () => {}
    },
    {
      text: "Seismic readings detect rhythmic vibrations deep beneath the surface.",
      effect: () => {}
    },
    {
      text: "Crew awakens to find their drawings contain symbols they don't remember making.",
      effect: () => {}
    },
    {
      text: "Algae samples exhibit bioluminescence in response to specific frequencies.",
      effect: () => {}
    },
    {
      text: "Team member reports brief sensation of being observed during surface walks.",
      effect: () => {}
    },
    {
      text: "Ancient impact crater shows mineral formations that defy geological explanation.",
      effect: () => {}
    },
    {
      text: "Primitive organisms form temporary congregation patterns near the base.",
      effect: () => {}
    }
  ],

  choiceEvents: [
    {
      text: "Perimeter fence overgrown by aggressive plant matter!",
      description: "Rapidly growing algae and primitive plant matter has completely overrun sections of our perimeter fence. We can spend energy to clear it immediately, or risk reduced security if we leave it.",
      choices: [
        { 
          text: "Spend 20 energy to clear overgrowth immediately", 
          cost: { energy: 20, food: 0, morale: 0 }, 
          effect: (resourceManager) => { resourceManager.modifyResources({ morale: 10 }); } 
        },
        { 
          text: "Leave it and monitor the situation", 
          cost: { energy: 0, food: 0, morale: 0 }, 
          effect: (resourceManager) => { resourceManager.modifyResources({ morale: -15 }); } 
        }
      ]
    },
    {
      text: "Equipment malfunction detected!",
      description: "Our main life support system is showing warning signs. We can use food reserves to fabricate replacement parts, or risk a major failure.",
      choices: [
        { 
          text: "Spend 25 food to repair immediately", 
          cost: { food: 25, energy: 0, morale: 0 }, 
          effect: () => {} 
        },
        { 
          text: "Risk waiting for next maintenance cycle", 
          cost: { food: 0, energy: 0, morale: 0 }, 
          effect: (resourceManager, buildingManager, eventManager) => { 
            if (Math.random() < 0.4) { 
              resourceManager.modifyResources({ energy: -30 }); 
              eventManager.lastEventExtra = "Life support failed! Major energy loss!"; 
            } 
          } 
        }
      ]
    },
    {
      text: "Crew conflict brewing!",
      description: "Tensions are high between crew members. We can organize a morale-boosting celebration using food, or let them work it out themselves.",
      choices: [
        { 
          text: "Organize celebration (15 food)", 
          cost: { food: 15, energy: 0, morale: 0 }, 
          effect: (resourceManager) => { resourceManager.modifyResources({ morale: 20 }); } 
        },
        { 
          text: "Let them handle it themselves", 
          cost: { food: 0, energy: 0, morale: 0 }, 
          effect: (resourceManager) => { resourceManager.modifyResources({ morale: -12, energy: -8 }); } 
        }
      ]
    },
    {
      text: "Medical crisis - crew member dying!",
      description: "One of our crew is critically injured! We can use precious resources for emergency treatment, or risk losing them.",
      choices: [
        { 
          text: "Emergency treatment (20 food, 25 energy)", 
          cost: { food: 20, energy: 25, morale: 0 }, 
          effect: (resourceManager) => { resourceManager.modifyResources({ morale: 15 }); }
        },
        { 
          text: "Do what we can with basic supplies", 
          cost: { food: 0, energy: 0, morale: 0 }, 
          effect: (resourceManager, buildingManager, eventManager) => { 
            if (Math.random() < 0.5) {
              resourceManager.modifyResources({ crewMembers: -1 });
              eventManager.lastEventExtra = "We lost a crew member. The colony mourns.";
            }
            resourceManager.modifyResources({ morale: -25 });
          }
        }
      ]
    },
    {
      text: "The Whispering Artifact",
      description: "Your team has uncovered a pulsing crystalline structure deep in the caves. It whispers seductive promises of knowledge and power. Dr. Chen insists we should study it intensively, but others fear what it might do to our minds.",
      choices: [
        { 
          text: "Study the artifact extensively (20 food, 30 energy)", 
          cost: { food: 20, energy: 30, morale: 0 }, 
          effect: (resourceManager, buildingManager, eventManager) => { 
            resourceManager.modifyResources({ morale: 15, energy: 25 });
            eventManager.addCosmicInfluence(15);
            eventManager.lastEventExtra = "The knowledge gained is... unsettling. Some truths are better left unknown.";
          }
        },
        { 
          text: "Seal it away and avoid further contact", 
          cost: { food: 0, energy: 0, morale: 0 }, 
          effect: (resourceManager, buildingManager, eventManager) => { 
            resourceManager.modifyResources({ morale: -10 });
            eventManager.lastEventExtra = "Some knowledge is too dangerous. The crew sleeps uneasily.";
          }
        }
      ]
    }
  ],

  expeditionOutcomes: [
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
  ]
};

module.exports = events;