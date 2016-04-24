var hue = require('./hue');
var blinds = require('./blinds');




exports.getLightPowerState = function(light) {
  //Returns bool
};

exports.executeAction = function(action, args){
    if(action.type == "hue-scene"){
        executeScene(action.id);
    }
    else if(action.type == "blind"){
        executeBlindAction(args);
    }
    else{
        console.log("Unspecified action");
    }
}

exports.executeFade = function(group, brightness){
    console.log("Fade lights in " + group + " to " + brightness);
    hue.setBrightness(group,brightness);
}

function executeScene(sceneID){
    console.log("Activating scene with id:" + sceneID);
    hue.setScene(sceneID);
}

function executeBlindAction(args){
    //Arg indices:
    // 0 : room, eg: "lounge", "bedroom",
    // 1 : blind index (0,1 or 2 meaning both 0 and 1)
    // 2 : new state. toggle, open, close, stop
    blinds.setBlindState(args[0],args[1],args[2]);
    
}

function executeCustomAction(actionID, args){
    console.log("Execute a custom action. Action:" + actionID + " args: " + args);
}