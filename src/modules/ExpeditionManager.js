class ExpeditionManager {
  constructor() {
    this.expeditionHistory = [];
  }

  generateExpeditionOutcome(crewMembers, day) {
    const outcomes = [
      // Positive outcomes (30% chance)
      {
        type: 'resource_cache',
        chance: 0.15,
        message: '🎒 CACHE DISCOVERED: Your team found abandoned supply containers!',
        effects: { food: 40, energy: 35, morale: 15 }
      },
      {
        type: 'energy_crystals',
        chance: 0.10,
        message: '⚡ CRYSTAL FORMATION: Strange energy-emitting crystals discovered!',
        effects: { energy: 60, morale: 10 },
        cosmic: true
      },
      {
        type: 'mineral_deposit',
        chance: 0.10,
        message: '⛏️ MINERAL WEALTH: Rich deposits found for trade or construction!',
        effects: { food: 25, energy: 25, morale: 20 }
      },
      {
        type: 'shelter_ruins',
        chance: 0.05,
        message: '🏛️ ANCIENT RUINS: Mysterious structures contain useful materials!',
        effects: { food: 45, energy: 40, morale: 0 },
        cosmic: true
      },

      // Neutral outcomes (27% chance)
      {
        type: 'empty_handed',
        chance: 0.20,
        message: '👥 SAFE RETURN: The team returns tired but unharmed.',
        effects: { morale: -5 }
      },
      {
        type: 'strange_readings',
        chance: 0.10,
        message: '📡 ANOMALOUS DATA: Equipment detected unexplainable phenomena...',
        effects: { morale: -10 },
        cosmic: true
      },
      {
        type: 'algae_encounter',
        chance: 0.05,
        message: '🟢 ALGAE BLOOMS: Dense primitive algae formations block expedition paths.',
        effects: { morale: -3 }
      },

      // Negative outcomes (43% chance - includes 35% crew disappearance risk)
      {
        type: 'equipment_failure',
        chance: 0.10,
        message: '🔧 EQUIPMENT LOST: Critical gear malfunctioned in the field.',
        effects: { energy: -15, morale: -8 }
      },
      {
        type: 'crew_injured',
        chance: 0.08,
        message: '🏥 EXPEDITION MISHAP: A team member was injured but survived.',
        effects: { food: -10, morale: -15 }
      },
      {
        type: 'crew_lost',
        chance: 0.15,
        message: '💀 EXPEDITION TRAGEDY: A crew member went missing in the wilderness.',
        effects: { crewLoss: 1, morale: -15 }
      },
      {
        type: 'crew_vanished',
        chance: 0.10,
        message: '👻 MYSTERIOUS DISAPPEARANCE: A team member walked into the crystal caves and never returned. Their equipment was found arranged in perfect geometric patterns.',
        effects: { crewLoss: 1, morale: -12 },
        cosmic: true
      },
      {
        type: 'crew_taken',
        chance: 0.08,
        message: '🌀 THEY CALLED TO US: "The crystals sing so beautifully..." were the last words transmitted. One crew member is missing.',
        effects: { crewLoss: 1, morale: -18 },
        cosmic: true
      },
      {
        type: 'cosmic_encounter',
        chance: 0.02,
        message: '👁️ THEY ARE WATCHING: The team returns... changed. Their eyes reflect starlight.',
        effects: { morale: -30, food: 10, energy: 10 },
        cosmic: true,
        crewCorrupted: true
      }
    ];

    // Adjust chances based on crew size (more crew = safer expeditions)
    const safetyMultiplier = Math.min(1.5, crewMembers / 6);
    const riskMultiplier = Math.max(0.5, 8 / crewMembers);

    // Select outcome based on weighted probabilities
    let totalChance = 0;
    const adjustedOutcomes = outcomes.map(outcome => {
      let adjustedChance = outcome.chance;
      
      // Positive outcomes more likely with more crew
      if (outcome.effects.food > 0 || outcome.effects.energy > 0) {
        adjustedChance *= safetyMultiplier;
      }
      
      // Negative outcomes more likely with fewer crew
      if (outcome.effects.crewLoss || outcome.effects.morale < -10) {
        adjustedChance *= riskMultiplier;
      }

      totalChance += adjustedChance;
      return { ...outcome, adjustedChance, cumulativeChance: totalChance };
    });

    const roll = Math.random() * totalChance;
    const selectedOutcome = adjustedOutcomes.find(outcome => roll <= outcome.cumulativeChance) || adjustedOutcomes[0];

    // Record expedition in history
    this.expeditionHistory.push({
      day: day,
      outcome: selectedOutcome.type,
      effects: selectedOutcome.effects,
      cosmic: selectedOutcome.cosmic || false
    });

    return selectedOutcome;
  }

  getCosmicEncounters() {
    return this.expeditionHistory.filter(exp => exp.cosmic).length;
  }

  getExpeditionCount() {
    return this.expeditionHistory.length;
  }
}

module.exports = ExpeditionManager;