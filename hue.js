var hue = require('node-hue-api');
var _ = require('underscore');
var request = require('request');


var lightState = hue.lightState;

var host = "10.0.0.4",
    username = "newdeveloper",
    api = new hue.HueApi(host, username);

var displayResults = function (result) {
    console.log(JSON.stringify(result, null, 2));
};

//Valid values for group are "lounge" and "bedroom"
exports.setBrightness = function (group,brightness){
    //TODO: Move to a config file
    if(group == "lounge" || group == "bedroom"){
        var brightnessState = lightState.create().brightness(brightness).transition(300);
        api.setGroupLightState(group == "lounge" ? 1 : 2,brightnessState);
    }
    else{
        console.log("Fader: Unknown light group '" + group + "' specified");
    } 
}


exports.setScene = function (id) {
    api.activateScene(id).then(displayResults).done();
}

exports.alert = function () {
    var alertState = lightState.create().shortAlert();
    api.setGroupLightState(0, alertState).then(displayResults).done();
}


exports.latestScene = function (callback) {
    console.log("Getting list of latest scenes:");
    api.scenes().then(function (result) {

        var sortedResult = _.sortBy(result, 'lastupdated').reverse();
        var latestScene;

        for (var index = 0; index < sortedResult.length; index++) {
            var element = sortedResult[index];
            if (element.lastupdated != null) {
                latestScene = element;
                break;
            }
        }
        callback(latestScene);
    }).done();
}

exports.setLightPowerState = function(lights,newState){
    lights = (lights instanceof Array) ? lights : [lights];
    var newPowerState = lightState.create().off();
    for(var x = 0; x < lights.length; x++){
        api.setLightState(lights[0],newPowerState).done();
    }
}


exports.getLightPowerState = function (lightIndex,callback) {
    //Returns bool
    var index = parseInt(lightIndex);
    api.lightStatus(index).then(function(status){
        console.log(JSON.stringify(status,null,2));
        if(callback){
            callback(status.state.on);
        }
    }).done();
};

// [light] is a light identifier or array of light identifiers
// [brightness] is a value between 0 (off) and 100
// [colorTemperature] is either a kelvin value between 2000 and 6500, or the string "auto" for circidian based color temperature
exports.setLightTemperature = function (light, brightness, colorTemperature) {
    if (light instanceof Array) {

    }
};
