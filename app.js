console.log("Starting up...");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var sensors = require("./sensors");
var router = require("./router");
//var schedules = require("./schedules");
var circadian = require("./circadian");
var state = require("./state");
var tasks = require("./tasks");
var web = require('./web.js');
var eventHandlers = {};


/* Initialize modules */
state.initialize(eventEmitter);
router.initialize(eventEmitter);
sensors.initialize(eventEmitter);
//schedules.initialize(eventEmitter);
circadian.initialize(eventEmitter);
tasks.initialize(eventEmitter);
web.initialize(3001,eventEmitter);


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function (err) {
    // handle the error safely

    console.log("*****************************************");
    console.log(err.stack);
    console.log("*****************************************\n");

});



console.log("Server ready");
