'use strict';

/**
 * @ngdoc function
 * @name buzzwaterApp.controller:MainCtrl
 * @description
 * # MapCtrl
 * Controller of the buzzwaterApp
 */
angular.module('buzzwaterApp')
  .controller('MapCtrl', function ($scope, $http, uiGmapGoogleMapApi) {

    uiGmapGoogleMapApi.then(function(maps) {

      $scope.map = { center: { latitude: 60.28711111111111, longitude: 25.01188888888889 }, zoom: 9 };
      $scope.markers = [];

      // Get marker coordinates from the database
      $http({
        method: 'GET',
        url: 'http://10.144.72.169:8080/api/targets'
      }).then(function successCallback(response) {
        for (var i = 0; i < response.data.data.length; i++) {
          $scope.markers[i] = {id: i, coords: {latitude: response.data.data[i].LAT, longitude: response.data.data[i].LONG}};
        };
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

    });

  });
