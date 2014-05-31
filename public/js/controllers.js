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
    var postId = unescape($routeParams.PostId);
    $scope.post = Post.get({PostId: postId}, function(Post) {
      $scope.mainImageUrl = Post.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);
