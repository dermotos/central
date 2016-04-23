var events = require('events');
var recipes = require("./recipes");
var actions = require("./actions");
var state = require('./state');
var eventEmitter;


var self = this;

exports.initialize = function(emitter){
  eventEmitter = emitter;
};

var commandTable = 
{
   [
       name : "hvacOff"
       device : "",
       command : "",
       duration : 1000 * 5
   },
   hvacOff : {
       device : "",
       command : "",
       duration : 1000 * 5
   },
   hvacOff : {
       device : "",
       command : "",
       duration : 1000 * 5
   },
   hvacOff : {
       device : "",
       command : "",
       duration : 1000 * 5
   },
   hvacOff : {
       device : "",
       command : "",
       duration : 1000 * 5
   },
   hvacOff : {
       device : "",
       command : "",
       duration : 1000 * 5
   }, 
};


exports.setActivity = function(activity){
    
}

exports.sendCommand = function(commandName, ){
    //TODO: perhaps need another level of abstraction for the air conditioner.
    //This also needs to support queuing of commands
}


function executeHubCommand(command){
    
}


/*

>node harmonyHubCLI.js -h
usage: harmonyHubCLI.js [-h] [-v] [-l HUB] [-r READ] [-a ACTIVITY] [-d DEVICE]
                        [-c COMMAND]


CLI for controlling Harmony HUB

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -l HUB, --hub HUB     ip address of the hub. if not provided a discovery
                        will be performed to find it
  -r READ, --read READ  Display supported activities/devices/commands that
                        are programmed on the hub
  -a ACTIVITY, --activity ACTIVITY
                        Select a activity
  -d DEVICE, --device DEVICE
                        Select a device
  -c COMMAND, --command COMMAND
                        Select a command to trigger. Device also needs to be
                        specified when this is used.
                        
*/