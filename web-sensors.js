var express = require('express');
var app = express();

var eventEmitter;
var server;

app.get("/:switch/:action", function(req, res) {
  if(eventEmitter != undefined){
    eventEmitter.emit('event','hello');
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
}
