var events = require('events');
//var recipes = require("./recipes");
var actions = require("./actions");
var state = require('./state');
var eventEmitter;


var self = this;

exports.initialize = function(emitter){
  eventEmitter = emitter;
};

exports.setWemoState = function(id,callback){
    
}


exports.getWemoState = function(id,state){
   
}