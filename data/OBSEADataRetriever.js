

// Stores and retrieves data
export class OBSEADataRetriever{

  csv;
  currentParams = {};
  callbackSetParameters;

  dataAvailability = {};

  samplingRateCheck = 6;

  maxWaveHeight = 5;
  maxWindSpeed = 20;
  maxCurrent = 2;

  constructor(callbackSetParameters){

    this.callbackSetParameters = callbackSetParameters;

    // Get static data
    fetch('/OBSEA/data/obsea_2021.csv')
    .then(res => res.text())
    .then(rawSS => {
      let rowsSS = rawSS.split("\r\n");
      for (let i = 0; i < rowsSS.length; i++) {
        rowsSS[i] = rowsSS[i].split(",");
      }
      rowsSS.pop();
      this.csv = rowsSS;

      this.processCSV();
      this.createDataAvailabilityTimeline();
      this.createSlider();
    })
    .catch(e => console.error("Error when parsing .csv: " + e));

    
  }



  processCSV(){

    let nearbyIndIndValue = [];

    // Iterate per data type
    for (let dInd = 0; dInd < this.csv[0].length; dInd++){
      // Iterate per timestamp
      for (let i = 1; i<this.csv.length; i++){
        
        // Fill empty data points with nearby data points
        let dataPoint = this.csv[i][dInd];
        
        if (dataPoint == ''){
          let prev = '';
          let next = '';
          // Find nearby
          if (i > 1){
            if (this.csv[i-1][dInd] != '')
              next = this.csv[i - 1][dInd];
          }
          if (i < this.csv.length - 1)
            if (this.csv[i-1][dInd] != '')
              prev = this.csv[i + 1][dInd];
          
          // Assign nearby
          let nearby = undefined;
          if (prev != '' && next != '') nearby = parseFloat(prev)*0.5 + parseFloat(next)*0.5;
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
    for (let i = 0; i<nearbyIndIndValue.length; i++){
      let ind = nearbyIndIndValue[i][0];
      let dInd = nearbyIndIndValue[i][1];
      this.csv[ind][dInd] = nearbyIndIndValue[i][2];
    }
      

  }



  createDataAvailabilityTimeline(){

    // Iterate per data type
    for (let dInd = 1; dInd < this.csv[0].length; dInd++) {
      let dType = this.csv[0][dInd];
      this.dataAvailability[dType] = {};

      // TODO: do not assume a constant sampling rate (30 min). Work with the timestamps.
      let samplingRateCheck = this.samplingRateCheck; // every 48 samples (24h, assuming a sampling rate of 30 min) 
      // Create canvas
      let canvas = document.createElement("canvas");
      canvas.width = Math.round(this.csv.length - 1) / samplingRateCheck; // Check for data for a day (30 min sampling rate)
      canvas.height = 20;
      canvas.id = dType;
      let ctx = canvas.getContext("2d");
      if (dType == 'Hm0') ctx.fillStyle = "darkblue";
      else if (dType == 'WSPD') ctx.fillStyle = "lightblue";
      else if (dType == 'UCUR_0m') ctx.fillStyle = "red";
      // Iterate per timestamp
      for (let i = 1; i < this.csv.length - samplingRateCheck; i += samplingRateCheck) { // Check 48 datapoints
        // Check if a sample exists in a day
        let isAvailable = false;
        let sample;
        for (let j = 0; j < samplingRateCheck; j++){
          if (this.csv[i + j][dInd] != ''){ 
            isAvailable = true; 
            sample = parseFloat(this.csv[i + j][dInd]);
            j = samplingRateCheck; // Found data point. Exit loop
          } 
        }
        // Paint on canvas
        if (isAvailable){
          if (dType == 'Hm0') {
            let thickness = Math.max(5, canvas.height * sample / this.maxWaveHeight);
            ctx.fillRect(Math.round(i / samplingRateCheck), canvas.height / 2 - thickness/2, 10, thickness);
          } else if (dType == 'WSPD'){ 
            let thickness = Math.max(5, canvas.height * sample / this.maxWindSpeed);
            ctx.fillRect(Math.round(i / samplingRateCheck), canvas.height / 2 - thickness / 2, 10, thickness);
          } else if (dType == 'UCUR_0m') {
            let thickness = Math.max(5, canvas.height * sample / this.maxCurrent);
            ctx.fillRect(Math.round(i / samplingRateCheck), canvas.height / 2 - thickness / 2, 10, thickness);
          } else
          ctx.fillRect(Math.round(i / samplingRateCheck), canvas.height / 2, 10, 20);
        }
      }
      
      if (dType == 'Hm0' || dType == 'WSPD' || dType == 'UCUR_0m')
        document.body.appendChild(canvas);

      this.dataAvailability[dType].canvas = canvas;
    }

  }
  
  createSlider(){

    // Create div
    let divEl = document.createElement("div");
    divEl.style.position = "absolute";
    divEl.style.bottom = "5%";
    divEl.style.width = "80%";
    divEl.style.left = "10%";
    divEl.style.right = "10%";
    

    // Create HTML slider on the bottom
    let slider = document.createElement("input");
    slider.type = "range";
    slider.max = this.csv.length - 2; // First row is header
    slider.min = 1;
    slider.step = 1;
    slider.value = 1;
    // slider.style.position = "absolute";
    // slider.style.bottom = "5%";
    slider.style.width = "100%";
    // slider.style.left = "10%";
    // slider.style.right = "10%";
    divEl.appendChild(slider);

    let canvasEl = this.dataAvailability.Hm0.canvas;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '10px';
    divEl.appendChild(canvasEl);

    canvasEl = this.dataAvailability.WSPD.canvas;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '10px';
    divEl.appendChild(canvasEl);

    canvasEl = this.dataAvailability.UCUR_0m.canvas;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '10px';
    divEl.appendChild(canvasEl);

    document.body.appendChild(divEl);

    slider.onchange = (e) => {
      let index = parseInt(e.target.value);
      this.getDataOnIndex(index);
      this.callbackSetParameters(this.currentParams);
    }
  }


  
  // Get data according to a value form slider
  getDataOnIndex(index){ 

    // Get data index
    //let index = Math.round(value*(this.csv.length-1) + 1/this.csv.length); // first row is header
    
    let header = this.csv[0];

    this.currentParams[header[0]] = this.csv[index+1][0];
    for (let i = 1; i < header.length; i++){
      let value = this.csv[index + 1][i];
      this.currentParams[header[i]] = value == '' ? undefined : parseFloat(value);
    }

    return this.currentParams;
  }


}
