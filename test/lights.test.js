var testTarget = require("../lights");
var assert = require('assert');

describe('Lights', function() {
    it('should contain 11 items', function () {
      assert.equal(Object.keys(testTarget).length, 11);
    });

    it('should have an ID property of type [number] for each object', function () {
      for (var i = 0; i < Object.keys(testTarget).length; i++) {
        var objectKey = Object.keys(testTarget)[i];
        assert(!isNaN(testTarget[objectKey].id), "ID is not a number");
      }
    });
});
