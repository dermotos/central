var hue = require('node-hue-api');


var lightState = hue.lightState;

var host = "10.0.0.4",
    username = "newdeveloper",
    api = new hue.HueApi(host, username);




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
