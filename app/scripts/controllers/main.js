'use strict';

/**
 * @ngdoc function
 * @name buzzwaterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the buzzwaterApp
 */
angular.module('buzzwaterApp')
  .controller('MainCtrl', function ($scope, $http) {

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
                            return d3.format(',f')(d);
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



            $scope.data = [{key: 'series1', type: "line", yAxis: 1, values:[{x: 10, y: 20}, {x: 20, y: 35}, {x: 30, y:18}]},
                   {key: 'series2',  type: "line", yAxis: 1,values:[{x: 10, y: 12}, {x: 20, y: 26}, {x: 30, y: 15}]},
                   {key: 'series3',  type: "line", yAxis: 2,values:[{x: 10, y: 0.75}, {x: 20, y: 0.9}, {x: 30, y: 0.8}]},
                   {key: 'series4',  type: "line", yAxis: 2,values:[{x: 10, y: 0.2}, {x: 20, y: 0.3}, {x: 30, y: 0.4}]}]


  });
