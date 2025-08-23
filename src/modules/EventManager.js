const eventData = require('../data/events');

class EventManager {
  constructor() {
    this.eventHistory = [];
    this.lastEvent = null;
    this.lastEventExtra = null;
    this.lastEventDay = null;
    this.pendingChoiceEvent = null;
    this.cosmicInfluence = 0;
  }

  triggerRandomEvent(resourceManager, buildingManager, day) {
    if (Math.random() < 0.3) {
      const events = eventData.randomEvents;
      const event = events[Math.floor(Math.random() * events.length)];
      
      this.lastEvent = `📰 ${event.text}`;
      this.lastEventDay = day;
      this.lastEventExtra = null;
      
      if (event.effect) {
        event.effect(resourceManager, buildingManager, this);
      }
      
      this.eventHistory.push({
        day: day,
        text: event.text
      });
    }
  }

  triggerChoiceEvent(day) {
    if (Math.random() < 0.15 && !this.pendingChoiceEvent) {
      const events = eventData.choiceEvents;
      this.pendingChoiceEvent = events[Math.floor(Math.random() * events.length)];
      this.lastEvent = `🔽 CHOICE REQUIRED: ${this.pendingChoiceEvent.text}`;
      this.lastEventDay = day;
      return true;
    }
    return false;
  }

  handleChoice(choiceIndex, resourceManager, buildingManager, day) {
    if (!this.pendingChoiceEvent) return false;

    const choice = this.pendingChoiceEvent.choices[choiceIndex];
    if (!choice) return false;

    if (resourceManager.spend(choice.cost)) {
      choice.effect(resourceManager, buildingManager, this);
      
      this.eventHistory.push({
        day: day,
        text: `CHOICE: ${this.pendingChoiceEvent.text} - ${choice.text}`
      });
    } else {
      const defaultChoice = this.pendingChoiceEvent.choices[1];
      defaultChoice.effect(resourceManager, buildingManager, this);
      
      this.eventHistory.push({
        day: day,
        text: `CHOICE: ${this.pendingChoiceEvent.text} - ${defaultChoice.text} (forced)`
      });
    }

    this.pendingChoiceEvent = null;
    return true;
  }

  forceDefaultChoice(resourceManager, buildingManager, day) {
    if (!this.pendingChoiceEvent) return;

    const defaultChoice = this.pendingChoiceEvent.choices[1];
    defaultChoice.effect(resourceManager, buildingManager, this);
    
    this.eventHistory.push({
      day: day,
      text: `CHOICE: ${this.pendingChoiceEvent.text} - ${defaultChoice.text} (default)`
    });

    this.pendingChoiceEvent = null;
  }

  triggerExpeditionEvent(resourceManager, day) {
    const outcomes = eventData.expeditionOutcomes;
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    resourceManager.modifyResources({
      food: outcome.food,
      energy: outcome.energy,
      morale: outcome.morale,
      crewMembers: -outcome.crewLoss
    });

    this.eventHistory.push({
      day: day,
      text: `EXPEDITION: ${outcome.text}`
    });

    this.lastEvent = `🚀 ${outcome.text}`;
    this.lastEventDay = day;
  }

  getRecentEvents(limit = 3) {
    return this.eventHistory.slice(-limit);
  }

  getCurrentEvent() {
    return {
      event: this.lastEvent,
      extra: this.lastEventExtra,
      day: this.lastEventDay,
      pending: this.pendingChoiceEvent
    };
  }

  addCosmicInfluence(amount) {
    this.cosmicInfluence += amount;
  }

  getCosmicInfluence() {
    return this.cosmicInfluence;
  }
}

module.exports = EventManager;