'use strict';

/* Services */

var plogServices = angular.module('plogServices', ['ngResource']);

plogServices.factory('Post', ['$resource',
  function($resource){
    return $resource('/plog/:postId', {}, {
      query: {method:'GET', params:{postId:''}, isArray:true}
    });
  }]);
