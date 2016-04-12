//
// State keeps track of various things like blind positions, which humans are in the house, which are in bed,
// modes such as midnightMode or tvWatchingMode or kitchenWorkMode.

var scheduler = require('node-schedule');
var moment = require('moment');
var eventEmitter;

// Some state changes time-out. This array holds a list of setTimeout identifiers that are pending.
var state =
{
  kitchenWorkMode : {
    enabled : false,
    defaultTimeout : 1000 * 60 * 60 * 2, // 2 hours
    timeoutIdentifier : 0
  },
  kitchenManualMode : {
    enabled : false,
    defaultTimeout : 1000 * 60 * 60 * 12, // 12 hours
    timeoutIdentifier : 0
  }
  // More modes could include lateNightMode, partyMode, awayMode
};

exports.initialize = function(emitter){
  eventEmitter = emitter;
}

exports.setState = function(state, enable, timeout){
  //Toggle if [enable] is undefined
  enable = (typeof enable == "undefined") ? !state.kitchenWorkMode.enabled : enable;
  switch(state){
    case "kitchenWorkMode":
      if(enable){
          state.kitchenWorkMode.enabled = true;
          if(timeout != 0){
            timeout = (typeof timeout == 'undefined') ? state.kitchenWorkMode.defaultTimeout : timeout;
            state.kitchenWorkMode.timeoutIdentifier = setTimeout(function(){
              var action = {
                category : "state-change",
                action : "kitchen-work-mode",
                args : [false]
              };
              eventEmitter.emit('event',action);
            },timeout);
          }
      }
      else{
        state.kitchenWorkMode.enabled = false;
        // Cancel a timeout if one exists
        if(state.kitchenWorkMode.timeoutIdentifier != 0){
          clearTimeout(state.kitchenWorkMode.timeoutIdentifier);
          state.kitchenWorkMode.timeoutIdentifier = 0;
        }
        var action = {
          category : "state-change",
          action : "kitchen-work-mode",
          args : [false]
        };
        eventEmitter.emit('event',action);
      }
      break;

    case "kitchenManualMode":
      if(enable){
          state.kitchenManualMode.enabled = true;
          if(timeout != 0){
            timeout = (typeof timeout == 'undefined') ? state.kitchenManualMode.defaultTimeout : timeout;
            state.kitchenManualMode.timeoutIdentifier = setTimeout(function(){
              var action = {
                category : "state-change",
                action : "kitchen-manual-mode",
                args : [false]
              };
              eventEmitter.emit('event',action);
              //TODO: A library to handle switch state should be notified of this mode change
            },timeout);
          }
      }
      else{
        state.kitchenManualMode.enabled = false;
        // Cancel a timeout if one exists
        if(state.kitchenManualMode.timeoutIdentifier != 0){
          clearTimeout(state.kitchenManualMode.timeoutIdentifier);
          state.kitchenManualMode.timeoutIdentifier = 0;
        }
        var action = {
          category : "state-change",
          action : "kitchen-manual-mode",
          args : [false]
        };
        eventEmitter.emit('event',action);
      }
      break;

      case "midnightMode":
        if(enable){
            state.kitchenManualMode.enabled = true;
            if(timeout != 0){
              timeout = (typeof timeout == 'undefined') ? state.kitchenManualMode.defaultTimeout : timeout;
              state.kitchenManualMode.timeoutIdentifier = setTimeout(function(){
                var action = {
                  category : "state-change",
                  action : "kitchen-manual-mode",
                  args : [false]
                };
                eventEmitter.emit('event',action);
                //TODO: A library to handle switch state should be notified of this mode change
              },timeout);
            }
        }
        else{
          state.kitchenManualMode.enabled = false;
          // Cancel a timeout if one exists
          if(state.kitchenManualMode.timeoutIdentifier != 0){
            clearTimeout(state.kitchenManualMode.timeoutIdentifier);
            state.kitchenManualMode.timeoutIdentifier = 0;
          }
          var action = {
            category : "state-change",
            action : "kitchen-manual-mode",
            args : [false]
          };
          eventEmitter.emit('event',action);
        }
        break;
  }
}

exports.getState = function(requestedState){
  console.log(JSON.stringify(state));
  console.log("getting state for " + requestedState);
  switch(requestedState){
    case "kitchenWorkMode":
      return state.kitchenWorkMode.enabled;
    break;

    case "kitchenManualMode":
      return state.kitchenManualMode.enabled;
    break;
  }
}
