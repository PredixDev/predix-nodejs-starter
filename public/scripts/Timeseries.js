
/**
Global variables
**/
var lineChartMap ;
var connectedDeviceConfig = '';
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
**/
function getMachineServiceData() {

  if (connectedDeviceConfig.isConnectedTimeseriesEnabled) {
    // If the Connected Device attribute exists, then
    // update the chart without using the Microservice
    getMachineServiceDataWithoutMicroservice();
  }
  else {

    var request = new XMLHttpRequest();
    var tagString = getTagsSelectedValue();
    var starttime = getStartTimeSelectedValue();
    var datapointsUrl = "/api/services/windservices/yearly_data/sensor_id/"+tagString+"?order=asc";
    if(starttime) {
      datapointsUrl = datapointsUrl + "&starttime="+starttime;
    }
    //console.log(tagString);
    request.open('GET', datapointsUrl, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        document.getElementById("line_chart_info").innerHTML = 'Chart for Tags';
        var str = JSON.stringify(request.responseText, null, 2);
        //console.log('data is '+str);
        lineChartMap = constructMachineChartResponse(data);
        return lineChartMap;

      } else {
        document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
      }
    };
    request.onerror = function() {
      document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
    };
    request.send();
  }

  // Call the Asset service if applicable
  if (connectedDeviceConfig.isConnectedAssetEnabled) {
    // Get the Asset data if the Asset URI is enabled
    var assetUaaRequest = new XMLHttpRequest();
    var assetAuth = connectedDeviceConfig.uaaBase64ClientCredential;
    var tagString = getTagsSelectedValue();
    var assetUaaParams = "grant_type=client_credentials&client_id=" + connectedDeviceConfig.uaaClientId;

    assetUaaRequest.open('GET', connectedDeviceConfig.uaaURL + "/oauth/token?" + assetUaaParams, true);
    assetUaaRequest.setRequestHeader("Authorization", "Basic " + assetAuth);

    assetUaaRequest.onreadystatechange = function() {
      if (assetUaaRequest.readyState == 4) {
        var res = JSON.parse(assetUaaRequest.responseText);
        var assetAccessToken = res.token_type + ' ' + res.access_token;

        var assetGetData = new XMLHttpRequest();
        var assetGetDataURL = connectedDeviceConfig.assetURL + "/" + tagString;

        assetGetData.open('GET', assetGetDataURL, true);

        assetGetData.setRequestHeader("Predix-Zone-Id", connectedDeviceConfig.assetZoneId);
        assetGetData.setRequestHeader("Authorization", assetAccessToken);
        assetGetData.setRequestHeader("Content-Type", "application/json");

        assetGetData.onreadystatechange = function() {
          if (assetGetData.status >= 200 && assetGetData.status < 400) {
            if (assetGetData.readyState == 4) {
              var resultJSON = JSON.parse(assetGetData.response)[0];
              var nameOfTable = document.getElementById("predix_asset_table");
              nameOfTable.innerHTML = "Asset Information";

              var table = document.getElementById("aTable");
              while (table.firstChild) {
                  table.removeChild(table.firstChild);
              }
              keys = Object.keys(resultJSON);
              for(var i = 0; i<keys.length; i++) {
               // Create an empty <tr> element and add it to the 1st position of the table:
               var row = table.insertRow(i);
               // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
               var cell1 = row.insertCell(0);
               var cell2 = row.insertCell(1);
               cell1.style.borderWidth = "1px"
               cell1.style.borderStyle = "solid"
               cell1.style.borderColor = "black"

               cell2.style.borderWidth = "1px"
               cell2.style.borderStyle = "solid"
               cell2.style.borderColor = "black"
               // Add some text to the new cells:
               cell1.innerHTML = keys[i];
               cell2.innerHTML = resultJSON[keys[i]];
             }
             table.style.borderCollapse= "collapse";
            }
          }
          else {
            document.getElementById("predix_asset_table").innerHTML = "No data found for Asset: " + tagString;
            var table = document.getElementById("aTable");
            while (table.firstChild) {
                table.removeChild(table.firstChild);
            }
          }
        }

        if (tagString != undefined)
        {
          assetGetData.send();
        }
      }
      else
      {
        console.log("No access token");
      }

    };

    assetUaaRequest.onerror = function() {
      document.getElementById("predix_asset_table").innerHTML = "Error getting UAA Token for Predix Asset";
    };

    assetUaaRequest.send();
  }
}

/**
This function actually performs the retrieval of TimeSeries tags as well as
the data of those tags chosen by the user. Data is queried directroy from
Timeseries and Asset Services
**/
function getMachineServiceDataWithoutMicroservice() {

  var timeSeriesUaaRequest = new XMLHttpRequest();
  var timeSeriesAuth = connectedDeviceConfig.uaaBase64ClientCredential;
  var uaaParams = "grant_type=client_credentials&client_id=" + connectedDeviceConfig.uaaClientId;

  timeSeriesUaaRequest.open('GET', connectedDeviceConfig.uaaURL + "/oauth/token?" + uaaParams, true);
  timeSeriesUaaRequest.setRequestHeader("Authorization", "Basic " + timeSeriesAuth);

  timeSeriesUaaRequest.onreadystatechange = function() {
    if (timeSeriesUaaRequest.readyState == 4) {
      var res = JSON.parse(timeSeriesUaaRequest.responseText);
      accessToken = res.token_type + ' ' + res.access_token;

      var myTimeSeriesBody = {
        tags: []
      };

      var timeSeriesGetData = new XMLHttpRequest();
      var tagString = getTagsSelectedValue();
      var starttime = getStartTimeSelectedValue();
      var datapointsUrl = connectedDeviceConfig.timeseriesURL;
      timeSeriesGetData.open('POST', datapointsUrl, true);

      var tags = tagString.split(",");
      for (i=0; i < tags.length; i++)
      {
        myTimeSeriesBody.tags.push({
          "name" : tags[i],
          "limit": 25
      });
      }
      if(starttime) {
        myTimeSeriesBody.start = starttime;
      }

      timeSeriesGetData.setRequestHeader("Predix-Zone-Id", connectedDeviceConfig.timeseriesZone);
      timeSeriesGetData.setRequestHeader("Authorization", accessToken);
      timeSeriesGetData.setRequestHeader("Content-Type", "application/json");

      timeSeriesGetData.onreadystatechange = function() {
        if (timeSeriesGetData.status >= 200 && timeSeriesGetData.status < 400) {
          var data = JSON.parse(timeSeriesGetData.responseText);
          document.getElementById("line_chart_info").innerHTML = 'Chart for Tags';
          var str = JSON.stringify(timeSeriesGetData.responseText, null, 2);
          console.log('First call to Timeseries returned data:'+ str);
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
      timeSeriesGetData.send(JSON.stringify(myTimeSeriesBody));
    }

  };

  timeSeriesUaaRequest.onerror = function() {
    document.getElementById("windService_machine_yearly").innerHTML = "Error getting UAA Token";
  };

  timeSeriesUaaRequest.send();
}

/**
Fetching the selected tags
**/
function getTagsSelectedValue() {
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
function getStartTimeSelectedValue() {
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
This method quries the Microservice created in the 'Build a Basic App Journey'
**/
function updateChart() {
  if (connectedDeviceConfig.isConnectedTimeseriesEnabled) {
    // If the Connected Device attribute exists, then
    // update the chart without using the Microservice
    updateChartWithoutMicroservice();
  }
  else {
    var tagString = getTagsSelectedValue();
    var request = new XMLHttpRequest();
    var datapointsUrl = "/api/services/windservices/yearly_data/sensor_id/"+tagString+"?order=asc&starttime=5mi-ago";
    //console.log(datapointsUrl);
    request.open('GET', datapointsUrl, true);
    request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      //console.log('updated data is '+str);
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
  };
  request.onerror = function() {
    document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
  };
  request.send();
  }
}


/**
Method to update the Chart with the latest data from the selected tags
This method quries UAA and Timeseries directly
**/
function updateChartWithoutMicroservice() {

    var uaaRequest = new XMLHttpRequest();
    var auth = connectedDeviceConfig.uaaBase64ClientCredential;
    var uaaParams = "grant_type=client_credentials&client_id=" + connectedDeviceConfig.uaaClientId;

    uaaRequest.open('GET', connectedDeviceConfig.uaaURL + "/oauth/token?" + uaaParams, true);
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
        var datapointsUrl = connectedDeviceConfig.timeseriesURL;
        timeSeriesGetData.open('POST', datapointsUrl, true);

        var tags = tagString.split(",");
        for (i=0; i < tags.length; i++)
        {
          myTimeSeriesBody.tags.push({
            "name" : tags[i],
            "limit": 25
        });
        }

        myTimeSeriesBody.start = "5mi-ago";

        timeSeriesGetData.setRequestHeader("Predix-Zone-Id", connectedDeviceConfig.timeseriesZone);
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
function configureTagsTimeseriesData() {

  getConnectedDeviceConfig().then(
    function(response) {
      connectedDeviceConfig = JSON.parse(response);

      if (connectedDeviceConfig.isConnectedTimeseriesEnabled) {
        headerTitle = document.getElementById('tag_list_title');
        if (headerTitle) {
          headerTitle.innerHTML = 'Connected Device Tag List';
        }
        select = document.getElementById('tagList');
        if (select) {

          var timeSeriesUaaRequest = new XMLHttpRequest();
          var timeSeriesAuth = connectedDeviceConfig.uaaBase64ClientCredential;
          var uaaParams = "grant_type=client_credentials&client_id=" + connectedDeviceConfig.uaaClientId;

          timeSeriesUaaRequest.open('GET', connectedDeviceConfig.uaaURL + "/oauth/token?" + uaaParams, true);
          timeSeriesUaaRequest.setRequestHeader("Authorization", "Basic " + timeSeriesAuth);

          timeSeriesUaaRequest.onreadystatechange = function() {
            if (timeSeriesUaaRequest.readyState == 4) {

              var res = JSON.parse(timeSeriesUaaRequest.responseText);
              accessToken = res.token_type + ' ' + res.access_token;

              var timeSeriesGetAllTags = new XMLHttpRequest();

              var datapointsUrl = connectedDeviceConfig.timeseriesURL;
              var getAllTagsUrl = datapointsUrl.replace("datapoints", "tags");
              timeSeriesGetAllTags.open('GET', getAllTagsUrl, true);

              timeSeriesGetAllTags.setRequestHeader("Predix-Zone-Id", connectedDeviceConfig.timeseriesZone);
              timeSeriesGetAllTags.setRequestHeader("Authorization", accessToken);
              timeSeriesGetAllTags.setRequestHeader("Content-Type", "application/json");

              timeSeriesGetAllTags.onreadystatechange = function() {
                if (timeSeriesGetAllTags.status >= 200 && timeSeriesGetAllTags.status < 400) {
                  var data = JSON.parse(timeSeriesGetAllTags.responseText);

                  // Create all Tags (assuming separated by comma)
                  var tagsToGenerate = (connectedDeviceConfig.assetTagname).split(",");

                  // Make call to timeseries to get all Tags
                  for (var i = 0; i < data.results.length; i++) {
                    var tagname = data.results[i];
                    if (tagsToGenerate.indexOf(tagname) < 0) {
                      tagsToGenerate.push(tagname);
                      console.log("Adding timeseries tag: " + tagname)
                    }
                  }
                  tagListElement = document.getElementById('tagList');
                  while (tagListElement.firstChild) {
                      tagListElement.removeChild(tagListElement.firstChild);
                  }

                  for (i=0; i < tagsToGenerate.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = tagsToGenerate[i].trim();
                    opt.selected = "selected";
                    opt.innerHTML = tagsToGenerate[i].trim();
                    tagListElement.appendChild(opt);
                  }
                }
                else {
                  document.getElementById("windService_machine_yearly").innerHTML = "Error getting tags from Timeseries";
                }
              }
              timeSeriesGetAllTags.send();
            }
            else
            {
              console.log("No access token");
            }
          };

          timeSeriesUaaRequest.onerror = function() {
            document.getElementById("windService_machine_yearly").innerHTML = "Error getting UAA Token when attempting to query Timeseries";
          };

          timeSeriesUaaRequest.send();
      }
    }
    else {
      getTagsFromMicroservice();
    }

    },
    function(error) {
      console.error("Failed when getting the RaspberryPi Configurations", error);
  });
}

function getTagsFromMicroservice (){
  var request = new XMLHttpRequest();
  request.open('GET', '/api/services/windservices/tags', true);
  request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(request.responseText);
    //console.log('tags response is '+JSON.stringify(request.responseText, null, 2));
    select = document.getElementById('tagList');
    if (select) {
      for(tagCount = 0; tagCount < data.results.length; tagCount++) {
        var opt = document.createElement('option');
        opt.value = data.results[tagCount];
        if(tagCount === 0){
          opt.selected = "selected";
        }
      opt.innerHTML = data.results[tagCount];
      select.appendChild(opt);
      }
    }
  }
  else {
    document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
  }
  };
  request.onerror = function() {
    document.getElementById("windService_machine_yearly").innerHTML = "Error getting data for tags";
  };
  request.send();
}

/**
Method to make the necessary rest call and get the raspberry PI configurations
from the server
**/
function getConnectedDeviceConfig() {
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
