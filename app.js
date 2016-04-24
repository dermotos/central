var events = require('events');
var eventEmitter = new events.EventEmitter();
var sensors = require("./sensors");
var router = require("./router");
//var schedules = require("./schedules");
//var circadian = require("./circadian");
var state = require("./state");
var tasks = require("./tasks");
var web = require('./web.js');
var eventHandlers = {};


/* Initialize modules */
state.initialize(eventEmitter);
router.initialize(eventEmitter);
sensors.initialize(eventEmitter);
//schedules.initialize(eventEmitter);
//circadian.initialize(eventEmitter);
tasks.initialize(eventEmitter);
web.initialize(3001,eventEmitter);

console.log("Server ready");
