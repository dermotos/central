var sunCalc = require('suncalc');
var eventEmitter;



exports.initialize = function (emitter) {
  eventEmitter = emitter;
  // On initialization, compute sun position times for the current day, and create a
  // daily recurring schedule to recalculate each night at midnight.
};
