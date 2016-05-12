var _ = require('underscore');
var arduinoLight = require('./arduino-light');
var blinds = require('./blinds');
var state = require('./state');
var deviceControl = require('./external-device');

/* Central scenes are custom internal scenes */

var scenes = {
    "arduino-light" : function(params){
        var light = params.light;
        var state = params.state;
        console.log("setting....");
        arduinoLight.setLightState(light, state);
    },
     "blind" : function(params){
        var room = params.room;
        var index = parseInt(params.index);
        var state = params.state;
        blinds.setBlindState(room,index,state,function(success){
            console.log("Blind scene operation completed.");
        });
    },
    "ceiling-fan" : function(params){
      deviceControl.sendCommand("ceilingFan", params.state);
    },
    "wemo-device" : function(params){
      deviceControl.sendCommand(params.name, params.state);
    },
    "harmony-activity" : function(params){
        deviceControl.sendCommand(params.activity, params.state);
    },
    "command" : function(params){
        deviceControl.executeRawCommand(params.command)
    },
    "mode-change" : function(params){
        console.log("Params:");
        console.log(params);
        state.setState(params.mode,params.state);
    },
    "imac-display" : function(params){
        deviceControl.sendCommand("imac-display", params.state);
    },
    "night" : function(){
        //Turn off all media devices, ceiling fan, lights
    },
    "midnight" : function(){
        
    } 
};


exports.setScene = function(id,parameters){
    console.log("Set central scene " + id);
    scenes[id](parameters);
    
};