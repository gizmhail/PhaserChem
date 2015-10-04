/**
 * @param toolsPalette: the palette of tools that can interact with the beam
 */
var Beam = function(x, y, instructionZone, toolsPalette, orbGroup, cursorKey, startingPointKey, beamKeyPrefix, gameStep, snapSize){
    if (typeof snapSize === 'undefined') { snapSize = 32; }
    this.snapSize = snapSize;
    Phaser.Group.call(this, gameStep.game);
    this.gameStep = gameStep;
    this.game = gameStep.game;
    this.startPoint = this.gameStep.add.sprite(x, y, startingPointKey);
    this.startPoint.anchor.set(0.5);
    this.targetCursor = this.gameStep.add.sprite(x, y, cursorKey);
    this.targetCursor.anchor.set(0.5);
    this.beamKeyPrefix = beamKeyPrefix;
    this.instructionZone = instructionZone;
    this.toolsPalette = toolsPalette;
    this.orbGroup = orbGroup;
    this.cursorMoving = false;
    //TODO Remove once sprite have proper sizes
};
Beam.prototype = Object.create(Phaser.Group.prototype);
Beam.prototype.constructor = Beam;

Beam.prototype.beamKeyForDirection = function(direction, isSecondHalfOfBeam){
    if (typeof isSecondHalfOfBeam === 'undefined') { isSecondHalfOfBeam = false; }
    if(isSecondHalfOfBeam){
        var secondHalfBeamMapping = {'right':'left','left':'right','up':'down','down':'up',}
        direction = secondHalfBeamMapping[direction];
    }
    return this.beamKeyPrefix+direction.charAt(0).toUpperCase() + direction.slice(1)
};

Beam.prototype.traceBeam = function() {
    var instructionZone = this.instructionZone;
    var startPoint = this.startPoint;
    var toolsPalette = this.toolsPalette;
    //We reset the beam
    this.removeAll(true, true);
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
        //1 - determine if an instruction might change beam direction
        var previousDirection = direction;
        for (var toolName in toolsPalette) {
            var paletteTool = toolsPalette[toolName];
            for (var i = 0; i < paletteTool.createdInstructions.children.length; i++) {
                var createdInstruction = paletteTool.createdInstructions.children[i];
                var d = Math.abs(createdInstruction.x - x) + Math.abs(createdInstruction.y - y);
                if(d < 20 ){
                    //console.log("Beam touches instruction: ", d,createdInstruction);
                    if(["left","right","up","down","red_left","red_right","red_up","red_down"].indexOf(createdInstruction.instruction)!=-1){
                        direction = createdInstruction.instruction;
                        direction = direction.replace("red_","");
                    }
                }else {
                    //console.log(x,y,d);
                }
            };
        };
        //2 - check that there is no beam at this position (and accept it in some cases - crossing, ....)
        var sameBeam = null;
        this.forEachAlive(function(beam){
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
        var beamKind = this.beamKeyForDirection(direction);
        var beamPart = this.gameStep.add.sprite(x, y, beamKind);
        beamPart.anchor.set(0.5);
        beamPart.direction = direction;
        this.add(beamPart);
        previousBeam.nextBeam = beamPart;
        previousBeam = beamPart;
        if(previousDirection == direction && previousBeam){
            var secondHalfBeamKind = this.beamKeyForDirection(direction, true);
            var beamSecondHalf = this.gameStep.add.sprite(0, 0, secondHalfBeamKind);
            beamSecondHalf.anchor.set(0.5);
            previousBeam.addChild(beamSecondHalf);
        }
        //4 - Move next position
        if(direction == "right"){
            x += this.snapSize;
        }
        if(direction == "left"){
            x -= this.snapSize;
        }
        if(direction == "up"){
            y -= this.snapSize;
        }
        if(direction == "down"){
            y += this.snapSize;
        }
    }
    this.gameStep.world.sendToBack(this);
    this.gameStep.world.sendToBack(instructionZone);
};

Beam.prototype.moveCursor = function(previousBeam){
    var cursorMoveTime = 200;
    var x = this.targetCursor.x;
    var y = this.targetCursor.y;
    //Actions
    for (var toolName in this.toolsPalette) {
            var paletteTool = this.toolsPalette[toolName];
            for (var i = 0; i < paletteTool.createdInstructions.children.length; i++) {
                var createdInstruction = paletteTool.createdInstructions.children[i];
                var d = Math.abs(createdInstruction.x - x) + Math.abs(createdInstruction.y - y);
                if(d < 20 ){
                    console.log("Action:", createdInstruction.instruction);
                    if(this.onBeamCursorOveringInstruction){
                        this.onBeamCursorOveringInstruction(this, x, y, createdInstruction.instruction, this.gameStep);
                    }else{
                        console.log("No callback for onBeamCursorOveringInstruction");
                    }
                }
            };
        };

    //Move cursor
    if (typeof previousBeam === 'undefined') { 
        this.forEachAlive(function(beam){
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
    this.targetCursor.beamTween = this.gameStep.add.tween(this.targetCursor);
    this.targetCursor.beamTween.to({'x':previousBeam.nextBeam.x,'y':previousBeam.nextBeam.y}, cursorMoveTime);    
    this.targetCursor.beamTween.onComplete.add(function(){
        //console.log('Done tween');
        this.moveCursor(previousBeam.nextBeam);
    }, this);
    this.targetCursor.beamTween.start();
};

Beam.prototype.playCursor = function(){
    this.cursorMoving = true;
    this.moveCursor(this.startPoint);
};

Beam.prototype.stopCursor = function(){
    this.cursorMoving = false;
    if(this.targetCursor.beamTween){
        this.targetCursor.beamTween.stop();
    }
    this.targetCursor.x = this.startPoint.x;
    this.targetCursor.y = this.startPoint.y;
    //console.log("Reset:", this.startPoint.x, this.startPoint.y);
    //Reset all orb
    //Orbs attached to cursor need to be detached
    this.targetCursor.removeChildren();
    if(this.onBeamReset){
        this.onBeamReset(this);
    }
};

