var events = require('events');
var eventEmitter = new events.EventEmitter();
var sensors = require("./sensors.js");
var eventHandlers = {};

/*

Some conceptual stuff:
Input modules, such as sensors, schedules etc use an event emitter pattern. Raising events when they occur.
Each module has an initializer [initialize()] that must be called to initialize it. It expects an eventEmitter to be passed in (at least)
Web sensors raises the same events as sensors. Sensors raises events from the physical switches. Web sensors allows simulation of
physica button presses via http requests.

args is passed on each event.
args is an object:

args = {
category: switch,schedule,movement
source: "switch-name",
action: "north-button-double-pressed",
args : [23]. - Array. Can be one or more values, eg: value of fader.
}

*/



eventEmitter.on('event',function(args){

  console.log("Event:" + JSON.stringify(args));
  return;

  switch (args.category) {
    case "sensor":
        eventHandlers.switchHandler(args);
        break;

    case "schedule" :
      eventHandlers.scheduleHandler(args);
      break;

    case "human" :
      eventHandlers.humanHandler(args);
      break;

    default:
      console.log("Unknown event category");
      break;
  }
});

var result = sensors.initialize(eventEmitter);

eventHandlers.switchHandler = function(args){
  switch(args.source){
    case "bedside" :
    {

    }
    break;

    case "bedroom-door":
    {

    }
    break;

    case "couch-side":
    {

    }
    break;

    case "desk-side":
    {

    }
    break;

    case "kitchen":
    {

    }
    break;
  }
}

eventHandlers.scheduleHandler = function(args){
  switch(args.source){
    case "sunrise" :
    {

    }
    break;

    case "sunset":
    {

    }
    break;

    case "wake-up":
    {

    }
    break;

    case "desk-side":
    {

    }
    break;

    case "kitchen":
    {

    }
    break;
  }
}

eventHandlers.humanHandler = function(args){
  switch(args.source){
    case "sunrise" :
    {

    }
    break;

    case "sunset":
    {

    }
    break;

    case "wake-up":
    {

    }
    break;

    case "desk-side":
    {

    }
    break;

    case "kitchen":
    {

    }
    break;
  }
}

// console.log("ready");
