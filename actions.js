var hue = require('./hue');
var blinds = require('./blinds');
var state = require('./state');
var circadian = require('./circadian');
var moment = require('moment');




exports.getLightPowerState = function (light) {
    //Returns bool
};

exports.executeAction = function (action, args) {
    //console.log("action:" + JSON.stringify(action));
    if (action.type == "hue-scene") {
        executeScene(action.id);
    }
    else if (action.type == "central-scene") {
        console.log("central scenes not yet implemented")
    }
    else if (action.type == "multi-scene") {
        //Check if this scene is mode sensitive:
        console.log("Testing multi-scene mode rule...");
        if (typeof (action.mode) !== 'undefined' || action.mode == "none") {
            // Scene is mode sensitive, check if it's negated (i.e.: does NOT run when the mode is active)
            var negate = (action.mode.indexOf("!") == 0);
            var sceneMode = negate ? action.mode.substring(1) : action.mode;
            // Check if mode is on or off...
            var modeIsOn = state.getState(sceneMode);
            //console.log("Mode:" + modeIsOn + " Negate:" + negate);
            if (modeIsOn && !negate) {
                //console.log("Scene is mode sensitive, and this mode is active, so, executing...");
                executeMultiSceneAction(action);
            }
            else if (modeIsOn && negate) {
                //console.log("This scene should only execute when the mode is off, but its currently on. Skipping");
            }
            else if (!modeIsOn && !negate) {
                //console.log("Mode is off, but this scene requires it to be on to run. Skipping");
            }
            else if (!modeIsOn && negate) {
                //console.log("Mode is off, and this scene only runs when this is the case. Executing...")
                executeMultiSceneAction(action);
            }
        }
        else {
            // Scene isn't mode sensitive, so execute regardless
            console.log("Scene isn't mode sensitive, executing...");
            executeMultiSceneAction(action);
        }
    }
    else if (action.type == "blind") {
        executeBlindAction(args);
    }
    else {
        console.log("Unspecified action");
    }
}


exports.executeFade = function (group, brightness) {
    console.log("Fade lights in " + group + " to " + brightness);
    hue.setBrightness(group, brightness);
}

function executeMultiSceneAction(action, lightsAreOn) {
    var turnedOn = false;
    //First, check if this is a toggle action:
    if (action.toggle && typeof (lightsAreOn) === 'undefined') {
        //Its a toggle, and not a recall of this function.
        // Check if one of the lightsAffected are on. if so, run the "off" scene, otherwise proceed as normal
        hue.getLightPowerState(action.lightsAffected[0], function (on) {
            if (on) {
                executeMultiSceneAction(action, true);
            } else {
                executeMultiSceneAction(action, false);
            }
        });
    }
    else if (action.toggle && lightsAreOn) {
        // run the off command
        console.log("Running the off scene");
        turnedOn = false;
        var offSceneID = action.scenes["off"];
        hue.setScene(offSceneID);
    }
    else {
        // run the correct scene in the collection for the current time of day
        console.log("Running the correct scene for the time of day");
        turnedOn = true;
        //console.log("Scenes: " + JSON.stringify(Object.keys(action.scenes), null, 2));
        var keys = Object.keys(action.scenes);

        for (var x = 0; x < keys.length; x++) {
            var key = keys[x];
            //console.log("Key: " + key);
            //console.log("Object: " + action.scenes[key]);
            if (timeRangeIsNow(key)) {
                //Found the correct scene
                var sceneID = action.scenes[key];
                if (sceneID == "unassigned") {
                    console.log("Scene unassigned. Skipping.");
                }
                else {
                    console.log("Setting the " + sceneID + " scene.");
                    hue.setScene(sceneID);
                }
                break;
            }
        }

        for (var key in Object.keys(action.scenes)) {
            //console.log(key);
            if (Object.keys(action.scenes).hasOwnProperty(key)) {
                if (timeRangeIsNow(key)) {
                    //Found the correct scene
                    var sceneID = action.scenes[key];
                    console.log("Setting the " + sceneID + " scene.");
                    hue.setScene(sceneID);
                    break;
                }
            }
        }
    }


    /* There is a bug/issue with the hue bridge, where the light state
       is not immediately updated and can report the old value for up to
       15 seconds after the scene is set. This directly sets the power state
       of the lights so it reports correctly. This is needed for toggles, which
       check the state of the light and proceed accordingly based on that. */
    if (action.toggle) {
        setTimeout(function () {
            hue.setLightPowerState(action.lightsAffected, turnedOn);
        }, 2000);

    }
}

//Returns true/false if the timeRange (in the format 00-02 for between midnight and 2am, including ss for sunset and sr for sunrise)
// covers the current moment or not.
function timeRangeIsNow(timeRange) {

    //console.log("Checking time range " + timeRange);
    function momentFromTime(timeParts) {
        var now = moment();
        //console.log("Now time " + now.format("dddd, MMMM Do YYYY, h:mm:ss a"));
        var dateTime = null;
        var time = timeParts.split(":");
        //console.log("TIME: " + time );
        var incrementToNextDay = (time[0]== 24);
        
        //console.log("Time parts:" + now.year() + "-"+ now.month() + "-"+ now.day() + "-"+ now.year() + "-" );
        
        dateTime = moment({
            year: now.year(),
            month: now.month(),
            date: now.date(),
            hour: time[0] == 24 ? 0 : time[0],
            minute: time[1],
            second: 0
        });
        if (incrementToNextDay) {
            dateTime.add(1, 'days');
        }
        console.log("Date time " + dateTime.format("dddd, MMMM Do YYYY, h:mm:ss a"));
        return dateTime;
    }

    if (timeRange.indexOf('-') == -1) {
        return;
    }

    var startTime = null;
    var endTime = null;
    /* Example values passed in:
     * 00:00-sunrise = "midnight to sunrise"
     * 04:00-22:00 = "4am to 10pm"
     * 04:00-sunset = "4am to sunset"
     */
    var part = timeRange.split("-");
    //console.log("Parts: " + JSON.stringify(part[0],null,2));

    if (part[0] == "sunrise") {
        startTime = circadian.sunrise();
    }
    else if (part[0] == "sunset") {
        startTime = circadian.sunset();
    } else {
        startTime = momentFromTime(part[0]);
    }

    if (part[1] == "sunrise") {
        endTime = circadian.sunrise();
    }
    else if (part[1] == "sunset") {
        endTime = circadian.sunset();
    } else {
        endTime = momentFromTime(part[1]);
    }
    
    //console.log("Start time: " + startTime);
    //console.log("End time: " + endTime);
    var inRange =  moment().isBetween(startTime, endTime);
    if(inRange){
        console.log(timeRange + " is in range");
    }
    else{
        console.log(timeRange + " is not in range");
    }
    return inRange;
    
}

function executeScene(sceneID) {
    if (sceneID == "unassigned") {
        console.log("Unassigned scene.");
    }
    else {
        console.log("Activating scene with id:" + sceneID);
        hue.setScene(sceneID);
    }
}

function executeBlindAction(args) {
    //Arg indices:
    // 0 : room, eg: "lounge", "bedroom",
    // 1 : blind index (0,1 or 2 meaning both 0 and 1)
    // 2 : new state. toggle, open, close, stop
    blinds.setBlindState(args[0], args[1], args[2]);

}

function executeCustomAction(actionID, args) {
    console.log("Execute a custom action. Action:" + actionID + " args: " + args);
}