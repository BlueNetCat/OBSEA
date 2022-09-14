

// Stores and retrieves data
export class OBSEADataRetriever{

  csv;
  currentParams = {};
  callbackSetParameters;

  counterNearby = 0;

  constructor(callbackSetParameters){

    this.callbackSetParameters = callbackSetParameters;

    // Get static data
    fetch('/OBSEA/data/data_2021.csv')
    .then(res => res.text())
    .then(rawSS => {
      let rowsSS = rawSS.split("\r\n");
      for (let i = 0; i < rowsSS.length; i++) {
        rowsSS[i] = rowsSS[i].split(",");
      }
      rowsSS.pop();
      this.csv = rowsSS;

      this.processCSV();
      this.createSlider();
    })
    .catch(e => console.error("Error when parsing .csv: " + e));

    
  }



  processCSV(){

    let nearbyIndIndValue = [];
    
    // Iterate per data type
    for (let dtype = 0; dtype < this.csv[0].length; dtype++){
      // Iterate per timestamp
      for (let i = 1; i<this.csv.length; i++){
        
        // Fill empty data points with nearby data points
        let dataPoint = this.csv[i][dtype];
        
        if (dataPoint == ''){
          let prev = '';
          let next = '';
          // Find nearby
          if (i > 1){
            if (this.csv[i-1][dtype] != '')
              next = this.csv[i - 1][dtype];
          }
          if (i < this.csv.length - 1)
            if (this.csv[i-1][dtype] != '')
              prev = this.csv[i + 1][dtype];
          
          // Assign nearby
          let nearby = undefined;
          if (prev != '' && next != '') nearby = parseFloat(prev)*0.5 + parseFloat(next)*0.5;
          else if (prev != '') nearby = prev;
          else if (next != '') nearby = next;

          if (nearby != undefined) {
            nearbyIndIndValue.push([i, dtype, nearby]);
            this.counterNearby++;
          }
        }
      }
    }

    // Fill the points in the csv
    for (let i = 0; i<nearbyIndIndValue.length; i++){
      let ind = nearbyIndIndValue[i][0];
      let dtype = nearbyIndIndValue[i][1];
      this.csv[ind][dtype] = nearbyIndIndValue[i][2];
    }
      
    console.log("nearby data points found: " + this.counterNearby);
  }

  
  createSlider(){

    // Create HTML slider on the bottom
    let slider = document.createElement("input");
    slider.type = "range";
    slider.max = this.csv.length - 1; // First row is header
    slider.min = 1;
    slider.step = 1;
    slider.value = 1;
    slider.style.position = "absolute";
    slider.style.bottom = "5%";
    slider.style.width = "80%";
    slider.style.left = "10%";
    slider.style.right = "10%";
    document.body.appendChild(slider);

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
