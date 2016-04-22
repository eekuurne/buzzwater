'use strict';

/**
 * @ngdoc function
 * @name buzzwaterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the buzzwaterApp
 */
angular.module('buzzwaterApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
