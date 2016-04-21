var hue = require('./hue');




exports.getLightPowerState = function(light) {
  //Returns bool
};

exports.executeAction = function(action, args){
    if(action.type == "hue-scene"){
        executeScene(action.id);
    }
    else if(action.type == "custom"){
        executeCustomAction(action.id,args);
    }
    else{
        console.log("Unspecified action");
    }
}

exports.executeFade = function(source, args){
    console.log("Fade lights for " + source + " switch, to " + args[0]);
}

function executeScene(sceneID){
    console.log("Activating scene with id:" + sceneID);
    hue.setScene(sceneID);
}

function executeCustomAction(actionID, args){
    console.log("Execute a custom action. Action:" + actionID + " args: " + args);
}