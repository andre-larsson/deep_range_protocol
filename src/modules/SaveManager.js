const fs = require('fs');
const path = require('path');

class SaveManager {
  constructor() {
    this.saveDirectory = path.join(process.cwd(), 'saves');
    this.ensureSaveDirectory();
  }

  ensureSaveDirectory() {
    if (!fs.existsSync(this.saveDirectory)) {
      fs.mkdirSync(this.saveDirectory, { recursive: true });
    }
  }

  saveGame(gameState, saveName = 'autosave') {
    try {
      const saveData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        gameState: gameState
      };

      const fileName = `${saveName}.json`;
      const filePath = path.join(this.saveDirectory, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
      return { success: true, message: `Game saved as ${saveName}` };
    } catch (error) {
      return { success: false, message: `Failed to save game: ${error.message}` };
    }
  }

  loadGame(saveName = 'autosave') {
    try {
      const fileName = `${saveName}.json`;
      const filePath = path.join(this.saveDirectory, fileName);

      if (!fs.existsSync(filePath)) {
        return { success: false, message: `Save file '${saveName}' not found` };
      }

      const saveData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!saveData.gameState) {
        return { success: false, message: 'Invalid save file format' };
      }

      return { 
        success: true, 
        gameState: saveData.gameState,
        timestamp: saveData.timestamp,
        message: `Game loaded from ${saveName}`
      };
    } catch (error) {
      return { success: false, message: `Failed to load game: ${error.message}` };
    }
  }

  getSaveFiles() {
    try {
      const files = fs.readdirSync(this.saveDirectory)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.saveDirectory, file);
          const stats = fs.statSync(filePath);
          const saveName = path.basename(file, '.json');
          
          try {
            const saveData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return {
              name: saveName,
              timestamp: saveData.timestamp || stats.mtime.toISOString(),
              day: saveData.gameState?.day || 'Unknown',
              size: stats.size
            };
          } catch {
            return {
              name: saveName,
              timestamp: stats.mtime.toISOString(),
              day: 'Corrupted',
              size: stats.size
            };
          }
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return files;
    } catch (error) {
      return [];
    }
  }

  deleteSave(saveName) {
    try {
      const fileName = `${saveName}.json`;
      const filePath = path.join(this.saveDirectory, fileName);

      if (!fs.existsSync(filePath)) {
        return { success: false, message: `Save file '${saveName}' not found` };
      }

      fs.unlinkSync(filePath);
      return { success: true, message: `Save file '${saveName}' deleted` };
    } catch (error) {
      return { success: false, message: `Failed to delete save: ${error.message}` };
    }
  }

  exportGameState(resourceManager, buildingManager, eventManager, campaignManager, expeditionManager, day) {
    return {
      day: day,
      resources: { ...resourceManager.resources },
      crewMembers: resourceManager.crewMembers,
      buildings: { ...buildingManager.getAllBuildings() },
      unlockedBuildings: [...buildingManager.unlockedBuildings],
      eventHistory: [...eventManager.eventHistory],
      cosmicInfluence: eventManager.getCosmicInfluence(),
      campaign: {
        currentMission: campaignManager.currentMission,
        timeLimit: campaignManager.timeLimit,
        targetBuilding: campaignManager.targetBuilding,
        targetAmount: campaignManager.targetAmount,
        missionActive: campaignManager.missionActive,
        finalMissionSkipped: campaignManager.finalMissionSkipped
      },
      currentEvent: eventManager.getCurrentEvent(),
      expeditionHistory: [...expeditionManager.expeditionHistory]
    };
  }

  importGameState(gameState, resourceManager, buildingManager, eventManager, campaignManager, expeditionManager) {
    try {
      // Restore resource manager state
      resourceManager.resources = { ...gameState.resources };
      resourceManager.crewMembers = gameState.crewMembers;

      // Restore building manager state
      buildingManager.buildings = { ...gameState.buildings };
      if (gameState.unlockedBuildings) {
        buildingManager.unlockedBuildings = new Set(gameState.unlockedBuildings);
      }

      // Restore event manager state
      eventManager.eventHistory = [...gameState.eventHistory];
      eventManager.cosmicInfluence = gameState.cosmicInfluence || 0;
      
      if (gameState.currentEvent) {
        eventManager.lastEvent = gameState.currentEvent.event;
        eventManager.lastEventExtra = gameState.currentEvent.extra;
        eventManager.lastEventDay = gameState.currentEvent.day;
        eventManager.pendingChoiceEvent = gameState.currentEvent.pending;
      }

      // Restore campaign manager state
      if (gameState.campaign) {
        campaignManager.currentMission = gameState.campaign.currentMission;
        campaignManager.timeLimit = gameState.campaign.timeLimit;
        campaignManager.targetBuilding = gameState.campaign.targetBuilding;
        campaignManager.targetAmount = gameState.campaign.targetAmount;
        campaignManager.missionActive = gameState.campaign.missionActive;
        campaignManager.finalMissionSkipped = gameState.campaign.finalMissionSkipped || false;
      }

      // Restore expedition manager state
      if (gameState.expeditionHistory && expeditionManager) {
        expeditionManager.expeditionHistory = [...gameState.expeditionHistory];
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: `Failed to import game state: ${error.message}` };
    }
  }
}

module.exports = SaveManager;