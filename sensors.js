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

exports.sensorStates = {
  "couch": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "desk": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "desklamp": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "bedroom-blinds": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "bedside": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "bedroom-door": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "kitchen": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "bathroom": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
  },
  "tv": {
    socket: null,
    connected: false,
    heartbeatInTimeout: null,
    heartbeatOutInterval: null,
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
  carrier.carry(socket, function (msg) {
    var message = msg.toString();
    var items = message.split(":");

    //Clean the command strings of carrage return characters that were fucking up everything royally.
    for (var i = items.length - 1; i >= 0; i--) {
      items[i] = items[i].replace('\r', '');
    };

    //** Normalisation **
    // Some existing switches use older firmware that sends "checkin" instead of "heartbeat", normalize it...
    items[1] = (items[1] == "checkin") ? "heartbeat" : items[1];

    if (items[1].length == 0) {
      console.log("Unspecified argument");
      return;
    }
    //console.log(items);
    //substring: eg: pot-24. 24 is the arg.
    if (items[1].startsWith("pot")) {
      items[2] = items[1].substr(4); // argument, eg: 24
      items[1] = "fader"; // Normalisation
    }
    // ** ******************************* **

    /* Connection hardening
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
      
      var sensor = self.sensorStates[items[0]];
      if (typeof (sensor) === 'undefined') {
        console.log("An unknown sensor connected (" + items[0] + "). DEBUG");
        return;
      } else {
        // Heartbeat received for known sensor

        if (sensor.connected) {
          // hue.latestScene(function(latestScene){
          //   console.log("Latest scene is " + latestScene.name + " - " + latestScene.id);
          // });
          //console.log("Heartbeat received (" + items[0] + ")");
        }
        else{
          console.log(items[0] + " connected.");
          // Sensor has just connected (or reconnected)
          sensor.connected = true;
          sensor.socket = socket;
          sensor.socket.write("^heartbeat$"); // Send the first heartbeat immediately
          sensor.heartbeatOutInterval = setInterval(function () {
            if(sensor.socket){
              sensor.socket.write("^heartbeat$");
            }else{
              sensor.socket = null;
              cleanSensorState();
            }
            
          }, heartbeatSendInterval);
        }



        // We've received a heartbeat, so reset the heartbeat in watcher.
        clearTimeout(sensor.heartbeatInTimeout);
        sensor.heartbeatInTimeout = setTimeout(function () {
          //Code that runs if we don't receive a heartbeat from this device:
          console.log(items[0] + " is not responding, closing connection.");
          if(sensor.socket){
            sensor.socket.destroy();
          }
          
          sensor.socket = null;
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
  

  function cleanSensorState() {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("Sensor States:");
    console.log(self.sensorStates);
    
    for (var key in Object.keys(self.sensorStates)) {
      console.log("Key");
      console.log(key);
      var obj = self.sensorStates[key];
      console.log("obj:");
      console.log(obj);
      console.log(JSON.stringify(obj));
      if(obj.socket == null){
        console.log("Cleaning state for "+ key);
        clearInterval(obj.heartbeatOutInterval);
        clearTimeout(obj.heartbeatInTimeout);
        obj.heartbeatOutInterval = null;
        obj.heartbeatInTimeout = null;
        obj.connected = false;
      }
    }
  }

  // Add a 'close' event handler to this instance of socket
  socket.on('error', function (data) {
    console.log("A socket error occurred, closing socket...");
    socket.destroy();
    socket = null;
    cleanSensorState();
  });
}
