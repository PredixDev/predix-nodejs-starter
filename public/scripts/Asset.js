/**
 * gets Asset Data for the tags
**/
function getAssetData(isConnectedAssetEnabled ,tagString) {

  // Call the Asset service if applicable
  if (isConnectedAssetEnabled) {
    // Get the Asset data if the Asset URI is enabled
    var table = document.getElementById("aTable");
    var assetGetData = new XMLHttpRequest();
    // Assumption that tag are defined as <AsssetId>:<tagname>
    var assetId = tagString.split(":");
    var assetGetDataURL = "/predix-api/predix-asset/asset/" + assetId[0];

    assetGetData.open('GET', assetGetDataURL, true);
    assetGetData.onload = function() {
      if (assetGetData.status >= 200 && assetGetData.status < 400) {
        document.getElementById("predix_asset_table").innerHTML = '';
        var resultJSON = JSON.parse(assetGetData.response)[0];
        var resultString = JSON.stringify(resultJSON);
        if (resultJSON) {
          var nameOfTable = document.getElementById("predix_asset_table");
          nameOfTable.innerHTML = "Asset Information";
          while (table.firstChild) {
						table.removeChild(table.firstChild);
					}
          var keys = Object.keys(resultJSON);
          var assetRowIndex = 0;
					for(var i = 0; i<keys.length; i++) {
						// Create an empty <tr> element and add it to the 1st position of the table:
            if(keys[i] == 'uri' || keys[i] == 'description' ||  keys[i] == 'assetId' ){
              console.log("inside keys"+keys[i]);
  						var row = table.insertRow(assetRowIndex++);
  						// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
  						var cell1 = row.insertCell(0);
  						var cell2 = row.insertCell(1);
  						cell1.style.borderWidth = "1px";
  						cell1.style.borderStyle = "solid";
  						cell1.style.borderColor = "black";

  						cell2.style.borderWidth = "1px";
  						cell2.style.borderStyle = "solid";
  						cell2.style.borderColor = "black";
  						// Add some text to the new cells:
              cell1.innerHTML = keys[i];
  						cell2.innerHTML = resultJSON[keys[i]];
            }else{console.log("outside keys"+keys[i]);}

      		}
          table.style.borderCollapse= "collapse";
          document.getElementById("asset_detail_model").innerHTML = JSON.stringify(resultJSON, undefined, 4);
          // enable Asset detail button
          var asssetLinkElement = document.getElementById('assset_detail_link');
          asssetLinkElement.style.display = "block";
        } else {
          //document.getElementById("predix_asset_table").innerHTML = "Asset Model Information is not available for:" + tagString;
          console.log("Asset Model Information is not available for:" + tagString);
          while (table.firstChild) {
            table.removeChild(table.firstChild);
          }
        }
      }else if(assetGetData.status >= 404 ) {
        console.log("Asset Model Information is not available for:" + tagString);
      }
       else {
        console.log("Error: Error Acceesing Asset Service : " + tagString);
        //document.getElementById("predix_asset_table").innerHTML = "Error fetching asset model info for tag: " + tagString;
      }
    };
    assetGetData.onerror = function() {
      console.log("Error: Accessing Asset Service for : " + tagString);
      //document.getElementById("predix_asset_table").innerHTML = "Error fetching asset model info for tag: " + tagString;
    };
    if (tagString !== undefined)
    {
      assetGetData.send();
    }
  }
}


function detailAssetModel() {
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
}

function assetDetailCLose(){
  var modal = document.getElementById('myModal');
  modal.style.display = "none";
}
