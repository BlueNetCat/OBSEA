import preLoadedDataTypes from "/OBSEA/data/WMSDataTypes.js";

// Scripts that obtain data from the CMEMS WMS API
export default class WMSDataRetriever{

// Variables:
// Requests - keep track of what is requested
activeRequests = [];
// DATA TYPES ARE STORED ELSEWHERE (WMSDataTypes.js). If you modify them, reload capabilities in the constructor and store in WMSDataTypes.js
dataTypes = {
  "Sea surface velocity": {
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-cur-rean-d?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&LAYERS=sea_water_velocity&STYLES=boxfill/ncview&LOGSCALE=false&SRS=EPSG:4326&BBOX=0,22.5,22.5,45&WIDTH=512&HEIGHT=512&COLORSCALERANGE=0.008134,0.3748&BELOWMINCOLOR=0x0000ff&ABOVEMAXCOLOR=0xff0001&TIME=2005-03-25T12:00:00.000Z&ELEVATION=-1.0182366371154785
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-cur-rean-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-cur-rean-m?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    name: 'Sea surface velocity',
    altNames: ['Sea surface velocity', 'Current', 'Sea velocity'],
    doi: "https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6",
    url: 'med-cmcc-cur-rean', // Forecast 'med-cmcc-cur-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'sea_water_velocity', 
    timeScales: ['d', 'd3', 'm'], // In reanalysis, no hourly; 'h', 'h3', 'h6', 'h12', 
    range: [0, 1.5],
    units: 'm/s',
    style: "boxfill/occam",//"vector/occam",
    animation: {
      layerNames: ['uo', 'vo'], // East, North
      format: 'east_north',
      type: 'velocity'
    },
    forecast: {
      url: 'med-cmcc-cur-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  "Sea temperature": {
    // Reanalysis comes from a different base URL. Only monthly and daily
    // 'https://my.cmems-du.eu/thredds/wms/med-cmcc-tem-rean-m?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities'
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-tem-rean-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    name: 'Sea temperature',
    altNames: ['Sea temperature', 'SST', 'Sea Surface Temperature'],
    doi: "https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6",
    url: 'med-cmcc-tem-rean', // Forecast: 'med-cmcc-tem-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'thetao',
    timeScales: ['d', 'd3', 'm'], // In reanalysis, not hourly available: 'h', 'h3', 'h6', 'h12', 
    range: [1, 40],
    units: 'ºC',
    style: "boxfill/occam",
    forecast: {
      url: 'med-cmcc-tem-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  "Sea temperature anomaly": {
    // https://nrt.cmems-du.eu/thredds/wms/SST_MED_SSTA_L4_NRT_OBSERVATIONS_010_004_d?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&LAYERS=sst_anomaly&STYLES=boxfill/ncview&LOGSCALE=false&SRS=EPSG:4326&BBOX=2.8125,38.671875,3.515625,39.375&WIDTH=256&HEIGHT=256&COLORSCALERANGE=-5,5&BELOWMINCOLOR=0x0000ff&ABOVEMAXCOLOR=0xff0001&TIME=2022-08-24T00:00:00.000Z
    // https://nrt.cmems-du.eu/thredds/wms/SST_MED_SSTA_L4_NRT_OBSERVATIONS_010_004_d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    name: 'Sea temperature anomaly',
    altNames: ['Sea temperature anomaly', 'Sea surface temperature anomaly', 'SSTA'],
    doi: "https://doi.org/10.48670/moi-00172",
    url: 'SST_MED_SSTA_L4_NRT_OBSERVATIONS_010_004_d', 
    domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
    version: '1.3.0',
    urlLocked: true,
    layerName: 'sst_anomaly',
    timeScales: ['d'], 
    range: [-5, 5],
    units: 'ºC',
    style: "boxfill/redblue",
  },
  "Sea bottom temperature": {
    // Reanalysis comes from a different base URL. Only monthly and daily
    // 'https://my.cmems-du.eu/thredds/wms/med-cmcc-tem-rean-m?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities'
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-tem-rean-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    name: 'Sea bottom temperature',
    altNames: ['Sea bottom temperature', 'SBT'],
    doi: "https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6",
    url: 'med-cmcc-tem-rean', // Forecast: 'med-cmcc-tem-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'bottomT',
    timeScales: ['d', 'd3', 'm'], // In reanalysis, not hourly available: 'h', 'h3', 'h6', 'h12', 
    range: [1, 30],
    units: 'ºC',
    style: "boxfill/occam",
    forecast: {
      url: 'med-cmcc-tem-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  "Salinity": {
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-sal-rean-m?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    // https://my.cmems-du.eu/thredds/wms/med-cmcc-sal-rean-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    name: 'Salinity',
    altNames: ['Salinity', 'Sal', 'Sea surface salinity'],
    doi: "https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6",
    url: 'med-cmcc-sal-rean',// Forecast 'med-cmcc-sal-an-fc', 
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'so',
    timeScales: ['d', 'd3', 'm'], // In reanalysis, only daily and monthly; 'h', 'h3', 'h6', 'h12', 
    range: [32, 41],
    units: '‰',
    style: "boxfill/occam",
    forecast: {
      url: 'med-cmcc-sal-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  "Wave significant height": {
    // https://my.cmems-du.eu/thredds/wms/med-hcmr-wav-rean-h?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    // https://my.cmems-du.eu/thredds/wms/med-hcmr-wav-rean-h?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&LAYERS=VHM0&STYLES=boxfill/ncview&LOGSCALE=false&SRS=EPSG:4326&BBOX=-22.5,22.5,0,45&WIDTH=512&HEIGHT=512&COLORSCALERANGE=0,10&BELOWMINCOLOR=0x0000ff&ABOVEMAXCOLOR=0xff0001&TIME=2007-02-20T22:00:00.000Z
    name: 'Wave significant height',
    altNames: ['Wave significant height', 'Waves', 'WSH'],
    doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam3',
    url: 'med-hcmr-wav-rean',// Forecast 'med-hcmr-wav-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'VHM0', // 'VMDR' for direction in degrees
    timeScales: ['h', 'h3', 'h6', 'h12'],
    range: [0, 6],
    units: 'm',
    style: "boxfill/alg",//occam_pastel-30",
    animation: {
      layerNames: ['VHM0', 'VMDR'], // Intensity, Angle
      format: 'value_angle',
      type: 'wave'
    },
    forecast: {
      url: 'med-hcmr-wav-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  "Wind wave significant height": {
    name: 'Wind wave significant height',
    altNames: ['Wind wave significant height', 'Wind waves', 'WWSH'],
    doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam3',
    url: 'med-hcmr-wav-rean',// Forecast 'med-hcmr-wav-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'VHM0_WW', // 'VMDR' for direction in degrees
    timeScales: ['h', 'h3', 'h6', 'h12'],
    range: [0, 6],
    units: 'm',
    style: "boxfill/sst_36", //occam_pastel-30",
    animation: {
      layerNames: ['VHM0_WW', 'VMDR_WW'], // Intensity, Angle
      format: 'value_angle',
      type: 'whiteWave'
    },
    forecast: {
      url: 'med-hcmr-wav-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  "Wave period": {
    name: 'Wave period',
    altNames: ['Wave period', 'Period'],
    doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam3',
    scientificName: 'Sea surface wave mean period from variance spectral density inverse frequency moment',
    url: 'med-hcmr-wav-rean',// Forecast 'med-hcmr-wav-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'VTM10', // Check out other period measures
    timeScales: ['h', 'h3', 'h6', 'h12'],
    range: [0, 18],
    units: 's',
    style: "boxfill/sst_36", //occam_pastel-30",
    forecast: {
      url: 'med-hcmr-wav-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
  'Chlorophyll': {
    // https://my.cmems-du.eu/thredds/wms/med-ogs-pft-rean-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    // https://my.cmems-du.eu/thredds/wms/med-ogs-pft-rean-m?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
    name: 'Chlorophyll',
    altNames: ['Chlorophyll', 'Chl'],
    doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_bgc_006_014_medbfm3',
    url: 'med-ogs-pft-rean',// Forecast: 'med-ogs-pft-an-fc',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    version: '1.1.1',
    layerName: 'chl',
    timeScales: ['d', 'd3', 'm'],
    range: [0.01, 1],
    units: 'mg/m3',
    style: 'boxfill/occam',
    forecast: {
      url: 'med-ogs-pft-an-fc',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
    // https://nrt.cmems-du.eu/thredds/wms/med-ogs-pft-an-fc-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&TILED=true&COLORSCALERANGE=0.028321734%2C2.3005204&ELEVATION=-1.0182366371154785&LAYERS=chl&STYLES=boxfill/rainbow&TIME=2021-10-06T12%3A00%3A00.000Z&WIDTH=256&HEIGHT=256&CRS=EPSG%3A4326&BBOX=28.125%2C16.875%2C33.75%2C22.5
  },
  "Wind": { // https://doi.org/10.48670/moi-00184, https://doi.org/10.48670/moi-00185
    name: 'Wind',
    altNames: ['Wind'],
    doi: 'https://doi.org/10.48670/moi-00185',
    url: 'CERSAT-GLO-BLENDED_WIND_L4_REP-V6-OBS_FULL_TIME_SERIE',
    domainURL: 'https://my.cmems-du.eu/thredds/wms/',
    urlLocked: true,
    version: '1.1.1',
    layerName: 'wind_speed',
    timeScales: ['h6'],
    range: [0, 30],
    units: 'm/s',
    style: "boxfill/occam",//"vector/occam",
    animation: {
      layerNames: ['eastward_wind', 'northward_wind'], // East, North
      format: 'east_north',
      type: 'velocity'
    },
    forecast: {
      url: 'CERSAT-GLO-BLENDED_WIND_L4-V6-OBS_FULL_TIME_SERIE',
      domainURL: 'https://nrt.cmems-du.eu/thredds/wms/',
      version: '1.1.1',
      // CRS instead of SRS
    },
  },
}



  // Create object with CMEMS product urls
  // https://resources.marine.copernicus.eu/products
  timeScales = ["h", "h6", "d", "m"]; // TODO: Note 1: the dataTypes have certain timeScales that are defined by me, not by the product. 
  // For example, wind has only h6 (intervals of 6h), whereas others can have hourly intervals.
  // They also have the timescale h6, not because the service provides it, but because I decide to show this interval in the front end.


  // CONSTRUCTOR
  constructor(onLoadCallback, verbose){
    // Loading control
    let loading = 0;
    let loaded = 0;

    // Verbose
    if (verbose){
      this.printLog = this.printLogConsole;
      this.printWarn = this.printWarnConsole;
    } else { // Empty callable function
      this.printLog = ()=> {};
      this.printWarn = ()=> {};
    }

    // Preloaded data types
    // Comment this three lines to update the WMSDataTypes
    this.dataTypes = JSON.parse(preLoadedDataTypes);
    if (onLoadCallback !== undefined) onLoadCallback();
    return

    // Iterate over data types and connect with the WMS service
    // Adds the time intervals to the dataTypes.
    // Adds elevation parameter if available. This might be useful to make plots time-depth
    let dataTypes = this.dataTypes;
    let timeScales = this.timeScales;
    Object.keys(dataTypes).forEach(dataTypeKey => {
      let dataType = dataTypes[dataTypeKey];
      dataType.timeScaleCorrection = {}; // Introduce new field for time corrections (daily forecast sometimes has 12h instead of 00h)
 
      // Iterate over timescales
      for (let i = 0; i < timeScales.length; i++) {
        let currTimeScale = timeScales[i];
        // Skip if time scale is not present in datatype
        if (dataType.timeScales.includes(currTimeScale)){
          let oPURL = dataType.url;
          if (!dataType.urlLocked) // Wind product does not use the '-timeScale' url format
            oPURL += "-" + currTimeScale[0]; // TODO: currTimeScale[0] instead of currTimeScale is a HACK for TODO Note 1
          // Get Capabilities
          loading++;
          this.loadWMSCapabilities(dataType, dataType.domainURL + oPURL, currTimeScale)
            .then(() => {
              // Callback when all capabilities have been loaded
              loaded++;
              if (loading - loaded == 0){
                debugger;
                if (onLoadCallback !== undefined)
                  onLoadCallback();
                
                  console.log(JSON.stringify(dataTypes));
              }
              console.log("Total left to load: " + (loading - loaded));
              
            });
        } else {
          console.log("Skipping " + dataType.url + " in " + timeScales[i]);
        }
        
      } // End of timeScales loop
      
    }) // End of data types loop
    console.log(dataTypes);

    
  } // End of constructor


  // Fetch the WMS capabilities and assign to dataType
  loadWMSCapabilities = async function (dataType, baseURL, currTimeScale){
    let capabilitiesURL = baseURL + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities";
    // fetch
    //this.printLog(capabilitiesURL);
    let response = await fetch(capabilitiesURL);
    let data = await response.text();

    const parser = new DOMParser();
    let xml = parser.parseFromString(data, "application/xml");
    let layers = xml.querySelectorAll('Layer');

    // Iterate through layers
    layers.forEach(ll => {
      // Get layer by its name
      if (ll.querySelector("Name").innerHTML == dataType.layerName && ll.attributes.queryable) {
        this.printLog("Layer name: " + ll.querySelector("Name").innerHTML + ", Variable name: " + dataType.name);        
        // Iterate through Dimensions (elevation, time)
        ll.querySelectorAll("Dimension").forEach(dd => {
          this.printLog("Dimension name: " + dd.attributes.name.nodeValue);
          // Elevation
          if (dd.attributes.name.nodeValue == "elevation") {
            // Get elevation values
            let tmpStr = dd.innerHTML.replace('\n', '[');
            let elevationArray = JSON.parse(tmpStr + ']');
            dataType.elevation = elevationArray;
            // Time dimension
          } else if (dd.attributes.name.nodeValue == "time") {

            // Parse time (will depend on month, day)
            if (currTimeScale == "h") {
              let tmpStr = dd.innerHTML.replace('\n', '');
              // Get the minutes (innerHTML example: '\n   2021-03-29T00:30:00.000Z/2022-02-28T23:30:00.000Z/PT1H')
              let minutes = dd.innerHTML.substring(dd.innerHTML.indexOf('T') + 4, dd.innerHTML.indexOf('T') + 6);
              dataType.timeScaleCorrection.h = { 'min': parseInt(minutes) };
            } else if (currTimeScale == "d") {
              let minutes = dd.innerHTML.substring(dd.innerHTML.indexOf('T') + 4, dd.innerHTML.indexOf('T') + 6);
              let hours = dd.innerHTML.substring(dd.innerHTML.indexOf('T') + 1, dd.innerHTML.indexOf('T') + 3);
              dataType.timeScaleCorrection.d = { 'min': parseInt(minutes), 'h': parseInt(hours) };
            } else if (currTimeScale == "m") {
              // Store all months available
              let mTimeDesc = dd.innerHTML.replace(/[\n ]/g, '').split(','); // Remove [] and ' ', and split by time periods
              // Can be
              // 2019-05-16T12:00:00.000Z/2019-07-16T12:00:00.000Z/P30DT12H
              // 2020-02-15T12:00:00.000Z
              // Iterate time periods
              let dates = [];
              mTimeDesc.forEach(tDesc => {
                if (tDesc.includes('/')) { // Time interval, e.g., 2019-05-16T12:00:00.000Z/2019-07-16T12:00:00.000Z/P30DT12H
                  let tInt = tDesc.split('/'); // Time intervals
                  let startT = new Date(tInt[0]);
                  let endT = new Date(tInt[1]);
                  while (startT <= endT) {
                    dates.push(startT.toISOString());
                    startT.setMonth(startT.getMonth() + 1);
                  }
                } else { // Specific time, e.g., 2020-02-15T12:00:00.000Z
                  dates.push(tDesc);
                }
              });
              dataType.timeScaleCorrection.m = { 'dates': dates };
            }

            // Get latest date recorded and store it in dataType
            let lastDate = dataType.lastDate == undefined ? new Date(1950) : new Date(dataType.lastDate);
            let timePeriods = dd.innerHTML.replace(/[\n ]/g, '').split(',');
            let lastTime = timePeriods[timePeriods.length - 1];
            if (lastTime.includes('/')){ // Time period e.g., 2019-05-16T12:00:00.000Z/2019-07-16T12:00:00.000Z/P30DT12H
              let endDate = new Date(lastTime.split('/')[1]);
              if (endDate > lastDate)
                dataType.lastDate = endDate.toISOString();
            } else {
              if (new Date(lastTime) > lastDate)
                dataType.lastDate = new Date(lastTime);
            }



          } else
            this.printLog("Unknown dimension" + dd.attributes.name.nodeValue);
        });
      }
    });
  }

  

  // Get url and parameters for a given data type and date
  getDataTypeURL = function(dataName, date, timeScale){
    // Find data type with that name
    let dataType = undefined;
    Object.keys(this.dataTypes).forEach(dKey => {
      this.dataTypes[dKey].altNames.forEach(altN => {
        if (altN.toLowerCase() == dataName.toLowerCase())
          dataType = this.dataTypes[dKey];
      })
      //if (dKey == dataName) dataType = this.dataTypes[dKey] 
    });
    if (dataType == undefined) {
      console.error("Data type does not exists: " + dataName);
      return;
    }

    // Check timescale
    let tScale = undefined
    dataType.timeScales.forEach(tS => { if (tS == timeScale) tScale = timeScale });
    if (tScale == undefined) {
      tScale = dataType.timeScales[0];
      this.printWarn("Time scale petitioned does not exist in the ocean prodcut. Ocean product: " + dataType.name + ". Time scale petitioned: " + timeScale + ". Available time scales: " + dataType.timeScales);
    }

    // Check if WMS capabilities were loaded
    if (dataType.timeScaleCorrection == undefined) {
      this.printWarn("WMS Capabilities were not yet loaded. Loading now");
      return;
      // Get Capabilities
      //await this.loadWMSCapabilities(dataType, this.domainURL + dataType.url + "-" + currTimeScale, currTimeScale);
    }

    // Check if the date is smaller than the lastDate of the WMS reanlysis
    // TODO: check if the timeScalesCorrection is also equivalent for forecast service. If not, we need to GetCapabilities of each forecast
    let domainURL = dataType.domainURL;
    let serviceURL = dataType.url;
    let version = dataType.version; // 1.1.1 or 1.3.0 (then CRS should be instead of SRS)
    if (date > dataType.lastDate) {
      this.printWarn("Using forecast instead of reanalysis CMEMS data.");
      domainURL = dataType.forecast.domainURL;
      serviceURL = dataType.forecast.url;
      version = dataType.forecast.version;
    }

    var params = {
      'LAYERS': dataType.layerName,
      'COLORSCALERANGE': String(dataType.range),
      //'BBOX': String(long - 0.2) + "," + String(lat - 0.2) + "," + String(long + 0.2) + "," + String(lat + 0.2),
      //'STYLES': 'boxfill/greyscale', // TODO: check that the gradient from black to white is linear
      // Other default parameters
      'SRS': 'EPSG:4326', // Should be CRS if version is 1.3.0
      'CRS': 'EPSG:4326', // If I add SRC and CRS the problem is solved?
      'TILED': 'true',
      'LOGSCALE': 'false',
      'TRANSPARENT': 'true',
      'STYLES': dataType.style,
      //'WIDTH': 1,
      //'HEIGHT': 1,
    }

    // Add elevation
    if (dataType.elevation !== undefined)
      params['ELEVATION'] = String(dataType.elevation[0]);

    // Add time parameter
    date = date.substring(0, 11) + '00:00:00.000Z'// Clean date
    if (tScale.includes('d')) {
      let tCorr = dataType.timeScaleCorrection.d;
      let hString = String(tCorr.h).padStart(2, '0');
      let minString = String(tCorr.min).padStart(2, '0');
      date = date.substring(0, 11) + hString + ':' + minString + ':00.000Z';
    } else if (tScale.includes('m')) {
      let tCorr = dataType.timeScaleCorrection.m;
      // Find corresponding month
      let mmyy = date.substring(0, 7);
      date = tCorr.dates.find((dd) => dd.substring(0, 7) == mmyy);
    }
    // SHOULD BE DEPENDANT ON SELECTED TIME SCALE (for now daily? - wave does not have daily, only hourly
    params['TIME'] = date;

    // Construct WMS url
    let url = domainURL + serviceURL;
    if (!dataType.urlLocked)
      url += '-' + tScale[0];
    
    
    return {
      url: url, 
      params: params,
      name: dataType.name, // not necessary?
      doi: dataType.doi,
      attributions: '© CMEMS', // TODO
      // animation
    }
  }



  // Get data at a specific point
  getDataAtPoint = async function(dataName, date, lat, long, timeScale, direction){
    
    // Input variables
    // var dataName = "Sea temperature";
    // var lat = 41;
    // var long = 2.9;
    // var date = '2010-01-12T12:00:00.000Z';
    // var timeScale = 'd';

    // Find data type with that name
    let dataType = undefined;
    Object.keys(this.dataTypes).forEach(dKey => { if (dKey == dataName) dataType = this.dataTypes[dKey] });
    if (dataType == undefined){
      console.error("Data type does not exists: " + dataName);
      return;
    }
    // Check timescale
    let tScale = undefined
    dataType.timeScales.forEach(tS => { if (tS == timeScale) tScale = timeScale });
    if (tScale == undefined) {
      tScale = dataType.timeScales[0];
      this.printWarn("Time scale petitioned does not exist in the ocean prodcut. Ocean product: " + dataType.name + ". Time scale petitioned: " + timeScale + ". Available time scales: " + dataType.timeScales);
    }
    // If we want the direction
    if (direction) {
      // Check if direction exists (animation)
      if (dataType.animation == undefined) {
        console.error("Data type " + dataName + " does not have direction information.");
        return;
      }
    }
    // Check if WMS capabilities were loaded
    if (dataType.timeScaleCorrection == undefined){
      this.printWarn("WMS Capabilities were not yet loaded. Loading now");
      // Get Capabilities
      await this.loadWMSCapabilities(dataType, dataType.domainURL + dataType.url + "-" + currTimeScale, currTimeScale);
    }
    

    // Check if the date is smaller than the lastDate of the WMS reanlysis
    // TODO: check if the timeScalesCorrection is also equivalent for forecast service. If not, we need to GetCapabilities of each forecast
    let domainURL = dataType.domainURL;
    let serviceURL = dataType.url;
    let version = dataType.version; // 1.1.1 or 1.3.0 (then CRS should be instead of SRS)
    if (date > dataType.lastDate){
      this.printWarn("Using forecast instead of reanalysis CMEMS data.");
      domainURL = dataType.forecast.domainURL;
      serviceURL = dataType.forecast.url;
      version = dataType.forecast.version;
    }


    // https://my.cmems-du.eu/thredds/wms/med-cmcc-cur-rean-d?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png
    // &TRANSPARENT=TRUE
    // &LAYERS=sea_water_velocity
    // &STYLES=boxfill/ncview
    // &LOGSCALE=false
    // &SRS=EPSG:4326
    // &BBOX=0,22.5,22.5,45
    // &WIDTH=512
    // &HEIGHT=512
    // &COLORSCALERANGE=0.008134,0.3748
    // &BELOWMINCOLOR=0x0000ff
    // &ABOVEMAXCOLOR=0xff0001
    // &TIME=2005-03-25T12:00:00.000Z
    // &ELEVATION=-1.0182366371154785

    var params = {
      'LAYERS': dataType.layerName,
      'COLORSCALERANGE': String(dataType.range),
      'BBOX': String(long - 0.2) + "," + String(lat - 0.2) + "," + String(long + 0.2) + "," + String(lat + 0.2),
      'STYLES': 'boxfill/greyscale', // TODO: check that the gradient from black to white is linear
      // Other default parameters
      'SRS': 'EPSG:4326', // Should be CRS if version is 1.3.0
      'CRS': 'EPSG:4326', // If I add SRC and CRS the problem is solved?
      'TILED': 'true',
      'LOGSCALE': 'false',
      'TRANSPARENT': 'true',
      'WIDTH': 1,
      'HEIGHT': 1,
    }
    // Add elevation
    if (dataType.elevation !== undefined)
      params['ELEVATION'] = String(dataType.elevation[0]);
    
    // Add time parameter
    date = date.substring(0, 11) + '00:00:00.000Z'// Clean date
    if (tScale.includes('d')){
      let tCorr = dataType.timeScaleCorrection.d;
      let hString = String(tCorr.h).padStart(2, '0');
      let minString = String(tCorr.min).padStart(2, '0');
      date = date.substring(0, 11) + hString + ':' + minString + ':00.000Z';
    } else if (tScale.includes('m')){
      let tCorr = dataType.timeScaleCorrection.m;
      // Find corresponding month
      let mmyy = date.substring(0,7);
      date = tCorr.dates.find((dd) => dd.substring(0, 7) == mmyy);
    }
    // SHOULD BE DEPENDANT ON SELECTED TIME SCALE (for now daily? - wave does not have daily, only hourly
    params['TIME'] = date;


    // Construct WMS url
    let url = domainURL + serviceURL;
    if (dataType.urlLocked)
      url += '?SERVICE=WMS&VERSION=' + version + '&REQUEST=GetMap&FORMAT=image/png';
    else
      url += '-' + tScale[0] + '?SERVICE=WMS&VERSION='+ version +'&REQUEST=GetMap&FORMAT=image/png';
    Object.keys(params).forEach(ppKey => {
      url += '&' + ppKey + '=' + params[ppKey];
    });



    // If no direction is requested
    if (direction == undefined){
      // Get value from URL
      return await this.getPreciseValueFromURL(url, dataType.range);
    }



    // If direction is requested
    let animData = dataType.animation;
    // Angle format
    if (animData.format == 'value_angle'){
      url = WMSDataRetriever.setWMSParameter(url, 'LAYERS', animData.layerNames[1]);
      url = WMSDataRetriever.setWMSParameter(url, 'COLORSCALERANGE', String([-360,360]));

      //params.LAYERS = animData.layerNames[1];
      //params.COLORSCALERANGE = String([0, 359]);
      // Object.keys(params).forEach(ppKey => {
      //   url += '&' + ppKey + '=' + params[ppKey];
      // });

      // Get value from URL
      let value = await this.getPreciseValueFromURL(url, [-360, 360]);
      return value;
    } 
    // East-North format
    else if (animData.format == 'east_north'){


      // url = WMSDataRetriever.setWMSParameter(url, 'LAYERS', animData.layerNames[0]);
      // let east = await this.getPreciseValueFromURL(url, dataType.range);
      // url = SourceWMS.setWMSParameter(url, 'LAYERS', animData.layerNames[1]);
      // let north = await this.getPreciseValueFromURL(url, dataType.range);
      // Calculate angle
      // TODO: could call an async function where east and north are requested at the same time
      return await this.getEastNorthValues(url, animData.layerNames, dataType.range);

    }

  }



  // Returns the precise value from a WMS URL
  getPreciseValueFromURL = async function(url, range){
    let value = await this.getValueFromURL(url); // Normalized value from 0 to 1
    if (value == undefined) {
      this.printWarn("No data at " + url);
      // TODO: this happens when a dot in timerange is clicked twice. Why?
      return;
    }
    // Put in range of the data type (normValue * (max-min) + min)
    value = value * (range[1] - range[0]) + range[0];
    // Improve precision
    // Quantization step is 0.4% (100*1/255). We can improve the precision by reducing the color scale range
    let quantStep = (range[1] - range[0]) * 1 / 255;
    url = WMSDataRetriever.setWMSParameter(url, 'COLORSCALERANGE', [value - quantStep, value + quantStep]);
    // Get precise value from URL
    let vPrec = await this.getValueFromURL(url); // Normalized value from 0 to 1
    // Put in range (normValue * (max-min) + min)
    vPrec = vPrec * (quantStep * 2) + value - quantStep;
    // console.log("Quantized value (255 steps): " + value + ", Precise value: " + vPrec);
    // Return value
    return vPrec;
  }


  // Returns the value from a WMS URL
  getValueFromURL = async function(url){
    let img = await this.getImageFromURL(url);
    // Remove image from active requests
    this.activeRequests = this.activeRequests.filter( el => el.src != url); // GC? TODO?
    return this.getNormValueFromImage(img);
  }

  // Create an image element and load the image
  // HACK: errors are not catched when fetching image urls. If errors are catched, the data does not load
  getImageFromURL = function(url){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', reject); // If reject(img), image does not load
      img.src = url;
      this.activeRequests.push(img);
      //this.printLog(url);
    })
  }

  // Create a canvas with size 1 and extract the pixel value
  getNormValueFromImage = function(img){
    let canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    let pixels = ctx.getImageData(0, 0, 1, 1);
    let pixel = pixels.data[0];
    // Alpha
    let alpha = pixels.data[3];
    if (alpha == 0)
      return undefined;
    return pixel/255;
  }


  // TODO: PARALLEL ASYNC CALLS
  // https://ankurpatel.in/blog/call-multiple-async-await-functions-parallel-or-sequential/
  getEastNorthValues = async function(url, layerNames, range){
    url = WMSDataRetriever.setWMSParameter(url, 'LAYERS', layerNames[0]);
    let east = await this.getPreciseValueFromURL(url, range);
    url = WMSDataRetriever.setWMSParameter(url, 'LAYERS', layerNames[1]);
    let north = await this.getPreciseValueFromURL(url, range);
    // Return values
    return Math.atan2(north, east) * (180 / Math.PI);
  }

  // Get data type from data type name
  getDataType = function(dataTypeName){
    let dataType = undefined;
    Object.keys(this.dataTypes).forEach(dKey => { if (dKey == dataTypeName) dataType = this.dataTypes[dKey] });
    if (dataType == undefined) {
      console.error("Data type does not exists: " + dataName);
      return;
    }
    return dataType;
  }


  // Cancels active requests
  cancelActiveRequests = function(){
    this.activeRequests.forEach(el => el.src = "");
    this.activeRequests = [];
  }




  // Set WMS parameter
  static setWMSParameter(wmsURL, paramName, paramContent) {
    // If parameter does not exist
    if (wmsURL.indexOf(paramName + "=") == -1) {
      console.log("Parameter ", paramName, " does not exist in WMS URL");
      return wmsURL + '&' + paramName + '=' + paramContent;
    }
    let currentContent = WMSDataRetriever.getWMSParameter(wmsURL, paramName);
    return wmsURL.replace(currentContent, paramContent);
  }

  // Get WMS parameter
  static getWMSParameter(wmsURL, paramName) {
    // If parameter does not exist
    if (wmsURL.indexOf(paramName + "=") == -1) {
      console.log("Parameter ", paramName, " does not exist in WMS URL");
      return '';
    }
    let tmpSTR = wmsURL.substr(wmsURL.indexOf(paramName + "="));
    let endOfContent = tmpSTR.indexOf('&') == -1 ? tmpSTR.length : tmpSTR.indexOf('&');
    return tmpSTR.substring(paramName.length + 1, endOfContent);
  }


  // Verbose
  printWarnConsole = function(message){
    console.warn(message);
  }
  printLogConsole = function(message){
    console.log(message);
  }
}


//
// Fetch for french data AROME - WINDS AND OTHER ATHMOSPHERIC DATA
// Possibilities are limited because:
// - Color cannot be changed (&COLORSCALERANGE=18,20)
// - There are no grey color styles (only barb wire and isobars for wind for example)
// TODO: check if it is possible to extract the legend in order to get the values
// TODO: there is a WCS service that provides values, probably a better option

// https://donneespubliques.meteofrance.fr/?fond=produit&id_produit=131
// fetch('https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-001-FRANCE-WMS/GetCapabilities?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities', {
//     headers: {
//       'apikey': 'eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJnZXJhcmQubGxvcmFjaEBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6ImdlcmFyZC5sbG9yYWNoIiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJEZWZhdWx0QXBwbGljYXRpb24iLCJpZCI6MTExOCwidXVpZCI6IjNlOGU0YjllLTQzOTYtNGM5ZS1iMzZiLTliZWNhOGU5M2FiMCJ9LCJpc3MiOiJodHRwczpcL1wvcG9ydGFpbC1hcGkubWV0ZW9mcmFuY2UuZnI6NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiNTBQZXJNaW4iOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6InNlYyJ9fSwia2V5dHlwZSI6IlBST0RVQ1RJT04iLCJwZXJtaXR0ZWRSZWZlcmVyIjoiaHR0cHM6XC9cL2JsdWVuZXRjYXQuZ2l0aHViLmlvXC8qIiwic3Vic2NyaWJlZEFQSXMiOlt7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiQVJPTUUiLCJjb250ZXh0IjoiXC9wdWJsaWNcL2Fyb21lXC8xLjAiLCJwdWJsaXNoZXIiOiJhZG1pbl9tZiIsInZlcnNpb24iOiIxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifV0sImV4cCI6MTc1MTgwMzE2MiwicGVybWl0dGVkSVAiOiIiLCJpYXQiOjE2NTcxOTUxNjIsImp0aSI6ImYxYWMwMGJlLWQ5M2QtNGE5Ny05MTdlLTk5ZmI3NWI2MjRhMCJ9.GlGBIsE4xSWQlbnIxhkio6silJqGiOa9_E2UrkQ-FdG3NwP59uIHIPo-RqNXPGvHrufCh0CwqN99LAGE_mgXS95oVaMMrOtZoB4rVxp7nJ5GYP4_D6-RsTowasmcg7BRj3LcQTNGCKZDoMPUJSMZTLDTCiqJYR0PaTymjQQhgmK5OWH0hPo5lb2f1wdETwygcDOMDG8jBtdXKQUlOuxgEjuXZPdr65Zv0MYfyLh7g4qOL5dP5d0-gwBzKBnTpI31blItCAJWL0BhPHRE1vHRPzaPvTpLgSREUrJAUPzEAWW9-3uYDgXaOtopKuzJKWSwdfuP7c5vPVJy3I-Shwn64w==',
//       'Accept': '*/* ',
//     },
//   }).then(r => r.text()).then(res => console.log(res))



