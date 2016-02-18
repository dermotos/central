/*

Interacts with sensors (usually wall switches)

*/
var eventEmitter;
var webSensors = require('./web-sensors.js');
var tcp = require('net');
var carrier = require('carrier'); //Easy new-line terminated chunking over TCP (from spark/arduino)
var server;

exports.initialize = function(emitter){
  eventEmitter = emitter;
  webSensors.initialize(3001,emitter);
  server = tcp.createServer(socketHandler);
};

function socketHandler(socket){
    carrier.carry(socket, function(msg){
      var message = msg.toString();
  		var items = message.split(":");

  		//Clean the command strings of carrage return characters that were fucking up everything royally.
  		for (var i = items.length - 1; i >= 0; i--) {
  			items[i] = items[i].replace('\r','');
  		};

      var action = {};

      //** Support for older switch firmware **
      // Some existing switches use older firmware that uses a different format, normalize it...
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

    //Send a heartbeat to the device every 30 seconds. Ensures connectivity errors can be self-corrected by either side.
  	var heartbeatInterval = setInterval(function(){
  		socket.write("^heartbeat$");
  	},30 * 1000);

  	//Idle sockets are considered dead after 1 minute of inactivity, and should be discarded.
  	var socketCheck = socket.setTimeout(60 * 1000,function(){
  		shutdownSocket();
  	});

    // Add a 'close' event handler to this instance of socket
    socket.on('close', function(data) {
    	shutdownSocket();
    });

    function shutdownSocket(){
    	clearInterval(heartbeatInterval);
    	socket.destroy();

    }

    // Handle errors
    socket.on('error', function(err) {
        socket.destroy();
        clearInterval(socketCheck);
    });
}
