var events = require('events');
var eventEmitter;
var eventHandlers = {};


exports.initialize = function(emitter){
  eventEmitter = emitter;

  eventEmitter.on('event',function(args){
    switch (args.category) {
      case "sensor":
        eventHandlers.sensorHandler(args);
        break;

      case "schedule":
        eventHandlers.scheduleHandler(args);
        break;

      default:
        console.log("Unknown event category!");
        break;
    }
  });
};




eventHandlers.sensorHandler = function(args){
  switch(args.source){
    case "bedside":
    {
      console.log("Bedside");
    }
    break;

    case "bedroom-door":
    {
      console.log("Bedroom door");
    }
    break;

    case "couch":
    {
      console.log("Couch");
    }
    break;

    case "desk":
    {
      console.log("Desk");
    }
    break;

    case "kitchen":
    {
      console.log("Kitchen");
    }
    break;

    case "tv":
    {
      console.log("tv");
    }
    break;

    case "bedroom-blinds":
    {
      console.log("bedroom blinds");
    }
    break;

    default:
      console.log("Unknown sensor!");
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
