/* Central scenes are custom internal scenes */

var scenes = {
    "arduino-light" : function(params){
        var light = params.light;
        var state = params.state;
    },
    "playstation" : function(params){
        var command = params.command;
        var delay = params.delay;
        //Press 'X' on PS (harmony) remote after a delay to bypass login
    },
    // "living-room-lights-contingency" : function(){
    //     //Turn on living room lights if the bedroom are being turned off,
    //     //and the living room lights, tv, or kitchen/bathroom/hall aren't on
    // },
    "blind-control" : function(){
        var room = params.room;
        //Turn off all media devices, set lights to a bedtime mode
    },
    "night" : function(){
        //Turn off all media devices, ceiling fan, lights
    },
    "midnight" : function(){
        
    },
    
    
    
    
}