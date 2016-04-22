'use strict';

/**
 * @ngdoc function
 * @name buzzwaterApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the buzzwaterApp
 */
angular.module('buzzwaterApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
