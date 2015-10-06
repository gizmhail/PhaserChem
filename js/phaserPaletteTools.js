

/**
 * A palette tool is a sprite (subclass of sprite) from which we can drag instance 
 *  (the palette sprite won't move, a new InstructionElement will be created)
 * @param x, y: position of the palette
 * @param instruction: id of the palette instruction, it is also the image key 
 * @param instructionZone: the background sprite on which instruction instance live (deleted outside of it)
 * @param gameStep: current game step
 * @param displayName(optional): name displayed below the palette sprite and instruction instances. Equal to instruction if not set
 * @param scale (optional): scale for the paeltte tool and created instruction sprites
 * @param textOffset (optional): vertical position of the description text displayed below the sprite
 */
var PaletteTool = function(x, y, instruction, instructionZone, gameStep, displayName, snapSize, textOffset){
    if (typeof displayName === 'undefined') { displayName = instruction; }
    if (typeof snapSize === 'undefined') { snapSize = 32; }
    Phaser.Sprite.call(this, gameStep.game, x, y, instruction);
    this.gameStep = gameStep;
    this.game = gameStep.game;
    this.game.add.existing(this);
    if (typeof textOffset === 'undefined') { textOffset = this.height - 10; }
    this.displayName = displayName;
    this.instructionZone = instructionZone;
    this.instruction = instruction;
    this.textOffset = textOffset;
    this.anchor.set(0.5);
    this.snapSize = snapSize;
    this.inputEnabled = true;
    this.createdInstructions = this.game.add.group();
    this.events.onInputDown.add(this.toolsPaletteClick, this);
    if(displayName && displayName != ""){
        var display = this.gameStep.add.text(0,textOffset,displayName,{fill: "#FFFFFF", font: "13px Arial"});
        display.anchor.set(0.5);
        this.addChild(display);
    }
};
PaletteTool.prototype = Object.create(Phaser.Sprite.prototype);
PaletteTool.prototype.constructor = PaletteTool;

// Click on a palette element: duplicating it and starting a drag
PaletteTool.prototype.toolsPaletteClick = function (){
    this.alpha = 0.5;
    this.game.add.tween(this).to({alpha: 1}, 1000, Phaser.Easing.Quadratic.Out, true);
    var newElementDragged = new InstructionElement(this.x, this.y, this, this.gameStep);
    
    this.game.time.events.add(150, function() {
        newElementDragged.input.startDrag(this.game.input.activePointer);
    }, this);

};

//--------------------------------------------------------------------

var InstructionElement = function(x, y, paletteTool, gameStep){

    Phaser.Sprite.call(this,  gameStep.game, x, y, paletteTool.instruction);
    this.gameStep = gameStep;
    this.game = gameStep.game;
    this.game.add.existing(this);
    paletteTool.createdInstructions.add(this);
    this.instruction = paletteTool.instruction;
    this.paletteTool = paletteTool;
    this.inputEnabled = true;
    this.input.enableDrag(true);
    this.input.enableSnap(paletteTool.snapSize, paletteTool.snapSize, true, true);
    this.anchor.set(0.5);

    this.events.onDragStart.add(this.onInstructionElementDragStart, this);
    this.events.onDragStop.add(this.onInstructionElementDragStop, this);
    this.events.onInputUp.add(this.onInstructionElementInputUp, this);

    //Bug fix: sometimes, dragStop is not properly called, neither onInputUp for the sprite
    // Probably due to us messing with startDrag ;)
    this.game.input.onUp.add(this.onInstructionElementInputUp, this);
    if(paletteTool.displayName && paletteTool.displayName != ""){
        var display = this.gameStep.add.text(0,this.paletteTool.textOffset,paletteTool.displayName,{fill: "#FFFFFF", font: "13px Arial"});
        display.anchor.set(0.5);
        this.addChild(display);
    }
}
InstructionElement.prototype = Object.create(Phaser.Sprite.prototype);
InstructionElement.prototype.constructor = InstructionElement;

// Picking an instruction element
InstructionElement.prototype.onInstructionElementDragStart = function (){
    //console.log("onInstructionElementDragStart");
    this.scale.set(0.8);
    this.alpha = 0.5;
};

// Dropping an instruction element
InstructionElement.prototype.onInstructionElementDragStop = function (){
    //TODO Add tween to restored size/alpha
    //console.log("onInstructionElementDragStop");
    this.alpha = 1;
    if(!Phaser.Rectangle.intersects(this.paletteTool.instructionZone.getBounds(), this.getBounds())){
        this.paletteTool.createdInstructions.remove(this);
        this.destroy();
    }
    if(this.paletteTool.onInstructionPlaced){
        this.paletteTool.onInstructionPlaced(this, this.gameStep);
    }
    //console.log("New",this.x,this.y,this.instruction);
};

InstructionElement.prototype.onInstructionElementInputUp = function(){
    //console.log("onInstructionElementInputUp", this, this.input.isDragged);
    if(this.input.isDragged){
        //console.log("Force drag stop");
        this.input.stopDrag(this.game.input.activePointer);
    }
};

