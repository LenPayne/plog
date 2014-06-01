'use strict';

/* Controllers */

var plogControllers = angular.module('plogControllers', []);

plogControllers.controller('PostListCtrl', ['$scope', 'Post',
  function($scope, Post) {
    $scope.posts = Post.query();
    $scope.orderProp = '-time';
  }]);

plogControllers.controller('PostDetailCtrl', ['$scope', '$routeParams', 'Post',
  function($scope, $routeParams, Post) {
    $scope.post = Post.get({title: $routeParams.title}, function(Post) {

    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);

plogControllers.controller('NewPostCtrl', ['$scope', 'Post', 'Login', '$location',
  function($scope, Post, Login, $location) {
    $scope.error = '';

    $scope.newPost = function() {
      var post = new Post;
      post.apiKey = Login.apiKey;
      console.log('Login.apiKey = ' + Login.apiKey);
      post.title = $scope.title;
      post.content = $scope.content;
      post.$save(function (val) {
        $location.path('/posts/' + $scope.title);
      },
      function(httpResponse) {
        $scope.error = 'Error Saving Post: Status ' + httpResponse.status + ' - ' + httpResponse.statusText;
      });
    }
  }]);

plogControllers.controller('LoginCtrl', ['$scope', 'Login', '$http',
  function($scope, Login, $http) {
    $scope.error = '';
    $scope.logoutForm = 'hidden';
    $scope.loginForm = 'show';
    $scope.adminArrow = 'glyphicon-chevron-up';

    $scope.toggleChevron = function() {
      if ($scope.adminArrow === 'glyphicon-chevron-up')
        $scope.adminArrow = 'glyphicon-chevron-down'
      else
        $scope.adminArrow = 'glyphicon-chevron-up';
    }

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
    }

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
    }
  }]);
