  /**
  This function is called on the submit button of Get timeseries data to fetch
  data from WindServices.
  **/
  function onclick_WindService_Yearly() {
    var request = new XMLHttpRequest();
    request.open('GET', '/api/services/windservices/yearly_data/', true);
    request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      document.getElementById("windService_yearly").innerHTML = "Data for tag :"+data.tags[0].name;
      //parseTSdailyResponse(data);
      constructChartResponse(data);
      //var str = JSON.stringify(request.responseText, null, 2);
      //console.log('data is '+str);

    } else {
      document.getElementById("windService_yearly").innerHTML = "Error getting data for tags";

    }
  };
  request.onerror = function() {
    document.getElementById("windService_yearly").innerHTML = "Error getting data for tags";
  };
  request.send();
  }
/**
**/
function parseTSdailyResponse(data) {
  var out = "";
  var i;
  var datapoints = data.tags[0].results[0].values;
  for(i = 0; i < datapoints.length; i++) {
      out+= '<div id="'+datapoints[i][0]+'">Time ='+datapoints[i][0]+' Value ='+datapoints[i][1]+'</div>';
  }
  //console.log(out);
  document.getElementById("windService_yearly_response").innerHTML = out;
}
/*
var for month
*/
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
/*
Method that get the timeseries data and convert that in Chart format.
*/
function getLineChartData(data){
  var d = new Date(0);
  var datapoints = data.tags[0].results[0].values;
  var dataValue = [];
  var dataLabel = [];
  for(i = 0; i < datapoints.length; i++) {
    var d = new Date(datapoints[i][0]);
    var formatDate = monthNames[d.getMonth()]+'-'+d.getFullYear()+' '+d.getHours()+':'+d.getSeconds();
    //dataLabel[d.getMonth()] = monthNames[d.getMonth()]; // time
    //dataValue[d.getMonth()] = datapoints[i][1]; // value
    dataLabel[i] = formatDate;
    dataValue[i] = datapoints[i][1];
  }

  var lineChartData = {
        labels : monthNames,
        datasets : [
          {
            label: data.tags[0].name,
            fillColor : "rgba(220,220,220,0.2)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(220,220,220,1)",
            data : []
          }
        ]
      };
  lineChartData.datasets[0].data = dataValue;
  lineChartData.labels = dataLabel;
  //lineChartData.labels = monthNames;

  //console.log(lineChartData.datasets[0].data);
  //console.log(lineChartData.labels);

  return lineChartData;
}

/**
Method to draw chart
**/
function constructChartResponse(data) {
var ctx = document.getElementById("canvas").getContext("2d");

window.myLine = new Chart(ctx).Line(getLineChartData(data), {
    responsive: true
  });
}
