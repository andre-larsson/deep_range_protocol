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
    if (Math.random() < 0.6) {
      const events = eventData.randomEvents;
      const event = events[Math.floor(Math.random() * events.length)];
      
      this.lastEvent = `📰 ${event.text}`;
      this.lastEventDay = day;
      
      // Calculate effects before applying them
      this.lastEventExtra = this.calculateEventEffects(event, resourceManager);
      
      // Apply the actual effect
      if (event.effect) {
        event.effect(resourceManager, buildingManager, this);
      }
      
      this.eventHistory.push({
        day: day,
        text: event.text,
        effects: this.lastEventExtra
      });
      
      return true; // Event was triggered
    }
    return false; // No event triggered
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

  calculateEventEffects(event, resourceManager) {
    if (!event.effect) return null;
    
    // Capture resource state before effect
    const beforeResources = { ...resourceManager.resources };
    const beforeCrew = resourceManager.crewMembers;
    
    // Create a temporary copy to test the effect
    const tempResourceManager = {
      resources: { ...resourceManager.resources },
      crewMembers: resourceManager.crewMembers,
      modifyResources: (changes) => {
        Object.keys(changes).forEach(key => {
          if (key === 'crewMembers') {
            tempResourceManager.crewMembers += changes[key];
          } else if (tempResourceManager.resources.hasOwnProperty(key)) {
            tempResourceManager.resources[key] += changes[key];
          }
        });
      }
    };
    
    try {
      // Test the effect on the temporary manager
      event.effect(tempResourceManager, null, { addCosmicInfluence: () => {} });
      
      // Calculate differences
      const effects = [];
      Object.keys(tempResourceManager.resources).forEach(key => {
        const change = tempResourceManager.resources[key] - beforeResources[key];
        if (change !== 0) {
          const symbol = change > 0 ? '+' : '';
          const icon = key === 'food' ? '🍽️' : key === 'energy' ? '⚡' : '😰';
          effects.push(`${icon} ${symbol}${change} ${key}`);
        }
      });
      
      const crewChange = tempResourceManager.crewMembers - beforeCrew;
      if (crewChange !== 0) {
        const symbol = crewChange > 0 ? '+' : '';
        effects.push(`👥 ${symbol}${crewChange} crew`);
      }
      
      return effects.length > 0 ? `Effects: ${effects.join(', ')}` : null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = EventManager;