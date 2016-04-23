'use strict';

/**
 * @ngdoc function
 * @name buzzwaterApp.controller:MainCtrl
 * @description
 * # MapCtrl
 * Controller of the buzzwaterApp
 */
angular.module('buzzwaterApp')
  .controller('MapCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', '$uibModal', function ($scope, $http, uiGmapGoogleMapApi, $uibModal) {

    uiGmapGoogleMapApi.then(function(maps) {

      $scope.map = { center: { latitude: 60.26, longitude: 24.92 }, zoom: 11 };
      $scope.markers = [];
      $scope.options = {icon:'url/images/icon.png'};
      $scope.formPassword = '';


      // Get marker coordinates from the database
      $http({
        method: 'GET',
        url: 'http://10.144.72.169:8080/api/targets'
      }).then(function successCallback(response) {
        console.log(response.data);




        angular.forEach(response.data.data, function(value, key) {
          $scope.markers.push({id: key, coords: {latitude: value.LAT, longitude: value.LONG}, flowQuality: value.flowQuality, name: value.Name});
          console.log(value);
        });




        for (var i = 0; i < response.data.data.length; i++) {

          $scope.markers[i] = {id: i, coords: {latitude: response.data.data[i].LAT, longitude: response.data.data[i].LONG}};
        };
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

    });

    $scope.chosenStation = {name: "Pumppaamon nimi"};

    $scope.openStation = function (stationName) {

      $scope.chosenStation.name = stationName;

      var modalInstance = $uibModal.open({
        templateUrl: '../views/modals/station.html',
        controller: 'ModalInstanceCtrl',
        size: 'sm',
        scope: $scope,
        windowClass: 'app-modal-window',
      });
    
    modalInstance.result.then(function (formPassword) {
      if ($scope.checkPassword(formPassword)) {
        $location.path('/main');
      }
    }, function () {
      console.log('Exit canceled');
    });
  };

  }]);

 angular.module('buzzwaterApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

     $scope.cancel = function () {
         $uibModalInstance.dismiss('cancel');
     };
 });