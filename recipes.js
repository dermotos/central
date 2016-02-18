/*

Recipes are groups of actions that can triggered via a sensor, schedule, etc.
eg: A recipe might simply be turning off x and y lights and setting z light to 50% brightness.
It could also be more complex, eg: turn off all lights except one, close blinds if after sunset,
then turn off remaining light 5 minutes later.

Individual actions within recipes are defined in tasks.js

*/
var eventEmitter;
var tasks = require("./tasks");

exports.initialize = function(emitter){
  eventEmitter = emitter;

};

exports.home = {};
exports.kitchen = {};
exports.livingRoom = {};
exports.bathroom = {};
exports.hallway = {};
exports.bedroom = {};

exports.kitchen.sensorHandler = function(action,args){

  switch(action){
    case "north-button-pressed":
      console.log("Kitchen press");
      tasks.kitchen.lightsToggle(true);
    break;

    case "north-button-double-pressed":
      console.log("Kitchen double press");
    break;

    case "north-button-long-pressed":
      console.log("Kitchen long press");
    break;
  }
}
