const missions = {
  missions: [
    {
      title: "Deep Space Communication Protocol",
      story: "Commander, we've detected structured transmissions from an unknown source beyond our galaxy. The signals appear to be using advanced compression algorithms that shouldn't exist. Our communications officer reported equipment malfunctions after the third attempt at decoding. We need to construct a high-powered Communication Array to properly analyze and respond to these transmissions before we lose this unprecedented contact opportunity.",
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
      title: "Deep Range Expedition",
      story: "Command has gone silent for 73 days. Our last transmission spoke of 'fascinating discoveries' that I don't remember sending. Dr. Martinez insists we need to venture deeper into the crystal caves - she says the formations are calling to her. The crew that volunteered for the expedition... their eyes have changed. But we need to understand what we're dealing with. And we need those mineral samples, even if the idea of collecting them fills us with inexplicable dread.",
      building: 'expedition',
      amount: 1,
      timeLimit: 10,
      costs: { food: 20, energy: 30, morale: 35 }
    }
  ]
};

module.exports = missions;