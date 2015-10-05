var gameStep = function(){
    this.characterSprite = null;
    this.instructionZone = null;
    this.toolsPalette = {};
    this.redToolsPalette = {};
    this.tools = ["left","right","up","down","in","grabdrop","exit"];
    this.redTools = ["red_left","red_right","red_up","red_down","red_in","red_grabdrop","red_exit"];
    this.playButton = null;
    this.inPoint = null;
    this.orbGroup = null;
    this.infoText = null;
    this.beams = [];
};

gameStep.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        game.load.image('background', 'assets/grid.png');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i];
            game.load.image(toolName, 'assets/'+toolName+'.png?v=2');
        };
        for (var i = 0; i < this.redTools.length; i++) {
            var toolName = this.redTools[i];
            game.load.image(toolName, 'assets/'+toolName+'.png?v=2');
        };
        game.load.image('enter', 'assets/enter.png?v=2');
        game.load.image('red_enter', 'assets/red_enter.png?v=2');
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
        game.load.image('orb2', 'assets/orb2.png?v=2');

    },

    // Called after preload - create sprites,... using assets here
    create: function () {
        //this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        this.instructionZone = this.add.tileSprite(50, 50, 1024, 700, 'background');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i];
            this.toolsPalette[toolName] = new PaletteTool(1170, 20+i*60, toolName, this.instructionZone, this, toolName, 32);
            this.toolsPalette[toolName].onInstructionPlaced = this.onInstructionPlaced;
        };
        for (var i = 0; i < this.redTools.length; i++) {
            var toolName = this.redTools[i];
            this.redToolsPalette[toolName] = new PaletteTool(1100, 20+i*60, toolName, this.instructionZone, this, toolName.replace("red_",""), 32);
            this.redToolsPalette[toolName].onInstructionPlaced = this.onInstructionPlaced;
        };
 
        //inPoint
        this.inPoint = {'x':32*11,'y':32*12,'color':'blue'};
        var inGhost = this.add.sprite(this.inPoint.x, this.inPoint.y ,'grabdrop');
        inGhost.alpha = 0.5;
        inGhost.anchor.set(0.5);
        var display = this.add.text(0,30,"in zone",{fill: "#FFFFFF", font: "13px Arial"});
        display.anchor.set(0.5);
        inGhost.addChild(display);
        //redInPoint
        this.redInPoint = {'x':32*11,'y':32*7,'color':'red'};
        var redInGhost = this.add.sprite(this.redInPoint.x, this.redInPoint.y ,'red_grabdrop');
        redInGhost.alpha = 0.5;
        redInGhost.anchor.set(0.5);
        display = this.add.text(0,30,"in zone",{fill: "#FFFFFF", font: "13px Arial"});
        display.anchor.set(0.5);
        redInGhost.addChild(display);
        //outPoint
        this.outPoint = {'x':32*26,'y':32*12,'color':'blue'};
        var outGhost = this.add.sprite(this.outPoint.x, this.outPoint.y ,'grabdrop');
        outGhost.alpha = 0.5;
        outGhost.anchor.set(0.5);
        display = this.add.text(0,30,"exit zone",{fill: "#FFFFFF", font: "13px Arial"});
        display.anchor.set(0.5);
        outGhost.addChild(display);
        //redOutPoint
        this.redOutPoint = {'x':32*26,'y':32*7,'color':'red'};
        outGhost = this.add.sprite(this.redOutPoint.x, this.redOutPoint.y ,'red_grabdrop');
        outGhost.alpha = 0.5;
        outGhost.anchor.set(0.5);
        display = this.add.text(0,30,"exit zone",{fill: "#FFFFFF", font: "13px Arial"});
        display.anchor.set(0.5);
        outGhost.addChild(display);


        this.orbGroup = this.add.group();
        this.playButton = game.add.button(400, 10, 'playButton', this.toggleCursors, this);
        this.playButton.scale.set(0.8);

        //Beam
        var beam1 = new Beam(32*6+2, 32*7, this.instructionZone, this.redToolsPalette, this.orbGroup, 'target', 'red_enter', 'beam', this, 32);
        this.beams.push(beam1);
        beam1.onBeamReset = this.onBeamReset;
        beam1.onBeamTraced = this.onBeamTraced;
        beam1.onBeamCursorOveringInstruction = this.onBeamCursorOveringInstruction;
        beam1.beamColor = 'red';
        beam1.traceBeam();
        beam1.onBeamCursorMoved = this.onBeamCursorMoved;
        //Beam2
        var beam2 = new Beam(32*6+2, 32*12, this.instructionZone, this.toolsPalette, this.orbGroup, 'targetBlue', 'enter', 'beamBlue', this, 32);
        this.beams.push(beam2);
        beam2.onBeamReset = this.onBeamReset;
        beam2.onBeamTraced = this.onBeamTraced;
        beam2.onBeamCursorMoved = this.onBeamCursorMoved;
        beam2.beamColor = 'blue';
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

    orbCollisionTest: function(){
        var allOrbs = [];
        for (var j = 0; j < this.orbGroup.children.length; j++) {
            var orb = this.orbGroup.children[j];
            allOrbs.push(orb);
        }
        for (var i = 0; i < this.beams.length; i++) {
            var beam = this.beams[i];
            if(beam.targetCursor.carriedOrb){
                allOrbs.push(beam.targetCursor.carriedOrb);
            }
        };  
        for (var i = 0; i < this.beams.length; i++) {
            var beam = this.beams[i];
            if(beam.targetCursor.carriedOrb){
                var boundsA = beam.targetCursor.carriedOrb.getBounds();
                for (var j = 0; j < allOrbs.length; j++) {
                    var orb = allOrbs[j];
                    if(beam.targetCursor.carriedOrb == orb){
                        continue;
                    }

                    var boundsB = orb.getBounds();

                    var collision = Phaser.Rectangle.intersects(boundsA, boundsB);
                    if(collision){
                        var gameStep = this;
                        if(this.infoText){
                            this.infoText.destroy();
                        }
                        this.infoText = this.add.text(200, 10, "Collision !!!!", {fill: "#FFFFFF", font: "13px Arial"});
                        this.game.paused = true;
                        window.setTimeout(function(){
                            gameStep.game.paused = false;
                            gameStep.stopCursors();
                            gameStep.infoText.destroy();
                        }, 2000);
                    }
                }

            }
        };         
    },

    orbExit: function(orb, exitPoint,gameStep){
        console.log("Exiting:", orb.orbKind, exitPoint.color);
    },
    // ------ Interface controls -----------------------------------

    stopCursors: function(){
        this.cursorMoving = false;
        this.playButton.loadTexture("playButton");
        for (var i = 0; i < this.beams.length; i++) {
            var beam = this.beams[i];
            beam.stopCursor();
        };

    },

    toggleCursors: function(){
        if(this.cursorMoving){
            this.stopCursors();
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

    onBeamCursorMoved: function(beam,gameStep){
        gameStep.orbCollisionTest();
    },

    onBeamReset: function(beam){
        if(beam.targetCursor.carriedOrb){
            beam.targetCursor.carriedOrb.destroy();
            beam.targetCursor.carriedOrb = null;
        }
        this.orbGroup.removeAll(true, true);
    },

    onBeamCursorOveringInstruction: function(beam, x, y, instructionElement, gameStep){
        if (typeof gameStep === 'undefined') { gameStep = this; }
        //console.log("onBeamCursorOveringInstruction",instructionElement, beam.beamColor);
        if(instructionElement == "red_in"){
            var orb = gameStep.add.sprite(gameStep.redInPoint.x, gameStep.redInPoint.y, "orb");    
            orb.orbKind = "orb";
            orb.anchor.set(0.5);
            orb.attachedToCursor = null;
            gameStep.orbGroup.add(orb);
        }
        if(instructionElement == "in"){
            var orb = gameStep.add.sprite(gameStep.inPoint.x, gameStep.inPoint.y, "orb2");    
            orb.orbKind = "orb2";
            orb.anchor.set(0.5);
            orb.attachedToCursor = null;
            gameStep.orbGroup.add(orb);
        }
        if(instructionElement == "exit"){
            for (var j = 0; j < gameStep.orbGroup.children.length; j++) {
                var orb = gameStep.orbGroup.children[j];
                var d = Math.abs(orb.x - gameStep.outPoint.x) + Math.abs(orb.y - gameStep.outPoint.y);
                if(d < 20 ){
                    gameStep.orbExit(orb, gameStep.outPoint, gameStep);
                    orb.destroy();  
                }
            }
        }
        if(instructionElement == "red_exit"){
            for (var j = 0; j < gameStep.orbGroup.children.length; j++) {
                var orb = gameStep.orbGroup.children[j];
                var d = Math.abs(orb.x - gameStep.redOutPoint.x) + Math.abs(orb.y - gameStep.redOutPoint.y);
                if(d < 20 ){
                    gameStep.orbExit(orb, gameStep.redOutPoint, gameStep);
                    orb.destroy();  
                }
            }
        }
        if( (instructionElement == "grabdrop" && beam.beamColor == "blue") || (instructionElement == "red_grabdrop" && beam.beamColor == "red") ){
            var droppingDone = false;
            if(beam.targetCursor.children.length > 0){
                // Dropping orb associated with this.beam cursor
                var orb = beam.targetCursor.getChildAt(0)
                beam.targetCursor.removeChild(orb);
                beam.targetCursor.carriedOrb = null;
                //We put back the orb in the orbs group (it was removed when attached as a sprite child)
                gameStep.orbGroup.add(orb);
                orb.x = x;
                orb.y = y;
                droppingDone = true;
            }        
            if(!droppingDone){
                // Grabing any orb below a cursor
                for (var j = 0; j < gameStep.orbGroup.children.length; j++) {
                    var orb = gameStep.orbGroup.children[j];
                    var d = Math.abs(orb.x - x) + Math.abs(orb.y - y);
                    if(d < 20 ){
                        orb.attachedToCursor = beam.targetCursor;
                        beam.targetCursor.carriedOrb = orb;
                        beam.targetCursor.addChild(orb);
                        orb.x = 0;
                        orb.y = 0;
                    }
                }
            }    
        }
    },

    onBeamTraced: function(beam, gameStep){
        return
        // DEBUG quick tests
        var orb = gameStep.add.sprite(gameStep.redInPoint.x, gameStep.redInPoint.y, "orb");    
        orb.orbKind = "orb";
        orb.anchor.set(0.5);
        orb.attachedToCursor = null;
        gameStep.orbGroup.add(orb);
        orb = gameStep.add.sprite(gameStep.inPoint.x, gameStep.inPoint.y, "orb2");    
        orb.orbKind = "orb";
        orb.anchor.set(0.5);
        orb.attachedToCursor = null;
        gameStep.orbGroup.add(orb);
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
