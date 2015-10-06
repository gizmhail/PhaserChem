
//The game will be displayed in the gameDiv HTML element, and will take a 800x600 space
var game = new Phaser.Game(1200, 800, Phaser.AUTO, 'gameDiv');
//All game states
game.state.add("MenuState", menu);
game.state.add("Game", gameStep);
game.state.add("Level1", level1);
game.state.add("Level2", level2);
game.state.add("Level3", level3);
//Initial state
game.state.start("MenuState");


