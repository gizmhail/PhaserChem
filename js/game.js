

var gameStep = function(){
    this.characterSprite = null;
    this.instructionZone = null;
    this.toolsPalette = {};
    this.startPoint = null;
    this.tools = ["left","right","up","down","in","grabdrop"];
    this.beamGroup = null;
    this.targetCursor = null;
    this.cursorMoving = false;
    this.playButton = null;
    this.inPoint = null;
    this.orbGroup = null;
};

gameStep.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        game.load.image('background', 'assets/grid.png');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i]
            game.load.image(toolName, 'assets/'+toolName+'.png');
        };
        game.load.image('enter', 'assets/enter.png');
        game.load.image('beamUp', 'assets/beamUp2.png');
        game.load.image('beamRight', 'assets/beamRight2.png');
        game.load.image('beamDown', 'assets/beamDown2.png');
        game.load.image('beamLeft', 'assets/beamLeft2.png');
        game.load.image('target', 'assets/target.png');
        game.load.image('playButton', 'assets/play.png');
        game.load.image('pauseButton', 'assets/pause.png');
        game.load.image('in', 'assets/in.png');
        game.load.image('grabdrop', 'assets/grabdrop.png');
        game.load.image('orb', 'assets/Flameless2.png');

    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        //this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        this.instructionZone = this.add.tileSprite(50, 50, 1024, 700, 'background');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i];
            this.toolsPalette[toolName] = new PaletteTool(1100, 100+i*60, toolName, this.instructionZone, this);
            this.toolsPalette[toolName].onInstructionPlaced = this.traceBeam;
        };
        this.inPoint = {'x':32*15+2,'y':32*7};
        this.startPoint = this.add.sprite(32*10+2, 32*7,'enter');
        this.targetCursor = this.add.sprite(322, 224,'target');
        this.startPoint.anchor.set(0.5);
        this.targetCursor.anchor.set(0.5);
        this.targetCursor.scale.set(2);
        this.startPoint.scale.set(0.25);
        this.beamGroup = this.add.group();
        this.orbGroup = this.add.group();
        this.traceBeam(this);
        this.playButton = game.add.button(400, 10, 'playButton', this.playCursor, this);
        this.playButton.scale.set(0.8);
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
    
    // --------------------------------------
    //TODO: Move the 3 methods below in a beam class, to easily support multiple beams
    
    playCursor: function(){
        if(this.cursorMoving){
            this.cursorMoving = false;
            if(this.targetCursor.beamTween){
                this.targetCursor.beamTween.stop();
            }
            this.playButton.loadTexture("playButton");
            this.targetCursor.x = this.startPoint.x;
            this.targetCursor.y = this.startPoint.y;
            console.log("Reset:", this.startPoint.x, this.startPoint.y);
            //Reset all orb
            //Orbs attached to cursor need to be detached
            this.targetCursor.removeChildren();
            this.orbGroup.removeAll(true, true);
            return;
        }
        this.playButton.loadTexture("pauseButton");
        this.cursorMoving = true;
        this.moveCursor(this, this.startPoint);
    },

    moveCursor: function(gameStep, previousBeam){
        var cursorMoveTime = 200;
        if (typeof gameStep === 'undefined') { gameStep = this; }
        var x = this.targetCursor.x;
        var y = this.targetCursor.y;
        //Actions
        for (var toolName in gameStep.toolsPalette) {
                var paletteTool = gameStep.toolsPalette[toolName];
                for (var i = 0; i < paletteTool.createdInstructions.children.length; i++) {
                    var createdInstruction = paletteTool.createdInstructions.children[i];
                    var d = Math.abs(createdInstruction.x - x) + Math.abs(createdInstruction.y - y);
                    if(d < 20 ){
                        console.log("Action:", createdInstruction.instruction);
                        if(createdInstruction.instruction == "in"){
                            var orb = gameStep.add.sprite(gameStep.inPoint.x,gameStep.inPoint.y,"orb");    
                            orb.anchor.set(0.5);
                            orb.attachedToCursor = null;
                            gameStep.orbGroup.add(orb);
                        }
                        if(createdInstruction.instruction == "grabdrop"){
                            if(this.targetCursor.children.length > 0){
                                var orb = this.targetCursor.getChildAt(0)
                                gameStep.targetCursor.removeChild(orb);
                                gameStep.orbGroup.add(orb);
                                orb.x = x;
                                orb.y = y;
                                orb.scale.set(1);
                            }else  {
                                for (var j = 0; j < gameStep.orbGroup.children.length; j++) {
                                    var orb = gameStep.orbGroup.children[j];
                                    var d = Math.abs(orb.x - x) + Math.abs(orb.y - y);
                                    if(d < 20 ){
                                        orb.attachedToCursor = this.targetCursor;
                                        this.targetCursor.addChild(orb);
                                        orb.scale.set(0.5);
                                        orb.x = 0;
                                        orb.y = 0;
                                    }
                                }
                            }    
                        }
                    }
                };
            };

        //Move cursor
        if (typeof previousBeam === 'undefined') { 
            gameStep.beamGroup.forEachAlive(function(beam){
                if(beam.x == x && beam.y == y){
                    previousBeam = beam;
                }
            }, this);
        }

        if(!previousBeam){
            console.log("Unable to find beam for cursor");
            return;
        }
        if(!previousBeam.nextBeam){
            console.log('no next');
            return;
        }
        this.targetCursor.beamTween = gameStep.add.tween(this.targetCursor);
        this.targetCursor.beamTween.to({'x':previousBeam.nextBeam.x,'y':previousBeam.nextBeam.y}, cursorMoveTime);    
        this.targetCursor.beamTween.onComplete.add(function(){
            //console.log('Done tween');
            gameStep.moveCursor(gameStep, previousBeam.nextBeam);
        }, this);
        this.targetCursor.beamTween.start();

    },

    traceBeam: function(gameStep) {
        if (typeof gameStep === 'undefined') { gameStep = this; }
        var beamKeyPrefix = "beam";
        var beamGroup = gameStep.beamGroup;
        var instructionZone = gameStep.instructionZone;
        var startPoint = gameStep.startPoint;
        var toolsPalette = gameStep.toolsPalette;
        var secondHaldBeamMapping = {'right':'left','left':'right','up':'down','down':'up',}
        //We reset the beam
        beamGroup.removeAll(true, true);
        var maxX = instructionZone.x + instructionZone.getBounds().width;
        var maxY = instructionZone.y + instructionZone.getBounds().height;
        var startX = startPoint.x;
        var startY = startPoint.y;
        var startDirection = "right";
        var direction = "right";
        var x = startX;
        var y = startY;
        var beams = 0;//Watchdog
        var previousBeam = startPoint;
        while(x > 0 && y > 0 && x < maxX && y < maxY && beams < 200){
            beams++;
            //2 - determine if an instruction might change beam direction
            var previousDirection = direction;
            for (var toolName in toolsPalette) {
                var paletteTool = toolsPalette[toolName];
                for (var i = 0; i < paletteTool.createdInstructions.children.length; i++) {
                    var createdInstruction = paletteTool.createdInstructions.children[i];
                    var d = Math.abs(createdInstruction.x - x) + Math.abs(createdInstruction.y - y);
                    if(d < 20 ){
                        //console.log("Beam touches instruction: ", d,createdInstruction);
                        if(["left","right","up","down"].indexOf(createdInstruction.instruction)!=-1){
                        direction = createdInstruction.instruction;
                        }
                    }
                };
            };
            //1 - check that there is no beam at this position (and accept it in some cases - crossing, ....)
            //TODO
            var sameBeam = null;
            beamGroup.forEachAlive(function(beam){
                if(beam.direction == direction && beam.x == x && beam.y == y){
                    //We are looping :)
                    sameBeam = beam;
                    console.log("Looping !!");
                }
            }, this);
            if(sameBeam){
                previousBeam.nextBeam = sameBeam;
                break;
            }
            //3 - add beam sprite
            var beamKind = beamKeyPrefix+direction.charAt(0).toUpperCase() + direction.slice(1);
            var beamPart = gameStep.add.sprite(x, y, beamKind);
            beamPart.anchor.set(0.5);
            beamPart.direction = direction;
            beamGroup.add(beamPart);
            previousBeam.nextBeam = beamPart;
            previousBeam = beamPart;
            if(previousDirection == direction && previousBeam){
                var secondHalfKey = secondHaldBeamMapping[direction];
                var secondHalfBeamKind = beamKeyPrefix+secondHalfKey.charAt(0).toUpperCase() + secondHalfKey.slice(1);
                var beamSecondHalf = gameStep.add.sprite(0, 0, secondHalfBeamKind);
                beamSecondHalf.anchor.set(0.5);
                previousBeam.addChild(beamSecondHalf);
            }
            //4 - Move next position
            if(direction == "right"){
                x += 32;
            }
            if(direction == "left"){
                x -= 32;
            }
            if(direction == "up"){
                y -= 32;
            }
            if(direction == "down"){
                y += 32;
            }

        }
        gameStep.world.sendToBack(beamGroup);
        gameStep.world.sendToBack(instructionZone);
    }
};
