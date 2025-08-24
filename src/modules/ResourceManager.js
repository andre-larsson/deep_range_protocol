class ResourceManager {
  constructor() {
    this.resources = {
      food: 95,
      energy: 95,
      morale: 90
    };
    this.crewMembers = 5;
  }

  checkMoraleBeforeProduction() {
    // Check if morale is too low for crew to work
    if (this.resources.morale < 0) {
      return { moralecrisis: true };
    }
    return {};
  }

  dailyDecay(day = 1) {
    // Food consumption - increased per crew member
    const foodConsumption = 5 + (this.crewMembers * 2.5);
    this.resources.food -= foodConsumption;
    
    // Handle starvation - crew member dies if food goes below 0
    if (this.resources.food < 0) {
      this.crewMembers = Math.max(0, this.crewMembers - 1);
      this.resources.food = 0;
      return { starvation: true };
    }
    
    // Progressive morale decay - slightly reduced and slower progression  
    const baseMoraleDecay = Math.max(2, 5 - Math.floor(this.crewMembers / 4));
    const timeStressFactor = Math.floor(day / 20); // +1 decay every 20 days instead of 15
    const moraleDecay = baseMoraleDecay + timeStressFactor;
    this.resources.morale -= moraleDecay;
    this.resources.morale = Math.max(0, this.resources.morale);
    
    // Slightly reduced energy consumption
    const energyConsumption = 5 + this.crewMembers;
    this.resources.energy = Math.max(0, this.resources.energy - energyConsumption);
    
    return {};
  }

  applyProduction(buildings) {
    // Energy blackout - no production when energy is 0
    if (this.resources.energy === 0) {
      return { blackout: true };
    }
    
    // Farms: 50% base + 50% crew-dependent (3 base + 3 crew-scaled)
    const farmEfficiency = Math.min(1.0, this.crewMembers / 5);
    const farmProduction = buildings.hydroponicsFarm * (3 + Math.floor(3 * farmEfficiency));
    this.resources.food += farmProduction;
    
    // Solar: 50% base + 50% crew-dependent (6 base + 6 crew-scaled) 
    const energyEfficiency = Math.min(1.0, this.crewMembers / 5);
    const solarProduction = buildings.solarPanels * (6 + Math.floor(6 * energyEfficiency));
    this.resources.energy += solarProduction;
    
    // Recreation: Fixed 5 per building (no crew scaling)
    this.resources.morale += Math.floor(buildings.recreationCenter * 5);
    
    // Apply energy costs for buildings (except solar panels)
    const buildingEnergyCost = buildings.hydroponicsFarm * 1 + 
                              buildings.recreationCenter * 1 + 
                              buildings.communicationArray * 3 + 
                              buildings.researchLab * 4 + 
                              buildings.shieldGenerator * 5;
    this.resources.energy -= buildingEnergyCost;
    
    this.resources.food = Math.min(200, this.resources.food);
    this.resources.energy = Math.min(200, this.resources.energy);
    this.resources.morale = Math.min(200, this.resources.morale);
    
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
    if (changes.food) this.resources.food = Math.max(0, Math.min(200, this.resources.food + changes.food));
    if (changes.energy) this.resources.energy = Math.max(0, Math.min(200, this.resources.energy + changes.energy));
    if (changes.morale) this.resources.morale = Math.max(0, Math.min(200, this.resources.morale + changes.morale));
    if (changes.crewMembers) this.crewMembers = Math.max(0, this.crewMembers + changes.crewMembers);
  }

  getNetChanges(buildings) {
    const foodDecay = -(5 + (this.crewMembers * 2.5));
    const moraleDecay = -Math.max(2, 4 - Math.floor(this.crewMembers / 5));
    const baseFoodDecay = -(6 + this.crewMembers);
    
    const farmEfficiency = Math.min(1.0, this.crewMembers / 5);
    const energyEfficiency = Math.min(1.0, this.crewMembers / 5);
    
    // Farms: 50% base + 50% crew-dependent (3 base + 3 crew-scaled)
    const foodProduction = buildings.hydroponicsFarm * (3 + Math.floor(3 * farmEfficiency));
    // Solar: 50% base + 50% crew-dependent (6 base + 6 crew-scaled)
    const energyProduction = buildings.solarPanels * (6 + Math.floor(6 * energyEfficiency));
    // Recreation: Fixed 5 per building (no crew scaling)
    const moraleProduction = buildings.recreationCenter * 5;
    
    // Calculate building energy costs
    const buildingEnergyCost = buildings.hydroponicsFarm * 1 + 
                              buildings.recreationCenter * 1 + 
                              buildings.communicationArray * 3 + 
                              buildings.researchLab * 4 + 
                              buildings.shieldGenerator * 5;
    const totalEnergyDecay = baseFoodDecay - buildingEnergyCost;
    
    return {
      food: { net: foodDecay + foodProduction, production: foodProduction, decay: foodDecay },
      energy: { net: totalEnergyDecay + energyProduction, production: energyProduction, decay: totalEnergyDecay },
      morale: { net: moraleDecay + moraleProduction, production: moraleProduction, decay: moraleDecay }
    };
  }

  isGameOver() {
    return this.crewMembers <= 0 || 
           (this.resources.food <= 0 && this.resources.energy <= 0 && this.resources.morale <= 0);
  }
}

module.exports = ResourceManager;