import OBSEADataRetriever from "/OBSEA/data/OBSEADataRetriever.js";

// Manages where to get the data from (API, WMS, or static files)
class DataManager{

  constructor(){
    this.OBSEADataRetriever = new OBSEADataRetriever();
  }


  // Request data on a specific time and date
  async getDataOnTimeInstant(timestamp){ // Timestamp in ISO standards
    // Wave significant height
    let Hm0 = await this.OBSEADataRetriever.getDataOnTimeInstant('Wave significant height', timestamp);
  }


  // Request data on a specific period of time

}

export default DataManager;