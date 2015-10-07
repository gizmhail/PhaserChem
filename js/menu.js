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
        var text = this.add.text(this.world.centerX - 130, 30, "PhaserChem", { font: "45px Arial", fill: "#000000", align: "center" } );
        while(i <= maxLevel){
            var text = this.add.text(this.world.centerX, 80 + i*80, "Level "+i, style);
            text.inputEnabled = true;
            text.anchor.set(.5,.5);
            text.events.onInputDown.add(this.levelClick(i), this);
            i++;
        }
        var tutorial = "The goal is to place in the out zone the requested orbs (see Red/Blue goals, they change for each levels)\n"
            +"To do so, you can place instructions on the board (drag and drop). The cursor of each beam will obey these orders"
            +" The red instruction will only work on the red beam, and similarly for the blue one:\n"
            +"   - direction(left, down, ...), instructions will bend the beams\n"
            +"   - 'in' will make an orb pop on the 'in zone' (red and blue in zone introduce different orbs) when the cursor over the instruction\n"
            +"   - 'grab/drop': the cursor will grab/drop any orb on this instruction when it passses over it\n" 
            +"   - 'exit' will make any orb on the 'out zone' be analysed for the goal, and removed from the board\n" 
            +"   - 'sync' add semaphors fun !"
            ;
        var Explication = this.add.text(150, 400, tutorial, { font: "15px Arial", fill: "#000000", align: "left",wordWrap: true,
    wordWrapWidth: 1000 } );


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
