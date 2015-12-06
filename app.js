var events = require('events');
var eventEmitter = new events.EventEmitter();
var sensors = require("./sensors.js");
var router = require("./router.js");
var schedules = require("./schedules.js");
var eventHandlers = {};


/* Initialize modules */

router.initialize(eventEmitter);
sensors.initialize(eventEmitter);
schedules.initialize(eventEmitter);


console.log("ready");
