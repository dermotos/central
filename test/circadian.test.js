var testTarget = require("../circadian");
var assert = require('assert');
var events = require('events');


describe('Circidian', function() {
    it('should initialize', function () {
      var eventEmitter = new events.EventEmitter();
      testTarget.initialize(eventEmitter);
      assert(true);
    });


});
