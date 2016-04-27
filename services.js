 var forever = require('forever-monitor');

  var child = new (forever.Monitor)('app.js', {
    silent: false,
    args: []
  });

  child.on('exit', function () {
    console.log('The process has exited');
  });

  child.start();