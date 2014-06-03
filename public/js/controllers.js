// Project: plog
// File: public/js/controllers.js
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

/* Controllers */

var plogControllers = angular.module('plogControllers', []);

//== Post List Controller - Retrieve Data for the Post List
plogControllers.controller('PostListCtrl', ['$scope', 'Post', 'Config', '$http', 'Login',
  function($scope, Post, Config, $http, Login) {
    $scope.posts = Post.query();
    $scope.pageSize = Config.paging;
    $scope.currentPage = 0;
    $scope.orderProp = '-time';

    $scope.editClass = function() {
      if (Login.apiKey) return 'show';
      else return 'hidden';
    };

    $scope.checkConfig = function() {
      $http({method: 'GET', url: '/config'})
        .success(function(data, status) {
          Config.canRegister = data.canRegister;
          if (Config.canRegister)
            $scope.registerForm = 'show';
          else
            $scope.registerForm = 'hidden';
          Config.paging = data.paging;
          $scope.pageSize = Config.paging;
        });
    };
    $scope.checkConfig();
  }]);

//== Post Detail Controller - Retrieve Data for a Single Post
plogControllers.controller('PostDetailCtrl', ['$scope', '$routeParams', 'Post',
  function($scope, $routeParams, Post) {
    $scope.post = Post.get({title: $routeParams.title});

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);

//== New Post Controller - Attempts to Persist a New Post
plogControllers.controller('ModifyPostCtrl', ['$scope', 'Post', 'Login', '$location', '$routeParams',
  function($scope, Post, Login, $location, $routeParams) {
    $scope.error = '';
    if ($routeParams.title) $scope.post = Post.get({title: $routeParams.title});
    else $scope.post = new Post;

    $scope.savePost = function() {
      $scope.post.apiKey = Login.apiKey;
      $scope.title = $scope.post.title;
      $scope.post.$save(function (val) {
        $location.path('/posts/' + $scope.title);
      },
      function(httpResponse) {
        $scope.error = 'Error Saving Post: Status ' + httpResponse.status + ' - ' + httpResponse.statusText;
      });
    }

    $scope.killPost = function() {
      $scope.post.apiKey = Login.apiKey;
      $scope.title = $scope.post.title;
      $scope.post.$delete(function (val) {
        $location.path('/posts');
      },
      function(httpResponse) {
        $scope.error = 'Error Deleting Post: Status ' + httpResponse.status + ' - ' + httpResponse.statusText;
      });
    }
  }]);

//== Login Controller - Attempts to Log the User In and Out
plogControllers.controller('LoginCtrl', ['$scope', 'Login', '$http', 'Config',
  function($scope, Login, $http, Config) {
    $scope.error = '';
    $scope.logoutForm = 'hidden';
    $scope.loginForm = 'show';
    $scope.adminArrow = 'glyphicon-chevron-up';

    $scope.checkConfig = function() {
      $http({method: 'GET', url: '/config'})
        .success(function(data, status) {
          Config.canRegister = data.canRegister;
          if (Config.canRegister)
            $scope.registerForm = 'show';
          else
            $scope.registerForm = 'hidden';
          Config.paging = data.paging;
        });
    };

    $scope.checkConfig();

    $scope.toggleChevron = function() {
      if ($scope.adminArrow === 'glyphicon-chevron-up')
        $scope.adminArrow = 'glyphicon-chevron-down'
      else
        $scope.adminArrow = 'glyphicon-chevron-up';
    };

    $scope.login = function() {
      $http({method: 'GET', url: '/login', params: {"user": $scope.user, "pass": $scope.pass}})
        .success(function(data, status) {
          Login.apiKey = data.apiKey;
          $scope.user = '';
          $scope.pass = '';
          $scope.error = '';
          $scope.logoutForm = 'show';
          $scope.loginForm = 'hidden';
        })
        .error(function(data, status) {
          $scope.error = 'Unable to Login, Try Again';
          console.log(JSON.stringify(data));
          console.log(JSON.stringify(status));
          Login.apiKey = '';
        });
    };

    $scope.logout = function() {
      $http({method: 'POST', url: '/expire/' + Login.apiKey})
        .success(function(data, status) {
          Login.apiKey = '';
          $scope.error = '';
          $scope.logoutForm = 'hidden';
          $scope.loginForm = 'show';
        })
        .error(function(data, status) {
          $scope.error = 'Unable to Logout, Try Again';
          console.log(JSON.stringify(data));
          console.log(JSON.stringify(status));
        });
    };
  }]);
