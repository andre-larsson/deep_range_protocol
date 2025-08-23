class ResourceManager {
  constructor() {
    this.resources = {
      food: 100,
      energy: 100,
      morale: 100
    };
    this.crewMembers = 10;
  }

  dailyDecay() {
    const foodConsumption = 5 + (this.crewMembers * 2);
    this.resources.food = Math.max(0, this.resources.food - foodConsumption);
    
    const moraleDecay = Math.max(2, 4 - Math.floor(this.crewMembers / 5));
    this.resources.morale = Math.max(0, this.resources.morale - moraleDecay);
    
    const energyConsumption = 6 + this.crewMembers;
    this.resources.energy = Math.max(0, this.resources.energy - energyConsumption);
  }

  applyProduction(buildings) {
    const farmEfficiency = Math.min(1.0, this.crewMembers / 8);
    this.resources.food += Math.floor(buildings.hydroponicsFarm * 8 * farmEfficiency);
    
    const energyEfficiency = Math.min(1.0, this.crewMembers / 6);
    this.resources.energy += Math.floor(buildings.solarPanels * 12 * energyEfficiency);
    
    const moraleEfficiency = Math.min(1.0, this.crewMembers / 4);
    this.resources.morale += Math.floor(buildings.recreationCenter * 5 * moraleEfficiency);
    
    this.resources.food = Math.min(100, this.resources.food);
    this.resources.energy = Math.min(100, this.resources.energy);
    this.resources.morale = Math.min(100, this.resources.morale);
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
    const foodDecay = -(5 + (this.crewMembers * 2));
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