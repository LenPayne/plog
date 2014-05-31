'use strict';

/* App Module */

var plogApp = angular.module('plogApp', [
  'ngRoute',
  'plogControllers',
  'plogFilters',
  'plogServices'
]);

plogApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/posts', {
        templateUrl: 'partials/list.html',
        controller: 'PlogListCtrl'
      }).
      when('/posts/:postId', {
        templateUrl: 'partials/detail.html',
        controller: 'PostDetailCtrl'
      }).
      otherwise({
        redirectTo: '/posts'
      });
  }]);
