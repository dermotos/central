/*

Create as module
Emit (simple) event object that contains info about what occurred.
Create similar module for testing buttons via rest requests. (ultimately can make a simple web page with buttons that send the requests)

Schedules are also event based

*/
var eventEmitter;
var webSensors = require('./web-sensors.js');
var tcp = require('net');
var carrier = require('carrier'); //Easy new-line terminated chunking over TCP (from spark/arduino)

exports.initialize = function(emitter){
  eventEmitter = emitter;
  webSensors.initialize(3001,emitter);

  var server = tcp.createServer(function(socket){
    carrier.carry(socket, function(msg){
      var message = msg.toString();
  		var items = message.split(":");

  		//Clean the command strings of carrage return characters that were fucking up everything royally.
  		for (var i = items.length - 1; i >= 0; i--) {
  			items[i] = items[i].replace('\r','');
  		};

      var action = {};
    
      //** Support for older switch firmware **
      // Some existing switches use older firmware that uses a different format
      items[1] = (items[1] == "checkin") ? "heartbeat" : items[1];

      //substring: eg: pot-24. 24 is the arg.
      if(items[1].substr(0,3 == "pot")){
        items[2] = items[1].substr(4); // argument, eg: 24
        items[1] = "fader"; // Normalisation
      }
      // ** ******************************* **

      action = {
        category : "sensor",
        source : items[0], //eg: bedroom-door, bedroom-blinds, kitchen etc
        action : items[1], //eg: north-button-double-pressed, motion-started, left-scale, etc...
        args : [] //Max of one arg in currently implemented hardware. Support for more. eg: fader value, scales value.
      };

      if(items.length > 2){
        for (var i = 2; i < items.length; i++) {
          args.args.push(items[i]);
        }
      }

      eventEmitter.emit('event',action);

    });
  });
}
