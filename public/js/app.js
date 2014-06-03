// Project: plog
// File: public/js/app.js
// Author: Len Payne
//
// Copyright 2014 Len Payne
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
        templateUrl: 'partials/modify.html',
        controller: 'ModifyPostCtrl'
      }).
      when('/edit/:title', {
        templateUrl: 'partials/modify.html',
        controller: 'ModifyPostCtrl'
      }).
      when('/delete/:title', {
        templateUrl: 'partials/modify.html',
        controller: 'ModifyPostCtrl'
      }).
      otherwise({
        redirectTo: '/posts'
      });
  }]);
