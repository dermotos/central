var app = angular.module('central');
app.controller('actionController', ['$scope','transport', function($scope, transport) {
    
    transport.getConfiguration(function(data){
        $scope.configuration = data;
        
        
        transport.setConfiguration(data,function(){
           
        });
    });
}]);