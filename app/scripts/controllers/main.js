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

            var start = new Date(2016, 3, 1);
            $scope.data = [{key: 'series1', type: "line", yAxis: 1, values:[]}];
            var values = [];
            $http.get('http://10.144.72.169:8080/api/output/?station=JVP1020&start='+start.toJSON()).then(
              function(data) {
                data.data.data.forEach(function(value) {
                  var date = new Date(value.STS)
                  var newValue = {y:value.OUTPUT_QUANTITY || 0, x:date.getTime()};
                  if (newValue.y > 2000) newValue.y = 0;
                  values.push(newValue);
                });
                $scope.data[0].values = values.sort(function(a, b) {return (a.x-b.x)});
              },
              function(data) {
                console.log(data);
              }
            );
  });
