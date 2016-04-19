// Declare app level module which depends on filters, and services
angular.module('central', ['central.filters', 'central.services', 'central.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'actions'
      });
    $locationProvider.html5Mode(true);
  }]);