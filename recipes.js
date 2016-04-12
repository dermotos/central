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
          tasks.livingRoom.lightsTvMode();
        break;

        case "north-button-double-pressed": // Company mode (warm lights, music, etc...)
          console.log("Reserved for 'company' mode.");
        break;

        case "north-button-long-pressed": // Full brightness (including white only bulb)
          tasks.livingRoom.lightsFullBrightness();
        break;


        /* East Button */
        case "east-button-pressed":        // Toggle living room blind
          console.log("Reserved for toggling living room blind");
        break;

        case "east-button-double-pressed": // Toggle kitchen manual mode
          tasks.home.kitchenWorkMode();
        break;

        case "east-button-long-pressed": // Toggle bedroom blinds
          console.log("Reserved for toggling bedroom belinds");
        break;

        /* South Button */
        case "south-button-pressed":        // Toggle lights (circidian)
          tasks.livingRoom.lightsToggle();
        break;

        case "south-button-double-pressed": // Change to temperature fader mode
          console.log("Reserved for temperature fader mode");
        break;

        case "south-button-long-pressed": // Turn off all other house lights
          tasks.livingRoom.allOtherLightsOff();
        break;

        /* West Button */
        case "west-button-pressed":        // Reserved
          console.log("Unassigned");
        break;

        case "west-button-double-pressed": // Bedtime mode (whole house)
          console.log("Reserved for bedtime mode");
        break;

        case "west-button-long-pressed": // Toggle bedroom blinds
          console("Toggle bedroom blinds");
        break;


        /* East Button */
        case "east-button-pressed":        // Toggle living room blind
          console.log("Toggle living room blind");
        break;

        case "east-button-double-pressed": // Toggle kitchen manual mode
          console.log("toggle kitchen manual mode");
        break;

        case "east-button-long-pressed": // Toggle bedroom blinds
          console.log("Reserved for future use");
        break;
      }
    }
    break;

    case "desk":
      switch(action){
        /*
        +---------+
        | N     W |
        |    o    |
        |  o o o  |
        |    o    |
        | E    S  |
        +---------+

        1     2
        3     4

NORTH
1 press                    Working mode
1 double-press       Reserved for ceiling fan toggle
1 long-press           Reserved

SOUTH
2 press                    Desk lamp toggle
2 double press        Toggle blind
2 long press            Turn off all house lights

WEST
west press                    Toggle lights circadian
west double press        Switch to temperature fader mode LED indicates state. State is specific to this switch
west long press            Reserved

East is reserved.
        */

        /* North Button */
        case "north-button-pressed":        // Desklamp light on
          console.log("Reserved");
        break;

        case "north-button-double-pressed": //
          console.log("Reserved for 'ceiling fan control on.");
        break;

        case "north-button-long-pressed": // Full brightness (including white only bulb)
          console.log("Reserved for ceiling fan off");
        break;


        /* East Button */
        case "east-button-pressed":
          console.log("Reserved");
        break;

        case "east-button-double-pressed": // Toggle kitchen manual mode
          console.log("Reserved");
        break;

        case "east-button-long-pressed": // Toggle bedroom blinds
          console.log("Reserved");
        break;

        /* South Button - bottom right */
        case "south-button-pressed":        // Toggle lights (circidian)
          tasks.livingRoom.desklampToggle();
        break;

        case "south-button-double-pressed": // Change to temperature fader mode
          tasks.livingRoom.blindToggle();
        break;

        case "south-button-long-pressed": // Turn off all other house lights
          tasks.livingRoom.allLightsOff();
        break;

        /* West Button - top right */
        case "west-button-pressed":        // Reserved
          tasks.livingRoom.lightsToggle();
        break;

        case "west-button-double-pressed": // Bedtime mode (whole house)
          console.log("Reserved for temperature fader mode");
        break;

        case "west-button-long-pressed": // Toggle bedroom blinds
          tasks.livingRoom.lightsToggle();
        break;


        /* East Button */
        case "east-button-pressed":        // Toggle living room blind
          console.log("Reserved");
        break;

        case "east-button-double-pressed": // Toggle kitchen manual mode
          console.log("Reserved");
        break;

        case "east-button-long-pressed": // Toggle bedroom blinds
          console.log("Reserved");
        break;
      }
    break;

    case "tv":
      console.log("TV actions not currently supported.");
    break;
  }
};

exports.bedroom.sensorHandler = function(source, action,args){

  console.log("Bedroom event");

};

exports.bathroom.sensorHandler = function(source, action,args){

  console.log("Bathroom event");

};
