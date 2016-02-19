/*

Recipes are groups of actions that can triggered via a sensor, schedule, etc.
eg: A recipe might simply be turning off x and y lights and setting z light to 50% brightness.
It could also be more complex, eg: turn off all lights except one, close blinds if after sunset,
then turn off remaining light 5 minutes later.

Individual actions within recipes are defined in tasks.js

*/
var eventEmitter;
var tasks = require("./tasks");
var state = require("./state");

exports.initialize = function(emitter){
  eventEmitter = emitter;

};

exports.home = {};
exports.kitchen = {};
exports.livingRoom = {};
exports.bathroom = {};
exports.hallway = {};
exports.bedroom = {};

exports.kitchen.sensorHandler = function(source, action,args){

  switch(action){
    case "motion-started":              // Turn on lights
      tasks.kitchen.lightsToggle(true);
    break;

    case "motion-stopped":              // Turn off lights
      tasks.kitchen.lightsToggle(false);
    break;

    case "north-button-pressed":        // Work mode toggle
      tasks.home.kitchenWorkMode();
    break;


    case "south-button-double-pressed": // Toggle manual mode
      tasks.home.kitchenManualMode();
    break;


    case "south-button-pressed":        // Lights toggle
      tasks.kitchen.lightsToggle();
    break;
  }
};

exports.livingRoom.sensorHandler = function(source, action,args){

  switch(source){
    case "couch":
    {
      switch(action){

      }
    }
    break;

    case "desk":
    break;

    case "tv":
    break;
  }
  console.log("LivingRoom event");

};

exports.bedroom.sensorHandler = function(source, action,args){

  console.log("Bedroom event");

};

exports.bathroom.sensorHandler = function(source, action,args){

  console.log("Bedroom event");

};
