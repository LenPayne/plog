'use strict';

/* Filters */

angular.module('plogFilters', []).filter('niceTime', function() {
  return function(input) {
    return (new Date(input)).toUTCString();
  };
});
