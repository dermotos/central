//
// State keeps track of various things like blind positions, which humans are in the house, which are in bed,
// modes such as midnightMode or tvWatchingMode or kitchenWorkMode.

var scheduler = require('node-schedule');
var moment = require('moment');
var sensors = require('./sensors');
var eventEmitter;

// Some state changes time-out. This array holds a list of setTimeout identifiers that are pending.
var state =
    {
        "modes": {
            'kitchen-work-mode': {
                enabled: false,
                timeout: 1000 * 60 * 60 * 2, // 2 hours
                timeoutIdentifier: 0,
                action: function (newState) {
                    // Action to take when this mode changes state
                    console.log("*** Work mode is currently " + newState);
                    sensors.setLED("kitchen","north",newState ? "on" : "off");
                },
                timeoutAction: function () {
                    // Any action that should occur when the timeout occurs
                    state['modes']['kitchen-work-mode'].enabled = false;
                    sensors.setLED("kitchen","north","off");   
                }
            },
            'kitchen-manual-mode': {
                enabled: false,
                timeout: 1000 * 60 * 60 * 12, // 12 hours
                timeoutIdentifier: 0,
                action: function (newState) {
                    // Action to take when this mode changes state
                    console.log("*** Kitchen manual mode is currently " + newState);
                    sensors.setLED("kitchen","south",newState ? "on" : "off");
                },
                timeoutAction: function () {
                    state['modes']['kitchen-manual-mode'].enabled = false;
                    sensors.setLED("kitchen","south","off");   
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
                    state['modes']['program-mode'].enabled = false;
                    console.log("program-mode timed out, and has been disabled");
                }
            }
            // More modes could include lateNightMode, partyMode, awayMode
        },
        "devices" : {
            "ceiling-fan" : {
                "current-state" : "off",
                "states" : [
                    "off",
                    "low"
                ]
            }
        }

    };

exports.initialize = function (emitter) {
    eventEmitter = emitter;
}

exports.setDeviceState = function(deviceName, newState){
    var device = state.devices[deviceName];
    if(typeof device === 'undefined'){
        console.log("Attempting to make a state change to an unknown device:" + deviceName);
    }
}

exports.advanceDeviceState = function(deviceName){
    
}

exports.setState = function (stateName, enable) {
    console.log("Setting state for " + stateName + " to " + enable);
    // Ensure the specified state is known:
    var found = false;
    var targetState;
    for (var k in state.modes) {
        if (k == stateName) {
            found = true;
            targetState = state.modes[k];
            break;
        }
    }
    if (!found) {
        console.log("Information about an unknown state '" + requestedState + "' was requested");
        return "error";
    }


    // Basically, toggle the on/off value if [enable] is undefined...
    if((typeof enable == "undefined") || enable == "toggle"){
        enable = !targetState.enabled;
    }

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

exports.getActiveStates = function () {
    var activeStates = [];
    for (var k in Object.keys(state.modes)) {
        if (state[k].enabled) {
            activeStates.push(key);
        }
    }
    return activeStates;
}

exports.getState = function (requestedState) {
    // Ensure the specified state is known:
    var found = false;
    var targetState;
    for (var k in state.modes) {
        if (k == requestedState) {
            found = true;
            targetState = state.modes[k];
            break;
        }
    }
    if (!found) {
        console.log("Information about an unknown state '" + requestedState + "' was requested");
        return "error";
    }

    return targetState.enabled;
}
