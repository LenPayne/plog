// Project: plog
// File: public/js/services.js
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

/* Services */

var plogServices = angular.module('plogServices', ['ngResource']);

//== Provide an ngResource Object for Posts
plogServices.factory('Post', ['$resource',
  function($resource){
    return $resource('/plog/:title?apiKey=:apiKey', {title: '@title', apiKey: '@apiKey'}, {
      query: {method:'GET', params:{title:''}, isArray:true}
    });
  }]);

//== Use the Service-Singleton Pattern to Store the API Key site-wide
plogServices.factory('Login', function() {
    return {
      apiKey : ''
    }
  });

//== Use the Service-Singleton Pattern to Store the Configuration site-wide
plogServices.factory('Config', function() {
    return {
      canRegister: false,
      paging: 10
    }
  });
