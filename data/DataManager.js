import OBSEADataRetriever from "/OBSEA/data/OBSEADataRetriever.js";
import WMSDataRetriever from "/OBSEA/data/WMSDataRetriever.js";

// Manages where to get the data from (API, WMS, or static files)
class DataManager{

  lat = 41.1804313;
  long = 1.7501205;

  dataTypes = [
    "Wave significant height",
    "Wave maximum height", // Need to include it in CMEMS
    "Wave direction",
    "Direction spreading of waves", // Need to include it CMEMS

    "Wind speed", // Not available in CMEMS?
    "Wind direction", // Not available in CMEMS?

    // Current

    // "Sea surface temperature", // Does not exist in OBSEA
    "Sea bottom temperature",
  ]

  constructor(){
    this.OBSEADataRetriever = new OBSEADataRetriever();
    this.WMSDataRetriever = new WMSDataRetriever();

    // Test data manager
    //this.getDataOnTimeInstant('2019-01-01T01:30:00.000Z');
    this.getDataOnTimeInstant('Wave significant height', '2019-01-01T01:30:00.000Z');
  }


  // Request data on a specific time and date
  async getDataOnTimeInstant(dataTypeName, timestamp){ // Timestamp in ISO standards
    // Try one datatype
    // OBSEA API
    let dataValue = await this.OBSEADataRetriever.getDataOnTimeInstant(dataTypeName, timestamp);
    // CMEMS WMS
    if (dataValue == undefined){
      // Need to fix the timestamp, maybe here?
      dataValue = await this.WMSDataRetriever.getDataAtPoint(dataTypeName, timestamp, this.lat, this.long, 'h');
    }
    console.log(dataValue)
  }


  // Request data on a specific period of time

}

export default DataManager;