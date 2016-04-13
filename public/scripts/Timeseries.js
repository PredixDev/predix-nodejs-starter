
  /**
  Global variables
  **/
  var lineChartMap ;
  var raspberryPiConfig = '';
  var accessToken = '';

  /**
  This function is called on the submit button of Get timeseries data to fetch
  data from TimeSeries.
  **/
  function onclick_machineServiceData() {
    lineChartMap = getMachineServiceData();
    setInterval(updateChart,10000);
  }

  /**
  This function actually performs the retrieval of TimeSeries tags as well as
  the data of those tags chosen by the user
  **/
  function getMachineServiceData() {

    //getRaspberryPiConfig().then(
    //  function(response) {
    //    raspberryPiConfig = JSON.parse(response);

    var uaaRequest = new XMLHttpRequest();
    var auth = raspberryPiConfig.timeseriesBase64ClientCredentials;
    var uaaParams = "grant_type=client_credentials&client_id=" + raspberryPiConfig.timeseriesClientId;

    uaaRequest.open('GET', raspberryPiConfig.uaaURL + "/oauth/token?" + uaaParams, true);
    uaaRequest.setRequestHeader("Authorization", "Basic " + auth);

    uaaRequest.onreadystatechange = function() {
      if (uaaRequest.readyState == 4) {
        var res = JSON.parse(uaaRequest.responseText);
        accessToken = res.token_type + ' ' + res.access_token;

        var myTimeSeriesBody = {
          tags: []
        };

        var timeSeriesGetData = new XMLHttpRequest();
        var tagString = getTagsSelectedValue();
        var starttime = getStartTimeSelectedValue();
        var datapointsUrl = raspberryPiConfig.timeseriesURL;
        timeSeriesGetData.open('POST', datapointsUrl, true);

        var tags = tagString.split(",");
        for (i=0; i < tags.length; i++)
        {
          myTimeSeriesBody.tags.push({
            "name" : tags[i]
        });
        }
        if(starttime) {
          myTimeSeriesBody.start = starttime;
        }

        timeSeriesGetData.setRequestHeader("Predix-Zone-Id", raspberryPiConfig.timeseriesZone);
        timeSeriesGetData.setRequestHeader("Authorization", accessToken);
        timeSeriesGetData.setRequestHeader("Content-Type", "application/json");

        timeSeriesGetData.onreadystatechange = function() {
          if (timeSeriesGetData.status >= 200 && timeSeriesGetData.status < 400) {
            var data = JSON.parse(timeSeriesGetData.responseText);
            document.getElementById("line_chart_info").innerHTML = 'Chart for Tags';
            var str = JSON.stringify(timeSeriesGetData.responseText, null, 2);
            console.log('First call to Timeseries returned data:'+str);
            lineChartMap = constructMachineChartResponse(data);
            return lineChartMap;
          }
          else {
            document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
          }
        }
      }
      else
      {
        console.log("No access token");
      }

      if (tagString != undefined)
      {
        console.log("Sending Timeseries request with body: " + JSON.stringify(myTimeSeriesBody));
        timeSeriesGetData.send(JSON.stringify(myTimeSeriesBody));
      }

    };

    uaaRequest.onerror = function() {
      document.getElementById("windService_machine_yearly").innerHTML = "Error getting UAA Token";
    };

    uaaRequest.send();
      //},
      //function(error) {
      //  console.error("Failed when getting the RaspberryPi Configurations", error);
    //});
  }

/**
Fetching the selected tags
**/
function getTagsSelectedValue()
{
  var tagString = "";
  var tagAppender = "";
  var tagList = document.getElementById('tagList');
  for (var tagCount = 0; tagCount < tagList.options.length; tagCount++) {

     if(tagList.options[tagCount].selected === true){

          tagString = tagString+tagAppender+tagList.options[tagCount].value ;
          tagAppender = ",";
      }
  }
  return tagString;
}

/**
Fetching the selected start time value
**/
function getStartTimeSelectedValue()
{
  var startTime;

  var startTimeList = document.getElementById('start-time');
  for (var stCount = 0; stCount < startTimeList.options.length; stCount++) {
     if(startTimeList.options[stCount].selected === true){

          startTime = startTimeList.options[stCount].value ;
          return startTime;
      }
  }
  return startTime;
}


  /**
  Method to draw chart as per tags and construct html for same
  **/
  function constructMachineChartResponse(data) {
    var lineChartMap = new Map();
    // remove exisitn elements -reset
    document.getElementById('add_machine_canvas').innerHTML = "";
    // get the base element
    var  add_machine_canvas = document.getElementById('add_machine_canvas');

    for(i = 0; i < data.tags.length; i++) {
      var divTag = document.createElement('div');
      divTag.id="windService_machine_div_"+i;
      divTag.setAttribute("class", "windyservice_chart_div");

      add_machine_canvas.appendChild(divTag);

      var add_machine_div = document.getElementById('windService_machine_div_'+i);
      var pTagName = document.createElement('p');
      pTagName.id="windService_machine_tag_"+i;
      pTagName.class="windyservice_machine_tag";
      add_machine_div.appendChild(pTagName);

      document.getElementById("windService_machine_tag_"+i).innerHTML = data.tags[i].name;

      var canvas = document.createElement('canvas');
      canvas.id="machine_canvas_"+i;
      canvas.setAttribute("class", "windyservice_chart_canvas");
      add_machine_div.appendChild(canvas);

      var ctx = document.getElementById(canvas.id).getContext("2d");
      var lineChartDemo = new Chart(ctx).Line(getMachineLineChartData_each(data.tags[i]), {
          responsive: true
        });
        lineChartMap.set(data.tags[i].name,lineChartDemo);

      }
      return lineChartMap;
  }

/**
Method to update the Chart with the latest data from the selected tags
**/
  function updateChart() {

      var uaaRequest = new XMLHttpRequest();
      var auth = raspberryPiConfig.timeseriesBase64ClientCredentials;
      var uaaParams = "grant_type=client_credentials&client_id=" + raspberryPiConfig.timeseriesClientId;

      uaaRequest.open('GET', raspberryPiConfig.uaaURL + "/oauth/token?" + uaaParams, true);
      uaaRequest.setRequestHeader("Authorization", "Basic " + auth);

      uaaRequest.onreadystatechange = function() {
        if (uaaRequest.readyState == 4) {
          var res = JSON.parse(uaaRequest.responseText);
          accessToken = res.token_type + ' ' + res.access_token;

          var myTimeSeriesBody = {
            tags: []
          };

          var timeSeriesGetData = new XMLHttpRequest();
          var tagString = getTagsSelectedValue();
          var starttime = getStartTimeSelectedValue();
          var datapointsUrl = raspberryPiConfig.timeseriesURL;
          timeSeriesGetData.open('POST', datapointsUrl, true);

          var tags = tagString.split(",");
          for (i=0; i < tags.length; i++)
          {
            myTimeSeriesBody.tags.push({
              "name" : tags[i]
          });
          }

          myTimeSeriesBody.start = "5mi-ago";

          timeSeriesGetData.setRequestHeader("Predix-Zone-Id", raspberryPiConfig.timeseriesZone);
          timeSeriesGetData.setRequestHeader("Authorization", accessToken);
          timeSeriesGetData.setRequestHeader("Content-Type", "application/json");

          timeSeriesGetData.onload = function() {
            if (timeSeriesGetData.status >= 200 && timeSeriesGetData.status < 400) {
              var data = JSON.parse(timeSeriesGetData.responseText);
              console.log("Updated data: " + JSON.stringify(timeSeriesGetData.responseText, null, 2))

              for(i = 0; i < data.tags.length; i++) {
                var datapoints = data.tags[i].results[0].values;
                for(j = 0; j < datapoints.length; j++) {
                  lineChartDemo = lineChartMap.get(data.tags[i].name);
                  var d = new Date(datapoints[j][0]);
                  var formatDate = monthNames[d.getMonth()]+'-'+d.getFullYear()+'-'+d.getDate()+' '+d.getHours()+' '+d.getMinutes()+':'+d.getSeconds()+" "+d.getMilliseconds();
                  lineChartDemo.addData([datapoints[j][1]],formatDate);
                  lineChartDemo.removeData();
                }
              }
            }
            else {
              {
                console.log("Error on updating the chart...");
              }
            }
          };
          timeSeriesGetData.send(JSON.stringify(myTimeSeriesBody));
        }
        else {
          console.log("No access token");
        }
      };
      uaaRequest.onerror = function() {
        document.getElementById("windService_machine_yearly").innerHTML = "Error getting UAA Access Token";
      };

      uaaRequest.send();
  }

  /*
  Method that get the timeseries data and convert that in Chart format.
  */
  function getMachineLineChartData_each(tag){
    var dataset = {
            label: tag.name,
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [0]
    };

    var lineChartData = {
          labels : [0],
          datasets : [dataset]
    };
    var datapoints = tag.results[0].values;
    var dataPointMap =  new Map();
    for(j = 0; j < datapoints.length; j++) {
      var d = new Date(datapoints[j][0]);
      var formatDate = monthNames[d.getMonth()]+'-'+d.getFullYear()+'-'+d.getDate()+' '+d.getHours()+' '+d.getMinutes()+':'+d.getSeconds()+" "+d.getMilliseconds();
      //chartLabels.push(formatDate);
      lineChartData.labels.push(formatDate);
      lineChartData.datasets[0].data.push(datapoints[j][1]);
    }
    document.getElementById('windService_machine_yearly').scrollIntoView();
    return lineChartData;
  }

/**
Method to generate the list of tags to choose from
**/
function configureTagsTimeseriesData (){

  getRaspberryPiConfig().then(
    function(response) {
      raspberryPiConfig = JSON.parse(response);

      select = document.getElementById('tagList');
      if (select) {
        // Create all Tags (assuming separated by comma)
        var tags = (raspberryPiConfig.assetTagname).split(",");
        for (i=0; i < tags.length; i++) {
          var opt = document.createElement('option');
          opt.value = tags[i].trim();
          opt.selected = "selected";
          opt.innerHTML = tags[i].trim();
          select.appendChild(opt);
        }

      }
      else {
        document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
      }
    },
    function(error) {
      console.error("Failed when getting the RaspberryPi Configurations", error);
  });
}

/**
Method to make the necessary rest call and get the raspberry PI configurations
from the server
**/
function getRaspberryPiConfig() {
  console.log("Making call to /secure/data to get raspberry pi configurations...");
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', '/secure/data');
    request.onload = function() {
      if (request.status == 200) {
        resolve(request.response);
      }
      else {
        reject(Error(request.statusText));
      }
    };
    request.send();
  });
}

/*
var for month
*/
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
