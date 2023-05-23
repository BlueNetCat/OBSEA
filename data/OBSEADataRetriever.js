import OBSEADataTypes from "/OBSEA/data/OBSEADataTypes.js";
import OBSEADailyDataMax from "/OBSEA/data/StaticData/OBSEADailyDataMax.js"

// // https://data.obsea.es/api/Datastreams(27)/Observations?$select=resultTime,result&$top=1000000&$filter=resultQuality/qc_flag eq 1 and resultTime ge 2021-01-01T00:00:00z and resultTime lt 2022-01-01T00:00:00z&$orderBy=resultTime asc

// Stores and retrieves data
export class OBSEADataRetriever{

  
  DailyDataMax = OBSEADailyDataMax;
  DataTypes = OBSEADataTypes;
  Measures = ["TEMP", "PSAL", "AIRT", "Hm0", "H3", "H10", "Hmax", "Spr1", "Mdir", "WDIR", "WSPD", "UCUR_0m", "VCUR_0m", "ZCUR_0m", "UCUR_1m", "VCUR_1m", "ZCUR_1m", "UCUR_2m", "VCUR_2m", "ZCUR_2m", "UCUR_3m", "VCUR_3m", "ZCUR_3m", "UCUR_4m", "VCUR_4m", "ZCUR_4m", "UCUR_5m", "VCUR_5m", "ZCUR_5m", "UCUR_6m", "VCUR_6m", "ZCUR_6m", "UCUR_7m", "VCUR_7m", "ZCUR_7m", "UCUR_8m", "VCUR_8m", "ZCUR_8m", "UCUR_9m", "VCUR_9m", "ZCUR_9m", "UCUR_10m", "VCUR_10m", "ZCUR_10m", "UCUR_11m", "VCUR_11m", "ZCUR_11m", "UCUR_12m", "VCUR_12m", "ZCUR_12m", "UCUR_13m", "VCUR_13m", "ZCUR_13m", "UCUR_14m", "VCUR_14m", "ZCUR_14m", "UCUR_15m", "VCUR_15m", "ZCUR_15m", "UCUR_16m", "VCUR_16m", "ZCUR_16m", "UCUR_17m", "VCUR_17m", "ZCUR_17m", "UCUR_18m", "VCUR_18m", "ZCUR_18m", "UCUR_19m", "VCUR_19m", "ZCUR_19m"];
  
  halfHourlyData = {};
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
  loadedStaticFiles = []; // Store files that were loaded
  notFoundFiles = [];
  APIrequestedTimePeriods = [];

  dailyData = {}; // ISO timestamp used as key. Inside, each measure has a value, e.g. <ISOString>.TEMP = X ºC
  // Control the loading status
  isLoading = false;
  loadingFiles = 0;

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
      let result = await this.fetchFromDatastreamURL(dataType.url, timestamp);
      return result;
    }
    else if (typeof dataType.url == 'object'){
      let urls = dataType.url;
      let result;
      for (let i = 0; i<urls.length; i++){
        result = await this.fetchFromDatastreamURL(urls[i], timestamp);
        if (result !== undefined){
          return result;
        }
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




  // Query a data stream on a time instant
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

    // Return a promise
    return fetch(url)
    .then(res => res.json())
    .then(data => {
      // Parse data
      console.log(data);
      if (data.value !== undefined) {
        if (data.value.length != 0) {
          console.log("*******USING OBSEA API!");
          // TODO: STORE THIS DATA IN HALF-HOURLY
          return data.value[data.value.length-1].result;
        }
      } else
        return undefined;
    })
    .catch(e => console.warn(e))
  }



  // Query a datastream on a time period
  fetchFromAPI = function (dataTypeURL, startDate, endDate) {
    let url = dataTypeURL;
    // Observations
    url += '/Observations?';
    // Select the timestamp and the result
    url += '$select=resultTime,result&$top=1000000&';
    // Filter
    // Quality
    url += '$filter=resultQuality/qc_flag eq 1 and '
    // Reset times to half-hourly
    startDate.setUTCMinutes(Math.floor(startDate.getUTCMinutes() / 30) * 30);
    endDate.setUTCMinutes(Math.floor(endDate.getUTCMinutes() / 30) * 30);
    // Timespan
    url += 'resultTime ge ' + startDate.toISOString().substring(0, 17) + '00.000Z and resultTime lt ' + endDate.toISOString().substring(0, 17) + '00.000Z&$orderBy=resultTime asc';

    //console.log(url);

    return fetch(url)
      .then(res => res.json())
      .then(result => {
        // Parse result
        if (result.value !== undefined) {
          if (result.value.length != 0) {
            return result.value;
          }
        } else
          return undefined;
      })
      .catch(e => { throw e })
  }







  // Load all files
  fetchFromStaticFiles = function(callback){

    for (let i = 0; i<this.staticFiles.length; i++){
      let url = this.baseURLStaticFiles;
      url += this.staticFiles[i];

      this.loadingFiles++;
      this.isLoading = true;

      fetch(url)
        .then(res => res.text())
        .then(rawSS => {
          this.loadingFiles--;
          this.isLoading = this.loadingFiles != 0;

          let csvData = this.processCSV(rawSS);
          callback(csvData);
          // Generate static JSON
          this.generateDailyDataAvailabilityJSON(csvData);
        })
        .catch(e => console.error("Error when parsing .csv: " + e));
    }
    
  }
  // Load single file on demand
  // Error propagation https://medium.com/front-end-weekly/error-propagation-in-javascript-with-error-translation-pattern-78cf7178fe92
  fetchFromStaticFile = function (fileName) {
    
    let url = this.baseURLStaticFiles;
    url += fileName;

    this.loadingFiles++;
    this.isLoading = true;

    return fetch(url)
      .then(res => {
        if (res.ok)
          return res.text();
        else {
          throw "HTTP status code: " + res.status + ". - fetchFromStaticFile()";
        }
      })
      .then(rawSS => {
        this.loadingFiles--;
        this.isLoading = this.loadingFiles != 0;
        if (!this.loadedStaticFiles.includes(fileName))
          this.loadedStaticFiles.push(fileName);
        return this.processCSV(rawSS);
      })
      .catch(e => {
        this.loadingFiles--;
        this.isLoading = this.loadingFiles != 0;
        if (!this.notFoundFiles.includes(fileName))
          this.notFoundFiles.push(fileName);
        throw e + "\nFetch url not working.- fetchFromStaticFile"
      });
  }

  // Finds the right file to load.
  // Returns a promise
  loadHalfHourlyData = function (date) {
    let fileName = this.getCSVFileNameFromDate(date);
    if (this.notFoundFiles.includes(fileName))
      return new Promise((res, reject) => reject(fileName+" could not be loaded in a previous fetch."));
    return this.fetchFromStaticFile(fileName)
      .then(csv => this.storeHalfHourlyData(csv))
      .catch(e => {
        throw e + '\n' + "Could not load static file " + fileName + ". - loadHalfHourlyData()";
      });
  }



  processCSV(rawSS) {
    // Split by end of line
    rawSS = rawSS.replaceAll("\r", '');
    let rowsSS = rawSS.split("\n");
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





  // Store loaded halfHourlyData
  storeHalfHourlyData(csv) {
    const header = csv[0];
    const measures = header.slice(1, header.length); // All measures without timestamp //['Hm0', 'WSPD', 'UCUR_0m'];
    // Iterate csv rows
    for (let i = 1; i < csv.length; i++) {
      let timeString = csv[i][0];
      let isoString = this.getISOStringFromCSVTimestamp(timeString);
      // First data
      if (this.halfHourlyData[isoString] == undefined) this.halfHourlyData[isoString] = {timestamp: isoString};
      // Iterate through measures
      for (let j = 0; j < measures.length; j++) {
        let measureName = measures[j];        
        // Get and store value
        if (csv[i][j + 1] != ''){
          this.halfHourlyData[isoString][measureName] = parseFloat(csv[i][j + 1]);
        }
      }
    }
    return this.halfHourlyData;
  }

  // Generate daily data availability image
  // In principle this script is exectued for the generation of a static JSON file that will be loaded here or in DataManager
  generateDailyDataAvailabilityJSON(csv) {
    const header = csv[0];
    const measures = header.slice(1, header.length); // All measures without timestamp //['Hm0', 'WSPD', 'UCUR_0m'];
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
      if (this.dailyData[isoString] == undefined) this.dailyData[isoString] = {timestamp: isoString}; // NOT TESTED
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
        if (this.dailyData[timeKeys[i]][measKeys[j]] == -999 || this.dailyData[timeKeys[i]][measKeys[j]] == null || measKeys[j] == 'timestamp') {
          delete this.dailyData[timeKeys[i]][measKeys[j]];
        } else
          hasData = true;
      }
      if (hasData == false){
        delete this.dailyData[timeKeys[i]];
      }
    }

    console.log(JSON.stringify(this.dailyData));
    this.DailyDataMax = this.dailyData;
  }

  // Transform the csv string to 
  getISOStringFromCSVTimestamp = function(timeString){
    
    let year = timeString.substring(0, 4);
    let month = timeString.substring(5, 7);
    let day = timeString.substring(8, 10);
    let hourMin = timeString.substring(11, 16);

    return year + "-" + month + "-" + day + "T" + hourMin + ":00.000Z";
  }



  generateDailyDataAvailabilityFromHalfHourlyData = function(startDate, endDate){
    // Number of halfhours between start and end date
    let halfHourSteps = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 0.5));
    // Iterate half hour steps
    for (let i = 0; i < halfHourSteps; i++){
      let halfHourlyTimestamp = startDate.toISOString().substring(0,17) + '00.000Z';
      let dailyTimestamp = startDate.toISOString().substring(0, 11) + '00:00:00.000Z';
      // Check if there is data on that time
      if (this.halfHourlyData[halfHourlyTimestamp]){
        let dataTypes = Object.keys(this.halfHourlyData[halfHourlyTimestamp]);
        // Iterate data types
        for (let j = 0; j < dataTypes.length; j++){
          let dataType = dataTypes[j];
          if (dataType == 'timestamp')
            continue;
          // Check if daily max entry exists
          if (!this.DailyDataMax[dailyTimestamp]){
            this.DailyDataMax[dailyTimestamp] = {};
          }
          // If is bigger or datatype was not defined yet
          if (this.DailyDataMax[dailyTimestamp][dataType] < this.halfHourlyData[halfHourlyTimestamp][dataType] ||
              this.DailyDataMax[dailyTimestamp][dataType] == undefined){
            this.DailyDataMax[dailyTimestamp][dataType] = this.halfHourlyData[halfHourlyTimestamp][dataType];
          }
        }
      }
      // Increase time step
      startDate.setUTCMinutes(startDate.getUTCMinutes() + 30);
    }
  }

  

  getCSVFileNameFromDate = function(date){
    let isLateHalfYear = date.getUTCMonth() + 1 >= 7;
    let fileName = 'obsea_' + date.getUTCFullYear() + '_' + (isLateHalfYear + 1) + '.csv';
    return fileName;
  }




  // PUBLIC METHODS
  // Get the data either from csv files or API
  getHalfHourlyData = function(startDate, endDate){
    // If files were loaded, return half-hourly data
    let startCSV = this.getCSVFileNameFromDate(startDate);
    let endCSV = this.getCSVFileNameFromDate(endDate);
    if (this.loadedStaticFiles.includes(startCSV) && this.loadedStaticFiles.includes(endCSV))
      return new Promise((resolve, rej) => resolve(this.halfHourlyData)); 
    
    // If dates were requested with the API
    for (let i = 0; i < this.APIrequestedTimePeriods.length; i++){
      let timePeriod = this.APIrequestedTimePeriods[i];
      if (timePeriod[0] <= startDate.getTime() && timePeriod[1] >= endDate.getTime()) {
        //console.log("OBSEA API: time period was already requested");
        return new Promise((resolve, rej) => resolve(this.halfHourlyData));
      }
    }

    // Request .csv files and use API if .csv file cannot be loaded
    return Promise.allSettled([this.getHalfHourlyDataFromFile(startDate), this.getHalfHourlyDataFromFile(endDate)])
      .then(arrayResponses => {
        let resStartDate = arrayResponses[0];
        let resEndDate = arrayResponses[1];
        // Both rejected, request from API
        if (resStartDate.status == 'rejected' && resEndDate.status == 'rejected'){
          return this.getDataFromAPI(startDate, endDate)
            .then(res => {return res})
        }
        // First section found as csv, second must be loaded from API
        else if (resStartDate.status == 'fulfilled' && resEndDate.status == 'rejected') {
          // Find out the date where the csv file ends
          let startRequestDate;
          if (startDate.getUTCMonth() + 1 >= 7){ // isLateHalfYear
            startRequestDate = new Date((startDate.getUTCFullYear()+1) + '-01-01');
          } else {
            startRequestDate = new Date(startDate.getUTCFullYear() + '-07-01');
          }
          this.getDataFromAPI(startRequestDate, endDate)
            .then(res => { return res }); // The other half was already stored when the file was loaded
        }
        // First must be loaded from API, second found as csv
        else if (resStartDate.status == 'rejected' && resEndDate.status == 'fulfilled') { // Only happens in 2011?
          // Find out the date where the csv file ends
          let endRequestDate;
          if (endDate.getUTCMonth() + 1 >= 7) { // isLateHalfYear
            endRequestDate = new Date(endDate.getUTCFullYear() + '-07-01');
          } else {
            endRequestDate = new Date(endDate.getUTCFullYear() + '-01-01');
          }
          this.getDataFromAPI(startDate, endRequestDate)
            .then(res => { return res }); // The other half was already stored when the file was loaded
        } 
        // Both fulfilled
        else if (resStartDate.status == 'fulfilled' && resEndDate.status == 'fulfilled'){
          return resStartDate.value;
        }
        
      })
      .catch(e => {throw e + "\nError in getHalfHourlyData"})

  }

  // If data is not loaded for that date, load file, otherwise return data
  // Returns a promise
  getHalfHourlyDataFromFile = function(date){
    let timestamp = date.toISOString();
    let min = parseInt(timestamp.substring(14, 16));
    let normMin = parseInt(30 * Math.floor(min / 30));
    timestamp = timestamp.substring(0, 14) + String(normMin).padStart(2, '0') + ':00.000Z'

    // Return promise of loading
    return this.loadHalfHourlyData(date)
      .catch(e => { throw e + "\nError when loading. - getHalfHourlyDataFromFile()"}); // HOW TO CATCH THE ERROR AND PROPAGATE IT?
    
  }


  // Get all data from the API on a certain time stamp
  getDataFromAPI = function(startDate, endDate){
    this.APIrequestedTimePeriods.push([startDate.getTime(), endDate.getTime()]);
    // List of promises
    let promises = [];
    let keys = [];
    // Iterate through all data types of OBSEA
    // to create a list of promises
    for (let i = 0; i < this.dataKeys.length; i++) {
      let dataType = OBSEADataTypes[this.dataKeys[i]];
      if (typeof dataType.url == 'string'){
        promises.push(this.fetchFromAPI(dataType.url, startDate, endDate));
        keys.push(this.dataKeys[i]);
      }
      // Currents
      else if( dataType.name == 'CUR'){
        let baseURL = dataType.url.baseURL;
        for (let j = 0; j <= 19; j++){
          promises.push(this.fetchFromAPI(baseURL.replace('X', dataType.url[j].U), startDate, endDate));
          keys.push('UCUR_' + j + 'm');
          promises.push(this.fetchFromAPI(baseURL.replace('X', dataType.url[j].V), startDate, endDate));
          keys.push('VCUR_' + j + 'm');
          promises.push(this.fetchFromAPI(baseURL.replace('X', dataType.url[j].Z), startDate, endDate));
          keys.push('ZCUR_' + j + 'm');
        }
      }
      // TODO: If datastream empty, request again
      // Datatypes with more than one datastream
      else if (typeof dataType.url == 'object'){
        promises.push(this.fetchFromAPI(dataType.url[0], startDate, endDate));
        keys.push(this.dataKeys[i]);
      }
    }

    // Promise.all
    return Promise.allSettled(promises)
      .then(results => {
        // Store half-hourly data
        for (let i = 0; i <  results.length; i++){
          let dataTypeName = keys[i];
          let result = results[i];
          // console.log(keys[i])
          // console.log(results[i]);
          
          if (result.status == 'fulfilled'){
            if (result.value != undefined){
              // Iterate values
              for (let j = 0; j < result.value.length; j++){
                let dataPoint = result.value[j];
                // Create data point if it does not exist
                if (this.halfHourlyData[dataPoint.resultTime] == undefined)
                  this.halfHourlyData[dataPoint.resultTime] = { 'timestamp': dataPoint.resultTime};
                // Assign values
                this.halfHourlyData[dataPoint.resultTime][keys[i]] = dataPoint.result;
              }
            }
          }
        }
        
        // Data manager updates the canvas in DataStreamsBar once it is loaded
        this.generateDailyDataAvailabilityFromHalfHourlyData(startDate, endDate);
        return this.halfHourlyData;
      })
      .catch(e => {throw e + "\nError in getDataFromAPI"})

  }

  
  



}

export default OBSEADataRetriever;
