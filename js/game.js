var gameStep = function(){
    this.characterSprite = null;
    this.instructionZone = null;
    this.toolsPalette = {};
    this.tools = ["left","right","up","down","in","grabdrop"];
    this.playButton = null;
    this.inPoint = null;
    this.orbGroup = null;
    this.beams = [];
};

gameStep.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        game.load.image('background', 'assets/grid.png');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i]
            game.load.image(toolName, 'assets/'+toolName+'.png?v=2');
        };
        game.load.image('enter', 'assets/enter.png?v=2');
        game.load.image('beamUp', 'assets/beamUp2.png?v=2');
        game.load.image('beamRight', 'assets/beamRight2.png?v=2');
        game.load.image('beamDown', 'assets/beamDown2.png?v=2');
        game.load.image('beamLeft', 'assets/beamLeft2.png?v=2');
        game.load.image('beamBlueUp', 'assets/beamBlueUp2.png?v=2');
        game.load.image('beamBlueRight', 'assets/beamBlueRight2.png?v=2');
        game.load.image('beamBlueDown', 'assets/beamBlueDown2.png?v=2');
        game.load.image('beamBlueLeft', 'assets/beamBlueLeft2.png?v=2');
        game.load.image('target', 'assets/target2.png?v=2');
        game.load.image('targetBlue', 'assets/targetBlue.png?v=2');
        game.load.image('playButton', 'assets/play.png?v=2');
        game.load.image('pauseButton', 'assets/pause.png?v=2');
        game.load.image('orb', 'assets/Flameless2.png?v=2');

    },

    // Called after preload - create sprites,... using assets here
    create: function () {
        //this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        this.instructionZone = this.add.tileSprite(50, 50, 1024, 700, 'background');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i];
            this.toolsPalette[toolName] = new PaletteTool(1100, 20+i*60, toolName, this.instructionZone, this, toolName, 32);
            this.toolsPalette[toolName].onInstructionPlaced = this.onInstructionPlaced;
        };
 
        //inPoint
        this.inPoint = {'x':32*11,'y':32*7};
        var inGhost = this.add.sprite(this.inPoint.x, this.inPoint.y ,'grabdrop');
        inGhost.alpha = 0.5;
        inGhost.anchor.set(0.5);

        this.orbGroup = this.add.group();
        this.playButton = game.add.button(400, 10, 'playButton', this.toggleCursors, this);
        this.playButton.scale.set(0.8);


        //Beam
        var beam1 = new Beam(32*6+2, 32*7, this.instructionZone, this.toolsPalette, this.orbGroup, 'target', 'enter', 'beam', this, 32);
        this.beams.push(beam1);
        beam1.onBeamReset = this.onBeamReset;
        beam1.onBeamCursorOveringInstruction = this.onBeamCursorOveringInstruction;
        beam1.traceBeam();
        //Beam2
        var beam2 = new Beam(32*6+2, 32*12, this.instructionZone, this.toolsPalette, this.orbGroup, 'targetBlue', 'enter', 'beamBlue', this, 32);
        this.beams.push(beam2);
        beam2.onBeamReset = this.onBeamReset;
        beam2.onBeamCursorOveringInstruction = this.onBeamCursorOveringInstruction;
        beam2.traceBeam();
   },

    // Called for each refresh
    update: function (){
   
    },

    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
        return;
        this.game.debug.spriteBounds(this.targetCursor, '#FF6600', false);
        this.beamGroup.forEachAlive(function(beam){
            this.game.debug.spriteBounds(beam);
        }, this);
        this.game.debug.spriteBounds(this.startPoint, '#FF6600', false);

    },

    // ------ Interface controls -----------------------------------

    toggleCursors: function(){
        if(this.cursorMoving){
            this.cursorMoving = false;
            this.playButton.loadTexture("playButton");
            for (var i = 0; i < this.beams.length; i++) {
                var beam = this.beams[i];
                beam.stopCursor();
            };
            return;
        }
        this.cursorMoving = true;
        this.playButton.loadTexture("pauseButton");
        for (var i = 0; i < this.beams.length; i++) {
            var beam = this.beams[i];
            beam.playCursor();
        };
    },

    // ------ Beam methods --------------------------------

    onBeamReset: function(beam){
        this.orbGroup.removeAll(true, true);
    },

    onBeamCursorOveringInstruction: function(beam, x, y, instructionElement, gameStep){
        if (typeof gameStep === 'undefined') { gameStep = this; }
            console.log("onBeamCursorOveringInstruction",instructionElement);
        if(instructionElement == "in"){
            console.log("in");
            var orb = gameStep.add.sprite(gameStep.inPoint.x, gameStep.inPoint.y, "orb");    
            orb.anchor.set(0.5);
            orb.attachedToCursor = null;
            gameStep.orbGroup.add(orb);
        }
        if(instructionElement == "grabdrop"){
            var droppingDone = false;
            for (var i = 0; i < gameStep.beams.length; i++) {
                var existingBeam = gameStep.beams[i];
                if(existingBeam.targetCursor.children.length > 0){
                    // Dropping orb associated with this.beam cursor
                    var orb = existingBeam.targetCursor.getChildAt(0)
                    existingBeam.targetCursor.removeChild(orb);
                    //We put back the orb in the orbs group (it was removed when attached as a sprite child)
                    gameStep.orbGroup.add(orb);
                    orb.x = x;
                    orb.y = y;
                    droppingDone = true;
                }
            };
        
            if(!droppingDone){
                // Grabing any orb below a cursor
                for (var j = 0; j < gameStep.orbGroup.children.length; j++) {
                    var orb = gameStep.orbGroup.children[j];
                    var d = Math.abs(orb.x - x) + Math.abs(orb.y - y);
                    if(d < 20 ){
                        orb.attachedToCursor = beam.targetCursor;
                        beam.targetCursor.addChild(orb);
                        orb.x = 0;
                        orb.y = 0;
                    }
                }
            }    
        }
    },
    
    // ------ Tools palette methods --------------------------------

    onInstructionPlaced: function(instructionElement, gameStep){
        if (typeof gameStep === 'undefined') { gameStep = this; }
        for (var i = 0; i < gameStep.beams.length; i++) {
            var beam = gameStep.beams[i];
            beam.stopCursor();
            beam.traceBeam(gameStep);
        }
        gameStep.playButton.loadTexture("playButton");
    },
};
