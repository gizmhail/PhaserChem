var level1 = function(){
    gameStep.call(this);
}
level1.prototype = Object.create(gameStep.prototype);
level1.prototype.constructor = level1;

level1.prototype.loadObjectives = function(){
    this.redObjectives = ["orb","orb"];
    this.blueObjectives = [];
};
// -------------------
var level2 = function(){
    gameStep.call(this);
}
level2.prototype = Object.create(gameStep.prototype);
level2.prototype.constructor = level2;

level2.prototype.loadObjectives = function(){
    this.redObjectives = ["orb2","orb2"];
    this.blueObjectives = ["orb","orb"];
};
// -------------------
var level3 = function(){
    gameStep.call(this);
}
level3.prototype = Object.create(gameStep.prototype);
level3.prototype.constructor = level3;

level3.prototype.loadObjectives = function(){
    this.redObjectives = ["orb2","orb"];
    this.blueObjectives = ["orb","orb2"];
};
