
/* ***************************

The purpose of this module is purely for development debugging reasons,
to allow easy simulation of various events that would normally originate
from hardware devices such as switches and sensors

* ***************************** */

var express = require('express');
var app = express();
var eventEmitter;
var server;

app.get("/:switch/:action", function(req, res) {
  if(eventEmitter != undefined){
    var action = {
      category : "sensor",
      source : req.params.switch, //eg: bedroom-door, bedroom-blinds, kitchen etc
      action : req.params.action, //eg: north-button-double-pressed, motion-started, left-scale, etc...
      args : []
    };
    eventEmitter.emit('event',action);
  }
  res.end();
});

app.get("/:switch/:action/:parameter", function(req, res) {
  if(eventEmitter != undefined){
    var action = {
      category : "sensor",
      source : req.params.switch, //eg: bedroom-door, bedroom-blinds, kitchen etc
      action : req.params.action, //eg: north-button-double-pressed, motion-started, left-scale, etc...
      args : [req.params.parameter]
    };

    eventEmitter.emit('event',action);
  }
  res.end();
});

exports.initialize = function(port,emitter){
  eventEmitter = emitter;
  server = app.listen(port, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Web sensor listener now running on port %s",port);
  });
};


function actionOcurred(action){
  var action = {};
  //substring: eg: pot-24. 24 is the arg.
  if(items[1].substr(0,3 == "pot")){
    items[2] = items[1].substr(4); // argument, eg: 24
    items[1] = "fader"; // Normalisation
  }
  // ** ******************************* **

  action = {
    category : "sensor",
    source : items[0], //eg: bedroom-door, bedroom-blinds, kitchen etc
    action : items[1], //eg: north-button-double-pressed, motion-started, left-scale, etc...
    args : [] //Max of one arg in currently implemented hardware. Support for more. eg: fader value, scales value.
  };

  if(items.length > 2){
    for (var i = 2; i < items.length; i++) {
      args.args.push(items[i]);
    }
  }

  eventEmitter.emit('event',action);
}
