/*

Create as module
Emit (simple) event object that contains info about what occurred.
Create similar module for testing buttons via rest requests. (ultimately can make a simple web page with buttons that send the requests)

Schedules are also event based

*/
var eventEmitter;
var webSensors = require('./web-sensors.js');

exports.initialize = function(emitter){
  eventEmitter = emitter;
  webSensors.initialize(3001,emitter);
}
