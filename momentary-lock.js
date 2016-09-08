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

exports.openLock = function (lock, duration) {
    console.log("Opening lock " + lock + " for duration " + duration);
    var actor = sensors.sensorStates[lock];
    if (typeof (actor) === 'undefined' || typeof (actor.socket) === 'undefined') {
        callback("Specified lock's remote interface unavailable");
    } else {
        actor.socket.write('^control-lock,open,' + duration + '$');
    }

}


