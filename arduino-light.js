var events = require('events');
var actions = require("./actions");
var state = require('./state');
var sensors = require('./sensors');
var eventEmitter;


var self = this;

exports.initialize = function (emitter) {
    eventEmitter = emitter;
};

exports.getLightState = function (room, index, callback) {
    console.log("getBlindState is not implemented, and probably wont be.");
}

//Valid parameters are: 
// device : "desklamp"
// state : "on" | "off"

exports.setLightState = function (device, state) {
    console.log("Device" + device);
    console.log("State " + state);
    if (device == "desklamp") {
        var actor = sensors.sensorStates["desklamp"];
        if (typeof (actor) === 'undefined' || typeof (actor.socket) === 'undefined') {
            callback("Specified light's remote interface unavailable");
        } else {
            if (state == "on") {
                actor.socket.write('^control-lamp,on$');
            }
            else if (state == "off") {
                actor.socket.write('^control-lamp,off$');
            }
            else if (state == "toggle") {
                actor.socket.write('^control-lamp,toggle$');
            }
        }
    }
}


