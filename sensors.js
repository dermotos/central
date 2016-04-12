/*

Interacts with sensors (usually wall switches)

*/
var eventEmitter;
var webSensors = require('./web-sensors.js');
var tcp = require('net');
var carrier = require('carrier'); //Easy new-line terminated chunking over TCP (from spark/arduino)
var server;


//Polyfill. TODO: Move these into a separate file
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

exports.initialize = function(emitter){
  eventEmitter = emitter;
  webSensors.initialize(3001,emitter);
  server = tcp.createServer(socketHandler);
  server.listen(9998, function(){
      console.log("Socket listening for incoming connections");
  });
};

function socketHandler(socket){
    console.log("New socket connection...");
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
     
     if(items[1].length == 0){
         console.log("Unspecified argument");
         return;
     }
      //console.log(items);
      //substring: eg: pot-24. 24 is the arg.
      if(items[1].startsWith("pot")){
          
        items[2] = items[1].substr(4); // argument, eg: 24
        items[1] = "fader"; // Normalisation
      }
    //   console.log("AFTER");
    //   console.log(items);
      // ** ******************************* **



      if(items[1] == "heartbeat"){
          console.log("Heartbeat received");
          return;
      }
      
      action = {
        category : "sensor",
        source : items[0], //eg: bedroom-door, bedroom-blinds, kitchen etc
        action : items[1], //eg: north-button-double-pressed, motion-started, left-scale, etc...
        args : [] //Max of one arg in currently implemented hardware. Support for more. eg: fader value, scales value.
      };

      if(items.length > 2){
        for (var i = 2; i < items.length; i++) {
          action.args.push(items[i]);
        }
      }
      
      eventEmitter.emit('event',action);

    });

    //Send a heartbeat to the device every 30 seconds. Ensures connectivity errors can be self-corrected by either side.
  	var heartbeatInterval = setInterval(function(){
  		socket.write("^heartbeat$");
  	},30 * 1000);

  	//Idle sockets are considered dead after 70 seconds of inactivity (missed two heartbeats), and should be discarded.
  	var socketCheck = socket.setTimeout(70 * 1000,function(){
  		//shutdownSocket();
        console.log("A socket timeout shutdown would normally occur here. Investigate.");  
	});

    // Add a 'close' event handler to this instance of socket
    socket.on('close', function(data) {
    	shutdownSocket();
    });

    function shutdownSocket(){
    	clearInterval(heartbeatInterval);
        clearTimeout(socketCheck);
    	socket.destroy();

    }

    // Handle errors
    socket.on('error', function(err) {
        shutdownSocket();  
    });
}
