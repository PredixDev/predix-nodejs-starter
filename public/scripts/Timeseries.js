  /**
  This function is called on the submit button of Get timeseries data to fetch
  data from WindServices.
  **/
  var lineChartMap ;

  function onclick_machineServiceData() {
    lineChartMap = getMachineServiceData();
    setInterval(updateChart,4000);
  }

  /**
  **/
  function getMachineServiceData() {
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

/**Fetching the selected tags
**/
function getTagsSelectedValue()
{
  var tagString = "";
  var tagAppender = "";
  var tagList = document.getElementById('tagList');
  for (var tagCount = 0; tagCount < tagList.options.length; tagCount++) {
    //console.log(tagList.options[tagCount].value);
     if(tagList.options[tagCount].selected === true){
          //console.log("Selected value is "+tagList.options[tagCount].value);
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
          //console.log("Selected value is "+startTimeList.options[stCount].value);
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

  function updateChart() {
      var tagString = getTagsSelectedValue();
      var request = new XMLHttpRequest();
      var datapointsUrl = "/api/services/windservices/yearly_data/sensor_id/"+tagString+"?order=asc&starttime=7s-ago";
      //console.log(datapointsUrl);
      request.open('GET', datapointsUrl, true);
      request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
    //    var str = JSON.stringify(request.responseText, null, 2);
        //console.log('updated data is '+str);
        for(i = 0; i < data.tags.length; i++) {
          var datapoints = data.tags[i].results[0].values;
          for(j = 0; j < datapoints.length; j++) {
            lineChartDemo = lineChartMap.get(data.tags[i].name);
            var d = new Date(datapoints[j][0]);
            var formatDate = monthNames[d.getMonth()]+'-'+d.getFullYear()+' '+d.getHours()+' '+d.getMinutes()+':'+d.getSeconds()+" "+d.getMilliseconds();
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
      var formatDate = monthNames[d.getMonth()]+'-'+d.getFullYear()+' '+d.getHours()+' '+d.getMinutes()+':'+d.getSeconds()+" "+d.getMilliseconds();
      //chartLabels.push(formatDate);
      lineChartData.labels.push(formatDate);
      lineChartData.datasets[0].data.push(datapoints[j][1]);
    }
    document.getElementById('windService_machine_yearly').scrollIntoView();
    return lineChartData;
  }

function configureTagsTimeseriesData (){
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
      if(tagCount === 0) {
        opt.selected = "selected";
      }
      opt.innerHTML = data.results[tagCount];
      select.appendChild(opt);
    }
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

/*
var for month
*/
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
