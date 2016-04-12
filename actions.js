var hue = require('node-hue-api');
var lightState = hue.lightState;

var host = "10.0.0.4",
    username = "newdeveloper",
    api = new hue.HueApi(host, username);




exports.getLightPowerState = function(light) {
  //Returns bool
};

exports.executeAction = function(action, args){
    if(action.type == "scene"){
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
    console.log("Execute scene with id:" + sceneID);
}

function executeCustomAction(actionID, args){
    console.log("Execute a custom action. Action:" + actionID + " args: " + args);
}