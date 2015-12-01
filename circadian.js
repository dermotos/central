/* *******************
Provides information and events related to circadian rhythm-related stuff.
Raises events for sunrise, sunset, dawn and dusk, etc
Provides kelvin values for appropriate white-points dependant on time of day / position of sun.
******************** */

var eventEmitter;
var sunCalc = require('suncalc');


exports.initialize = function(emitter){
  eventEmitter = emitter;
  // On initialization, compute sun position times for the current day, and create a
  // daily recurring schedule to recalculate each night at midnight.
};
