'use strict';

/**
 * @ngdoc service
 * @name buzzwaterApp.apiService
 * @description
 * # apiService
 * Service in the buzzwaterApp.
 */
angular.module('buzzwaterApp')
  .service('apiService', function ($http) {
    var url = 'http://10.144.72.169:8080/api/';
    var markers = [];
    this.getTargets = function(cb) {
      if (markers.length == 0) {
        $http.get(url+'targets').then(
          function(data) {
            angular.forEach(data.data.data, function(value, key) {
              markers.push({id: key, coords: {latitude: value.LAT, longitude: value.LONG}, flowQuality: value.flowQuality, name: value.Name});
            });
            cb(markers)
          },
          function(data) {
            console.log(data);
          });
      } else {
        cb(markers);
      }
    }


    this.getData = function(station, start, end, cb) {
      $http.get(url+'output/?station='+station+'&start='+start.toJSON()+'&end='+end.toJSON()).then(
        function(data) {
          var outputs = [];
          var rainfalls = [];
          var percentages = [];
          var totals = [];
          console.log(data)

          angular.forEach(data.data.data, function(value, key) {
            var output = {x: key, y: value.outputQuantity}
            var rainfall = {x: key, y: value.rainfall}
            var uptimePerc = {x: key, y: value.uptime.uptimePercentage}
            var uptimeTotal = {x: key, y: value.uptime.totalRuntime}
            if (value.outputQuantity < data.data.statistics.outputMedian*10) outputs.push(output);
            if (value.rainfall < data.data.statistics.rainfallMedian*10) rainfalls.push(rainfall);
            percentages.push(uptimePerc);
            totals.push(uptimeTotal);
          });

          cb({outputs: outputs.sort(function(a, b) {return (a.x-b.x)}),
              rainfalls: rainfalls.sort(function(a, b) {return (a.x-b.x)}),
              percentages: percentages.sort(function(a, b) {return (a.x-b.x)}),
              totals: totals.sort(function(a, b) {return (a.x-b.x)})
            });
        },
        function(data) {
          console.log(data);
        }
      );
    }
  });
