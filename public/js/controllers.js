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

    $scope.showKey = function() {
      $scope.error = Login.apiKey;
    }

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
        $scope.error = JSON.stringify(httpResponse);
      });
    }
  }]);

plogControllers.controller('LoginCtrl', ['$scope', 'Login',
  function($scope, Login) {
    $scope.login = function() {
      Login.send($scope.user, $scope.pass);
    }
  }]);
