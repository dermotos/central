var app = angular.module('central');
app.service('transport', ['$http', function($http) {
    
    this.getConfiguration = function(callback){
        $http.get('/action-mapping/rules').
        success(function(data){
            callback(data);
        });
    }
    
    
    this.setConfiguration = function(config, callback){
        $http.put('/action-mapping/rules',config).
        success(function(data){
            callback(data);
        });
    }
    
}]);

// app.service('transport',function(){
//    console.log('testing service'); 
// });