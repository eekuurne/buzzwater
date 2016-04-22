'use strict';

/**
 * @ngdoc overview
 * @name buzzwaterApp
 * @description
 * # buzzwaterApp
 *
 * Main module of the application.
 */
angular
  .module('buzzwaterApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/buzz', {
        templateUrl: 'views/buzz.html',
        controller: 'MainCtrl'
      })
      .when('/water', {
        templateUrl: 'views/water.html',
        controller: 'MainCtrl'
      })
      .when('/buzzwater', {
        templateUrl: 'views/buzzwater.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
