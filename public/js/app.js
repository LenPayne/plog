'use strict';

/* App Module */

var plogApp = angular.module('plogApp', [
  'ngRoute',
  'ngSanitize',
  'plogControllers',
  'plogFilters',
  'plogServices'
]);

plogApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/posts', {
        templateUrl: 'partials/list.html',
        controller: 'PostListCtrl'
      }).
      when('/posts/:postId', {
        templateUrl: 'partials/detail.html',
        controller: 'PostDetailCtrl'
      }).
      otherwise({
        redirectTo: '/posts'
      });
  }]);
