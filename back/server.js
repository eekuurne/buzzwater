var sql = require('mssql');

var express = require('express')
  , cors = require('cors')
  , app = express();

app.use(cors());

var port = process.env.PORT || 8080;

var connection = new sql.Connection({
  user:       'devuser1',
  password:   'devuser123',
  server:     '10.144.72.11',
  database:   'AWR'
});

connection.connect();

var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'NYT SITÄ DATAA SITTEN' });
});

router.get('/targets', function(req, res) {

  var targetsWithFlowQuality = {};

  var q = 'SELECT Code, Target_Type, Name, LAT, LONG FROM HSY_TARGETS WHERE Target_Type = \'JVP\' AND LAT IS NOT NULL AND LONG IS NOT NULL';
  var sqlReq = new sql.Request(connection).query(q)
  .then(function(targetResult) {

    for (var i = 0; i < targetResult.length; i++) {
      var tar = targetResult[i];
      var key = tar.Target_Type + tar.Code;
      targetsWithFlowQuality[key] = tar;
    }

    var flowQualityQuery = 'SELECT STATION, QUALITY FROM FLOW_QUALITY';
    var flowQualitySqlReq = new sql.Request(connection).query(flowQualityQuery)
    .then(function(flowQualityResult) {

      for (var i = 0; i < flowQualityResult.length; i++) {
        var flowQuality = flowQualityResult[i];
        if (targetsWithFlowQuality[flowQuality.STATION]) {
          targetsWithFlowQuality[flowQuality.STATION].flowQuality = flowQuality.QUALITY;
        }
      }

      res.json({
        success: true,
        data: targetsWithFlowQuality,
      });

    }).catch(function(err) {
      console.log('query (' + outputQuery + ') meni vähä rikki');

      res.json({
        success: false,
        data: err
      });
    });

  }).catch(function(err) {
    console.log('query meni vähä rikki');

    res.json({
      success: false,
      data: err
    });
  });

});

router.get('/output/', function(req, res) {

  var station = req.query.station;
  var start = req.query.start;
  var end = typeof(req.query.end) !== 'undefined' ? req.query.end : undefined;

  var resultWithOutputVolumeAndRainData = {};

  var outputQuery = 'SELECT OUTPUT_QUANTITY, STS, P1_RUN_TIME, P2_RUN_TIME, P3_RUN_TIME, P4_RUN_TIME, P5_RUN_TIME, P6_RUN_TIME FROM HSY_MES_PUMP_1H WHERE STS > \'' + start + '\' AND STATION = \'' + station + '\'';
  if (end) {
    outputQuery += ' AND STS < \'' + end + '\'';
  }

  var outputMedianArray = [];
  var outputMedian = 0;

  var rainfallMedianArray = [];
  var rainfallMedian = 0;

  var max = 0;
  var min = Number.MAX_SAFE_INTEGER;

  console.log(outputQuery);

  var outputSqlReq = new sql.Request(connection).query(outputQuery)
  .then(function(outputResult) {

    console.log('number of outputresults: ' + outputResult.length);

    for (var i = 0; i < outputResult.length; i++) {
      var output = outputResult[i]
      var date = new Date(output.STS).getTime();

      if (output.OUTPUT_QUANTITY > 0)
        outputMedianArray.push(output.OUTPUT_QUANTITY);

      max = date > max ? date : max;
      min = date < min ? date : min;

      var pumpUptime = calculatePumpUptimeData(output);

      resultWithOutputVolumeAndRainData[date] = {
        outputQuantity: output.OUTPUT_QUANTITY,
        rainfall: 0,
        uptime: pumpUptime
      };

    }

    outputMedian = median(outputMedianArray);

    var rainfallQuery = 'SELECT Rainfall, DateAndTime from HSY_RAINFALL_1H WHERE DateAndTime > \'' + start + '\' AND STATION = \'' + station + '\'';
    if (end) {
      rainfallQuery += ' AND DateAndTime < \'' + end + '\'';
    }

    console.log(rainfallQuery);

    var rainfallSqlReq = new sql.Request(connection).query(rainfallQuery)
    .then(function(rainfallResult) {

      console.log('number of rainfall results: '+rainfallResult.length);

      for (var i = 0; i < rainfallResult.length; i++) {
        var rainfall = rainfallResult[i];
        var date = new Date(rainfall.DateAndTime).getTime();

        rainfallMedianArray.push(rainfall.Rainfall);

        resultWithOutputVolumeAndRainData[date].rainfall = rainfall.Rainfall;
      }

      rainfallMedian = median(rainfallMedianArray);

      res.json({
        success: true,
        data: resultWithOutputVolumeAndRainData,
        dates: {
          min: min,
          max: max
        },
        statistics: {
          outputMedian: outputMedian,
          outputAverage: average(outputMedianArray),
          outputMin: outputMedianArray[0],
          outputMax: outputMedianArray[outputMedianArray.length-1],

          rainfallMedian: rainfallMedian,
          rainfallAverage: average(rainfallMedianArray),
          rainfallMin: rainfallMedianArray[0],
          rainfallMax: rainfallMedianArray[rainfallMedianArray.length-1]

        }
      });

    }).catch(function(err) {
      console.log('query (' + outputQuery + ') meni vähä rikki');

      res.json({
        success: false,
        data: err
      });
    });

  }).catch(function(err) {
    console.log('query ( ' + rainfallQuery + ') meni vähä rikki');

    res.json({
      success: false,
      data: err

    });
  });
});

router.get('/customQuery/:query', function(req, res) {

  var sqlReq = new sql.Request(connection).query(req.params.query)
  .then(function(recordset) {

    res.json({
      success: true,
      data: recordset
    });

  }).catch(function(err) {
    console.log('query meni vähä rikki');

    res.json({
      success: false,
      data: err
    });
  });

});

app.use('/api', router);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.listen(port);
console.log('Magic happens on port ' + port);

function calculatePumpUptimeData(d) {

  var runtimes = [d.P1_RUN_TIME, d.P2_RUN_TIME, d.P3_RUN_TIME, d.P4_RUN_TIME, d.P5_RUN_TIME, d.P6_RUN_TIME];
  var pumpCount = 0;
  var totalRuntime = 0;
  var calculatedData = {

  };

  for (var i = 0; i < runtimes.length; i++) {
    var pumpRuntime = runtimes[i];
    if (pumpRuntime) {
      pumpCount += 1;
      pumpRuntime = pumpRuntime > 100 ? pumpRuntime / 1000 : pumpRuntime;
      if (pumpRuntime > 60 && pumpRuntime < 100) {
        pumpRuntime = 60;
      }
      else if (pumpRuntime >= 100) {
        pumpRuntime = pumpRuntime / 1000;
      }
      totalRuntime += pumpRuntime;
      calculatedData['P' + (i+1)] = pumpRuntime;
    }
  }

  calculatedData.pumpCount = pumpCount;
  calculatedData.totalRuntime = totalRuntime;
  calculatedData.uptimePercentage = totalRuntime / (pumpCount * 60) * 100;

  return calculatedData;
}

function median(values) {

  values.sort( function(a,b) {return a - b;} );
  var half = Math.floor(values.length/2);

  if(values.length % 2)
    return values[half];
  else
    return (values[half-1] + values[half]) / 2.0;
}

function average(values) {
  var total = 0;

  for (var i = 0; i < values.length; i++) {
    total += values[i];
  }
  return total / values.length;
}