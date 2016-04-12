var events = require('events');
var recipes = require("./recipes");
var eventEmitter;
var eventHandlers = {};
var routingTable;

var self = this;

exports.initialize = function(emitter){
  eventEmitter = emitter;
  self.loadRoutingTable();

  eventEmitter.on('event',function(args){
      
    // console.log("EVENT EMITTER MONITOR:");
    // console.log(JSON.stringify(args));

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


exports.loadRoutingTable = function(){
    routingTable = require("./action-map.json");
    console.log("Routing table loaded");
}




eventHandlers.sensorHandler = function(args){
    
    // Lookup the routing table for the correct action to invoke
    // There is a special case for the pot adjustment, where it adjusts the brightness of the lights in the current room
    
    console.log(args);
    if(args.action == 'fader'){
        console.log("Adjust lights to brightness:" + args.args[0]);
    }
    
    else{
        var action = routingTable[args.source][args.action];
        if(action.type == "custom"){
            console.log("Running custom action");
        }
        else if(action.type == "scene"){
            console.log("Loading scene " + action.name);
        }
        
    }
    console.log(routingTable[args.source][args.action]);
    
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
