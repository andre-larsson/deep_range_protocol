class ResourceManager {
  constructor() {
    this.resources = {
      food: 88,
      energy: 92,
      morale: 85
    };
    this.crewMembers = 10;
  }

  checkMoraleBeforeProduction() {
    // Check if morale is too low for crew to work
    if (this.resources.morale < 0) {
      return { moralecrisis: true };
    }
    return {};
  }

  dailyDecay(day = 1) {
    // Food consumption - reduced from 2 to 1.5 per crew member
    const foodConsumption = 5 + (this.crewMembers * 1.5);
    this.resources.food -= foodConsumption;
    
    // Handle starvation - crew member dies if food goes below 0
    if (this.resources.food < 0) {
      this.crewMembers = Math.max(0, this.crewMembers - 1);
      this.resources.food = 0;
      return { starvation: true };
    }
    
    // Progressive morale decay - gets worse over time as isolation sets in
    const baseMoraleDecay = Math.max(3, 6 - Math.floor(this.crewMembers / 4));
    const timeStressFactor = Math.floor(day / 15); // +1 decay every 15 days
    const moraleDecay = baseMoraleDecay + timeStressFactor;
    this.resources.morale -= moraleDecay;
    this.resources.morale = Math.max(0, this.resources.morale);
    
    const energyConsumption = 6 + this.crewMembers;
    this.resources.energy = Math.max(0, this.resources.energy - energyConsumption);
    
    return {};
  }

  applyProduction(buildings) {
    // Energy blackout - no production when energy is 0
    if (this.resources.energy === 0) {
      return { blackout: true };
    }
    
    const farmEfficiency = Math.min(1.0, this.crewMembers / 8);
    this.resources.food += Math.floor(buildings.hydroponicsFarm * 8 * farmEfficiency);
    
    const energyEfficiency = Math.min(1.0, this.crewMembers / 6);
    this.resources.energy += Math.floor(buildings.solarPanels * 12 * energyEfficiency);
    
    const moraleEfficiency = Math.min(1.0, this.crewMembers / 4);
    this.resources.morale += Math.floor(buildings.recreationCenter * 5 * moraleEfficiency);
    
    this.resources.food = Math.min(100, this.resources.food);
    this.resources.energy = Math.min(100, this.resources.energy);
    this.resources.morale = Math.min(100, this.resources.morale);
    
    return {};
  }

  canAfford(costs) {
    return this.resources.food >= costs.food &&
           this.resources.energy >= costs.energy &&
           this.resources.morale >= costs.morale;
  }

  spend(costs) {
    if (this.canAfford(costs)) {
      this.resources.food -= costs.food;
      this.resources.energy -= costs.energy;
      this.resources.morale -= costs.morale;
      return true;
    }
    return false;
  }

  modifyResources(changes) {
    if (changes.food) this.resources.food = Math.max(0, Math.min(100, this.resources.food + changes.food));
    if (changes.energy) this.resources.energy = Math.max(0, Math.min(100, this.resources.energy + changes.energy));
    if (changes.morale) this.resources.morale = Math.max(0, Math.min(100, this.resources.morale + changes.morale));
    if (changes.crewMembers) this.crewMembers = Math.max(0, this.crewMembers + changes.crewMembers);
  }

  getNetChanges(buildings) {
    const foodDecay = -(5 + (this.crewMembers * 1.5));
    const moraleDecay = -Math.max(2, 4 - Math.floor(this.crewMembers / 5));
    const energyDecay = -(6 + this.crewMembers);
    
    const farmEfficiency = Math.min(1.0, this.crewMembers / 8);
    const energyEfficiency = Math.min(1.0, this.crewMembers / 6);
    const moraleEfficiency = Math.min(1.0, this.crewMembers / 4);
    
    const foodProduction = Math.floor(buildings.hydroponicsFarm * 8 * farmEfficiency);
    const energyProduction = Math.floor(buildings.solarPanels * 12 * energyEfficiency);
    const moraleProduction = Math.floor(buildings.recreationCenter * 5 * moraleEfficiency);
    
    return {
      food: { net: foodDecay + foodProduction, production: foodProduction, decay: foodDecay },
      energy: { net: energyDecay + energyProduction, production: energyProduction, decay: energyDecay },
      morale: { net: moraleDecay + moraleProduction, production: moraleProduction, decay: moraleDecay }
    };
  }

  isGameOver() {
    return this.crewMembers <= 0 || 
           (this.resources.food <= 0 && this.resources.energy <= 0 && this.resources.morale <= 0);
  }
}

module.exports = ResourceManager;