//
// State keeps track of various things like blind positions, which humans are in the house, which are in bed,
// modes such as midnightMode or tvWatchingMode or kitchenWorkMode.

var scheduler = require('node-schedule');
var moment = require('moment');
var eventEmitter;

// Some state changes time-out. This array holds a list of setTimeout identifiers that are pending.
var state =
    {
        'kitchen-work-mode': {
            enabled: false,
            timeout: 1000 * 60 * 60 * 2, // 2 hours
            timeoutIdentifier: 0,
            action: function (newState) {
                // Action to take when this mode changes state
                console.log("I'm the action for the work mode");
            },
            timeoutAction: function () {
                state['kitchen-work-mode'].enabled = false;
                // Any action that should occur when the timeout occurs
            }
        },
        'kitchen-manual-mode': {
            enabled: false,
            timeout: 1000 * 60 * 60 * 12, // 12 hours
            timeoutIdentifier: 0,
            action: function (newState) {
                // Action to take when this mode changes state
                console.log("I'm the action for the manual mode");
            },
            timeoutAction: function () {
                state['kitchen-manual-mode'].enabled = false;
            }
        },
        'program-mode': { // Used to program the light switches. The next button pressed is assigned the most recent active hue scene
            enabled: false,
            timeout: 60000 * 10, // 10 minutes
            timeoutIdentifier: 0,
            action: function (newState) {
                // Action to take when this mode changes state
                if (newState) {
                    console.log("I'm the action for the program mode");
                }
            },
            timeoutAction: function () {
                state['program-mode'].enabled = false;
                console.log("program-mode timed out, and has been disabled");
            }
        }
        // More modes could include lateNightMode, partyMode, awayMode
    };

exports.initialize = function (emitter) {
    eventEmitter = emitter;
}

exports.setState = function (stateName, enable) {
    console.log("Setting state for " + stateName + " to " + enable);
    // Ensure the specified state is known:
    var found = false;
    var targetState;
    for (var k in state) {
        if (k == stateName) {
            found = true;
            targetState = state[k];
            break;
        }
    }
    if (!found) {
        console.log("Information about an unknown state '" + requestedState + "' was requested");
        return "error";
    }


    // Basically, toggle the on/off value if [enable] is undefined...
    enable = (typeof enable == "undefined") ? !targetState.enabled : enable;
    targetState.enabled = enable;
    // Setup the timeout action
    if (targetState.timeout > 0) {
        targetState.timeoutIdentifier = setTimeout(function () {
            targetState.timeoutAction();
        }, targetState.timeout);
    }
    targetState.action(enable);
    return enable;

}

exports.getActiveStates = function(){
    var activeStates = [];
    for(var k in Object.keys(state)){
        if(state[k].enabled){
            activeStates.push(key);
        }
    }
    return activeStates;
}

exports.getState = function (requestedState) {
    // Ensure the specified state is known:
    var found = false;
    var targetState;
    for (var k in state) {
        if (k == requestedState) {
            found = true;
            targetState = state[k];
            break;
        }
    }
    if (!found) {
        console.log("Information about an unknown state '" + requestedState + "' was requested");
        return "error";
    }

    return targetState.enabled;
}
