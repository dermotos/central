var sunCalc = require('suncalc');
var eventEmitter;
var scheduler = require('node-schedule');
var blinds = require('./blinds');
var moment = require('moment');


exports.initialize = function (emitter) {
  eventEmitter = emitter;
  // On initialization, compute sun position times for the current day, and create a
  // daily recurring schedule to recalculate each night at midnight.
};

var sydneyLatLong = [-33.8650, 151.2094];
// Schedule a job to run at 4am each morning, to calculate sunset time for that day and schedule a job.
// This function also runs at startup, to cover scenarios where the server is restarted


var setupRule;
var earlyClosingJob;
var closingJob;
var times;


function setupBlindClosingSchedule(){
  times = sunCalc.getTimes(new Date(),sydneyLatLong[0],sydneyLatLong[1]);
  var sunset = moment(times.sunset);
  var justBeforeSunset = moment(times.sunset).subtract(10,'minutes');
  var justAfterSunset = moment(times.sunset).add(10,'minutes');
  console.log("Calculating sunset times...")
  console.log("Sunset: " + sunset.format("h:mm:ss a"));
  console.log("Just Before: " + justBeforeSunset.format("h:mm:ss a"));
  console.log("Just After: " + justAfterSunset.format("h:mm:ss a"));

  console.log("Configuring bedroom door-blind to close at " + justBeforeSunset.format("h:mm:ss a"));
  
  earlyClosingJob = scheduler.scheduleJob(justBeforeSunset.toDate(),function(){
    blinds.setBlindState("bedroom", 1, "close");
  });

  console.log("Configuring bedroom window blinds & lounge to close at " + sunset.format("h:mm:ss a"));
  closingJob = scheduler.scheduleJob(sunset.toDate(),function(){
    blinds.setBlindState("bedroom", 0, "close");
    blinds.setBlindState("lounge", 0, "close");
  });
  
};


setupRule = new scheduler.RecurrenceRule();
setupRule.hour = 4;
setupRule.minute = 0;
scheduler.scheduleJob(setupRule,function(){
  console.log("Calculating sunset based blind closing times for today...");
  setupBlindClosingSchedule();
});

setupBlindClosingSchedule();



//Open blinds every weekday morning at 7:00 am

var openBlindsRule = new scheduler.RecurrenceRule();
openBlindsRule.minute = 00;
openBlindsRule.hour = 7;
openBlindsRule.dayOfWeek = [1, 2, 3, 4, 5]; //0 being sunday, 6 being saturday
scheduler.scheduleJob(openBlindsRule, function () {
  // Open door blind a bit (for 5 seconds), then stop. Open it completely 5 minutes later
  blinds.setBlindState("bedroom", 0, "open");
  setTimeout(function(){
    blinds.setBlindState("bedroom", 0, "stop");
  },1000 * 5);
  setTimeout(function(){
    blinds.setBlindState("bedroom", 0, "open");
  },1000 * 60 * 5);

  //Open remaining blinds 10 minutes later

  setTimeout(function () {
    blinds.setBlindState("bedroom", 1, "open");
    blinds.setBlindState("lounge", 0, "open");
  }, 1000 * 60 * 10);
  

});