const buildings = {
  hydroponicsFarm: {
    name: 'Hydroponic Farm',
    symbol: '🌱',
    description: 'Produces food for the colony',
    cost: { food: 15, energy: 25, morale: 10 },
    production: { food: 8 },
    efficiencyRequirement: 8,
    unlocked: true
  },
  solarPanels: {
    name: 'Solar Panel Array',
    symbol: '☀️',
    description: 'Generates energy from solar radiation',
    cost: { food: 15, energy: 0, morale: 10 },
    production: { energy: 12 },
    efficiencyRequirement: 6,
    unlocked: true
  },
  recreationCenter: {
    name: 'Recreation Center',
    symbol: '🏠',
    description: 'Improves crew morale and mental health',
    cost: { food: 20, energy: 15, morale: 15 },
    production: { morale: 5 },
    efficiencyRequirement: 4,
    unlocked: true
  },
  communicationArray: {
    name: 'Communication Array',
    symbol: '📡',
    description: 'Long-range communication system - Required for first mission',
    cost: { food: 35, energy: 60, morale: 25 },
    production: {},
    efficiencyRequirement: null,
    unlocked: false,
    unlockedByMission: 0
  },
  researchLab: {
    name: 'Research Laboratory',
    symbol: '🔬',
    description: 'Advanced research and analysis facility - Required for second mission',
    cost: { food: 30, energy: 50, morale: 20 },
    production: {},
    efficiencyRequirement: null,
    unlocked: false,
    unlockedByMission: 1
  },
  shieldGenerator: {
    name: 'Protective Barrier',
    symbol: '🛡️',
    description: 'Defensive system against unknown threats - Required for third mission',
    cost: { food: 50, energy: 75, morale: 40 },
    production: {},
    efficiencyRequirement: null,
    unlocked: false,
    unlockedByMission: 2
  },
  expedition: {
    name: 'Expedition',
    symbol: '🚀',
    description: 'Deep exploration mission - Required for final mission',
    cost: { food: 20, energy: 30, morale: 35 },
    production: {},
    efficiencyRequirement: null,
    unlocked: false,
    unlockedByMission: 3
  }
};

module.exports = buildings;