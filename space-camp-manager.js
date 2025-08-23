const { GameController } = require('./src/index');

async function main() {
  const game = new GameController('campaign');
  await game.startGame();
}

if (require.main === module) {
  main();
}