var sunCalc = require('suncalc');
var eventEmitter;
var scheduler = require('node-schedule');
var blinds = require('./blinds');


exports.initialize = function (emitter) {
  eventEmitter = emitter;
  // On initialization, compute sun position times for the current day, and create a
  // daily recurring schedule to recalculate each night at midnight.
};


console.log("Loading temporary schedules...");

var closeBlindsRule = new scheduler.RecurrenceRule();
closeBlindsRule.minute = 00;
closeBlindsRule.hour = 17;
scheduler.scheduleJob(closeBlindsRule, function () {
  blinds.setBlindState("bedroom", 0, "close");
  blinds.setBlindState("bedroom", 1, "close");
  setTimeout(function () {
		  blinds.setBlindState("lounge", 0, "close");
  }, 1000 * 60 * 10);

});


//Open blinds every weekday morning at 7:00 am

var openBlindsRule = new scheduler.RecurrenceRule();
openBlindsRule.minute = 00;
openBlindsRule.hour = 7;
openBlindsRule.dayOfWeek = [1, 2, 3, 4, 5]; //0 being sunday, 6 being saturday
scheduler.scheduleJob(openBlindsRule, function () {
  blinds.setBlindState("bedroom", 0, "open");
  blinds.setBlindState("lounge", 0, "open");
  setTimeout(function () {
    blinds.setBlindState("bedroom", 1, "open");
  }, 1000 * 60 * 10);

});