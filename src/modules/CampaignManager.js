const campaignData = require('../data/missions');

class CampaignManager {
  constructor() {
    this.currentMission = 0;
    this.timeLimit = 0;
    this.targetBuilding = '';
    this.targetAmount = 0;
    this.missionActive = false;
    this.missions = campaignData.missions;
  }

  startCampaign() {
    if (this.currentMission < this.missions.length) {
      const mission = this.missions[this.currentMission];
      this.missionActive = true;
      this.targetBuilding = mission.building;
      this.targetAmount = mission.amount;
      this.timeLimit = mission.timeLimit;
      return mission;
    }
    return null;
  }

  getCurrentMission() {
    if (this.currentMission < this.missions.length) {
      return this.missions[this.currentMission];
    }
    return null;
  }

  checkMissionCompletion(buildingManager) {
    if (!this.missionActive) return false;

    const currentCount = buildingManager.getBuildingCount(this.targetBuilding);
    return currentCount >= this.targetAmount;
  }

  checkMissionFailure(day) {
    if (!this.missionActive) return false;
    return day > this.timeLimit;
  }

  completeMission() {
    if (this.missionActive) {
      this.missionActive = false;
      this.currentMission++;
      return true;
    }
    return false;
  }

  failMission() {
    if (this.missionActive) {
      this.missionActive = false;
      return true;
    }
    return false;
  }

  getMissionProgress(buildingManager) {
    if (!this.missionActive) return null;

    const currentCount = buildingManager.getBuildingCount(this.targetBuilding);
    return {
      current: currentCount,
      target: this.targetAmount,
      building: this.targetBuilding,
      completed: currentCount >= this.targetAmount
    };
  }

  getDaysRemaining(day) {
    if (!this.missionActive) return 0;
    return Math.max(0, this.timeLimit - day + 1);
  }

  isLastMission() {
    return this.currentMission >= this.missions.length - 1;
  }

  isCampaignComplete() {
    return this.currentMission >= this.missions.length;
  }

  getMissionStatus(buildingManager, day) {
    if (!this.missionActive) return null;

    const mission = this.getCurrentMission();
    const progress = this.getMissionProgress(buildingManager);
    const daysLeft = this.getDaysRemaining(day);

    return {
      title: mission.title,
      story: mission.story,
      progress: progress,
      daysLeft: daysLeft,
      isUrgent: daysLeft <= 5,
      isComplete: progress.completed,
      isFailed: daysLeft <= 0 && !progress.completed
    };
  }
}

module.exports = CampaignManager;