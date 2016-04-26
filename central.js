


console.info("Server starting...");

var dgram = require("dgram");
var udpServer = dgram.createSocket("udp4");
var moment = require("moment-timezone");
var colors = require("colors");
var net = require('net');
var http = require('http');
var util = require('util');
var querystring = require('querystring');
var hue = require('node-hue-api');
var express = require('express');
var carrier = require('carrier'); //Easy new-line terminated chunking over TCP (from spark/arduino)
var scheduler = require('node-schedule');
var ip = require('ip');
var request = require('request');
var circadian = require('./circadian');
var app = express();



// -------  Philips hue -------



var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var host = "10.0.0.4",
    username = "newdeveloper",
    api = new HueApi(host, username);


var ignorePot = true; // a quick hack to ignore potentiometer adjustments reported for a period of time after startup.
setTimeout(function(){
	ignorePot = false;
},35000);

// -------  State Management -------

//Sensor (switch) and actor (controller) hierarchy
var rooms = {
	lounge : {
		couchSensor : {
			socket : {},
			state : {}
		},
		deskSensor : {
			socket : {},
			state : {}
		},
		lampActor : {
			socket : {},
			state : false
		},
		tvSensor : {
			socket : {},
			state : false //tv on/off state
		}
	},
	bedroom : {
		bedroomDoorSensor : {
			socket : {},
			state : {}
		},
		bedsideSensor : {
			socket : {},
			state : {}
		},
		blindsActor : {
			socket : {},
			state : true //Blinds assumed to be open after reboot. The device will propagate the correct value shortly after it connects.
		},
		roomState :{
			bedtimeMode : false
		}
	},
  bathroom : {
    bathroomSensor : {
      socket : {},
      state : {}
    }
  },
	kitchen : {
		kitchenSensor : {
			socket : {},
			state : {}
		},
		roomState :{
			workMode : false,
			manualMode : false
		}
	}
};

//Oh god. Its ok, a replacement for this whole server is coming soon...
var partyMode = false;

circadian.initialize();

circadian.triggerBeforeSunset(15,function(){
	closeBlinds(0);
});




function setSensorLedState(sensor,state,led){

	// refactor...
}










/*  KITCHEN.JS */


rooms.kitchen.toggleManualMode = function() {
	//Toggle manual mode. This disables the motion sensors. Useful when the heating is on in the kitchen.
	rooms.kitchen.roomState.manualMode = !rooms.kitchen.roomState.manualMode;
	if(rooms.kitchen.roomState.manualMode){
		//Manual mode has been turned on, set the lower button LED to on
		rooms.kitchen.kitchenSensor.socket.write('^set-led-state,south,on$');
		rooms.lounge.couchSensor.socket.write('^set-led-state,east,on$');
		rooms.lounge.couchSensor.socket.write('^set-led-brightness,1$');
	}
	else{
		//Manual mode has been turned off, set the lower LED button to off
		rooms.kitchen.kitchenSensor.socket.write('^set-led-state,south,off$');
		rooms.lounge.couchSensor.socket.write('^set-led-state,east,off$');
		rooms.lounge.couchSensor.socket.write('^set-led-brightness,100$');
	}
}

rooms.kitchen.toggleWorkMode = function (turnOn){
	if(typeof turnOn === 'undefined'){
		turnOn = !rooms.kitchen.roomState.workMode;
	}
	console.debug("Toggling work mode to " + turnOn);
	var roomState = rooms.kitchen.roomState;
	if(turnOn){
		roomState.workMode = true;
		roomState.workModeTimeout = setTimeout(function(){
			console.debug("Work mode timed out. Turning off...");
			rooms.kitchen.toggleWorkMode(false);
		},(1000 * 60 * 60)); //Currently set at 1 hour.

		//Turn on the button LED to on
		rooms.kitchen.kitchenSensor.socket.write('^set-led-state,north,on$');
	}
	else{
		//Cancel work mode
		clearTimeout(roomState.workModeTimeout);
		roomState.workMode = false;
		//Turn off the button LED.
		rooms.kitchen.kitchenSensor.socket.write('^set-led-state,north,off$');
		
	}

	//Update lights, if they are on
		api.lightStatus(4).then(function(status){
			if(status.state.on || turnOn){
				turnOnKitchenLightsTimeSensitive();
			}
		}).done();
};


















/*   BEDROOM.js  */




// -------  Bedroom Blinds Management -------

// function toggleBlinds(){
// 	if(typeof rooms.bedroom.blindsActor.socket != 'undefined'){
// 		rooms.bedroom.blindsActor.socket.write('^control-blinds,0,toggle$'); //Blind index doesn't matter.
// 	}
// }

function openBlinds(blindIndex){
	if(typeof rooms.bedroom.blindsActor.socket != 'undefined'){
		if(blindIndex == 'undefined'){
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ '0' +',open$');
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ '1' +',open$');
		}
		else{
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ blindIndex +',open$');
		}
		rooms.bedroom.blindsActor.state = true; //At least one blind open means the blinds are considered 'open'

	}
}

function closeBlinds(blindIndex){
	if(typeof rooms.bedroom.blindsActor.socket != 'undefined'){
		if(blindIndex == 'undefined'){
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ '0' +',close$');
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ '1' +',close$');
			rooms.bedroom.blindsActor.state = false;
		}
		else{
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ blindIndex +',close$');
		}
	}
}

function toggleBlinds(blindIndex){
	if(typeof rooms.bedroom.blindsActor.socket != 'undefined'){
		if(typeof(blindIndex) == 'undefined'){
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ '0' +',toggle$');
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ '1' +',toggle$');
			rooms.bedroom.blindsActor.state = false;
		}
		else{
			rooms.bedroom.blindsActor.socket.write('^control-blinds,'+ blindIndex +',toggle$');
		}
	}
}

var blindTriggerCheckInterval;

function startMonitoringBlindTriggerLight(){
	blindTriggerCheckInterval = setInterval(function(){
		//Checks if the blinds trigger bulb is on
		api.lightStatus(8).then(function(status){
			if(status.state.on && status.state.bri < 5){

				morningSequence();
				//Clean up: Turn off the trigger light and stop the interval monitoring it.
				var state = lightState.create().off();
				api.setLightState(8, state).then(displayResult).done();
				stopMonitoringBlindTrigger();
			}
		});
	},5000);
}

function stopMonitoringBlindTriggerLight(){
	clearInterval(blindTriggerCheckInterval);
}



// ------- Sequences --------

function morningSequence(){
	console.debug("Starting morning sequence...");

	//TODO: Start music playback, turn on lights.

	console.debug("Opening blinds in one minute...");
	setTimeout(function(){
		openBlinds(0);
		openBlinds(1);

	},1000 * 60 * 1);
};


// -------  Schedules -------



//Blind related

//Starts monitoring the sleep cycle trigger light at 6am each morning.
var startMonitoringBlindTriggerRule = new scheduler.RecurrenceRule();
startMonitoringBlindTriggerRule.minute = 0;
startMonitoringBlindTriggerRule.hour = 6;

//Stops monitoring the sleep cycle trigger light at 11:30am each morning.
var stopMonitoringBlindTriggerRule = new scheduler.RecurrenceRule();
stopMonitoringBlindTriggerRule.minute = 30;
stopMonitoringBlindTriggerRule.hour = 11;

scheduler.scheduleJob(startMonitoringBlindTriggerRule,function(){
	//console.debug("Starting to monitor blinds");
	startMonitoringBlindTriggerLight();
});




scheduler.scheduleJob(stopMonitoringBlindTriggerRule,function(){
	stopMonitoringBlindTriggerLight();
});


//Close blinds every night at 7:30pm

var closeBlindsRule = new scheduler.RecurrenceRule();
closeBlindsRule.minute = 59;
closeBlindsRule.hour = 19;
scheduler.scheduleJob(closeBlindsRule,function(){
	closeBlinds(0);
	closeBlinds(1);
});


//Open blinds every weekday morning at 7:00 am

var openBlindsRule = new scheduler.RecurrenceRule();
openBlindsRule.minute = 00;
openBlindsRule.hour = 7;
openBlindsRule.dayOfWeek = [1,2,3,4,5]; //0 being sunday, 6 being saturday
scheduler.scheduleJob(openBlindsRule,function(){


	openBlinds(1);
	setLoungeBlindState("toggle");
	setTimeout(function(){
		openBlinds(0);
	},1000 * 60 * 10);

});




var server = net.createServer(function(socket){
	console.log('A sensor connected');

	carrier.carry(socket,function(msg){
		console.debug("Sensor : " + msg);
		var message = msg.toString();
		var items = message.split(":");

		//Clean the command strings of carrage return characters that were fucking up everything royally.
		for (var i = items.length - 1; i >= 0; i--) {
			items[i] = items[i].replace('\r','');
		};
        


		console.log(message);

		if(items[1] == "heartbeat" || items[1] == "checkin"){
			//Update the last heartbeat time the device and refresh the socket reference.
			console.debug(items[0].substr(0,1).toUpperCase() + items[0].substr(1) + " heartbeat received.");

			if(items[0] == "couch"){
				rooms.lounge.couchSensor.socket = socket;
				rooms.lounge.couchSensor.lastHeartbeat = new Date();
			} else if(items[0] == "desk"){
				rooms.lounge.deskSensor.socket = socket;
				rooms.lounge.deskSensor.lastHeartbeat = new Date();
			}else if(items[0] == "desklamp"){
				rooms.lounge.lampActor.socket = socket;
				rooms.lounge.lampActor.lastHeartbeat = new Date();
			}else if(items[0] == "bedroom-blinds"){
				rooms.bedroom.blindsActor.socket = socket;
				rooms.bedroom.blindsActor.lastHeartbeat = new Date();
			}else if(items[0] == "bedside"){
				rooms.bedroom.bedsideSensor.socket = socket;
				rooms.bedroom.bedsideSensor.lastHeartbeat = new Date();
			}else if(items[0] == "bedroom-door"){
				rooms.bedroom.bedroomDoorSensor.socket = socket;
				rooms.bedroom.bedroomDoorSensor.lastHeartbeat = new Date();
			}else if(items[0] == "kitchen"){
				rooms.kitchen.kitchenSensor.socket = socket;
				rooms.kitchen.kitchenSensor.lastHeartbeat = new Date();
			}
      else if(items[0] == "bathroom"){
				rooms.bathroom.bathroomSensor.socket = socket;
				rooms.bathroom.bathroomSensor.lastHeartbeat = new Date();
			}
			else if(items[0] == "tv"){
				rooms.lounge.tvSensor.socket = socket;
				tvCheckIn();
			}
		}
		else{
			//Ignore fader adjustments shortly after startup, as the remote devices sometimes send a signal.
			if(ignorePot && items[1].indexOf("pot") > -1){
				return;
			}
			//Otherwise send message for processing
			
			
			processMessage(items[0],items[1]);
		}



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

});

server.listen(9998,function(){
	console.log("Server ready for sensors to connect.");
});


// ----------------------------------

var tvTimeoutID = 0;

function tvCheckIn(){
	//Clear any existing timeout and set another one. TV Device checks in every 4 seconds when its on. If we haven't heard from it in about 6 seconds, assume the tv is off.
	clearTimeout(tvTimeoutID);
	tvStateChanged(true);
	tvTimeoutID = setTimeout(function(){
		tvStateChanged(false);
	},6000);
}

function tvStateChanged(newState){
	if(newState == rooms.lounge.tvSensor.state){
		return;
	}
	else{
		rooms.lounge.tvSensor.state = newState;
		if(newState)
		{
			console.log("TV is on");
			//Send the off state to the two left bulbs in the kitchen, in case they are on. These are bulbs 5 and 7. 6 Should remain on.
			state = lightState.create().on(false);
			api.setLightState(5,state).then(displayResult).done();
			state = lightState.create().on(false);
			api.setLightState(7,state).then(displayResult).done();
		}
		else
			console.log("TV is off");
	}


}







function processMessage(controller,command){
    
    // Quick, hacky implementation of party mode...
    if(partyMode && (controller == "couch" || controller == "desk" || controller == "kitchen")){
        console.log("*************************")
        console.log("Party mode is active. Living room & kitchen controls are disabled");
        console.log("*************************")
        return;
    }
    else{
        if(controller == "bedroom-door" && command == "button-west-long-pressed"){
            partyMode = !partyMode;
            if(partyMode){
                rooms.bedroom.bedroomDoorSensor.socket.write('^set-led-state,north,on$');
                var state = lightState.create().on(true).bri(130).hue(13312).sat(255);
			    api.setGroupLightState(0,state).then(displayResult).done();
            }else{
                rooms.bedroom.bedroomDoorSensor.socket.write('^set-led-state,north,off$');
            }
        }
    }

	switch(controller)
	{
		case "kitchen":
		{
			processKitchenCommand(command);
		}
		break;

		case "bedroom-door":
		{
			processBedroomDoorCommand(command);
		}
		break;

		case "bedside":
		{
			processBedsideCommand(command);
		}
		break;

		case "couch":
		{
			processCouchCommand(command);
		}
		break;

    case "desk":
		{
			processDeskCommand(command);
		}
		break;
    case "bathroom":
		{
			processBathroomCommand(command);
		}
		break;
	}
}

function processBathroomCommand(command){
  var state;
	switch(command)
	{
		case "button-north-pressed":
    		console.log("Bathroom north pressed");
    		if(currentTime().hour() >= 7 && currentTime().hour() < 21)
			{
				//Light between 7am and 9pm
				state = lightState.create().on().brightness(100);
				
			}
			else if(currentTime().hour() >= 21 && currentTime().hour() < 22)
			{
				state = lightState.create().on().brightness(70);
			}
			else if(currentTime().hour() >= 22 || currentTime().hour() < 23)
			{
				state = lightState.create().on().brightness(60);
			}
			else if(currentTime().hour() == 23 || currentTime().hour() < 1)
			{
				state = lightState.create().on().brightness(50);
			}
			else 
			{
				// late night
				state = lightState.create().on().brightness(1);
			}

			


			api.lightStatus(9).then(function(status){
				if(status.state.on){
					// Light is on, turn it off
					var offState = lightState.create().off();
					api.setLightState(9, offState).then(displayResult).done();
				}
				else{
					api.setLightState(9, state).then(displayResult).done();
				}
			}).done();


			
		break;

    case "button-north-double-pressed":
    console.log("Bathroom north double pressed");
    		// Full brightness
			state = lightState.create().on().brightness(100);
			api.setLightState(9, state).then(displayResult).done();
		break;

    case "button-north-long-pressed":
    console.log("Bathroom north long pressed");
    		// Minimum brightness
    		state = lightState.create().on().brightness(1);
			api.setLightState(9, state).then(displayResult).done();
		break;
  }
}

function processDeskCommand(command){
	var state;

	//TODO: This should have a state, toggled by button, marked active with its led that adjusts the temperature of the light?

	switch(command) //Descriptions when looking at device, facing the hallway.
	{
		case "button-north-pressed": // top left. Evening mode
			state = lightState.create().on(true).bri(255).hue(15331).sat(121);
			api.setGroupLightState(2,state).then(displayResult).done();
			var whiteState = lightState.create().on(true).bri(255);
			api.setLightState(5,whiteState).then(displayResult).done();
		break;

		case "button-south-pressed": // bottom right. Warm night color
			state = lightState.create().on(true).bri(144).hue(13088).sat(213);
			api.setGroupLightState(2,state).then(displayResult).done();
			var whiteState = lightState.create().on(false);
			api.setLightState(5,whiteState).then(displayResult).done();
		break;

		case "button-east-pressed": // bottom left
			state = lightState.create().on(true).bri(255).hue(13312).sat(206);
			api.setGroupLightState(2,state).then(displayResult).done();
		break;

		case "button-east-double-pressed":
			//Turn off living room lights
			console.log("Turning off living room lights");
			state = lightState.create().on(false);
			api.setGroupLightState(2,state).then(displayResult).done();
			setDeskLampState("off");
			var whiteState = lightState.create().on(false);
			api.setLightState(5,whiteState).then(displayResult).done();
		break;

		case "button-east-long-pressed":
			console.log("Turning off bathroom light");
			state = lightState.create().off();
			api.setLightState(9, state).then(displayResult).done();
			//Also need to update the hue "sensor" state in the bridge, so it knows the light is off
			request.put('http://10.0.0.4/api/newdeveloper/sensors/3/state', {form: '{ "flag": false }'});
		break;

		case "button-west-pressed": //Top Right
			setDeskLampState("toggle");

		break;

		case "button-west-double-pressed": // Top Right
			setLoungeBlindState("toggle");

		break;

		default:
			if(command.beginsWith('pot')){
				var items = command.split("-");


				//Clean the command strings of carrage return characters
				for (var i = items.length - 1; i >= 0; i--) {
					items[i] = items[i].replace('\r','');
				};

				var potValue = parseInt(items[1]);
				console.log(potValue);

				var fadeState = lightState.create().brightness(potValue);
				api.setGroupLightState(2, fadeState).then(displayResult).done();

				// state = lightState.create().off();
				// api.setLightState(9, state).then(displayResult).done();
			}


		break;
	}
}

// Seriously, re-write this mess.

function setLoungeBlindState(newState){
	// Valid values are open, close, stop, toggle

	if(typeof rooms.lounge.lampActor.socket != 'undefined'){
		console.log("sending " + newState + " to lounge blind device");
		switch(newState){
			case "toggle" :
				rooms.lounge.lampActor.socket.write('^control-blinds,0,toggle$');
			break;
			case "open" :
				rooms.lounge.lampActor.socket.write('^control-blinds,0,open$');
			break;
			case "close" :
				rooms.lounge.lampActor.socket.write('^control-blinds,0,close$');
			break;
			case "stop" :
				rooms.lounge.lampActor.socket.write('^control-blinds,0,stop$');
			break;
		}
	}
}

function setDeskLampState(newState){

	if(typeof rooms.lounge.lampActor.socket != 'undefined'){

		switch(newState){
			case "toggle" :
				rooms.lounge.lampActor.state = !rooms.lounge.lampActor.state;
				if(rooms.lounge.lampActor.state){
					rooms.lounge.lampActor.socket.write('^control-lamp,on$');
				}
				else{
					rooms.lounge.lampActor.socket.write('^control-lamp,off$');
				}
			break;

			case "on" :
				rooms.lounge.lampActor.state = true; //TODO: This should be call back based, directly asing the device
				rooms.lounge.lampActor.socket.write('^control-lamp,on$');
			break;

			case "off" :
				rooms.lounge.lampActor.state = false;
				rooms.lounge.lampActor.socket.write('^control-lamp,off$');
			break;
		}
	}
}

function processCouchCommand(command){
	//TEMPORARY - Implement scenes

	var state;
	switch(command)
	{
		case "button-south-pressed":
			//Warm chillout colour
			state = lightState.create().on(true).bri(144).hue(13088).sat(213);
			api.setGroupLightState(2,state).then(displayResult).done();
			var whiteState = lightState.create().on(false);
			api.setLightState(5,whiteState).then(displayResult).done();
		break;

		case "button-north-pressed":
			//TV mode
			console.log("setting tv mode");
			var onState = lightState.create().on(true).hue(13088).sat(213);
			var offState = lightState.create().on(false);
			console.log(onState);
			api.setLightState(1,onState).then(displayResult).done();
			api.setLightState(2,offState).then(displayResult).done();
			api.setLightState(3,offState).then(displayResult).done();

			var whiteState = lightState.create().on(false);
			api.setLightState(5,whiteState).then(displayResult).done();

		break;

		case "button-east-pressed":

			//Evening mode
			console.log("setting evening mode");
			state = lightState.create().on(true).bri(240).hue(15331).sat(121);
			api.setGroupLightState(2,state).then(displayResult).done();
			var whiteState = lightState.create().on(true).bri(20);
			api.setLightState(5,whiteState).then(displayResult).done();
		break;

		case "button-east-double-pressed":
			setLoungeBlindState("toggle");
		break;

		case "button-east-long-pressed": 
			rooms.kitchen.toggleManualMode();
		break;

		case "button-west-pressed":
			//Turn off living room lights
			console.log("Turning off living room lights");
			state = lightState.create().on(false);
			api.setGroupLightState(2,state).then(displayResult).done();
			setDeskLampState("off");
			var whiteState = lightState.create().on(false);
			api.setLightState(5,whiteState).then(displayResult).done();
		break;

		case "button-west-double-pressed":
			//Turn off kitchen lights and hall lights
			console.log("Turning off kitchen lights");
			state = lightState.create().off();
			api.setLightState(4, state).then(displayResult).done();
			api.setLightState(8, state).then(displayResult).done();
			api.setGroupLightState(3, state).then(displayResult).done();

			//Also need to update the hue "sensor" state in the bridge, so it knows the light is off
			request.put('http://10.0.0.4/api/newdeveloper/sensors/4/state', {form: '{ "flag": false }'});

			//Turn off bathroom light
			console.log("Turning off bathroom light");
			state = lightState.create().off();
			api.setLightState(9, state).then(displayResult).done();
			//Also need to update the hue "sensor" state in the bridge, so it knows the light is off
			request.put('http://10.0.0.4/api/newdeveloper/sensors/3/state', {form: '{ "flag": false }'});


		break;

		case "button-west-long-pressed":
			
		break;

		default:
			if(command.beginsWith('pot')){
				var items = command.split("-");


				//Clean the command strings of carrage return characters
				for (var i = items.length - 1; i >= 0; i--) {
					items[i] = items[i].replace('\r','');
				};

				var potValue = parseInt(items[1]);
				console.log(potValue);

				var fadeState = lightState.create().brightness(potValue);
				api.setGroupLightState(2, fadeState).then(displayResult).done();

				// state = lightState.create().off();
				// api.setLightState(9, state).then(displayResult).done();
			}


		break;
	}

}


function processBedroomDoorCommand(command){

	var state;
	switch(command)
	{
		case "button-south-pressed": // top left
			toggleBlinds();
			//This button isn't working

		break;
		case "button-north-pressed": // top right. Toggle main light

			// //Warm chillout colour
			// state = lightState.create().on(true).brightness(255).hue(13088).sat(213);
			// api.setLightState(11, state).then(displayResult).done();
			// api.setLightState(10, state).then(displayResult).done();

			api.lightStatus(10).then(function(status){
				if(status.state.on){
					// Light is on, turn it off
					var offState = lightState.create().off();
					api.setLightState(10, offState).then(displayResult).done();
					api.setLightState(11, offState).then(displayResult).done();
				}
				else{
					state = lightState.create().on(true).brightness(255).hue(13088).sat(213);
					api.setLightState(11, state).then(displayResult).done();
					api.setLightState(10, state).then(displayResult).done();
				}
			}).done();

		break;

		case "button-north-double-pressed": // Top right
			state = lightState.create().on(true).hsl(38,91,70);
			api.setLightState(10,state).then(displayResult).done();

			var offState = lightState.create().on(false);
			api.setLightState(11,offState).then(displayResult).done();
		break;

		case "button-east-pressed": // bottom right - toggle blinds
			toggleBlinds();
			//Off
			// state = lightState.create().on(false);
			// api.setLightState(11, state).then(displayResult).done();
			// 	api.setLightState(10, state).then(displayResult).done();
		break;

		case "button-east-double-pressed": // Bottom right
			toggleBlinds(0);
		break;

		case "button-east-long-pressed": // Bottom right
			toggleBlinds(1);
		break;

		case "button-west-pressed": //Note - Theres a bug, likely hardware in bedroom door switch, button-south-pressed is also triggered. Pin short circuit maybe.
			//Turn on mood lamp only
			state = lightState.create().on(true).hsl(38,91,50);
			api.setLightState(10,state).then(displayResult).done();

			var offState = lightState.create().on(false);
			api.setLightState(11,offState).then(displayResult).done();
		break;

		case "button-west-double-pressed":



		break;

		case "button-west-long-pressed":

		break;

		default:
			if(command.beginsWith('pot')){
				var items = command.split("-");


				//Clean the command strings of carrage return characters
				for (var i = items.length - 1; i >= 0; i--) {
					items[i] = items[i].replace('\r','');
				};

				var potValue = parseInt(items[1]);
				console.log(potValue);

				var fadeState = lightState.create().brightness(potValue);
				api.setLightState(11, fadeState).then(displayResult).done();
				api.setLightState(10, fadeState).then(displayResult).done();

				// state = lightState.create().off();
				// api.setLightState(9, state).then(displayResult).done();
			}


		break;
	}

}



function processBedsideCommand(command){

	/*
	Top left: South
	Top right: North
	Bottom left: East
	Bottom right: West

	*/

	var state;
	switch(command)
	{

		/*
         
         +------------------+
         |.                .|
		 |                  |
		 |         0        |===============
		 |                  |
		 |.               X |
		 +------------------+
		*/
		case "button-south-pressed": //BOTTOM RIGHT

		break;

		case "button-south-double-pressed":

		break;

		case "button-south-long-pressed":

		break;




		/*
         
         +------------------+
         |.                .|
		 |                  |
		 |         0        |===============
		 |                  |
		 |X                .|
		 +------------------+
		*/

		case "button-north-pressed":  //BOTTOM LEFT
		break;





		/*
         
         +------------------+
         |.                X|
		 |                  |
		 |         0        |===============
		 |                  |
		 |.                .|
		 +------------------+
		*/
		case "button-east-pressed": //TOP RIGHT
			toggleBlinds();
			// console.log("3 *************************");
			// state = lightState.create().on(false);
			// api.setLightState(11, state).then(displayResult).done();
			// api.setLightState(10, state).then(displayResult).done();
		break;

		case "button-east-double-pressed":
			toggleBlinds(0);
		break;

		case "button-east-long-pressed": 
			toggleBlinds(1);
			// //Turn off all lights
			// state = lightState.create().on(false);
			// api.setGroupLightState(0, state).then(displayResult).done();
			// setDeskLampState("off");
			// //Update the sensor state in the bridge so it knows the bathroom light and hall light are off:
			// request.put('http://10.0.0.4/api/newdeveloper/sensors/4/state', {form: '{ "flag": false }'});
			// request.put('http://10.0.0.4/api/newdeveloper/sensors/3/state', {form: '{ "flag": false }'});
		break;






		/*

		Main light control
         
         +------------------+
         |X                .|
		 |                  |
		 |         0        |===============
		 |                  |
		 |.               .|
		 +------------------+
		*/

		case "button-west-pressed": // TOP LEFT
			
			api.lightStatus(10).then(function(status){
				if(status.state.on){
					// Light is on, turn it off
					var offState = lightState.create().off();
					api.setLightState(10, offState).then(displayResult).done();
					api.setLightState(11, offState).then(displayResult).done();
				}
				else{
					state = lightState.create().on(true).brightness(255).hue(13088).sat(213);
					api.setLightState(11, state).then(displayResult).done();
					api.setLightState(10, state).then(displayResult).done();
				}
			}).done();
			
		break;

		case "button-west-double-pressed":
			// //Turn on mood lamp only
			state = lightState.create().on(true).hsl(38,91,70);
			api.setLightState(10,state).then(displayResult).done();

			var offState = lightState.create().on(false);
			api.setLightState(11,offState).then(displayResult).done();
		break;

		case "button-west-long-pressed":
			// //Turn off all lights
			state = lightState.create().on(false);
			api.setGroupLightState(0, state).then(displayResult).done();
			setDeskLampState("off");
			//Update the sensor state in the bridge so it knows the bathroom light and hall light are off:
			request.put('http://10.0.0.4/api/newdeveloper/sensors/4/state', {form: '{ "flag": false }'});
			request.put('http://10.0.0.4/api/newdeveloper/sensors/3/state', {form: '{ "flag": false }'});
		break;

		default:
			if(command.beginsWith('pot')){
				var items = command.split("-");


				//Clean the command strings of carrage return characters
				for (var i = items.length - 1; i >= 0; i--) {
					items[i] = items[i].replace('\r','');
				};

				var potValue = parseInt(items[1]);
				console.log(potValue);

				var fadeState = lightState.create().brightness(potValue);
				api.setLightState(11, fadeState).then(displayResult).done();
				api.setLightState(10, fadeState).then(displayResult).done();

				// state = lightState.create().off();
				// api.setLightState(9, state).then(displayResult).done();
			}


		break;
	}
}



function processKitchenCommand(command){

	console.debug("Kitchen: " + command);

	var state;

	switch(command){
		case "motion-started":
			if(!rooms.kitchen.roomState.manualMode){
				turnOnKitchenLightsTimeSensitive();
			}

		break;

		case "motion-stopped":
			//Turns off kitchen lights
			if(!rooms.kitchen.roomState.manualMode){
				state = lightState.create().off().transition(4);
				api.setLightState(4, state).then(displayResult).done();

				state = lightState.create().off().transition(3);
				api.setGroupLightState(3, state).then(displayResult).done();
			}


		break;

		case "button-north-pressed":
			//Toggles on/off work mode. Lights are updated to reflect change. Workmode times out after 1 hour (on CC)
			// Set light state to 'on' with warm white value of 500 and brightness set to 100%
			rooms.kitchen.toggleWorkMode();
		break;

		case "button-south-double-pressed":
			rooms.kitchen.toggleManualMode();
		break;

		case "button-south-pressed":
			//The lights in the kitchen are on if the kitchen color lamp (lamp 4) is on
			api.lightStatus(4).then(function(status){
				if(status.state.on){
					state = lightState.create().off().transition(4);
					api.setLightState(4, state).then(displayResult).done();

					state = lightState.create().off().transition(3);
					api.setGroupLightState(3, state).then(displayResult).done();
				}
				else{
					turnOnKitchenLightsTimeSensitive();
				}
			}).done();
			

		break;

		case "button-south-long-pressed":
			//Turn off lights immediately (except the kitchen mood, which will turn off itself after motion stops)
			state = lightState.create().off();
			api.setGroupLightState(4, state).then(displayResult).done();
			setDeskLampState("off");
			request.put('http://10.0.0.4/api/newdeveloper/sensors/3/state', {form: '{ "flag": false }'});
			request.put('http://10.0.0.4/api/newdeveloper/sensors/4/state', {form: '{ "flag": false }'});
		break;

		case "checkin":
			//console.debug("Kitchen device checked in.");
		break;

	}
}

function turnOnBedroomLightsTimeSensitive()
{
	var state;

	//TODO: WHen re-writing, this should be a smooth fade over the evening. If light is on, it is updated each hour by a slow fade to new colour, otherwise its turned on at correct colour.
	//Pick colours at the right time of night and record via API. Setup scenes here first.

		if(currentTime().hour() >= 7 && currentTime().hour() < 22)
		{
			console.debug("Updating bedroom lights to daytime setting...");
			//Light between 7am and 9:59pm

			state = lightState.create().on().brightness(100);
			api.setLightState(11, state).then(displayResult).done();

			state = lightState.create().off();
			api.setLightState(10, state).then(displayResult).done();


		}
		else if(currentTime().hour() >= 22 || currentTime().hour() < 1)
		{
			//Light between 10pm and midnight
			console.debug("Updating bedroom lights to late evening setting...");
			state = lightState.create().on().brightness(100); //TODO: Set Colour.
			api.setLightState(11, state).then(displayResult).done();

			state = lightState.create().on().hsl(49,65,93).transition(3);
			api.setLightState(10, state).then(displayResult).done();

		}
		else if(currentTime().hour() >= 0 || currentTime().hour() < 1)
		{
			//Light between 10pm and 1am
			console.debug("Updating bedroom lights to late night setting...");
			state = lightState.create().on().hsl(68,87,34);
			api.setLightState(4, state).then(displayResult).done();

			state = lightState.create().off();
			api.setGroupLightState(3, state).then(displayResult).done();
		}
		else
		{
			//Light between 1am and 7am (midnight mode)
			console.debug("Updating bedroom lights to midnight setting...");
			state = lightState.create().on().brightness(30); //White light is on to cover scenarios where arriving home late.
			api.setLightState(11, state).then(displayResult).done();

			state = lightState.create().on().hsl(49,65,93).transition(3);
			api.setLightState(10, state).then(displayResult).done();
		}


}

function turnOnKitchenLightsTimeSensitive(){
	console.log("turnOnKitchenLightsTimeSensitive()");
	var state;

	if(rooms.kitchen.roomState.workMode){
		console.log("Updating kitchen lights to work mode...");
		//If work mode is enabled, turn that on when motion detected.
		if(currentTime().hour() < 6){
			//After midnight, use a dimmer version for work mode. Full brightness can always be accessed via the app
			state = lightState.create().on().hsl(68,87,100);
			api.setLightState(4, state).then(displayResult).done();
			setTimeout(function(){
				state = lightState.create().on().brightness(69);
				var offState = lightState.create().off();
				if(rooms.lounge.tvSensor.state == true){
					api.setLightState(6,state).then(displayResult).done();
					api.setLightState(7,offState).then(displayResult).done();
				}
				else{
					api.setGroupLightState(3, state).then(displayResult).done();
				}
			},300);

		}
		else{
		state = lightState.create().on().hsl(68,87,100);
		api.setLightState(4, state).then(displayResult).done();
		setTimeout(function(){
			state = lightState.create().on().brightness(100);
			var offState = lightState.create().off();
			if(rooms.lounge.tvSensor.state == true){
				api.setLightState(6,state).then(displayResult).done();
				api.setLightState(7,offState).then(displayResult).done();
			}
			else{
				api.setGroupLightState(3, state).then(displayResult).done();
			}
		},300);

		}

	}
	else
	{
		if(currentTime().hour() >= 7 && currentTime().hour() < 21)
		{
			console.log("Updating kitchen lights to daytime setting...");
			//Light between 7am and 6:59pm
			state = lightState.create().on().hsl(68,87,64);
			api.setLightState(4, state).then(displayResult).done();
			setTimeout(function(){
				state = lightState.create().on().brightness(69);
				var offState = lightState.create().off();
				if(rooms.lounge.tvSensor.state == true){
					api.setLightState(6,state).then(displayResult).done();
					api.setLightState(7,offState).then(displayResult).done();
				}
				else{
					api.setGroupLightState(3, state).then(displayResult).done();
				}

			},300);

		}
		else if(currentTime().hour() >= 21 && currentTime().hour() < 22)
		{
			//Light between 7pm and 9:59pm
			console.log("Updating kitchen lights to evening setting...");
			state = lightState.create().on().hsl(68,87,84);
			api.setLightState(4, state).then(displayResult).done();
			setTimeout(function(){
				state = lightState.create().off();
				api.setGroupLightState(3, state).then(displayResult).done();
			},300);


		}
		else if(currentTime().hour() >= 22 || currentTime().hour() < 1)
		{
			//Light between 10pm and 1am
			console.log("Updating kitchen lights to night setting...");
			state = lightState.create().on().hsl(68,87,44);
			api.setLightState(4, state).then(displayResult).done();
			setTimeout(function(){
				state = lightState.create().off();
				api.setGroupLightState(3, state).then(displayResult).done();
			},300);

		}
		else
		{
			//Light between 1am and 7am (midnight mode)
			console.log("Updating kitchen lights to midnight setting...");
			state = lightState.create().on().hsl(71,82,3);
			api.setLightState(4, state).then(displayResult).done();
			setTimeout(function(){
				state = lightState.create().off();
				api.setGroupLightState(3, state).then(displayResult).done();
			},300);

		}
	}

}


// -------  Basic web server for serving info via web browser -------



app.get('/',function(req,res){
	res.send("Current server time is " + Date());
});

var server = app.listen(8080,function(){
	var host = server.address().address;
	var port = server.address().port;

	console.log('Basic server info available @ http://' + ip.address() + ':' + port);
});



// -----------------------------------------










// -------  General Utility functions -------

function currentTime(){
	return moment().tz('Australia/Sydney');
}


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely

    console.log("*****************************************");
    console.log(err.stack);
    console.log("*****************************************\n");

});


String.prototype.beginsWith = function (string) {
    return(this.indexOf(string) === 0);
};



var logger = console.log;
// console.log = function(log){
// 	logger(currentTime().format("HH:mm:ss") + " - " + log.green);
// }

console.error = function(log){
	logger((currentTime().format("HH:mm:ss") + " - " + log).red);
}

console.info = function(log){
	logger((currentTime().format("HH:mm:ss") + " - " + log).green);
}

console.debug = function(log){
	logger((currentTime().format("HH:mm:ss") + " - DEBUG: " + log).blue);
}



var displayResult = function(result) {
    if(result){
    	console.debug("Light state updated.");
    }
    else{
	console.error("Unable to update light state.");
    }
};




console.log("Server ready.");
