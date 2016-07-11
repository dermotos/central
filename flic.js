var eventEmitter;
var fliclib = require("./fliclibNodeJs");
var FlicClient = fliclib.FlicClient;
var FlicConnectionChannel = fliclib.FlicConnectionChannel;
var FlicScanner = fliclib.FlicScanner;

var client = new FlicClient("localhost", 5551);

var flics = require('./config/flic.json');

exports.initialize = function (emitter) {
  eventEmitter = emitter;
};

function listenToButton(bdAddr) {
	var cc = new FlicConnectionChannel(bdAddr);
	client.addConnectionChannel(cc);
	cc.on("buttonSingleOrDoubleClickOrHold", function(clickType, wasQueued, timeDiff) {
        var currentFlic = flics[bdAddr];
        if(currentFlic){
            
        var actionObject = {
            category: "flic",
            source: currentFlic.name, //eg: flic-1
            action: null, //eg: press, double-press, hold
            args: [] // Currently not supported
        };
        
        switch(clickType){
            case "ButtonSingleClick" :
                actionObject.action = "press";
            break;
            
            case "ButtonDoubleClick" :
                actionObject.action = "double-press";
            break;
            
            case "ButtonHold" :
                actionObject.action = "hold";
            break;
        }

        eventEmitter.emit('event', actionObject);
            
        }
        else{
            console.log("Unidentified flic: " + bdAddr);
        }
		//console.log(bdAddr + " " + clickType + " " + (wasQueued ? "wasQueued" : "notQueued") + " " + timeDiff + " seconds ago");
	});
	cc.on("connectionStatusChanged", function(connectionStatus, disconnectReason) {
		console.log(bdAddr + " " + connectionStatus + (connectionStatus == "Disconnected" ? " " + disconnectReason : ""));
	});
}

client.once("ready", function() {
	console.log("Connected to Flic service");
	client.getInfo(function(info) {
		info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
			listenToButton(bdAddr);
		});
	});
});

client.on("bluetoothControllerStateChange", function(state) {
	console.log("Bluetooth controller state change: " + state);
});

client.on("newVerifiedButton", function(bdAddr) {
	console.log("A new Flic button was added: " + bdAddr);
	listenToButton(bdAddr);
});

client.on("error", function(error) {
	console.log("Flic service connection error: " + error);
});

client.on("close", function(hadError) {
	console.log("Connection to Flic service is now closed");
});