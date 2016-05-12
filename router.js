var events = require('events');

var actions = require("./actions");
var state = require('./state');
var hue = require('./hue');
var fs = require('fs');
var eventEmitter;
var eventHandlers = {};
var routingTable;

var self = this;

exports.initialize = function (emitter) {
  eventEmitter = emitter;
  self.loadRoutingTable();

  eventEmitter.on('event', function (args) {
    console.log("\n");
    //console.log("EVENT EMITTER MONITOR:");
    //console.log(JSON.stringify(args));

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

  eventEmitter.on('action-map-updated', function (args) {
    self.loadRoutingTable();
  });


};




exports.loadRoutingTable = function () {
  var previouslyExisted = (routingTable != null);
  routingTable = require("./config/action-map.json");
  console.log("Routing table " + (previouslyExisted ? "re" : "") + "loaded");
}


function assignButton(source, action) {
  console.log("setting new action for: " + source + " | " + action);

  //Get the latest set scene on the hub, then assign its ID to the current button
  hue.latestScene(function (latestScene) {
    var actionMap = require('./config/action-map.json');
    if (!actionMap[source][action].programmable) {
      console.log("This scene is not programmable and must be configured manually.");
      return;
    }
    console.log("Latest scene is " + latestScene.name + " (" + latestScene.id + ")");
    actionMap[source][action].type = "hue-scene";
    actionMap[source][action].name = latestScene.name;
    actionMap[source][action].id = latestScene.id;

    fs.writeFile("./config/action-map.json", JSON.stringify(actionMap, null, 2), function (err) {
      if (err) {
        console.log("Failed to update action-map.json " + err);
      }
      else {
        eventEmitter.emit('action-map-updated', null);
      }
      console.log("Scene change completed");
      state.setState("program-mode", false);
    });
  });
}



eventHandlers.sensorHandler = function (args) {

  // Lookup the routing table for the correct action to invoke
  // There is a special case for the pot adjustment, where it adjusts the brightness of the lights in the current room
  // Note: There can be multiple actions for a sensor event. As a result, the action variable can be a single action,
  // or an array of actions.
  console.log("IN sensor handler. Args:");
  console.log(args);
  if (args.action == 'fader') {
    if (routingTable[args.source]) {
      var action = routingTable[args.source][args.action];
      if (action instanceof Array) {
        console.log("Error! - Multiple actions are not supported for fader operations");
        if (action.length > 0) {
          action = action[0];
        }
        else return;
      }
      actions.executeFade(action.group, args.args[0]);
    }
  }
  else {
    if (state.getState("program-mode")) {
      console.log("Program mode is active");
      assignButton(args.source, args.action);
      return;
    }

    var action = routingTable[args.source][args.action];
    if (typeof action === 'undefined') {
      console.log("No action defined for trigger.");
      return;
    }
    else if (action instanceof Array) {
      console.log("Operation has " + action.length + " actions defined.")
      for (var x = 0; x < action.length; x++) {
        var currentAction = action[x];
        console.log("Action is: " + JSON.stringify(currentAction));
        if (typeof currentAction.delay === 'undefined') {
          actions.executeAction(currentAction, currentAction.args);
        }
        else {
          runDelayedAction(currentAction);
        }

      }
    }
    else {
      //console.log("Action is: " + JSON.stringify(action));
      if (typeof action.delay === 'undefined') {
        actions.executeAction(action, action.args);
      }
      else {
        var delay = action.delay;
        console.log("Running delayed single action..." + JSON.stringify(action, null, 2));
        setTimeout(function () {
          actions.executeAction(action, action.args);
        }, delay);
      }
    }
  }
}


function runDelayedAction(action) {
  setTimeout(function () {
    actions.executeAction(action, action.args);
  }, action.delay);
}



eventHandlers.scheduleHandler = function (args) {
  switch (args.source) {
    default:
      console.log("Not implemented");
      break;
  }
}

eventHandlers.humanHandler = function (args) {
  switch (args.source) {
    default:
      console.log("Not implemented");
      break;
  }
}
