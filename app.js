var events = require('events');
var eventEmitter = new events.EventEmitter();
var sensors = require("./sensors");
var router = require("./router");
var schedules = require("./schedules");
var circadian = require("./circadian");
var state = require("./state");
var tasks = require("./tasks");
var eventHandlers = {};


/* Initialize modules */
state.initialize(eventEmitter);
router.initialize(eventEmitter);
sensors.initialize(eventEmitter);
schedules.initialize(eventEmitter);
circadian.initialize(eventEmitter);
tasks.initialize(eventEmitter);


console.log("ready");
