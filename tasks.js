/*

Tasks are wrappers around simple actions. eg: turn off a light, turn on one, toggle light etc.
They are usually part of a recipe. Tasks make use of state.js, which contains state for lights, blinds,
humans in or out of house etc...


Current actions:

Kitchen light on, time sensitive?
Work mode on/off
Manual mode on/off
Kitchen light on/off
All lights off, kitchen off 3 minutes later

Living room daylight
Living room evening light
Living room off
Open, close stop living room blinds
Toggle desk lamp
turn on desk lamp
turn off desk lamp

Kitchen lights on in tv mode // Handled by an event that changes state.

TV watching mode
Fade currently on living room lights
Turn off bathroom light
Turn off kitchen lights and hall light

Turn on bedroom night light
Turn on main bedroom ligh
Bedroom lights off
Open blinds,
Close blinds
Stop blinds

All lights in house off.
Late night mode (trip to bathroom)


*/


//TODO:!! RECPIES use these. Recipes are where "if xyz in the house, do this, otherwise do that" live.

var hue = require('node-hue-api');
var lights = require('./lights');
var circadian = require('./circadian');
var state = require('./state');

var eventEmitter;

var host = "10.0.0.4",
  username = "newdeveloper",
  api = new hue.HueApi(host, username);

exports.initialize = function (emitter) {
  eventEmitter = emitter;
};

exports.home = {};
exports.kitchen = {};
exports.livingRoom = {};
exports.bathroom = {};
exports.hallway = {};
exports.bedroom = {};


exports.kitchen.lightsToggle = function (turnOn, temperature, brightness) {
  console.log("lights toggle");
  //console.log(turnOn);
  //console.log(hue);

  // Toggle handling
  if (typeof turnOn == 'undefined') {
    console.log('turnon is undefined');
    api.lightStatus(lights.kitchenColor.id).then(function (status) {
      exports.kitchen.lightsToggle(!status.state.on);
    });
    return;
  }

  if (turnOn) {
    var coloredLightState;
    var whiteLightState;

    if (state.getState("kitchenWorkMode")) {
      // Work mode is on. Lights at full brightness
      coloredLightState = hue.lightState.create()
        .on(true)
        .brightness(100)
        .colorTemperature(circadian.brightnessForTime(circadian.currentMoment()));

      // Getting the brightness from circadian ensures that at 3am (for example)
      // the full brightness is around 70%.
      whiteLightState = hue.lightState.create()
        .on(true)
        .brightness(circadian.brightnessForTime(circadian.currentMoment()));
    }
    else {
      console.log("Setting white to " + circadian.whiteForTime(circadian.currentMoment()));
      coloredLightState = hue.lightState.create()
        .on(true)
        .brightness((typeof brightness == 'undefined') ? circadian.brightnessForTime(circadian.currentMoment()) : brightness)
        .colorTemperature((typeof temperature == 'undefined') ? circadian.whiteForTime(circadian.currentMoment()) : temperature);

      whiteLightState = hue.lightState.create()
        .on(true)
        .brightness((typeof brightness == 'undefined') ? circadian.brightnessForTime(circadian.currentMoment()) : brightness).transitionSlow();
    }

    api.setLightState(lights.kitchenColor.id, coloredLightState).done();
    api.setLightState(lights.kitchenWhite0.id, whiteLightState).done();
    api.setLightState(lights.kitchenWhite1.id, whiteLightState).done();
  }
  else {
    // Turn off the kitchen lights
    var lightState = hue.lightState.create().on(false).transitionSlow();
    api.setLightState(lights.kitchenColor.id, lightState).done();
    api.setLightState(lights.kitchenWhite0.id, lightState).done();
    api.setLightState(lights.kitchenWhite1.id, lightState).done();

  }

}


// Living room daylight
// Living room evening light
// Living room off
// Open, close stop living room blinds
// Toggle desk lamp
// turn on desk lamp
// turn off desk lamp

exports.livingRoom.lightsToggle = function (turnOn, temperature, brightness) {

  if (typeof turnOn == 'undefined') {
    api.lightStatus(lights.livingRoomLeft.id).then(function (status) {
      exports.livingRoom.lightsToggle(!status.state.on);
    });
    return;
  }

  if (turnOn) {
    var lightState;

    lightState = hue.lightState.create()
      .on(true)
      .brightness((typeof brightness == 'undefined') ? circadian.brightnessForTime(circadian.currentMoment()) : brightness)
      .colorTemperature((typeof temperature == 'undefined') ? circadian.whiteForTime(circadian.currentMoment()) : temperature);

    api.setLightState(lights.livingRoomLeft.id, lightState).done();
  }
  else {
    // Turn off the kitchen lights
    var lightState = hue.lightState.create().on(false).transitionSlow();
    api.setLightState(lights.livingRoomLeft.id, lightState).done();
  }
}


exports.livingRoom.blindsToggle = function (action) {
  // Action can be null, open, close or stop
}


exports.livingRoom.lightsToggle = function () {

}

exports.livingRoom.allOtherLightsOff = function () {

}


exports.livingRoom.deskLampToggle = function (action) {
  // Action can be null, on, off or stop
}

exports.livingRoom.lightsTvMode = function () {

}

exports.livingRoom.lightsFullBrightness = function () {

}




exports.bathroom.lightsOn = function (turnOn, temperature, brightness) {

}

exports.bathroom.lightsOff = function () {

}


exports.hallway.lightsOn = function (turnOn, temperature, brightness) {

}

exports.hallway.lightsOff = function () {

}

// Turn on bedroom night light
// Turn on main bedroom ligh
// Bedroom lights off
// Open blinds,
// Close blinds
// Stop blinds
//
// All lights in house off.
// Late night mode (trip to bathroom)




exports.bedroom.nightMode = function (on) {
  // Night mode should be toggled depending if someone is in bed for longer than 10 mins.
}

exports.bedroom.lightsOn = function (turnOn, temperature, brightness) {
  // If night mode, the temperature will have to be interperated differently, as the nightlight isn't capable of rendering true kelvin values
}

exports.bedroom.lightsOff = function () {

}

exports.bedroom.blindsToggle = function (action) {
  // Action can be null, open, close or stop
}


//State tasks modify the state of the apartment. The rules engine is executed, and may (or may not) change or do something depending on the new state. These things it does will
//likely be a recipe, made of other tasks.

exports.home.midnightMode = function (on) {
  console.log("Midnight mode not yet supported");
  //state.setState("midnightMode",on);
  // Toggles the state of midnight mode. (not the actual light changes)
}


exports.home.kitchenWorkMode = function (on) {
  state.setState("kitchenWorkMode", on);
}

exports.home.kitchenManualMode = function (on) {
  state.setState("kitchenManualMode", on);
}

exports.home.bedtimeMode = function (on) {
  console.log("Bedtime mode not yet supported");
  //state.setState("bedtimeMode",on);
  //Disables motion in kitchen, turns on all lights warm and dim. GETTING INTO BED in this state turns off all lights when in bed.
  //This kind of thing really needs Siri integration.
}
