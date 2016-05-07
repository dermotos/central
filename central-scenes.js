var _ = require('underscore');
var arduinoLight = require('./arduino-light');
var blinds = require('./blinds');
var state = require('./state');

/* Central scenes are custom internal scenes */

var scenes = {
    "arduino-light" : function(params){
        var light = params.light;
        var operation = params.operation;
        console.log("setting....");
        arduinoLight.setLightState(light, operation);
    },
     "blind" : function(params){
        var room = params.room;
        var index = parseInt(params.index);
        var state = params.state;
        blinds.setBlindState(room,index,state,function(success){
            console.log("Blind scene operation completed.");
        });
    },
    "playstation" : function(params){
        var command = params.command;
        var delay = params.delay;
        //Press 'X' on PS (harmony) remote after a delay to bypass login
    },
    "mode-change" : function(params){
        console.log("Params:");
        console.log(params);
        state.setState(params.mode,params.state);
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