/* *******************
Provides kelvin values for appropriate white-points dependant on time of day.
******************** */
var hue = require('node-hue-api');
var sunCalculator = require('suncalc');
var scheduler = require('node-schedule');

var eventEmitter;
var times;
var lightState = hue.lightState;
/*
+---------------+--------------------------------------------------------------------------+
|   Property    |                               Description                                |
+---------------+--------------------------------------------------------------------------+
| sunrise       | sunrise (top edge of the sun appears on the horizon)                     |
| sunriseEnd    | sunrise ends (bottom edge of the sun touches the horizon)                |
| goldenHourEnd | morning golden hour (soft light, best time for photography) ends         |
| solarNoon     | solar noon (sun is in the highest position)                              |
| goldenHour    | evening golden hour starts                                               |
| sunsetStart   | sunset starts (bottom edge of the sun touches the horizon)               |
| sunset        | sunset (sun disappears below the horizon, evening civil twilight starts) |
| dusk          | dusk (evening nautical twilight starts)                                  |
| nauticalDusk  | nautical dusk (evening astronomical twilight starts)                     |
| night         | night starts (dark enough for astronomical observations)                 |
| nadir         | nadir (darkest moment of the night, sun is in the lowest position)       |
| nightEnd      | night ends (morning astronomical twilight starts)                        |
| nauticalDawn  | nautical dawn (morning nautical twilight starts)                         |
| dawn          | dawn (morning nautical twilight ends, morning civil twilight starts)     |
+---------------+--------------------------------------------------------------------------+
*/

var sydneyLatLong = [-33.8650, 151.2094];


exports.initialize = function(emitter){
  eventEmitter = emitter;

  // On initialization, compute sun position times for the current day, and create a
  // daily recurring schedule to recalculate each night at midnight.
  calculateSunRelatedTimes();
  var scheduleRule = new scheduler.RecurrenceRule();
  scheduleRule.minute = 0;
  scheduleRule.hour = 0;
  scheduler.scheduleJob(scheduleRule, calculateSunRelatedTimes());
};

exports.lightStateForTime = function(currentTime){
  /*
  Initially, return a daylight color from 6am until sunset,
  Then return progressively warmer colours from sunset until 11pm, when its warmest.
  */
}

exports.lightStateForKelvin = function(kelvin){
  /*
  Initially, return a daylight color from 6am until sunset,
  Then return progressively warmer colours from sunset until 11pm, when its warmest.
  */
}

exports.lightStateForPercent = function(kelvin){
  /*
  Initially, return a daylight color from 6am until sunset,
  Then return progressively warmer colours from sunset until 11pm, when its warmest.
  */
}


function calculateSunRelatedTimes(){
  times = sunCalculator.getTimes(new Date(),sydneyLatLong[0],sydneyLatLong[1]);
}
