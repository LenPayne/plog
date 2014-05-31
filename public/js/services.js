'use strict';

/* Services */

var plogServices = angular.module('plogServices', ['ngResource']);

plogServices.factory('Post', ['$resource',
  function($resource){
    return $resource('/plog/:title?apiKey=:apiKey', {title: '@title', apiKey: '@apiKey'}, {
      query: {method:'GET', params:{title:''}, isArray:true}
    });
  }]);

plogServices.factory('Login', ['$http', 'Login',
  function($http) {
    return {
      apiKey : ''      
    }
  }
]);
