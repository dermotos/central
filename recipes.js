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
    /* Motion */
    case "motion-started":              // Turn on lights
      tasks.kitchen.lightsToggle(true);
    break;

    case "motion-stopped":              // Turn off lights
      tasks.kitchen.lightsToggle(false);
    break;

    /* North Button */
    case "north-button-pressed":        // Work mode toggle
      tasks.home.kitchenWorkMode();
    break;

    case "north-button-double-pressed":        // Toggle kitchen fan
      console.log("Reserved - Toggle kitchen fan");
    break;

    case "north-button-long-pressed":        // Toggle bathroom fan
      console.log("Reserved - Toggle bathroom fan");
    break;


    /* South Button */

    case "south-button-pressed":        // Lights toggle
      tasks.kitchen.lightsToggle();
    break;

    case "south-button-double-pressed": // Toggle manual mode
      tasks.home.kitchenManualMode();
    break;

    case "south-button-long-pressed":        // Toggle floor fan
      console.log("Reserved - Toggle floor fan");
    break;
  }
};

exports.livingRoom.sensorHandler = function(source, action,args){

  switch(source){
    case "couch":
    {
      switch(action){
        /*
        +--------------------+
        |    o           n   |
        |  o o o      w    e |
        |    o           s   |
        +--------------------+
        */

        /* North Button */
        case "north-button-pressed":        // TV Watching mode on
          exports.livingRoom.lightsTvMode();
        break;

        case "north-button-double-pressed": // Company mode (warm lights, music, etc...)
          console.log("Reserved for 'company' mode.");
        break;

        case "north-button-long-pressed": // Full brightness (including white only bulb)
          exports.livingRoom.lightsFullBrightness();
        break;


        /* East Button */
        case "east-button-pressed":        // Toggle living room blind
          console.log("Reserved for toggling living room blind");
        break;

        case "east-button-double-pressed": // Toggle kitchen manual mode
          exports.home.kitchenWorkMode();
        break;

        case "east-button-long-pressed": // Toggle bedroom blinds
          console.log("Reserved for toggling bedroom belinds");
        break;

        /* South Button */
        case "south-button-pressed":        // Toggle lights (circidian)
          exports.livingRoom.lightsToggle();
        break;

        case "south-button-double-pressed": // Change to temperature fader mode
          console.log("Reserved for temperature fader mode");
        break;

        case "south-button-long-pressed": // Turn off all other house lights
          exports.livingRoom.allOtherLightsOff();
        break;

        /* West Button */
        case "west-button-pressed":        // Reserved
          console.log("Unassigned");
        break;

        case "west-button-double-pressed": // Bedtime mode (whole house)
          console.log("Reserved for bedtime mode");
        break;

        case "west-button-long-pressed": // Toggle bedroom blinds
          console
        break;


        /* East Button */
        case "west-button-pressed":        // Toggle living room blind

        break;

        case "west-button-double-pressed": // Toggle kitchen manual mode

        break;

        case "west-button-long-pressed": // Toggle bedroom blinds

        break;
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
