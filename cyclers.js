
var eventEmitter;

exports.initialize = function (emitter) {
  eventEmitter = emitter;
};

var states = {};
var cyclers = require('./config/cyclers.json');


/*  */
exports.increment = function(cyclerName, increment){
  triggerScene(cyclerName,true);
}

exports.decrement = function(cyclerName, decrement){
  triggerScene(cyclerName,false);
}

function triggerScene(cyclerName,){
   var currentCycler = cyclers[cyclerName];
  if(!currentCycler){
    console.log("Error! No cycler with name '" + cyclerName + "' found.");
  }
  var currentScene = currentCycler.scenes[currentCycler.index];
  // TODO: trigger action here...

  //TODO: Advance the scene index (looping over as required) and save the cyclers.json file back to disk.
  // Finally, ad an action to trigger the advance or retreat of a "cycler"" scene

}

