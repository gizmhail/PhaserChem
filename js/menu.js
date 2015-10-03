var menu = function(){
    this.characterSprite = null;
    this.backgroundSprite = null;
};

menu.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        tutorialGame.load.image('background', 'assets/background.jpg');
    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        var style = { font: "45px Arial", fill: "#ff6600", align: "center" }
        var i = 1;
        while(i<=5){
            var text = tutorialGame.add.text(tutorialGame.world.centerX, i*60, "Game - step "+i, style);
            text.inputEnabled = true;
            text.anchor.set(.5,.5);
            text.events.onInputDown.add(this.stateClick(i), this);
            i++;
        }
    },
    // Called for each refresh
    update: function (){
   
    },
    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
    
    },

    stateClick: function(index){
        return function (){
            tutorialGame.state.start("GameStateStep"+index);
        };
    }
};
