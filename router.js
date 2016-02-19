var events = require('events');
var recipes = require("./recipes");
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
    case "bedroom-door":
    case "bedroom-blinds":
      recipes.bedroom.sensorHandler(args.source, args.action,args.args);
    break;

    case "couch":
    case "desk":
    case "tv":
      recipes.livingRoom.sensorHandler(args.source, args.action,args.args);
    break;

    case "kitchen":
      recipes.kitchen.sensorHandler(args.source, args.action,args.args);
    break;

    case "bathroom":
      recipes.bathroom.sensorHandler(args.source, args.action,args.args);
    break;

    default:
      console.log("Unknown sensor!");
      break;
  }
}

eventHandlers.scheduleHandler = function(args){
  switch(args.source){
    default:
      console.log("Not implemented");
    break;
  }
}

eventHandlers.humanHandler = function(args){
  switch(args.source){
    default:
      console.log("Not implemented");
    break;
  }
}
