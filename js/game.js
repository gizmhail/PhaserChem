var gameStep = function(){
    this.characterSprite = null;
    this.instructionZone = null;
    this.toolsPalette = {};
    this.redToolsPalette = {};
    this.tools = ["left","right","up","down","in","grabdrop","exit","sync"];
    this.redTools = ["red_left","red_right","red_up","red_down","red_in","red_grabdrop","red_exit","red_sync"];
    this.blueObjectives = [];
    this.redObjectives = [];
    this.playButton = null;
    this.inPoint = null;
    this.orbGroup = null;
    this.infoText = null;
    this.beams = [];
    this.blueGoalSprites = [];
    this.redGoalSprites = [];
        this.inSync = {'redFreezed':null,'blueFreezed':null};
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
        // Load level design
        this.loadObjectives();

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
 
        // Where the orbs will pop in
        this.inPoint = {'x':32*11,'y':32*12,'color':'blue','key':'grabdrop',"text":"in zone"};
        this.redInPoint = {'x':32*11,'y':32*7,'color':'red','key':'red_grabdrop',"text":"in zone"};
        // Where the orb can be sucked out
        this.outPoint = {'x':32*26,'y':32*12,'color':'blue','key':'grabdrop',"text":"exit zone"};
        this.redOutPoint = {'x':32*26,'y':32*7,'color':'red','key':'red_grabdrop',"text":"exit zone"};
        // We display ghost point to tell the player where the orb will pop in, and where she/he should deliver it
        var hintPoints = [this.inPoint, this.redInPoint, this.outPoint, this.redOutPoint];
        for (var i = 0; i < hintPoints.length; i++) {
            var point = hintPoints[i]
            var ghost = this.add.sprite(point.x, point.y , point.key);
            ghost.alpha = 0.5;
            ghost.anchor.set(0.5);
            var display = this.add.text(0,30,point["text"],{fill: "#FFFFFF", font: "13px Arial"});
            display.anchor.set(0.5);
            ghost.addChild(display);
        };
        //We show the goals
        var displayRedGoal = this.add.text(580,10, " Red goals: ",{fill: "#FFFFFF", font: "13px Arial"});
        for (var i = 0; i < this.redObjectives.length; i++) {
            var targetOrb = this.redObjectives[i];
            var targetOrbSprite = this.add.sprite(650+i*20, 5 ,targetOrb);
            targetOrbSprite.scale.set(0.35);
            targetOrbSprite.alpha = 0.5;
            targetOrbSprite.achieved = false;
            targetOrbSprite.goal = targetOrb;
            this.redGoalSprites.push(targetOrbSprite);
        };
        var displayBlueGoal = this.add.text(580,30, "Blue goals: ",{fill: "#FFFFFF", font: "13px Arial"});
        for (var i = 0; i < this.blueObjectives.length; i++) {
            var targetOrb = this.blueObjectives[i];
            var targetOrbSprite = this.add.sprite(650+i*20, 30 ,targetOrb);
            targetOrbSprite.scale.set(0.35);
            targetOrbSprite.alpha = 0.5;
            targetOrbSprite.achieved = false;
            targetOrbSprite.goal = targetOrb;
            this.blueGoalSprites.push(targetOrbSprite);
        };

        //Orbs
        this.orbGroup = this.add.group();
        //UI
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

        //Debug
        //Initial state (for demo purposes)
        var addInitialStateInstruction = false;
        if(addInitialStateInstruction){
            var ins = null;
            // Red beam
            ins = new InstructionElement(this.redInPoint.x - 2*32, this.redInPoint.y, this.redToolsPalette["red_in"], this);
            ins = new InstructionElement(this.redInPoint.x, this.redInPoint.y, this.redToolsPalette["red_grabdrop"], this);
            ins = new InstructionElement(32*26+2, 32*7, this.redToolsPalette["red_down"], this);
            ins = new InstructionElement(this.outPoint.x, this.outPoint.y, this.redToolsPalette["red_grabdrop"], this);
            ins = new InstructionElement(this.outPoint.x, this.outPoint.y + 1*32, this.redToolsPalette["red_left"], this);
            ins = new InstructionElement(beam2.startPoint.x - 2*32, beam2.startPoint.y + 1*32, this.redToolsPalette["red_up"], this);
            ins = new InstructionElement(beam1.startPoint.x - 2*32, beam1.startPoint.y, this.redToolsPalette["red_right"], this);
            // Blue beam
            ins = new InstructionElement(this.outPoint.x + 2*32, this.outPoint.y, this.toolsPalette["up"], this);
            ins = new InstructionElement(this.outPoint.x + 2*32, this.outPoint.y - 5*32, this.toolsPalette["exit"], this);
            ins = new InstructionElement(this.outPoint.x + 2*32, this.outPoint.y - 6*32, this.toolsPalette["left"], this);
            ins = new InstructionElement(beam1.startPoint.x - 1*32, beam1.startPoint.y - 1*32, this.toolsPalette["down"], this);
            ins = new InstructionElement(beam2.startPoint.x - 1*32, beam2.startPoint.y , this.toolsPalette["right"], this);
            //We retrace the beams
            beam1.traceBeam();
            beam2.traceBeam();
        }
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

    // -------- Level design -----------

    loadObjectives: function(){
        this.blueObjectives = ["orb","orb"];
        this.redObjectives = ["orb2","orb2"];
    },

    // -------- Game logic -----------
    resetTry: function(gameStep){
        gameStep.stopCursors();
        if(gameStep.infoText){
            gameStep.infoText.destroy();
        }
        //Dropping orbs
        for (var i = 0; i < gameStep.beams.length; i++) {
            var beam = gameStep.beams[i];
            if(beam.targetCursor.carriedOrb){
                beam.targetCursor.carriedOrb.destroy();
                beam.targetCursor.carriedOrb = null;
            }
        }; 
        gameStep.orbGroup.removeAll(true, true);
        //Reset goals state
        for (var i = 0; i < gameStep.blueGoalSprites.length; i++) {
            var goalSprite = gameStep.blueGoalSprites[i]
            goalSprite.alpha = 0.5;
            goalSprite.achieved = false;
        };
        for (var i = 0; i < gameStep.redGoalSprites.length; i++) {
            var goalSprite = gameStep.redGoalSprites[i]
            goalSprite.alpha = 0.5;
            goalSprite.achieved = false;
        };

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
                        this.tryFailure("Collision !!!!");
                    }
                }

            }
        };         
    },

    tryFailure: function(text){
        var gameStep = this;
        this.infoText = this.add.text(200, 10, text, {fill: "#FFFFFF", font: "13px Arial"});
        this.game.paused = true;
        window.setTimeout(function(){
            gameStep.game.paused = false;
            gameStep.resetTry(gameStep);
        }, 2000);
    },

    trySuccess: function(){
        var gameStep = this;
        this.infoText = this.add.text(400, 100, "CONGRATULATIONS !!!", {fill: "#FF6600", font: "43px Arial"});
        this.game.paused = true;
        window.setTimeout(function(){
            gameStep.game.paused = false;
            gameStep.resetTry(gameStep);
        }, 10000);
    },

    orbExit: function(orb, exitPoint, gameStep){
        console.log("Exiting:", orb.orbKind, exitPoint.color);
        var impactedGoals = this.blueGoalSprites;
        var otherGoals = this.redGoalSprites;
        if(exitPoint.color == 'red'){
            impactedGoals = this.redGoalSprites;
            otherGoals = this.blueGoalSprites;
        }
        for (var i = 0; i < impactedGoals.length; i++) {
            var goal = impactedGoals[i];
            if(goal.achieved){
                //Goal already ok, we check the next one :)
                continue;
            }
            if(goal.goal == orb.orbKind){
                // We delievered the proper orb !!
                goal.alpha = 1;
                goal.achieved = true;
                if(i == (impactedGoals.length - 1)){
                    // All this goal line is full (congrats !)
                    if(otherGoals.length == 0){
                        gameStep.trySuccess();
                    }else{
                        var otherLastGoal = otherGoals[otherGoals.length -1];
                        if(otherLastGoal.achieved = true){
                            gameStep.trySuccess();
                        }                        
                    }
                }
                break;
            }else{
                this.tryFailure("Bad orb :'( ("+orb.orbKind+") instead of "+goal.goal);
            }
        };
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
            this.resetTry(this);
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
        if(instructionElement == "sync"){
            if(gameStep.inSync.redFreezed){
                console.log("Unfreezing beam "+gameStep.inSync.redFreezed.beamColor);
                gameStep.inSync.redFreezed.freezedForSync = false;
                //We skip the current instruction...as it is a freeze ;)
                Beam.prototype.moveCursor.call(gameStep.inSync.redFreezed, null, true);
                gameStep.inSync.redFreezed = null;
            }else{
                gameStep.inSync.blueFreezed = beam;
                console.log("Freezing beam "+gameStep.inSync.blueFreezed.beamColor);
                gameStep.inSync.blueFreezed.freezedForSync = true;
            }

        }
        if(instructionElement == "red_sync"){
            if(gameStep.inSync.blueFreezed){
                console.log("Unfreezing beam "+gameStep.inSync.blueFreezed.beamColor);
                gameStep.inSync.blueFreezed.freezedForSync = false;
                //We skip the current instruction...as it is a freeze ;)
                Beam.prototype.moveCursor.call(gameStep.inSync.blueFreezed, null, true);
                gameStep.inSync.blueFreezed = null;
            }else{
                gameStep.inSync.redFreezed = beam;
                console.log("Freezing beam "+gameStep.inSync.redFreezed.beamColor);
                gameStep.inSync.redFreezed.freezedForSync = true;
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
