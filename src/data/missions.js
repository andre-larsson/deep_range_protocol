const missions = {
  missions: [
    {
      title: "Emergency Communication Restoration",
      story: "Commander, our communication systems have been dead since the storm. But now crew members report strange electromagnetic interference patterns - equipment activating on its own, displays showing impossible readings, and radio static that almost sounds... structured. We desperately need to build a Communication Array to reestablish contact with Earth and investigate these phenomena before they drive the crew to madness.",
      building: 'communicationArray',
      amount: 1,
      timeLimit: 12,
      costs: { food: 35, energy: 60, morale: 25 }
    },
    {
      title: "Xenogeological Analysis Initiative",
      story: "The subsurface scans have revealed mineral formations unlike anything in Earth's geological record. The crystalline structures exhibit properties that seem to defy our understanding of physics - they're generating energy without any apparent fuel source. Dr. Chen requires a fully equipped Research Lab to analyze these samples safely. The crew is anxious about the unknown risks, but this could revolutionize our energy crisis.",
      building: 'researchLab',
      amount: 1,
      timeLimit: 15,
      costs: { food: 30, energy: 50, morale: 20 }
    },
    {
      title: "Emergency Containment Protocol",
      story: "The situation has deteriorated beyond our worst projections. The crystal formations aren't just energy sources - they're... alive. Dr. Rodriguez calculated the breach probability before she stopped speaking altogether. The patterns in her equations, they're not mathematical anymore. They're something else. Something that whispers. We need to build what the crew has started calling a 'Protective Barrier' - though the blueprints seem to have appeared overnight, written in symbols none of us recognize. 18 days before something breaks through.",
      building: 'shieldGenerator',
      amount: 1,
      timeLimit: 18,
      costs: { food: 50, energy: 75, morale: 40 }
    },
    {
      title: "Deep Range Protocol - Final Expedition",
      story: "Command has gone silent for 73 days. Our last transmission spoke of 'fascinating discoveries' that I don't remember sending. Dr. Martinez insists we need to venture deeper into the crystal caves - she says the formations are calling to her. The crew that volunteered for the expedition... their eyes have changed. They speak in unison now, of 'completion' and 'awakening.' Dr. Chen's research notes contain warnings about a vast neural network beneath the planet's surface. Something that has been waiting. Something that needs us to come deeper. The mineral samples we've been collecting... they're not samples. They're invitations.",
      building: 'expedition',
      amount: 1,
      timeLimit: 10,
      costs: { food: 20, energy: 30, morale: 35 }
    }
  ]
};

module.exports = missions;