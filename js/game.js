var InstructionElement = function(x, y, paletteTool, gameStep){
    Phaser.Sprite.call(this,  gameStep.game, x, y, paletteTool.instruction);
    this.gameStep = gameStep;
    this.game = gameStep.game;
    this.game.add.existing(this);
    this.instruction = paletteTool.instruction;
    this.paletteTool = paletteTool;
    this.inputEnabled = true;
    this.input.enableDrag(true);
    this.input.enableSnap(32, 32, true, true);
    this.scale.set(0.25);
    this.anchor.set(0.5);

    this.events.onDragStart.add(this.onInstructionElementDragStart, this);
    this.events.onDragStop.add(this.onInstructionElementDragStop, this);

    this.game.time.events.add(150, function() {
        this.input.startDrag(this.game.input.activePointer);
    }, this);
}
InstructionElement.prototype = Object.create(Phaser.Sprite.prototype);
InstructionElement.prototype.constructor = InstructionElement;

// Picking an instruction element
InstructionElement.prototype.onInstructionElementDragStart = function (){
    this.scale.set(0.8*0.25);
    this.alpha = 0.5;
};

// Dropping an instruction element
InstructionElement.prototype.onInstructionElementDragStop = function (){
    //TODO Add tween to restored size/alpha
    this.scale.set(0.25);
    this.alpha = 1;
    if(!Phaser.Rectangle.intersects(this.paletteTool.instructionZone.getBounds(), this.getBounds())){
        this.paletteTool.createdInstructions.remove(this);
        this.destroy();
    }
    if(this.paletteTool.onInstructionPlaced){
        this.paletteTool.onInstructionPlaced(this.gameStep);
    }
};

//--------------------------------------------------------------------

var PaletteTool = function(x, y, instruction, instructionZone, gameStep){
    Phaser.Sprite.call(this, gameStep.game, x, y, instruction);
    this.gameStep = gameStep;
    this.game = gameStep.game;
    this.game.add.existing(this);
    this.instructionZone = instructionZone;
    this.instruction = instruction;
    this.scale.set(0.25);
    this.anchor.set(0.5);
    this.inputEnabled = true;
    this.createdInstructions = this.game.add.group();
    this.events.onInputDown.add(this.toolsPaletteClick, this);
};
PaletteTool.prototype = Object.create(Phaser.Sprite.prototype);
PaletteTool.prototype.constructor = PaletteTool;

// Click on a palette element: duplicating it and starting a drag
PaletteTool.prototype.toolsPaletteClick = function (){
    this.alpha = 0.5;
    this.game.add.tween(this).to({alpha: 1}, 1000, Phaser.Easing.Quadratic.Out, true);
    var newElementDragged = new InstructionElement(this.x, this.y, this, this.gameStep);
    this.createdInstructions.add(newElementDragged);
    this.game.time.events.add(10, function() {
        newElementDragged.input.startDrag(this.game.input.activePointer);
    }, this);
};

//--------------------------------------------------------------------


var gameStep = function(){
    this.characterSprite = null;
    this.instructionZone = null;
    this.toolsPalette = {};
    this.startPoint = null;
    this.tools = ["left","right","up","down"];
    this.beamGroup = null;
    this.targetCursor = null;
    this.cursorMoving = false;
    this.playButton = null;
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
    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        //this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        this.instructionZone = this.add.tileSprite(50, 50, 1024, 700, 'background');
        for (var i = 0; i < this.tools.length; i++) {
            var toolName = this.tools[i];
            this.toolsPalette[toolName] = new PaletteTool(1100, 100+i*50, toolName, this.instructionZone, this);
            this.toolsPalette[toolName].onInstructionPlaced = this.traceBeam;
        };
        this.startPoint = this.add.sprite(322, 224,'enter');
        this.targetCursor = this.add.sprite(322, 224,'target');
        this.startPoint.anchor.set(0.5);
        this.targetCursor.anchor.set(0.5);
        this.targetCursor.scale.set(2);
        this.startPoint.scale.set(0.25);
        this.beamGroup = this.add.group();
        this.traceBeam(this);
        this.playButton = game.add.button(400, 10, 'playButton', this.playCursor, this);
        this.playButton.scale.set(0.8);
    },
    // Called for each refresh
    update: function (){
   
    },
    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
        this.game.debug.spriteBounds(this.targetCursor, '#FF6600', false);
        return;
        this.beamGroup.forEachAlive(function(beam){
            this.game.debug.spriteBounds(beam);
        }, this);
        this.game.debug.spriteBounds(this.startPoint, '#FF6600', false);

    },
    
    // --------------------------------------
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
        //We reset the beam
        var xOffset = 0;//32/2;
        var yOffset = 0;
        gameStep.beamGroup.removeAll(true, true);
        var maxX = gameStep.instructionZone.x + gameStep.instructionZone.getBounds().width;
        var maxY = gameStep.instructionZone.y + gameStep.instructionZone.getBounds().height;
        var startX = gameStep.startPoint.x + xOffset;
        var startY = gameStep.startPoint.y;
        var startDirection = "right";
        var direction = "right";
        var x = startX;
        var y = startY;
        var beams = 0;//Watchdog
        var previousBeam = gameStep.startPoint;
        while(x > 0 && y > 0 && x < maxX && y < maxY && beams < 200){
            beams++;
            //2 - determine if an instruction might change beam direction
            var previousDirection = direction;
            for (var toolName in gameStep.toolsPalette) {
                var paletteTool = gameStep.toolsPalette[toolName];
                for (var i = 0; i < paletteTool.createdInstructions.children.length; i++) {
                    var createdInstruction = paletteTool.createdInstructions.children[i];
                    var d = Math.abs(createdInstruction.x - x - xOffset) + Math.abs(createdInstruction.y - y - yOffset);
                    if(d < 20 ){
                        //console.log("Beam touches instruction: ", d,createdInstruction);
                        direction = createdInstruction.instruction;
                    }
                };
            };
            //1 - check that there is no beam at this position (and accept it in some cases - crossing, ....)
            //TODO
            var sameBeam = null;
            gameStep.beamGroup.forEachAlive(function(beam){
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
            var beamKind = "beam"+direction.charAt(0).toUpperCase() + direction.slice(1);
            var beamPart = gameStep.add.sprite(x, y, beamKind);
            beamPart.anchor.set(0.5);
            beamPart.direction = direction;
            gameStep.beamGroup.add(beamPart);
            previousBeam.nextBeam = beamPart;
            previousBeam = beamPart;
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
        gameStep.world.sendToBack(gameStep.beamGroup);
        gameStep.world.sendToBack(gameStep.instructionZone);
    }
};
