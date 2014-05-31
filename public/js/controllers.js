'use strict';

/* Controllers */

var plogControllers = angular.module('plogControllers', []);

plogControllers.controller('PostListCtrl', ['$scope', 'Post',
  function($scope, Post) {
    $scope.posts = Post.query();
    $scope.orderProp = '_id';
  }]);

plogControllers.controller('PostDetailCtrl', ['$scope', '$routeParams', 'Post',
  function($scope, $routeParams, Post) {
    $scope.post = Post.get({title: $routeParams.title}, function(Post) {
      $scope.mainImageUrl = Post.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);

plogControllers.controller('NewPostCtrl', ['$scope', 'Post',
  function($scope, Post) {
    $scope.newPost = function() {
      var post = new Post;
      post.apiKey = $('#apiKey').val();
      post.title = $scope.post.title;
      post.content = $scope.post.content;
      post.$save();
    }
  }]);
