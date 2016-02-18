/* *******************
Provides kelvin values for appropriate white-points dependant on time of day.
******************** */
var hue = require('node-hue-api');
var sunCalculator = require('suncalc');
var scheduler = require('node-schedule');
var moment = require('moment');
var timezone = require('moment-timezone');
var map = require('./map.js');
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

exports.test = function(){
  console.log(moment(times.sunrise));
}

exports.whiteForTime = function(time){
  /*
  Initially, return a daylight color from 6am until sunset,
  Then return progressively warmer colours from sunset until midnight, when its warmest.
  Return warmest color from midnight to 6am
  */
  var coolest = 158;
  var warmest = 500;
  // 153 == coldest.
  // 500 == warmest.

  //console.log("Hour: "+ moment(time).format());
  //console.log("Sunset: "+ moment(times.sunset).format());
  //console.log(time.isBefore(times.sunset));

  if(time.hour() <7){
    //Late night mode
    //console.log("Return late night");
    return warmest;
  }
  if(time.hour() >=7 && time.isBefore(times.sunset)){
    // Day light
    //console.log("Return day light");
    return coolest;
  }
  else{
    //console.log("Calculating...");
    // Number of minutes between sunset and 11pm:
    var hours = 21 - moment(times.sunset).hours();
    var minutes = 59 - moment(times.sunset).minutes();
    var sunsetMinutesBeforeMidnight = (hours * 60) + minutes;

    // Current number of minutes before midnight
    hours = 23 - moment(time).hours();
    minutes = 59 - moment(time).minutes();
    var minutesBeforeMidnight = (hours * 60) + minutes;

    var colorValue = minutesBeforeMidnight.map(sunsetMinutesBeforeMidnight, 0, coolest, warmest);
    return Math.floor(colorValue);
  }
}

exports.brightnessForTime = function(time, min, max){
  /*
  Returns 100% brightness during the day.
  Returns 70% brightness after 11pm.
  Returns a value between 100 and 70 between sunset and 11pm
  */
  var dimmest = (typeof min == 'undefined') ? 70 : min;
  var brightest = (typeof max == 'undefined') ? 100 : max;

  //console.log("Hour: "+ moment(time).format());
  //console.log("Sunset: "+ moment(times.sunset).format());
  //console.log(time.isBefore(times.sunset));

  if(time.hour() <7){
    //Late night mode
    //console.log("Return late night");
    return dimmest;
  }
  if(time.hour() >=7 && time.isBefore(times.sunset)){
    // Day light
    //console.log("Return day light");
    return brightest;
  }
  else{
    //console.log("Calculating...");
    // Number of minutes between sunset and 11pm:
    var hours = 22 - moment(times.sunset).hours();
    var minutes = 59 - moment(times.sunset).minutes();
    var sunsetMinutesBeforeMidnight = (hours * 60) + minutes;
    // Current number of minutes before midnight
    hours = 23 - moment(time).hours();
    minutes = 59 - moment(time).minutes();
    var minutesBeforeMidnight = (hours * 60) + minutes;
    var brightnessValue = minutesBeforeMidnight.map(sunsetMinutesBeforeMidnight, 0, dimmest, brightest);
    return Math.floor(brightnessValue);
  }
}

exports.isBeforeSunrise = function(time){
  return time.isBefore(times.sunrise);
}

exports.isAfterSunrise = function(time){
  return time.isAfter(times.sunrise);
}

exports.isBeforeSunset = function(time){
  return time.isBefore(times.sunset);
}

exports.isAfterSunset = function(time){
  return time.isAfter(times.sunset);
}


exports.currentMoment = function(){
	return moment().tz('Australia/Sydney');
}


function calculateSunRelatedTimes(){
  times = sunCalculator.getTimes(new Date(),sydneyLatLong[0],sydneyLatLong[1]);
}
