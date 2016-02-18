var testTarget = require("../circadian");
var assert = require('assert');
var events = require('events');
var moment = require('moment');


describe('Circidian', function() {
    it('should initialize', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);
      assert(true);
    });

    it('should return a cool color for midday', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);

      var testTime = moment().set('hour',12).set('minute',00);

      var result = testTarget.whiteForTime(testTime);
      assert(result < 200);
    });

    it('should return a warm color for 3am', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);

      var testTime = moment().set('hour',3).set('minute',00);

      var result = testTarget.whiteForTime(testTime);
      assert(result > 450);
    });

    it('should return progressively warmer colors for later in the evening', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);

      var testTime0 = moment().set('hour',20).set('minute',30);
      var testTime1 = moment().set('hour',21).set('minute',00);
      var testTime2 = moment().set('hour',22).set('minute',00);

      var result0 = testTarget.whiteForTime(testTime0);
      var result1 = testTarget.whiteForTime(testTime1);
      var result2 = testTarget.whiteForTime(testTime2);

      assert(result0 < result1 && result1 < result2);
    });

    // Brightness related tests
    it('should return 100% brightness during the day', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);

      var testTime = moment().set('hour',11).set('minute',00);

      var result = testTarget.brightnessForTime(testTime);
      assert(result == 100);
    });

    it('should return 70% brightness during the night', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);

      var testTime = moment().set('hour',3).set('minute',00);

      var result = testTarget.brightnessForTime(testTime);
      assert(result == 70);
    });

    it('should return progressively dimmer brightnesses for later in the evening', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);

      var testTime0 = moment().set('hour',20).set('minute',30);
      var testTime1 = moment().set('hour',21).set('minute',00);
      var testTime2 = moment().set('hour',22).set('minute',00);

      var result0 = testTarget.brightnessForTime(testTime0);
      var result1 = testTarget.brightnessForTime(testTime1);
      var result2 = testTarget.brightnessForTime(testTime2);

      assert(result0 < result1 && result1 < result2);
    });

});
