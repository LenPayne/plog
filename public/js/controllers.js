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

plogControllers.controller('NewPostCtrl', ['$scope', 'Post', '$location',
  function($scope, Post, $location) {
    $scope.error = '';

    $scope.newPost = function() {
      var post = new Post;
      post.apiKey = $('#apiKey').val();
      post.title = $scope.title;
      post.content = $scope.content;
      post.$save(function (val) {
        console.log($scope.title);
        console.log(post.title);
        console.log(JSON.stringify(val));
        $location.path('/posts/' + $scope.title);
      },
      function(httpResponse) {
        $scope.error = JSON.stringify(httpResponse);
      });
    }
  }]);
