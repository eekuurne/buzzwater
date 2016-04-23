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
    this.getData = function(station, start, cb) {
      $http.get(url+'output/?station='+station+'&start='+start.toJSON()).then(
        function(data) {
          var values1 = [];
          var values2 = [];
          console.log(data)

          angular.forEach(data.data.data, function(value, key) {
            var output = {x: key, y: value.outputQuantity}
            var rainfall = {x: key, y: value.rainfall}
            values1.push(output);
            values2.push(output);

          });

          cb(values1.sort(function(a, b) {return (a.x-b.x)}), values2.sort(function(a, b) {return (a.x-b.x)}));
        },
        function(data) {
          console.log(data);
        }
      );
    }
  });
