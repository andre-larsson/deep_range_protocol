const buildingData = require('../data/buildings');

class BuildingManager {
  constructor() {
    this.buildings = {
      hydroponicsFarm: 3,
      solarPanels: 0,
      recreationCenter: 0,
      communicationArray: 0,
      researchLab: 0,
      shieldGenerator: 0
    };
    this.unlockedBuildings = new Set(['hydroponicsFarm', 'solarPanels', 'recreationCenter']);
  }

  getBuildingCost(buildingType) {
    return buildingData[buildingType]?.cost || null;
  }

  getBuildingInfo(buildingType) {
    return buildingData[buildingType] || null;
  }

  isBuildingUnlocked(buildingType) {
    return this.unlockedBuildings.has(buildingType);
  }

  unlockBuilding(buildingType) {
    this.unlockedBuildings.add(buildingType);
  }

  unlockBuildingByMission(missionIndex) {
    Object.keys(buildingData).forEach(buildingType => {
      const building = buildingData[buildingType];
      if (building.unlockedByMission === missionIndex) {
        this.unlockBuilding(buildingType);
      }
    });
  }

  getUnlockedBuildings() {
    return Object.keys(buildingData).filter(buildingType => 
      this.isBuildingUnlocked(buildingType)
    );
  }

  canBuild(buildingType, resourceManager) {
    const cost = this.getBuildingCost(buildingType);
    return cost && this.isBuildingUnlocked(buildingType) && resourceManager.canAfford(cost);
  }

  build(buildingType, resourceManager) {
    const cost = this.getBuildingCost(buildingType);
    if (cost && this.isBuildingUnlocked(buildingType) && resourceManager.spend(cost)) {
      this.buildings[buildingType]++;
      return true;
    }
    return false;
  }

  getBuildingCount(buildingType) {
    return this.buildings[buildingType] || 0;
  }

  damageBuilding(buildingType, amount = 1) {
    if (this.buildings[buildingType] > 0) {
      this.buildings[buildingType] = Math.max(0, this.buildings[buildingType] - amount);
      return true;
    }
    return false;
  }

  getAllBuildings() {
    return { ...this.buildings };
  }

  getBuildingEfficiency(buildingType, crewMembers) {
    const efficiencyData = {
      hydroponicsFarm: Math.min(1.0, crewMembers / 5),
      solarPanels: Math.min(1.0, crewMembers / 5),
      recreationCenter: Math.min(1.0, crewMembers / 5)
    };
    return efficiencyData[buildingType] || 1.0;
  }

  getTotalBuildingProduction(crewMembers) {
    const farmEfficiency = this.getBuildingEfficiency('hydroponicsFarm', crewMembers);
    const energyEfficiency = this.getBuildingEfficiency('solarPanels', crewMembers);
    const moraleEfficiency = this.getBuildingEfficiency('recreationCenter', crewMembers);
    
    return {
      food: Math.floor(this.buildings.hydroponicsFarm * 8 * farmEfficiency),
      energy: Math.floor(this.buildings.solarPanels * 12 * energyEfficiency),
      morale: Math.floor(this.buildings.recreationCenter * 5 * moraleEfficiency)
    };
  }
}

module.exports = BuildingManager;