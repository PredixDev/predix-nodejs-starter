

function learningPaths(body) {
  var resultJSON;
  var getData = new XMLHttpRequest();
  getData.open('GET', "/learning-paths", true);
  getData.onload = function() {
    resultJSON = JSON.parse(getData.response);
    if ( resultJSON["learningPathsConfig"].authorization == true ) {
      var cloudbasics = document.getElementById('learningpaths.authentication');
      cloudbasics.style.display="list-item";
      //cloudbasics.style="display";
    }
    else {
      var cloudbasics = document.getElementById('learningpaths.cloudbasics');
      cloudbasics.style.display="list-item";
    }
  };
  getData.send();

}
