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

    $scope.openStation = function (station) {

      $scope.chosenStation = station;

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

 angular.module('buzzwaterApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, apiService) {
     $scope.cancel = function () {
         $uibModalInstance.dismiss('cancel');
     };

     $scope.getData = function() {
       apiService.getData($scope.chosenStation.id, $scope.start, $scope.end, function(data) {
         //$scope.data = [];
         if (typeof($scope.data) === 'undefined') {
           $scope.data = [];
           $scope.data[0] = {key: 'output quantity', type: "line", yAxis: 1, values:data.outputs};
           $scope.data[1] = {key: 'rainfall', type: "line", yAxis: 2, values:data.rainfalls};
           $scope.data[2] = {key: 'runtime percentage', type: "line", yAxis: 2, values:data.percentages};
           $scope.data[3] = {key: 'total runtime', type: "line", yAxis: 2, values:data.totals};
         }
         else {
           $scope.data[0].values = data.outputs;
           $scope.data[1].values = data.rainfalls;
           $scope.data[2].values = data.percentages;
           $scope.data[3].values = data.totals;
         }

       });
     }

     $scope.options = {
                chart: {
                    type: 'multiChart',
                    height: 550,
                    margin : {
                        top: 30,
                        right: 60,
                        bottom: 50,
                        left: 70
                    },
                    color: d3.scale.category10().range(),
                    //useInteractiveGuideline: true,
                    transitionDuration: 500,
                    xAxis: {
                        tickFormat: function(d){
                            return d3.time.format('%x')(new Date(d));
                        }
                    },
                    yAxis1: {
                        tickFormat: function(d){
                            return d3.format(',.1f')(d);
                        }
                    },
                    yAxis2: {
                        tickFormat: function(d){
                            return d3.format(',.1f')(d);
                        }
                    },
                    tooltip: {
                        contentGenerator: function (e) {
                          var series = e.series[0];
                          if (series.value === null) return;
                          var date = new Date(parseInt(e.value));

                          var rows =
                            "<tr>" +
                              "<td class='key'>" + 'Date: ' + "</td>" +
                              "<td class='x-value'>" +date+ "</td>" +
                            "</tr>" +
                            "<tr>" +
                              "<td class='key'></td>" +
                              "<td class='x-value'><strong>" + (series.value?series.value.toFixed(2):0) + "</strong></td>" +
                            "</tr>";

                          var header =
                            "<thead>" +
                              "<tr>" +
                                "<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
                                "<td class='key'><strong>" + series.key + "</strong></td>" +
                              "</tr>" +
                            "</thead>";

                          return "<table>" +
                              header +
                              "<tbody>" +
                                rows +
                              "</tbody>" +
                            "</table>";
                        }
                    }
                }
            };

      $scope.end = new Date();
      $scope.start = new Date();
      $scope.start.setDate($scope.start.getDate()-14)
      $scope.data = undefined;

      $scope.getData();


      $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: false
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 0, 0),
        minDate: new Date()
      };

      $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
      };

      $scope.toggleMin();

      $scope.open1 = function() {
        $scope.popup1.opened = true;
      };

      $scope.open2 = function() {
        $scope.popup2.opened = true;
      };

      $scope.popup1 = {
        opened: false
      };

      $scope.popup2 = {
        opened: false
      };

      $scope.prev = function() {
        var period = $scope.end.getTime()-$scope.start.getTime()-86400000;
        $scope.start = new Date($scope.start.getTime()-period);
        $scope.end = new Date($scope.end.getTime()-period);
        $scope.getData();
      }

      $scope.next = function() {
        var period = $scope.end.getTime()-$scope.start.getTime()-86400000;
        $scope.start = new Date($scope.start.getTime()+period);
        $scope.end = new Date($scope.end.getTime()+period);
        $scope.getData();
      }

      function getDayClass(data) {
        var date = data.date,
          mode = data.mode;
        if (mode === 'day') {
          var dayToCheck = new Date(date).setHours(0,0,0,0);

          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

            if (dayToCheck === currentDay) {
              return $scope.events[i].status;
            }
          }
        }

        return '';
      }

 });
