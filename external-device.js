var events = require('events');
//var recipes = require("./recipes");
var actions = require("./actions");
var state = require('./state');
var exec = require('child_process').exec;
var queue = require('queue');
var hue = require('./hue');
var eventEmitter;


var self = this;

exports.initialize = function (emitter) {
    eventEmitter = emitter;
};

var commandTable = require('./config/cli-commands.json');
var commandPrefixes = require('./config/cli-prefixes.json');
var commandQueue = queue();
commandQueue.concurrency = 1;


exports.sendCommand = function (device, operation) {
    var commandObject = getCommand(device, operation);
    if (commandObject) {
        commandQueue.push(function (complete) {
            var commandString = commandObject.prefix ? commandPrefixes[commandObject.prefix] + " " + commandObject.command : commandObject.command;
            executeCommand(commandString);
            setTimeout(function () {
                complete();
            }, commandObject.duration);
        });
        //hue.alert();
        commandQueue.start();
    }
}




function getCommand(device, operation) {
    var device = commandTable[device];
    if (device) {
        var commandObject = device[operation];
        if (commandObject) {
            return commandObject;
        } else {
            console.log("Unknown operation (" + operation + ") for device: " + device);
        }
    } else {
        console.log("Unknown device specified: " + device);
    }

    return;
}

function executeCommand(commandString) {
    console.log("Running command...");
    exec(commandString, function (error, stdout, stderr) {
        console.log("Command output:" + stdout);
    });
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