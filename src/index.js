const GameController = require('./modules/GameController');

async function main() {
  try {
    const game = new GameController('campaign');
    await game.startGame();
  } catch (error) {
    console.error('An error occurred while running the game:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { GameController };