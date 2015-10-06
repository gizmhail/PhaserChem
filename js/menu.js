var menu = function(){
    this.characterSprite = null;
    this.backgroundSprite = null;
};

menu.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        this.load.image('background', 'assets/background.jpg');
    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        this.backgroundSprite = this.add.sprite(0, 0, 'background');
        var style = { font: "45px Arial", fill: "#ff6600", align: "center" }
        var i = 1;
        var maxLevel = 3;
        while(i <= maxLevel){
            var text = this.add.text(this.world.centerX, i*60, "Level "+i, style);
            text.inputEnabled = true;
            text.anchor.set(.5,.5);
            text.events.onInputDown.add(this.levelClick(i), this);
            i++;
        }

    },
    // Called for each refresh
    update: function (){
   
    },
    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
    
    },

    levelClick: function(index){
        return function (){
            this.state.start("Level"+index);
        };
    }
};
