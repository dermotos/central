var events = require('events');
//var recipes = require("./recipes");
var actions = require("./actions");
var state = require('./state');
var sensors = require('./sensors');
var eventEmitter;


var self = this;

exports.initialize = function(emitter){
  eventEmitter = emitter;
};

exports.getBlindState = function(room,index,callback){
    console.log("getBlindState is not implemented, and probably wont be.");
}

//Valid parameters are: 
// room : "bedroom" | "lounge"
// index: 0 | 1
// state: "open" | "close" | "stop" | "toggle"
exports.setBlindState = function(room,index,state,callback){
  var actor;
   if(room == "bedroom"){
      actor = sensors.sensorStates["bedroom-blinds"]; 
    } else if(room == "lounge"){
      actor = sensors.sensorStates["desklamp"]; //Same actor as the desklamp
    }
    
    if(typeof(actor) === 'undefined' || typeof(actor.socket) === 'undefined' || actor.socket == null){
        console.log("Blind interface not connected");
        if(callback){
          callback("error");
        } 
      }else{
        //Set sensible defaults (0th blind, toggle) if parameters not defined
        if(typeof(state) === 'undefined'){ state = "toggle"; }
        if(!(state == "open" ||state == "close" ||state == "stop" ||state == "toggle")) { state = "toggle"; }
        if(typeof(index) === 'undefined'){ index = 0; }
        if(index == 2){
          actor.socket.write('^control-blinds,0,'+ state +'$');
          actor.socket.write('^control-blinds,1,'+ state +'$');
        }else{
          actor.socket.write('^control-blinds,' + index + ','+ state +'$');
        } 
        console.log("Command sent to blinds");
      } 
}


