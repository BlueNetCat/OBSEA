import OBSEADataTypes from "/OBSEA/data/OBSEADataTypes.js";

// // https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result&$top=1000000&$filter=resultQuality/qc_flag eq 1 and resultTime ge 2021-01-01T00:00:00z and resultTime lt 2022-01-01T00:00:00z&$orderBy=resultTime asc

// Stores and retrieves data
export class OBSEADataRetriever{

  dataKeys;

  constructor(){

    this.dataKeys = Object.keys(OBSEADataTypes);
  }

  getDataOnTimeInstant = async function(dataTypeName, timestamp){
    // Find data type
    let dataType = this.getDataType(dataTypeName);
    if (dataType == undefined)
      return undefined;

    // Get data
    // Check if it is a string or an array (some data types have multiple datastreams);
    // One URL available
    if (typeof dataType.url == 'string'){
      let result = this.fetchFromDatastreamURL(dataType.url, timestamp);
    }
    else if (typeof dataType.url == 'object'){
      let urls = dataType.url;
      let result;
      for (let i = 0; i<urls.length; i++){
        result = await this.fetchFromDatastreamURL(urls[i], timestamp);
        if (result !== undefined)
          i = urls.length; // Exit loop
      }
      console.log(result);
      console.log("************")
    }
  }



  fetchFromDatastreamURL = async function(url, timestamp){
    // Observations
    url += '/Observations?';
    // Select the timestamp and the result
    url += '$select=resultTime,result&$top=10&';
    // Filter
    // Quality
    url += '$filter=resultQuality/qc_flag eq 1 and '
    // Time
    //url += 'resultTime ge 2021-01-01T00:00:00z and resultTime lt 2022-01-01T00:00:00z&$orderBy=resultTime asc'
    let prevTime = new Date(timestamp);
    prevTime.setUTCMinutes(prevTime.getUTCMinutes() - 25);
    let nextTime = new Date(timestamp);
    nextTime.setUTCMinutes(nextTime.getUTCMinutes() + 25);
    url += 'resultTime ge ' + prevTime.toISOString() + ' and resultTime lt ' + nextTime.toISOString() + '&$orderBy=resultTime asc';
    console.log(url);
    let result;

    // Fetch
    try {
      let response = await fetch(url, {
        mode: "no-cors",
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
      }).catch((error) =>
        console.log("Network error: " + error));
      // Response OK
      if (response.status >= 200 && response.status <= 299) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        result = jsonResponse;
      } 
      // Handle response errors
      else {
        console.log('Response status; ' + response.status + ", reponse status text: " + response.statusText);
        result = undefined;
      }

    } catch (error) {
      console.log('There was an error');
      console.log(error);
      let result = undefined;
    }
    return result;
  }




  getDataType(dataTypeName){
    let dataType;
    for (let i = 0; i < this.dataKeys.length; i++) {
      let key = this.dataKeys[i];
      // Data key is the same as data type name
      if (key == dataTypeName) {
        dataType = OBSEADataTypes[key];
        i = this.dataKeys.length; // Exit loop
      }
      // Look into the altNames
      else {
        let altNames = OBSEADataTypes[key].altNames;
        for (let j = 0; j < altNames.length; j++) {
          if (altNames[j] == dataTypeName) {
            dataType = OBSEADataTypes[key];
            j = altNames.length; // Exit loop
            i = this.dataKeys.length; // Exit loop
          }
        }
      }
    }

    // Datatype not found
    if (dataType == undefined) {
      console.error('Data type ' + dataTypeName + ' not found in OBSEADataTypes.js');
      console.error(OBSEADataTypes);
      debugger;
      return undefined;
    }

    return dataType;
  }

}

export default OBSEADataRetriever;
