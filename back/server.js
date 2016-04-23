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
  res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/targets', function(req, res) {

  var q = 'SELECT Code, Target_Type, Name, LAT, LONG FROM HSY_TARGETS WHERE Target_Type = \'JVP\' AND LAT IS NOT NULL AND LONG IS NOT NULL';
  var sqlReq = new sql.Request(connection).query(q)
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

router.get('/output/', function(req, res) {

  var station = req.query.station;
  var start = req.query.start;
  var end = typeof(req.query.end) !== 'undefined' ? req.query.end : undefined;

  var resultWithOutputVolumeAndRainData = {};

  var outputQuery = 'SELECT OUTPUT_QUANTITY, STS FROM HSY_MES_PUMP_1H WHERE STS > \'' + start + '\' AND STATION = \'' + station + '\'';
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

      resultWithOutputVolumeAndRainData[date] = {
        outputQuantity: output.OUTPUT_QUANTITY,
        rainfall: 0
      };

    }

    outputMedian = median(outputMedianArray);

    var rainfallQuery = 'SELECT Rainfall, DateAndTimeUTC from HSY_RAINFALL_1H WHERE DateAndTimeUTC > \'' + start + '\' AND STATION = \'' + station + '\'';
    if (end) {
      rainfallQuery += ' AND DateAndTimeUTC < \'' + end + '\'';
    }

    console.log(rainfallQuery);

    var rainfallSqlReq = new sql.Request(connection).query(rainfallQuery)
    .then(function(rainfallResult) {

      console.log('number of rainfall results: '+rainfallResult.length);

      for (var i = 0; i < rainfallResult.length; i++) {
        var rainfall = rainfallResult[i];
        var date = new Date(rainfall.DateAndTimeUTC).getTime();

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
    // console.dir(recordset);

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

// sql.connect("mssql://devuser1:devuser123@10.144.72.11/AWR").then(function() {
//     // Query
//
// 	new sql.Request().query('select TOP 2 * from HSY_MES_PUMP_1H').then(function(recordset) {
//     //SELECT t.*, %%physloc%% as "%%physloc%%" FROM AWR.dbo.HSY_MES_PUMP_1H t
// 		console.dir(recordset);
// 	}).catch(function(err) {
//     console.log('query meni vähä rikki');
// 		console.log(err);
// 	});
//
//     // Stored Procedure
//
// 	// new sql.Request()
// 	// .input('input_parameter', sql.Int, value)
//   //   .output('output_parameter', sql.VarChar(50))
// 	// .execute('procedure_name').then(function(recordsets) {
// 	// 	console.dir(recordsets);
// 	// }).catch(function(err) {
// 	// 	// ... execute error checks
// 	// });
//
// 	// ES6 Tagged template literals (experimental)
//
// 	// sql.query`select * from mytable where id = ${value}`.then(function(recordset) {
// 	// 	console.dir(recordset);
// 	// }).catch(function(err) {
// 	// 	// ... query error checks
// 	// });
// }).catch(function(err) {
// 	// ... connect error checks
//   console.log('kaikki meni vituiks');
// });
