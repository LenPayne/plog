'use strict';

/* Filters */

angular.module('plogFilters', []).filter('niceTime', function() {
  return function(input) {
    return (new Date(input)).toString();
  };
})
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
