var hue = require('node-hue-api');
var _ = require('underscore');
var request = require('request');


var lightState = hue.lightState;

var host = "10.0.0.4",
    username = "newdeveloper",
    api = new hue.HueApi(host, username);

var displayResults = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

// Array.sort(function(a,b){
//   // Turn your strings into dates, and then subtract them
//   // to get a value that is either negative, positive, or zero.
//   return new Date(b.date) - new Date(a.date);
// });


exports.setScene = function(id){
    api.activateScene(id).then(displayResults).done();
}


exports.latestScene = function(callback){
    console.log("Getting list of latest scenes:");
    api.scenes().then(function(result){
        
        var sortedResult = _.sortBy(result,'lastupdated').reverse();
        var latestScene;
        
        for (var index = 0; index < sortedResult.length; index++) {
            var element = sortedResult[index];
            if(element.lastupdated != null){
                latestScene = element;
                break;
            }
        }   
        callback(latestScene);
    }).done();
}

exports.getLightPowerState = function(light) {
  //Returns bool
};

// [light] is a light identifier or array of light identifiers
// [brightness] is a value between 0 (off) and 100
// [colorTemperature] is either a kelvin value between 2000 and 6500, or the string "auto" for circidian based color temperature
exports.setLightTemperature = function(light, brightness, colorTemperature) {
  if(light instanceof Array){

  }
};
