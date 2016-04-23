var events = require('events');
var recipes = require("./recipes");
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


exports.setBlindState = function(room,index,state){
   if(room == "bedroom"){
      var actor = sensors.sensorStates["bedroom-blinds"];
      if(typeof(actor) === 'undefined' || typeof(actor.socket) === 'undefined'){
        callback("error");
      }else{
        if(typeof(state) === 'undefined'){
          
        }
        actor.socket.write('^control-blinds,' + index + ',open$');
      }
      
    }
}


