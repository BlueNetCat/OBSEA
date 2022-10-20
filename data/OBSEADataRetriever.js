import OBSEADataTypes from "/OBSEA/data/OBSEADataTypes.js";
import OBSEADailyDataMax from "/OBSEA/data/StaticData/OBSEADailyDataMax.js"

// // https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result&$top=1000000&$filter=resultQuality/qc_flag eq 1 and resultTime ge 2021-01-01T00:00:00z and resultTime lt 2022-01-01T00:00:00z&$orderBy=resultTime asc

// Stores and retrieves data
export class OBSEADataRetriever{

  OBSEADailyDataMax = OBSEADailyDataMax;

  dataKeys;
  baseURLStaticFiles = '/OBSEA/data/StaticData/';

  staticFiles = ['obsea_2011_1.csv', 'obsea_2011_2.csv',
                  'obsea_2013_1.csv', 'obsea_2013_2.csv',
                  'obsea_2014_1.csv', 'obsea_2014_2.csv', 
                  'obsea_2015_1.csv', 'obsea_2015_2.csv',
                  'obsea_2016_1.csv', 'obsea_2016_2.csv',
                  'obsea_2017_1.csv', 'obsea_2017_2.csv',
                  'obsea_2018_1.csv', 'obsea_2018_2.csv', 
                  'obsea_2019_1.csv', 'obsea_2019_2.csv', 
                  'obsea_2020_1.csv', 'obsea_2020_2.csv', 
                  'obsea_2021_1.csv', 'obsea_2021_2.csv'];

  dataAvailability = {}; // measures: list of measures ; year: isAvailiable[] maxdaily[]
  dailyData = {}; // ISO timestamp used as key. Inside, each measure has a value, e.g. <ISOString>.TEMP = X

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
    }
  }



  // Get data type from data type name
  getDataType(dataTypeName) {
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




  fetchFromStaticFiles = function(callback){

    for (let i = 0; i<this.staticFiles.length; i++){
      let url = this.baseURLStaticFiles;
      url += this.staticFiles[i];

      fetch(url)
        .then(res => res.text())
        .then(rawSS => {
          let csvData = this.processCSV(rawSS);
          callback(csvData);
          // Generate static JSON
          this.generateDailyDataAvailabilityJSON(csvData);
        })
        .catch(e => console.error("Error when parsing .csv: " + e));
    }
    
  }



  processCSV(rawSS) {
    // Split by end of line
    let rowsSS = rawSS.split("\r\n");
    for (let i = 0; i < rowsSS.length; i++) {
      rowsSS[i] = rowsSS[i].split(","); // Split by comma
    }
    rowsSS.pop();
    let csvData = rowsSS;

    let nearbyIndIndValue = [];

    // Iterate per data type
    for (let dInd = 0; dInd < csvData[0].length; dInd++) {
      // Iterate per timestamp
      for (let i = 1; i < csvData.length; i++) {

        // Fill empty data points with nearby data points
        let dataPoint = csvData[i][dInd];

        if (dataPoint == '') {
          let prev = '';
          let next = '';
          // Find nearby
          if (i > 1) { // If at start
            if (csvData[i - 1][dInd] != '')
              next = csvData[i - 1][dInd];
          }
          if (i < csvData.length - 1) // If at end
            if (csvData[i - 1][dInd] != '')
              prev = csvData[i + 1][dInd];

          // Assign nearby
          let nearby = undefined;
          if (prev != '' && next != '') nearby = parseFloat(prev) * 0.5 + parseFloat(next) * 0.5;
          else if (prev != '') nearby = prev;
          else if (next != '') nearby = next;

          if (nearby != undefined) {
            nearbyIndIndValue.push([i, dInd, nearby]);
            // data is available
          }
        } // else // data is available
      }
    }

    // Fill the points in the csv
    for (let i = 0; i < nearbyIndIndValue.length; i++) {
      let ind = nearbyIndIndValue[i][0];
      let dInd = nearbyIndIndValue[i][1];
      csvData[ind][dInd] = nearbyIndIndValue[i][2];
    }

    return csvData;
  }







  // Generate daily data availability image
  // In principle this script is exectued for the generation of a static JSON file that will be loaded here or in DataManager
  generateDailyDataAvailabilityJSON(csv) {
    const header = csv[0];
    const measures = header.slice(1, header.length); // All measures //['Hm0', 'WSPD', 'UCUR_0m'];
    let measureIndices = [];
    for (let i = 0; i < measures.length; i++){
      measureIndices[i] = header.findIndex((e) => e == measures[i]);
    }

    for (let i = 1; i<csv.length; i++){
      let timeString = csv[i][0];
      let isoString = this.getISOStringFromCSVTimestamp(timeString);
      // Turn it into daily
      isoString = isoString.substring(0, 10) + "T00:00:00.000Z";
      // First daily data
      if (this.dailyData[isoString] == undefined) this.dailyData[isoString] = {}
      // Iterate through measures
      for (let j = 0; j<measures.length; j++){
        let measureName = measures[j];
        // First iteration
        if (this.dailyData[isoString][measureName] == undefined) this.dailyData[isoString][measureName] = -999;
        // Get value
        let value = csv[i][j + 1] == '' ? -999 : parseFloat(csv[i][j + 1]);
        this.dailyData[isoString][measureName] = Math.max(value, this.dailyData[isoString][measureName]);
      }
    }
    
    // Clean -999 and timestamps without data
    let timeKeys = Object.keys(this.dailyData);
    for (let i = 0; i<timeKeys.length; i++){
      let hasData = false;
      let measKeys = Object.keys(this.dailyData[timeKeys[i]]);
      for (let j = 0; j<measKeys.length; j++){
        if (this.dailyData[timeKeys[i]][measKeys[j]] == -999) {
          delete this.dailyData[timeKeys[i]][measKeys[j]];
        } else
          hasData = true;
      }
      if (hasData == false){
        delete this.dailyData[timeKeys[i]];
      }
    }

    console.log(JSON.stringify(this.dailyData));
    this.OBSEADailyDataMax = this.dailyData;
  }

  // Transform the csv string to 
  getISOStringFromCSVTimestamp = function(timeString){
    
    let year = timeString.substring(0, 4);
    let month = timeString.substring(5, 7);
    let day = timeString.substring(8, 10);
    let hour = timeString.substring(11, 16);

    return year + "-" + month + "-" + day + "T" + hour + ".000Z";
  }



}

export default OBSEADataRetriever;
