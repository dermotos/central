var events = require('events');
var eventEmitter = new events.EventEmitter();
var sensors = require("./sensors.js");
var router = require("./router.js");
var eventHandlers = {};


/* Initialize modules */

router.initialize(eventEmitter);
sensors.initialize(eventEmitter);


console.log("ready");
