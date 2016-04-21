var events = require('events');
var recipes = require("./recipes");
var actions = require("./actions");
var state = require('./state');
var hue = require('./hue');
var fs = require('fs');
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
        
        case "homekit":
        eventHandlers.homekitHandler(args);
        break;

      default:
        console.log("Unknown event category!");
        break;
    }
  });
  
  eventEmitter.on('action-map-updated',function(args){
   self.loadRoutingTable();
  });
  
  
};




exports.loadRoutingTable = function(){
    var previouslyExisted = (routingTable != null);
    routingTable = require("./action-map.json");
    console.log("Routing table "+ (previouslyExisted ? "re" : "")  + "loaded");
}


function assignButton(source,action){
    console.log("setting new action for: "+ source + " | " + action);
    
    //Get the latest set scene on the hub, then assign its ID to the current button
    hue.latestScene(function(latestScene){
        var actionMap = require('./action-map.json');
        
        actionMap[source][action].type = "hue-scene";
        actionMap[source][action].name = latestScene.name;
        actionMap[source][action].id = latestScene.id;
        
        fs.writeFile("./action-map.json", JSON.stringify(actionMap, null, 2),function(err){
            if(err){
                console.log("Failed to update action-map.json. " + err); 
            }
            else{
                eventEmitter.emit('action-map-updated',null);
            }
            console.log("Scene change completed");
            state.setState("program-mode",false);
        });
    });  
}



eventHandlers.sensorHandler = function(args){
    
    // Lookup the routing table for the correct action to invoke
    // There is a special case for the pot adjustment, where it adjusts the brightness of the lights in the current room
    
    console.log(args);
    if(args.action == 'fader'){
        actions.executeFade(args.source, args.args);
    }
    else{
      
      if(state.getState("program-mode")){
          console.log("Program mode is active");
          assignButton(args.source,args.action);
          return;
      }
      
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
