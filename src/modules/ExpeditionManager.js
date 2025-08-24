class ExpeditionManager {
  constructor() {
    this.expeditionHistory = [];
  }

  generateExpeditionOutcome(crewMembers, day, morale = 100, teamSize = 1) {
    const outcomes = [
      // Positive outcomes (30% chance)
      {
        type: 'resource_cache',
        chance: 0.15,
        message: '🎒 CACHE DISCOVERED: Your team found abandoned supply containers!',
        effects: { food: 30, energy: 25, morale: 10 }
      },
      {
        type: 'energy_crystals',
        chance: 0.10,
        message: '⚡ RESONANT CRYSTALS: The team found crystals that hum with unfamiliar frequencies.',
        effects: { energy: 25, morale: -2 },
        cosmic: true
      },
      {
        type: 'mineral_deposit',
        chance: 0.10,
        message: '⛏️ MINERAL WEALTH: Rich deposits found for trade or construction!',
        effects: { food: 20, energy: 20, morale: 15 }
      },
      {
        type: 'shelter_ruins',
        chance: 0.05,
        message: '🏛️ GEOMETRIC RUINS: Ancient structures with impossible angles yield some materials.',
        effects: { food: 20, energy: 15, morale: -3 },
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
        message: '📡 SIGNAL PATTERNS: The equipment records data that follows no known patterns.',
        effects: { morale: -6 },
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
        message: '👻 LEFT BEHIND: A team member didn\'t return. Their equipment was found neatly arranged.',
        effects: { crewLoss: 1, morale: -12 },
        cosmic: true
      },
      {
        type: 'crew_taken',
        chance: 0.08,
        message: '🌀 DISTANT VOICES: "I can hear something beautiful..." was the last transmission. One crew member is missing.',
        effects: { crewLoss: 1, morale: -18 },
        cosmic: true
      },
      {
        type: 'cosmic_encounter',
        chance: 0.02,
        message: '👁️ CHANGED PERSPECTIVE: The team returns quieter than usual. They avoid direct eye contact.',
        effects: { morale: -25, food: 8, energy: 6 },
        cosmic: true,
        crewCorrupted: true
      },
      {
        type: 'cosmic_whispers',
        chance: 0.03,
        message: '🌀 SHARED DREAMS: The team mentions having identical dreams during the expedition.',
        effects: { morale: -15, energy: 10 },
        cosmic: true
      },
      {
        type: 'reality_distortion',
        chance: 0.02,
        message: '🌪️ TIME CONFUSION: The team insists the expedition lasted much longer than recorded.',
        effects: { morale: -20, food: -8 },
        cosmic: true
      },
      {
        type: 'cosmic_gift',
        chance: 0.01,
        message: '✨ UNEXPECTED FINDS: The team returns with materials that shouldn\'t exist here.',
        effects: { food: 25, energy: 20, morale: -8 },
        cosmic: true
      },
      {
        type: 'entity_influence',
        chance: 0.02,
        message: '🕳️ GROWING PRESENCE: The team mentions that something feels "closer" than before.',
        effects: { morale: -12, food: 3 },
        cosmic: true,
        increasesCosmicRisk: true
      },
      {
        type: 'dimensional_breach',
        chance: 0.01,
        message: '🌌 MOMENTARY ABSENCE: A team member briefly disappeared from instruments before returning confused.',
        effects: { morale: -18, energy: 12 },
        cosmic: true
      },
      {
        type: 'mind_meld',
        chance: 0.015,
        message: '🧠 SYNCHRONIZED THOUGHTS: The team finishes each other\'s sentences more than usual.',
        effects: { morale: -16, food: 8, energy: 6 },
        cosmic: true,
        crewCorrupted: true
      }
    ];

    // Calculate cosmic escalation based on expedition history
    const totalExpeditions = this.expeditionHistory.length;
    const totalCrewSent = this.expeditionHistory.reduce((sum, exp) => sum + (exp.teamSize || 1), 0);
    const cosmicEncounters = this.getCosmicEncounters();
    
    // Cosmic encounters become more likely after each expedition (50/50 after ~4 expeditions)
    const baseCosmicMultiplier = Math.min(3.0, 1 + (totalExpeditions * 0.5) + (totalCrewSent * 0.2));
    const cosmicEscalation = baseCosmicMultiplier * (1 + cosmicEncounters * 0.3);
    
    // Adjust chances based on morale (higher morale = safer expeditions)
    // High morale benefits are stronger to make solo expeditions more viable
    const safetyMultiplier = Math.min(2.0, morale / 100); // 100 morale for max safety bonus (increased)
    const riskMultiplier = Math.max(0.3, 60 / Math.max(morale, 15)); // Higher risk at low morale (stronger effect)
    
    // Team size affects both risk and reward
    const teamRewardMultiplier = 1 + (teamSize - 1) * 0.3; // +30% rewards per extra crew member
    const teamRiskMultiplier = Math.max(0.5, 1 - (teamSize - 1) * 0.15); // -15% crew loss risk per extra crew member (minimum 50%)

    // Select outcome based on weighted probabilities
    let totalChance = 0;
    const adjustedOutcomes = outcomes.map(outcome => {
      let adjustedChance = outcome.chance;
      
      // Positive outcomes more likely with higher morale
      if (outcome.effects.food > 0 || outcome.effects.energy > 0) {
        adjustedChance *= safetyMultiplier;
      }
      
      // Negative outcomes more likely with lower morale
      if (outcome.effects.crewLoss || outcome.effects.morale < -10) {
        adjustedChance *= riskMultiplier;
      }
      
      // Team size affects crew loss risk
      if (outcome.effects.crewLoss) {
        adjustedChance *= teamRiskMultiplier;
      }
      
      // Apply cosmic escalation to all cosmic encounters
      if (outcome.cosmic) {
        adjustedChance *= cosmicEscalation;
      }

      totalChance += adjustedChance;
      return { ...outcome, adjustedChance, cumulativeChance: totalChance };
    });

    const roll = Math.random() * totalChance;
    const selectedOutcome = adjustedOutcomes.find(outcome => roll <= outcome.cumulativeChance) || adjustedOutcomes[0];

    // Apply team size reward multiplier to resource gains
    const scaledEffects = { ...selectedOutcome.effects };
    if (scaledEffects.food && scaledEffects.food > 0) {
      scaledEffects.food = Math.floor(scaledEffects.food * teamRewardMultiplier);
    }
    
    // Apply expedition food cost based on team size AFTER scaling rewards
    const expeditionFoodCost = teamSize * 3; // 3 food per crew member
    scaledEffects.food = (scaledEffects.food || 0) - expeditionFoodCost;
    if (scaledEffects.energy && scaledEffects.energy > 0) {
      scaledEffects.energy = Math.floor(scaledEffects.energy * teamRewardMultiplier);
    }
    if (scaledEffects.morale && scaledEffects.morale > 0) {
      scaledEffects.morale = Math.floor(scaledEffects.morale * teamRewardMultiplier);
    }
    
    // Larger teams can lose crew members but at least one always returns
    if (scaledEffects.crewLoss && teamSize > 1) {
      scaledEffects.crewLoss = Math.min(teamSize - 1, Math.max(1, Math.floor(scaledEffects.crewLoss * teamRiskMultiplier)));
    }
    
    // If crew are lost from larger teams, provide partial rewards but reduce morale
    let partialRewards = false;
    if (scaledEffects.crewLoss && teamSize > 1) {
      // Surviving team members still bring back some resources
      const survivalRewardMultiplier = Math.max(0.3, (teamSize - scaledEffects.crewLoss) / teamSize);
      
      // Apply partial rewards if this was originally a negative outcome
      if (scaledEffects.food <= 0 && scaledEffects.energy <= 0) {
        // Give some resources that the lost crew found before disappearing
        scaledEffects.food = Math.floor(15 * teamRewardMultiplier * survivalRewardMultiplier);
        scaledEffects.energy = Math.floor(10 * teamRewardMultiplier * survivalRewardMultiplier);
        partialRewards = true;
      }
      
      // Additional morale penalty for losing team members
      const moraleReduction = -Math.floor(15 * scaledEffects.crewLoss);
      scaledEffects.morale = (scaledEffects.morale || 0) + moraleReduction;
    }

    const finalOutcome = {
      ...selectedOutcome,
      effects: scaledEffects,
      partialRewards: partialRewards
    };

    // Record expedition in history
    this.expeditionHistory.push({
      day: day,
      outcome: finalOutcome.type,
      effects: finalOutcome.effects,
      cosmic: finalOutcome.cosmic || false,
      teamSize: teamSize
    });

    return finalOutcome;
  }

  getCosmicEncounters() {
    return this.expeditionHistory.filter(exp => exp.cosmic).length;
  }

  getExpeditionCount() {
    return this.expeditionHistory.length;
  }
}

module.exports = ExpeditionManager;