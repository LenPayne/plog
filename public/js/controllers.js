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
      $scope.mainImageUrl = Post.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);

plogControllers.controller('NewPostCtrl', ['$scope', 'Post',
  function($scope, Post) {
    $scope.error = '';

    $scope.newPost = function() {
      var post = new Post;
      post.apiKey = $('#apiKey').val();
      post.title = $scope.title;
      post.content = $scope.content;
      post.$save(function () {
        $location.path('/posts/' + post.title);
      },
      function(httpResponse) {
        $scope.error = JSON.stringify(httpResponse);
      });
    }
  }]);
