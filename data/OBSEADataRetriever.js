import OBSEADataTypes from "/OBSEA/data/OBSEADataTypes.js";

// // https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result&$top=1000000&$filter=resultQuality/qc_flag eq 1 and resultTime ge 2021-01-01T00:00:00z and resultTime lt 2022-01-01T00:00:00z&$orderBy=resultTime asc

// Stores and retrieves data
export class OBSEADataRetriever{

  dataKeys;
  baseURLStaticFiles = '/OBSEA/data/';
  staticFiles = ['obsea_2019.csv', 'obsea_2020.csv', 'obsea_2021.csv'];

  dataAvailability = {}; // measures: list of measures ; year: isAvailiable[] maxDailiy[]

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
    for (let i = 0; i < measures.length; i++)
      measureIndices[i] = header.findIndex((e) => e == measures[i]);

    // Data availability array
    // TODO: could setup this as a class variable and store per year
    let areAvailable = []; // measures available - Hm0, WSPD, UCUR_0m
    let maxDailyValue = [];
    let dayTimestamp = [];

    const yearStart = parseInt(csv[1][0].substring(0, 4));
    const monthStart = parseInt(csv[1][0].substring(5, 7));
    const dayStart = parseInt(csv[1][0].substring(8, 10));

    let date = new Date(yearStart + '-' +
                        monthStart.toString().padStart(2, '0') + '-'+
                        dayStart.toString().padStart(2, '0') + 'T00:00:00.000Z');

    const lastRow = csv[csv.length - 1][0];
    const endDate = new Date(lastRow.substring(0, 10) + 'T00:00:00.000Z');

    let csvIndex = 1;
    let dayCount = dayStart - 1; // set starting index at 0 for day 1 of areAvailable and maxDailyValue
    // Iterate through all days of the year
    while (date <= endDate) {

      // Store date
      dayTimestamp[dayCount] = date.toISOString().substring(0,10);

      // Check every timestamp of a day
      for (let i = 0; i < 24 * 3; i++) { // Samples every half an hour (24*2) + an hour for the hour change in spring/autumn
        let month = parseInt(csv[csvIndex][0].substring(5, 7));
        let day = parseInt(csv[csvIndex][0].substring(8, 10));

        // Check if data exists for measures
        // TODO: optimization: could put this loop outside and exit when a data point is found for a day
        for (let j = 0; j < measureIndices.length; j++) {
          let content = csv[csvIndex][measureIndices[j]];
          if (content.length != 0) {
            areAvailable[dayCount][j] = true;
            // Find maximum daily value for a measure
            maxDailyValue[dayCount][j] = maxDailyValue[dayCount][j] == undefined ? parseFloat(content) : Math.max(maxDailyValue[dayCount][j], parseFloat(content));
          }
          // If it does not exists, areAvailable is undefined
        }
        //console.log("Day; " + day + ", " + date.getUTCDate() + ", Day count: " + dayCount + ", Month: " + (date.getUTCMonth() + 1) + ", " + month);
        // Continue examining csv
        if (day == date.getUTCDate() && (date.getUTCMonth() + 1) == month && csvIndex != csv.length-1)
          csvIndex++;
        else // Escape
          i = 24 * 3;
      }

      // Add one day
      date.setUTCDate(date.getUTCDate() + 1);
      dayCount += 1;
    }


    // Generate json data for daily availability
    // It assumes that the csv rows are ordered in time
    this.dataAvailability.measures = measures;
    // Iterate through all values
    for (let i = 0; i < areAvailable.length; i++){
      let yy = dayTimestamp[i].substring(0,4);
      if (this.dataAvailability[yy] == undefined)
        this.dataAvailability[yy] = {areAvailable: [], maxDailyValue: [], timestamp: []};
      
      // Check if value was already stored
      let ind = this.dataAvailability[yy].timestamp.findIndex(el => el == dayTimestamp[i]);
      if (ind != -1){
        this.dataAvailability[yy].timestamp[ind] = dayTimestamp[i];
        this.dataAvailability[yy].areAvailable[ind]  = areAvailable[i];
        this.dataAvailability[yy].maxDailyValue[ind] = maxDailyValue[i];
      } else {
        // Store values for that year
        this.dataAvailability[yy].areAvailable.push(areAvailable[i]); // Assumes data is ordered in time
        this.dataAvailability[yy].maxDailyValue.push(maxDailyValue[i]); // Assumes data is ordered in time
        this.dataAvailability[yy].timestamp.push(dayTimestamp[i]); // Assumes data is ordered in time
      }
    }
    
    
    console.log(this.dataAvailability);
  }



}

export default OBSEADataRetriever;
