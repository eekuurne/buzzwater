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
                    height: 800,
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

      var start = new Date(2015, 11, 0);
      var end = new Date(2015, 11, 7);
      var station = "JVP1020";
      $scope.data = [];

      apiService.getData(station, start, end, function(data) {
        $scope.data.push({key: 'output quantity', type: "line", yAxis: 1, values:data.outputs});
        $scope.data.push({key: 'rainfall', type: "line", yAxis: 2, values:data.rainfalls});
        $scope.data.push({key: 'runtime percentage', type: "line", yAxis: 2, values:data.percentages});
        $scope.data.push({key: 'total runtime', type: "line", yAxis: 2, values:data.totals});
        console.log($scope.data)
      });



  });
