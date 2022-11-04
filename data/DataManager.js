import OBSEADataRetriever from "/OBSEA/data/OBSEADataRetriever.js";
import WMSDataRetriever from "/OBSEA/data/WMSDataRetriever.js";

// Manages where to get the data from (API, WMS, or static files)
class DataManager{

  lat = 41.1804313;
  long = 1.7501205;

  data = {};

  dataTypes = [
    "Wave significant height",
    "Wave maximum height", // Need to include it in CMEMS
    "Wave direction", // Need to include it in CMEMS
    "Direction spreading of waves", // Not available in CMEMS?

    "Wind speed", // Not available in CMEMS?
    "Wind direction", // Not available in CMEMS?

    // Current
    // Different elevations for OBSEA and CMEMS

    // "Sea surface temperature", // Does not exist in OBSEA
    "Sea bottom temperature",

    "Salinity", // Bottom for OBSEA, surface for CMEMS

    "Air temperature", // Not available in CMEMS?
  ]

  constructor(){
    // Singleton
    if (DataManager.instace != undefined)
      return DataManager.instance;

    // Constructor
    this.OBSEADataRetriever = new OBSEADataRetriever();
    this.WMSDataRetriever = new WMSDataRetriever();

    // TODO: files should only be loaded on demand (more than 20Mb of data, no need to download)
    //        - Load files on demand

    // Load all static files to compute the daily maximum (this data is stored locally in "/OBSEA/data/StaticData/OBSEADailyDataMax.js")
    if (!this.OBSEADataRetriever.DailyDataMax)
      this.getStaticData();

    // Test data manager
    //this.getDataOnTimeInstant('2019-01-01T01:30:00.000Z');
    this.getDataOnTimeInstant('Wave significant height', '2022-01-01T01:30:00.000Z');

    // Singleton
    DataManager.instance = this;
    
  }


  // Request data on a specific time and date
  async getDataOnTimeInstant(dataTypeName, timestamp){ // Timestamp in ISO standards
    // Try one datatype
    // OBSEA API
    // Get data type
    let dataType = this.OBSEADataRetriever.getDataType(dataTypeName);
    // Get value
    let dataValue = await this.OBSEADataRetriever.getDataOnTimeInstant(dataTypeName, timestamp);
    // CMEMS WMS
    if (dataValue == undefined){
      // Get data type
      dataType = this.WMSDataRetriever.getDataType(dataTypeName);
      if (dataType !== undefined)
        // Need to fix the timestamp, maybe here?
        // Get timescale and add something like (daily) to the data point
        dataValue = await this.WMSDataRetriever.getDataAtPoint(dataTypeName, timestamp, this.lat, this.long, 'h'); // TODO, NOT ALL HAVE 'h' timings
    }
    // TODO; EMIT DATA VALUE? STORE IT HERE? SEND IT WHEN ALL ARE LOADED? EMIT AND UPDATE ALL VALUES?
    if (dataValue !== undefined){
      let dataRow = this.data[timestamp];
      // Create data row if it does not exist
      if (dataRow == undefined)
        dataRow = {};
      // Assign data value
      dataRow[dataType.name] = dataValue; // Transform to standard units/simulation units?
      // Assign to data
      this.data[timestamp] = dataRow;
      window.eventBus.emit('DataManager_' + dataType.name, dataValue);
    }
    
    console.log("DataManager_" + dataType.name + ":" + dataValue + " " + dataType.units);
  }


  // Request data on a specific period of time from OBSEA API


  // Get data from static files of OBSEA data
  // Get static data
  getStaticData(){
    this.OBSEADataRetriever.fetchFromStaticFiles((csv) => {
      // this is a callback function
      //console.log(csv);
    })
  }

  





  // PUBLIC METHODS
  getDailyData(){
    return this.OBSEADataRetriever.DailyDataMax;
  }

  // Loads the half-hourly static files according to a date
  loadStaticData(date){
    // Returns a promise
    return this.OBSEADataRetriever.getHalfHourlyData(date);
  }

 



}

export default DataManager;