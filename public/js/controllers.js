var app = angular.module('central');
app.controller('actionController', ['$scope','transport', function($scope, transport) {
    console.log("this far");
    transport.getConfiguration(function(data){
        $scope.configuration = data;
        console.log("done");
        
        transport.setConfiguration(data,function(){
           console.log("done set."); 
        });
    });
}]);