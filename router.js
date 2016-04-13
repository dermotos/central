var events = require('events');
var recipes = require("./recipes");
var actions = require("./actions");
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
    var previouslyExisted = (routingTable != null);
    routingTable = require("./action-map.json");
    console.log("Routing table "+ (previouslyExisted ? "re" : "")  + "loaded");
}




eventHandlers.sensorHandler = function(args){
    
    // Lookup the routing table for the correct action to invoke
    // There is a special case for the pot adjustment, where it adjusts the brightness of the lights in the current room
    
    console.log(args);
    if(args.action == 'fader'){
        actions.executeFade(args.source, args.args);
    }
    else{
        var action = routingTable[args.source][args.action];
        if(typeof action === 'undefined'){
            console.log("No action defined for trigger.");
            return;
        }
        console.log("Action is: " + JSON.stringify(action));
        actions.executeAction(action,action.args);  
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
