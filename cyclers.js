
var eventEmitter;
var actions = require("./actions");
var fs = require('fs');

exports.initialize = function (emitter) {
  eventEmitter = emitter;
};

var configFile = './config/cyclers.json';
var states = {};
var cyclers = require(configFile);


/*  */
exports.up = function(cyclerName){
  triggerScene(cyclerName,true);
}

exports.down = function(cyclerName){
  triggerScene(cyclerName,false);
}

function triggerScene(cyclerName,advance){
   var currentCycler = cyclers[cyclerName];
  if(!currentCycler){
    console.log("Error! No cycler with name '" + cyclerName + "' found.");
  }
  var sceneAction = currentCycler.scenes[currentCycler.index];
  actions.executeAction(sceneAction);

  if(advance){
    currentCycler.index = (currentCycler.index == currentCycler.scenes.length -1) ? 0 : currentCycler.index+1;
  }
  else{
    currentCycler.index = (currentCycler.index == 0) ? currentCycler.scenes.length -1 : currentCycler.index-1;
  }

   fs.writeFile(configFile, JSON.stringify(cyclers, null, 2), function (err) {
      if (err) {
        console.log("Failed to update cyclers.json " + err);
      }
      else {
        eventEmitter.emit('cyclers-updated', null);
      }
      console.log("Cyclers file updated");
    });

  //TODO: Save back to disk.
  //TODO: Create a scene type that can trigger these scenes, then TEST

}

