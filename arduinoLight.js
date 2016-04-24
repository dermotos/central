var events = require('events');
var actions = require("./actions");
var state = require('./state');
var sensors = require('./sensors');
var eventEmitter;


var self = this;

exports.initialize = function(emitter){
  eventEmitter = emitter;
};

exports.getLightState = function(room,index,callback){
    console.log("getBlindState is not implemented, and probably wont be.");
}

//Valid parameters are: 
// room : "bedroom" | "lounge"
// index: 0 | 1
// state: "open" | "close" | "stop" | "toggle"
exports.setBlindState = function(room,index,state){
   if(room == "bedroom"){
      var actor = sensors.sensorStates["bedroom-blinds"];
      if(typeof(actor) === 'undefined' || typeof(actor.socket) === 'undefined'){
        callback("Specified blind's remote interface unavailable");
      }else{
        //Set sensible defaults (0th blind, toggle) if parameters not defined
        if(typeof(state) === 'undefined'){ state = "toggle"; }
        if(!(state == "open" ||state == "close" ||state == "stop" ||state == "toggle")) { state = "toggle"; }
        if(typeof(index) === 'undefined'){ index = 0; }
       
        actor.socket.write('^control-blinds,' + index + ','+  +'$');
      }
      
    }
}


