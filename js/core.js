
//The game will be displayed in the gameDiv HTML element, and will take a 800x600 space
var game = new Phaser.Game(1200, 800, Phaser.AUTO, 'gameDiv');
//All game states
game.state.add("MenuState", menu);
game.state.add("Game", gameStep);
//Initial state
game.state.start("Game");


