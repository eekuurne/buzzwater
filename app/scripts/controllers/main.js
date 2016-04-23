'use strict';

/**
 * @ngdoc function
 * @name buzzwaterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the buzzwaterApp
 */
angular.module('buzzwaterApp')
  .controller('MainCtrl', function ($scope, $http, apiService) {
     $scope.options = {
                chart: {
                    type: 'multiChart',
                    height: 450,
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
                    }
                }
            };

      var start = new Date(2016, 1, 2);
      var station = "JVP1020";
      $scope.data = [{key: 'series1', type: "line", yAxis: 1, values:[]}];

      apiService.getData(station, start, function(data1, data2) {
        $scope.data = [{key: 'series1', type: "line", yAxis: 1, values:data1}];
        $scope.data = [{key: 'series1', type: "line", yAxis: 1, values:data2}];
      });

  });
