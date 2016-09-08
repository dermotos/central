/*

Interacts with sensors (usually wall switches)

*/
var eventEmitter;
var tcp = require('net');
var carrier = require('carrier'); //Easy new-line terminated chunking over TCP (from spark/arduino)
var server;
var hue = require('./hue');

var heartbeatSendInterval = 25 * 1000;
var heartbeatReceiveThreshold = 60 * 1000;


//Polyfill. TODO: Move these into a separate file
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

var self = this;

//TODO: Move to configuration file:

exports.sensorStates = {
  "couch": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "desk": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "desklamp": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "bedroom-blinds": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "bedside": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "bedroom-door": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "kitchen": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "bathroom": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "tv": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  },
  "front-door-lock" : {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null
  }
};

exports.initialize = function (emitter) {
  eventEmitter = emitter;

  server = tcp.createServer(socketHandler);
  server.listen(9998, function () {
    console.log("Socket listening for incoming connections");
  });
};


exports.setLED = function(sensor,led,command){
  var targetSensor = self.sensorStates[sensor];
  targetSensor.socket.write('^set-led-state,' + led + ','+ command +'$');
}

function socketHandler(socket) {
  //console.log("New socket connection...");
  var sensorConnection = null;
  var sensorName = "";
  carrier.carry(socket, function (msg) {
    var message = msg.toString();
    var items = message.split(":");

    //Clean the command strings of carriage return characters that were fucking up everything royally.
    for (var i = items.length - 1; i >= 0; i--) {
      items[i] = items[i].replace('\r', '');
    };

    //** Normalisation **
    // Some existing switches use older firmware that sends "checkin" instead of "heartbeat", normalize it...
    items[1] = (items[1] == "checkin") ? "heartbeat" : items[1];
    if(!(items && items[1])){
      console.log("Unknown or malformed message received from sensor. The message content was:" + message.replace('\r', ''));
      return;
    }
    if (items[1].length == 0) {
      console.log("Unspecified argument received from sensor");
      return;
    }

    //substring: eg: pot-24. 24 is the arg.
    if (items[1].startsWith("pot")) { 
      items[2] = items[1].substr(4); // argument, eg: 24
      items[1] = "fader"; // Normalisation
    }
    // ** ******************************* **

    /* Connection hardening
     * Some sensors use v1.0 kickstarter hardware, and aren't the most solid...
     * Each device (sensor)...
     *    - Sends a heartbeat every 25 seconds
     *    - Expects a heartbeat every 60 seconds or less from central control (should be 2-3 within this time)
     *    - Re-establishes a connection when it detects it has gone down
     * 
     * It is central controls responsibility to...
     *    - Send a heartbeat every 25 seconds to each sensor
     *    - Disconnect a sensor if it hasn't received a heartbeat within 60 seconds
     *    - Disconnect a sensor and cleanup if it detects a problem (eg: socket closed/write failed)
     * */

    if (items[1] == "heartbeat") {
      sensorConnection = self.sensorStates[items[0]];
      if (!sensorConnection) {
        console.log("An unknown sensor sent a heartbeat (" + items[0] + "). DEBUG");
        return;
      } else {
        sensorName = items[0];
        // Heartbeat received for known sensor
        if (!sensorConnection.connected) { // Sensor was not connected and has just connected (or reconnected)
          console.log(items[0] + " connected.");
          sensorConnection.connected = true;
          sensorConnection.socket = socket;
          sensorConnection.socket.write("^heartbeat$"); // Send the first heartbeat immediately
          sensorConnection.heartbeatOutInterval = setInterval(function () {
            //console.log("Sending heartbeat out to " + sensorName); // verbose logging - remove.
            if(sensorConnection.socket){
              sensorConnection.socket.write("^heartbeat$");
            }else{
              //Close down connection
              closeConnection(sensorConnection);
            }
            
          }, heartbeatSendInterval);
        }
        // We've received a heartbeat, so reset the heartbeat-in watcher.
        clearTimeout(sensorConnection.heartbeatInTimeout);
        sensorConnection.heartbeatInTimeout = setTimeout(function () {
          //Code that runs if we don't receive a heartbeat from this device:
          console.log("No heartbeat received from " + items[0] + " sensor in over " + (heartbeatReceiveThreshold / 1000) + " seconds.");
          closeConnection(sensorConnection);
        }, heartbeatReceiveThreshold);

      }

    } else {
      var action = {
        category: "sensor",
        source: items[0], //eg: bedroom-door, bedroom-blinds, kitchen etc
        action: items[1], //eg: north-button-double-pressed, motion-started, left-scale, etc...
        args: [] //Max of one arg in currently implemented hardware. Support for more. eg: fader value, scales value.
      };

      if (items.length > 2) {
        for (var i = 2; i < items.length; i++) {
          action.args.push(items[i]);
        }
      }

      eventEmitter.emit('event', action);
    }

  }); //end of carrier

 
  function closeConnection(sensorConnection){
      console.log("Closing connection to " + sensorName);
      sensorConnection.connected = false;
      sensorConnection.socket.destroy();
      clearTimeout(sensorConnection.heartbeatInTimeout);
      clearInterval(sensorConnection.heartbeatOutInterval);
      self.sensorStates[sensorName] = sensorConnection;
    }
  

  // Add a 'close' event handler to this instance of socket
  socket.on('error', function (err) {
    console.log("A socket error occurred : ");
    console.log(err);
    closeConnection(sensorConnection);
  });
}
