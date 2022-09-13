

// Stores and retrieves data
export class OBSEADataRetriever{

  csv;
  currentParams = {};
  callbackSetParameters;

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

      this.createSlider();
    })
    .catch(e => console.error("Error when parsing .csv: " + e));

    
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
