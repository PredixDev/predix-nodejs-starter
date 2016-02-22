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
  This function is called on the submit button of Get timeseries data to fetch
  data from WindServices.
  **/
  function onclick_machineServiceData() {
    var request = new XMLHttpRequest();
    var tagString = getTagsSelectedValue();
    var starttime = getStartTimeSelectedValue();
    var datapointsUrl = "/api/services/windservices/yearly_data/sensor_id/"+tagString;
    if(starttime) {
      datapointsUrl = datapointsUrl + "?starttime="+starttime;
    }
    console.log(tagString);
    request.open('GET', datapointsUrl, true);
    request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      document.getElementById("line_chart_info").innerHTML = 'Chart for Tags';
      document.getElementById("windService_machine_tags").innerHTML = tagString;
      var str = JSON.stringify(request.responseText, null, 2);
      console.log('data is '+str);
      constructMachineChartResponse(data);

    } else {
      document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";

    }
  };
  request.onerror = function() {
    document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
  };
  request.send();
  }

/**Fetching the selected tags
**/
function getTagsSelectedValue()
{
  var tagString = "";
  var tagAppender = "";
  var tagList = document.getElementById('tagList');
  for (var tagCount = 0; tagCount < tagList.options.length; tagCount++) {
    console.log(tagList.options[tagCount].value);
     if(tagList.options[tagCount].selected === true){
          console.log("Selected value is "+tagList.options[tagCount].value);
          tagString = tagString+tagAppender+tagList.options[tagCount].value ;
          tagAppender = ",";
      }
  }
  return tagString;
}

/**Fetching the selected tags
**/
function getStartTimeSelectedValue()
{
  var startTime;

  var startTimeList = document.getElementById('start-time');
  for (var stCount = 0; stCount < startTimeList.options.length; stCount++) {
     if(startTimeList.options[stCount].selected === true){
          console.log("Selected value is "+startTimeList.options[stCount].value);
          startTime = startTimeList.options[stCount].value ;
          return startTime
      }
  }
  return startTime;
}


  /**
  Method to draw chart
  **/
  function constructMachineChartResponse(data) {
  var ctx = document.getElementById("machine_canvas").getContext("2d");
  window.myLine = new Chart(ctx).Line(getMachineLineChartData(data), {
      responsive: true
    });
  }

  /*
  Method that get the timeseries data and convert that in Chart format.
  */
  function getMachineLineChartData(data){
    var lineChartData = {
          labels : monthNames,
          datasets : []
    };

    var chartLabels = []; // timestamp value of all the labels for all tags
    var tagsMap =  new Map(); // maps of tags and its datapoints
    // construct datasets
    lineChartData.datasets = constructDataSet(data.tags);

    for(i = 0; i < data.tags.length; i++) {
      console.log("getting data for tag"+data.tags[i].name);
      var datapoints = data.tags[i].results[0].values;
      console.log("Results are "+datapoints);
      var dataPointMap =  new Map();
      for(j = 0; j < datapoints.length; j++) {
        var d = new Date(datapoints[j][0]);
        var formatDate = monthNames[d.getMonth()]+'-'+d.getFullYear()+' '+d.getHours()+':'+d.getSeconds();
        //chartLabels.push(formatDate);
        lineChartData.labels.push(formatDate);
        lineChartData.datasets[i].data.push(datapoints[j][1]);
      }
    }
    return lineChartData;

  }

/**
*
**/
  function constructDataSet(tags) {
    var tagDataSet = [];
    for(i = 0; i < tags.length; i++) {
      var dataset = {
              label: tags[i].name,
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: []
          };

      if(i % 2 === 0 ){
        dataset.fillColor = 'rgba(151,187,205,0.2)';
        dataset.strokeColor = 'rgba(151,187,205,1)';
        dataset.pointColor = 'rgba(151,187,205,1)';
         dataset.pointHighlightStroke = '"rgba(151,187,205,1)';
      }
      tagDataSet.push(dataset);
    }

  return tagDataSet;

  }

/**
**/
function configureTimeseriesData (){
  var request = new XMLHttpRequest();
  request.open('GET', '/api/services/windservices/tags', true);
  request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(request.responseText);
    console.log('tags response is '+JSON.stringify(request.responseText, null, 2));
    select = document.getElementById('tagList');
    for(tagCount = 0; tagCount < data.results.length; tagCount++) {
    var opt = document.createElement('option');
    opt.value = data.results[tagCount];
    if(tagCount === 0) {
      opt.selected = "selected";
    }
    opt.innerHTML = data.results[tagCount];
    select.appendChild(opt);
  }


  } else {
    document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";

  }
};
request.onerror = function() {
  document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
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
