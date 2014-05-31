'use strict';

/* Services */

var plogServices = angular.module('plogServices', ['ngResource']);

plogServices.factory('Post', ['$resource',
  function($resource){
    return $resource('/plog/:title?apiKey=:apiKey', {title: '@title', apiKey: '@apiKey'}, {
      query: {method:'GET', params:{title:''}, isArray:true}
    });
  }]);

plogServices.factory('Login', ['$http',
  function($http) {
    return {
      apiKey : '',
      send : function (user, pass) {
        $http({method: 'GET', url: '/login', params: {"user": user, "pass": pass}})
          .success(function(data, status) {
            this.apiKey = data.apiKey;
          })
          .error(function(data, status) {
            apiKey = '';
          });
        }
    }
  }
]);
