
/* ***************************

The purpose of this module is purely for development debugging reasons,
to allow easy simulation of various events that would normally originate
from hardware devices such as switches and sensors

* ***************************** */

var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var eventEmitter;
var server;
var state = require("./state");
var deviceControl = require('./external-device');
var blinds = require('./blinds');
var arduinoLight = require('./arduinoLight');

/* ******************************
 * Static content service
 * ******************************
*/

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static('node_modules'));

/* ******************************
 * Modes
 * ******************************
*/

app.get("/mode/:mode", function (req, res) {
  var response = {
    "state": false,
    "previousState": false
  };
  if (typeof (req.params.mode) == 'undefined') {
    res.write(response);
    res.end();
    return;
  }

  console.log("Request received to change mode '" + req.params.mode + "'...");

  var currentState = state.getState(req.params.mode);
  if (currentState == "error") {
    res.write("unknown state");
  }
  else {
    var requestedState = (req.query.state == 'true');
    if (requestedState != currentState) {
      state.setState(req.params.mode, requestedState);
    }
    response.state = (requestedState == true);
    response.previousState = (currentState == true);
    res.write(JSON.stringify(response));
  }
  res.end();
});


/* ******************************
 * Devices (eg: for homebridge interface)
 * ******************************
*/
app.get("/devices/:device/:operation", function (req, res) {
  var device = req.params.device;
  var operation = req.params.operation;
  deviceControl.sendCommand(device, operation);
  res.end("ok");
});

app.get("/arduinoLight/:device/:operation", function (req, res) {
  var device = req.params.device;
  var operation = req.params.operation;
  arduinoLight.setLightState(device, operation);
  res.end("ok");
});

app.get("/blinds/:room/:index/:action", function (req, res) {
  var room = req.params.room;
  var action = req.params.action;
  var index = req.params.index;
  blinds.setBlindState(room, index, action);
  res.end("ok");
});


/* ******************************
 * Virtual Switches
 * ******************************
*/

app.get("/debug/:switch/:action", function (req, res) {
  if (eventEmitter != undefined) {
    var action = {
      category: "sensor",
      source: req.params.switch, //eg: bedroom-door, bedroom-blinds, kitchen etc
      action: req.params.action, //eg: north-button-double-pressed, motion-started, left-scale, etc...
      args: []
    };
    eventEmitter.emit('event', action);
  }
  res.end();
});

app.get("/debug/:switch/:action/:parameter", function (req, res) {
  if (eventEmitter != undefined) {
    var action = {
      category: "sensor",
      source: req.params.switch, //eg: bedroom-door, bedroom-blinds, kitchen etc
      action: req.params.action, //eg: north-button-double-pressed, motion-started, left-scale, etc...
      args: [req.params.parameter]
    };

    eventEmitter.emit('event', action);
  }
  res.end();
});

/* ******************************
 * Action editor endpoints
 * ******************************
*/

// GET list of all triggers and their currently assigned actions /action-mapping/rules
app.get("/action-mapping/rules", function (req, res) {
  if (eventEmitter != undefined) {
    res.setHeader('Content-Type', 'application/json');
    var actionMap = require('./action-map.json');
    res.send(actionMap);
  }
  res.end();
});

// PUT a change to all rules
app.put("/action-mapping/rules", function (req, res) {
  if (eventEmitter != undefined) {
    var actionMap = req.body;
    res.write('ok');
    fs.writeFile("./action-map.json", JSON.stringify(actionMap, null, 2), function (err) {
      if (err) {
        console.log("Failed to update action-map.json. " + err);
      }
      else {
        eventEmitter.emit('action-map-updated', null);
      }
    });
  }
  res.end();
});

// GET list of all actions (for dropdown boxes)                 /action-mapping/actions
app.get("/action-mapping/catalog", function (req, res) {
  if (eventEmitter != undefined) {
    res.setHeader('Content-Type', 'application/json');
    var actionCatalog = require('./config/action-catalog.json');
    res.send(actionCatalog);
  }
  res.end();
});
// PUT a change to a trigger                                    /action-mapping/rules/:id 
app.put("/action-mapping/rules/:sensor/:trigger", function (req, res) {
  if (eventEmitter != undefined) {
    var actionMap = require('./action-map.json');
    var actionCatalog = require('./config/action-catalog.json');

    var sensor = req.params.sensor;
    var trigger = req.params.trigger;
    var targetRule = actionMap[sensor][trigger];

    if ((typeof req.body.type === 'undefined') ||
      (typeof req.body.name === 'undefined') ||
      (typeof req.body.id === 'undefined')) {
      //Invalid request
      res.write("error");
    }
    else {
      var replacementRule = {
        "type": req.body.type,
        "name": req.body.name,
        "id": req.body.id
      }
      actionMap[sensor][trigger] = replacementRule;
      fs.writeFile("./action-map.json", JSON.stringify(actionMap, null, 2), function (err) {
        if (err) {
          console.log("Failed to update action-map.json. " + err);
        }
        else {
          eventEmitter.emit('action-map-updated', null);
        }
      });
      res.write("ok");
    }
  }
  res.end();
});



exports.initialize = function (port, emitter) {
  eventEmitter = emitter;
  server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Web sensor listener now running on port %s", port);
  });
};


function errorResponse() {
  return {
    "status": "error"
  }
}


function actionOcurred(action) {
  var action = {};
  //substring: eg: pot-24. 24 is the arg.
  if (items[1].substr(0, 3 == "pot")) {
    items[2] = items[1].substr(4); // argument, eg: 24
    items[1] = "fader"; // Normalisation
  }
  // ** ******************************* **

  action = {
    category: "sensor",
    source: items[0], //eg: bedroom-door, bedroom-blinds, kitchen etc
    action: items[1], //eg: north-button-double-pressed, motion-started, left-scale, etc...
    args: [] //Max of one arg in currently implemented hardware. Support for more. eg: fader value, scales value.
  };

  if (items.length > 2) {
    for (var i = 2; i < items.length; i++) {
      args.args.push(items[i]);
    }
  }

  eventEmitter.emit('event', action);
}
