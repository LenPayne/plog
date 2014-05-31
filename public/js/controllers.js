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
        $scope.error = 'Error Saving Post: Status ' + httpResponse.data.status + ' - ' + httpResponse.data.statusText;
      });
    }
  }]);

plogControllers.controller('LoginCtrl', ['$scope', 'Login', '$http',
  function($scope, Login, $http) {
    $scope.login = function() {
      $http({method: 'GET', url: '/login', params: {"user": $scope.user, "pass": $scope.pass}})
        .success(function(data, status) {
          Login.apiKey = data.apiKey;
        })
        .error(function(data, status) {
          Login.apiKey = '';
        });
    }
  }]);
