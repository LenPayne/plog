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
      when('/posts/:title', {
        templateUrl: 'partials/detail.html',
        controller: 'PostDetailCtrl'
      }).
      when('/new', {
        templateUrl: 'partials/new.html',
        controller: 'NewPostCtrl'
      }).
      otherwise({
        redirectTo: '/posts'
      });
  }]);
