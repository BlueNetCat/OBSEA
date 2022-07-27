/*
AWAK SENSOR
https://www.youtube.com/watch?v=iP0r-2PaMqE&ab_channel=Nortek
https://www.youtube.com/watch?v=bFV_1t0AFGY&ab_channel=Geo-matching
https://www.youtube.com/watch?v=FBB_qAe2ZwI&ab_channel=VassilisSkanavis

Hm0_ADCPWaves : Spectral significant wave height of waves {Hm0} on the water body by acoustic doppler wave array

avHeightOnethirdADCPWaves : Wave height mean of waves (highest one third) on the water body by acoustic doppler wave array

Hsig_upper_10_per_cent : Wave height mean of waves (highest one tenth) on the water body by acoustic doppler wave array

Hmax_ADCP : Wave height maximum of waves on the water body by acoustic doppler wave array

WaveAvgPer_ADWA : Period mean of waves on the water body by acoustic doppler wave array

WavePeriodSpecMax_ADCP : Period at spectral maximum of waves {peak period Tp} on the water body by acoustic doppler wave array

MeanWavePeriodTz_ADWA : Zero-crossing period of waves {Tz} on the water body by acoustic doppler wave array

Spectral_max_dirn_waveArray : Direction (from) at spectral maximum of waves on the water body by acoustic doppler wave array

directionalSprealADCPwaves : Directional spreading of waves on the water body by acoustic doppler wave array

MeanDir_ADCPWaves : Direction (from) mean of waves {mean wave direction} on the water body by acoustic doppler wave array

Unidir_Ind_ADCP_Waves : Unidirectivity index of waves on the water body by acoustic doppler wave array and computation using protocol of Barstow et al. (1991)
*/


export class OceanParameters{

  oceanParameters = {
    hm0: 1,
    hOneThird: 2,
    hOneTenth: 2.5,
    hMax: 3,
    meanDir: 0,
    stdDir: 90,
  }

  imgSize;
 
  waveHeights = [];
  waveDirections = [];
  waveSteepness = [];

  WAVE_MAX = 6;

  constructor(oceanParameters, imgSize){
    this.oceanParameters.hm0 = oceanParameters.hm0 || 1; // Hm0_ADCPWaves
    this.oceanParameters.hOneThird = oceanParameters.hOneThird || 2; // avHeightOnethirdADCPWaves
    this.oceanParameters.hOneTenth = oceanParameters.hOneTenth || 2.5; // Hsig_upper_10_per_cent
    this.oceanParameters.hMax = oceanParameters.hMax || 3; // Hmax_ADCP

    this.oceanParameters.meanDir = oceanParameters.meanDir || 0; // MeanDir_ADCPWaves
    this.oceanParameters.stdDir = oceanParameters.stdDir || 90; // ?

    this.numWaves = imgSize * imgSize;
    this.imgSize = imgSize;

    this.generateDistributions();
    this.createHTMLGidget();
    this.updateHTMLGidget();
  }



  generateDistributions = function(){
    // Calculate target std according to Z Score
    // https://en.wikipedia.org/wiki/Normal_distribution#/media/File:Standard_deviation_diagram_micro.svg
    // https://www.ztable.net/
    let z_score_OneThird = 0.43; // 66%
    let z_score_OneTenth = 1.29; // 90% 

    let meanHeight = this.oceanParameters.hm0;

    let stdOneThird = (this.oceanParameters.hOneThird - meanHeight) / z_score_OneThird;
    let stdOneTenth = (this.oceanParameters.hOneTenth - meanHeight) / z_score_OneTenth;
    let stdHeight = stdOneThird * 0.5 + stdOneTenth * 0.5;
    this.oceanParameters.stdHeight = stdHeight;

    console.log("Std 1/3: " + stdOneThird + ", Std 1/10: " + stdOneTenth);


    // Generate gaussian distribution for wave height
    this.waveHeights = this.generateGaussianDistribution(meanHeight, stdHeight, this.numWaves);
    // Limit wave heights
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = el > this.oceanParameters.hMax ? el / 5 : el);
    //console.log("Maximum wave height: " + Math.max(...waveHeights));

    // Generate direction distribution
    this.waveDirections = this.generateGaussianDistribution(this.oceanParameters.meanDir, this.oceanParameters.stdDir, this.numWaves);

    // Generate steepness distribution
    this.waveSteepness = this.generateGaussianDistribution(0.25, 0.1, this.numWaves);
  }


  createHTMLGidget = function(){
    this.canvas = document.createElement("canvas");
    let canvas = this.canvas;
    canvas.width = 300;
    canvas.height = 500;
    canvas.style.position = "absolute";
    canvas.style.bottom = "0px";
    canvas.style.right = "0px";
    document.body.append(canvas);
  }


  updateHTMLGidget = function(){
    let canvas = this.canvas;
    let context = canvas.getContext('2d');

    // Background
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0,0,0,0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // WAVE HEIGHTS
    context.translate(30, 200);
    context.scale(1, -1);
    let xFactor = 50;
    // Axis
    context.strokeStyle = "rgb(255,255,255)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, 100);
    context.lineTo(0, 0);
    context.lineTo(Math.max(...this.waveHeights) * xFactor, 0);
    context.stroke();
    // hm0
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.hm0 * xFactor, 100);
    context.lineTo(this.oceanParameters.hm0 * xFactor, 0);
    context.stroke();
    // h 1/3
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.hOneThird * xFactor, 100);
    context.lineTo(this.oceanParameters.hOneThird * xFactor, 0);
    context.stroke();
    // h 1/10
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.hOneTenth * xFactor, 100);
    context.lineTo(this.oceanParameters.hOneTenth * xFactor, 0);
    context.stroke();
    // hMax
    context.strokeStyle = "rgba(255, 0, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.hMax * xFactor, 100);
    context.lineTo(this.oceanParameters.hMax * xFactor, 0);
    context.stroke();
    // Gaussian histogram
    context.lineWidth = 2;
    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.moveTo(0, 0);
    for (let i = 0; i < Math.max(...this.waveHeights); i = i + 0.5) {
      let filtered = this.waveHeights.filter(el => (el < i + 0.5) && (el > i));
      context.lineTo((i + 0.25) * xFactor, filtered.length / this.waveHeights.length * 200);
    }
    context.stroke();
    context.resetTransform();

    context.translate(10, 20);
    // Informative text
    let textSeparation = 15;
    context.font = '12pt Calibri';
    context.textAlign = 'left';
    context.fillStyle = 'white';
    context.fillText('Wave heights. Num. waves: ' + this.waveHeights.length, 0, 0)
    context.font = '10pt Calibri';
    context.fillText('Hm0_ADCPWaves: ' + this.oceanParameters.hm0 + "m", 0, textSeparation);
    context.fillText("avHeightOnethirdADCPWaves: " + this.oceanParameters.hOneThird + "m", 0, textSeparation * 2);
    context.fillText("Hsig_upper_10_per_cent: " + this.oceanParameters.hOneTenth, 0, textSeparation * 3);
    context.fillText('Hmax_ADCP: ' + this.oceanParameters.hMax + "m", 0, textSeparation * 4);

    context.resetTransform();


    // WAVE DIRECTIONS
    context.translate(canvas.width / 2, 400);
    // Circle
    let radius = 50;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.stroke();
    // Axis
    context.strokeStyle = "rgba(255,255,255,0.2)";
    context.beginPath();
    context.moveTo(0, 0);
    for (let i = 0; i < 360; i += 360 / 12) {
      context.lineTo(Math.cos(i * Math.PI / 180) * radius, Math.sin(i * Math.PI / 180) * radius);
      context.lineTo(0, 0);
    }
    context.stroke();

    context.rotate(-Math.PI / 2)
    // Selected orientation
    context.lineWidth = 5;
    context.strokeStyle = "rgba(0,255,0,1)";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(Math.cos(this.oceanParameters.meanDir * Math.PI / 180) * radius * 1.2, Math.sin(this.oceanParameters.meanDir * Math.PI / 180) * radius * 1.2);
    context.stroke();
    // Histogram
    context.lineWidth = 2;
    let step = 15;
    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.moveTo(0, 0);
    for (let i = 0; i < 360 + step; i = i + step) {
      let filtered = this.waveDirections.filter(el => {
        el = (el + 360 * 10) % 360; // Transform to 0-360 space
        return ((el < i % 360 + step) && (el > i % 360))
      });
      let amount = 12 * radius * filtered.length / this.waveDirections.length;
      if (i == 0)
        context.moveTo(Math.cos((i + step / 2) * Math.PI / 180) * amount, Math.sin((i + step / 2) * Math.PI / 180) * amount);
      else
        context.lineTo(Math.cos((i + step / 2) * Math.PI / 180) * amount, Math.sin((i + step / 2) * Math.PI / 180) * amount);
    }
    context.stroke();
    context.resetTransform();

    context.translate(10, 280);
    // Informative text
    textSeparation = 15;
    context.font = '12pt Calibri';
    context.textAlign = 'left';
    context.fillStyle = 'white';
    context.fillText('Wave directions', 0, 0)
    context.font = '10pt Calibri';
    context.fillText('MeanDir_ADCPWaves: ' + this.oceanParameters.meanDir + " º", 0, textSeparation);
    context.fillText("Standard deviation: " + this.oceanParameters.stdDir + " º", 0, textSeparation * 2);
    context.resetTransform();
  }




  getWaveParamsImageData = function(){
    // Create a texture
    let canvas = document.createElement("canvas");
    canvas.width = this.imgSize;
    canvas.height = this.imgSize;
    // canvas.style.position = "absolute";
    // canvas.style.top = "0px";
    // document.body.append(canvas);

    let context = canvas.getContext('2d');
    // Get pixels
    let imageData = context.getImageData(0, 0, this.imgSize, this.imgSize);

    // Fill pixels and scale values from 0 to 255
    for (let i = 0; i < this.numWaves; i++) {
      // Steepness range
      let waveSteep = Math.abs(this.waveSteepness[i]);
      imageData.data[i * 4] = 255 * waveSteep;
      // Wave range
      let waveHeight = Math.abs(this.waveHeights[i]);
      imageData.data[i * 4 + 1] = 255 * waveHeight / this.WAVE_MAX;
      // Direction range -- SOME HACK WITH ORIENTATION HERE
      let dirX = Math.sin((-this.waveDirections[i] - 90) * Math.PI / 180)
      imageData.data[i * 4 + 2] = 255 * (dirX + 1) / 2;
      let dirZ = Math.cos((-this.waveDirections[i] - 90) * Math.PI / 180);
      imageData.data[i * 4 + 3] = 255 * (dirZ + 1) / 2;

    }


    // Put data into the texture
    //context.putImageData(imageData, 0, 0);
    // Return image pixels
    return imageData.data;
  }




  // Generate Gaussian Distribution
  // From uniform noise to normal noise (gaussian)
  // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  // If skew needed, use https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  // Or better here: https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/
  generateGaussianDistribution = function (targetMean, targetStd, numPoints, out) {

    out = out || [];

    // Create points
    for (let i = 0; i < numPoints / 2; i++) {

      let U1 = Math.random();
      let U2 = Math.random();
      while (U1 == 0) U1 = Math.random(); // Make sure 0 does not happen
      while (U2 == 0) U2 = Math.random();
      // Normally distributed random number
      let Z0 = targetStd * Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * Math.PI * U2) + targetMean;
      let Z1 = targetStd * Math.sqrt(-2 * Math.log(U1)) * Math.sin(2 * Math.PI * U2) + targetMean;

      out.push(Z0);
      out.push(Z1);
    }


    // Calculate mean and std for testing
    // let mean = out.reduce((total, el) => total += el) / out.length;
    // let std = Math.sqrt(out.reduce((total, el) => total += (el - mean) * (el - mean)) / out.length);
    // console.log("Mean: " + mean);
    // console.log("Std: " + std);

    return out;
  }





  // USER ACTIONS
  // Regenerate distribution for waveHeight
  randomizeWaveHeightDistribution = function(){
    // Generate gaussian distribution for wave height
    this.waveHeights = this.generateGaussianDistribution(this.oceanParameters.hm0, this.oceanParameters.stdHeight, this.numWaves);
    // Limit wave heights
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = Math.abs(el));
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = el > this.oceanParameters.hMax ? el / 5 : el);

    // TODO: SOMETIMES WAVES DISAPPEAR FOR NO REASON...
    this.updateHTMLGidget();
  }

  // Regenerate distribution for waveHeight
  randomizeWaveDirectionDistribution = function () {
    // Generate gaussian distribution for wave height
    this.waveDirections = this.generateGaussianDistribution(this.oceanParameters.meanDir, this.oceanParameters.stdDir, this.numWaves);

    this.updateHTMLGidget();
  }

}


/*

const WAVE_MAX = 6;


// Create wave parameters
// https://en.wikipedia.org/wiki/Significant_wave_height
// https://en.wikipedia.org/wiki/Trochoidal_wave
export const createWaveParamsImageData = function(oceanParameters, imgSize){

  // Params
  let hm0 = oceanParameters.hm0 || 1; // Hm0_ADCPWaves
  let hOneThird = oceanParameters.hOneThird || 2; // avHeightOnethirdADCPWaves
  let hOneTenth = oceanParameters.hOneTenth || 2.5; // Hsig_upper_10_per_cent
  let hMax = oceanParameters.hMax || 3; // Hmax_ADCP

  let meanDir = oceanParameters.meanDir || 0; // MeanDir_ADCPWaves
  let stdDir = oceanParameters.stdDir || 90; // ?


  let numWaves = imgSize * imgSize;




  

  // Calculate target std according to Z Score
  // https://en.wikipedia.org/wiki/Normal_distribution#/media/File:Standard_deviation_diagram_micro.svg
  // https://www.ztable.net/
  let z_score_OneThird = 0.43; // 66%
  let z_score_OneTenth = 1.29; // 90% 

  let meanHeight = hm0;

  let stdOneThird = (hOneThird - meanHeight) / z_score_OneThird;
  let stdOneTenth = (hOneTenth - meanHeight) / z_score_OneTenth;
  let stdHeight = stdOneThird * 0.5 + stdOneTenth * 0.5;

  console.log("Std 1/3: " + stdOneThird + ", Std 1/10: " + stdOneTenth);


  // Generate gaussian distribution for wave height
  let waveHeights = generateGaussianDistribution(meanHeight, stdHeight, numWaves);
  // Limit wave heights
  waveHeights.forEach((el, index) => waveHeights[index] = el > hMax ? el/5 : el);
  //console.log("Maximum wave height: " + Math.max(...waveHeights));

  // Generate direction distribution
  let waveDirections = generateGaussianDistribution(meanDir, stdDir, numWaves);

  // Generate steepness distribution
  let waveSteepness = generateGaussianDistribution(0.25, 0.1, numWaves);

  

  // Create HTML widget
  {
    let canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 500;
    canvas.style.position = "absolute";
    canvas.style.bottom = "0px";
    canvas.style.right = "0px";
    document.body.append(canvas);

    let context = canvas.getContext('2d');

    // Background
    context.fillStyle = "rgba(0,0,0,0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // WAVE HEIGHTS
    context.translate(30, 200);
    context.scale(1, -1);
    let xFactor = 50;
    // Axis
    context.strokeStyle = "rgb(255,255,255)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0,100);
    context.lineTo(0,0);
    context.lineTo(Math.max(...waveHeights) * xFactor,0);
    context.stroke();
    // hm0
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(hm0 * xFactor, 100);
    context.lineTo(hm0 * xFactor, 0);
    context.stroke();
    // h 1/3
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(hOneThird * xFactor, 100);
    context.lineTo(hOneThird * xFactor, 0);
    context.stroke();
    // h 1/10
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(hOneTenth * xFactor, 100);
    context.lineTo(hOneTenth * xFactor, 0);
    context.stroke();
    // hMax
    context.strokeStyle = "rgba(255, 0, 0, 0.8)";
    context.beginPath();
    context.moveTo(hMax * xFactor, 100);
    context.lineTo(hMax * xFactor, 0);
    context.stroke();
    // Gaussian histogram
    context.lineWidth = 2;
    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.moveTo(0,0);
    for (let i = 0; i < Math.max(...waveHeights); i=i+0.5){
      let filtered = waveHeights.filter(el => (el< i+0.5)&& (el>i) );
      context.lineTo( (i + 0.25) * xFactor, filtered.length/waveHeights.length * 200);
    }
    context.stroke();
    context.resetTransform();

    context.translate(10, 20);
    // Informative text
    let textSeparation = 15;
    context.font = '12pt Calibri';
    context.textAlign = 'left';
    context.fillStyle = 'white';
    context.fillText('Wave heights. Num. waves: ' + waveHeights.length, 0,0)
    context.font = '10pt Calibri';
    context.fillText('Hm0_ADCPWaves: ' + hm0 + "m", 0, textSeparation);
    context.fillText("avHeightOnethirdADCPWaves: " + hOneThird + "m", 0, textSeparation*2);
    context.fillText("Hsig_upper_10_per_cent: " + hOneTenth, 0, textSeparation*3);
    context.fillText('Hmax_ADCP: ' + hMax + "m", 0, textSeparation*4);

    context.resetTransform();

    
    // WAVE DIRECTIONS
    context.translate(canvas.width/2, 400);
    // Circle
    let radius = 50;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.stroke();
    // Axis
    context.strokeStyle = "rgba(255,255,255,0.2)";
    context.beginPath();
    context.moveTo(0,0);
    for (let i = 0; i< 360; i += 360/12){
      context.lineTo(Math.cos(i * Math.PI / 180) * radius, Math.sin(i * Math.PI / 180) * radius);
      context.lineTo(0,0);
    }
    context.stroke();
    
    context.rotate(-Math.PI / 2)
    // Selected orientation
    context.lineWidth = 5;
    context.strokeStyle = "rgba(0,255,0,1)";
    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(Math.cos(meanDir * Math.PI / 180) * radius * 1.2, Math.sin(meanDir * Math.PI / 180) * radius * 1.2);
    context.stroke();
    // Histogram
    context.lineWidth = 2;
    let step = 15;
    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.moveTo(0, 0);
    for (let i = 0; i < 360+step; i = i + step) {
      let filtered = waveDirections.filter(el => {
        el = (el + 360*10)%360; // Transform to 0-360 space
        return ((el < i%360 + step) && (el > i%360))
      });
      let amount = 12 * radius * filtered.length / waveDirections.length;
      if (i == 0)
        context.moveTo(Math.cos((i + step / 2) * Math.PI / 180) * amount, Math.sin((i + step / 2) * Math.PI / 180) * amount);
      else
        context.lineTo(Math.cos((i + step / 2) * Math.PI / 180) * amount, Math.sin((i + step / 2) * Math.PI / 180) * amount);
    }
    context.stroke();
    context.resetTransform();

    context.translate(10, 280);
    // Informative text
    textSeparation = 15;
    context.font = '12pt Calibri';
    context.textAlign = 'left';
    context.fillStyle = 'white';
    context.fillText('Wave directions', 0, 0)
    context.font = '10pt Calibri';
    context.fillText('MeanDir_ADCPWaves: ' + meanDir + " º", 0, textSeparation);
    context.fillText("Standard deviation: " + stdDir + " º", 0, textSeparation * 2);
    context.resetTransform();
  }





  // Create a texture
  let canvas = document.createElement("canvas");
  canvas.width = imgSize;
  canvas.height = imgSize;
  // canvas.style.position = "absolute";
  // canvas.style.top = "0px";
  // document.body.append(canvas);

  let context = canvas.getContext('2d');
  // Get pixels
  let imageData = context.getImageData(0, 0, imgSize, imgSize);

  // Fill pixels and scale values from 0 to 255
  for (let i = 0; i < numWaves; i++){
    // Steepness range
    let waveSteep = Math.abs(waveSteepness[i]);
    imageData.data[i * 4] = 255 * waveSteep;
    // Wave range
    let waveHeight = Math.abs(waveHeights[i]);
    imageData.data[i * 4 + 1] = 255 * waveHeight / WAVE_MAX;
    // Direction range -- SOME HACK WITH ORIENTATION HERE
    let dirX = Math.sin( (-waveDirections[i]-90) * Math.PI / 180)
    imageData.data[i * 4 + 2] = 255 * (dirX + 1) / 2;
    let dirZ = Math.cos((-waveDirections[i]-90) * Math.PI / 180);
    imageData.data[i * 4 + 3] = 255 * (dirZ + 1) / 2;
    
  }


  // Put data into the texture
  //context.putImageData(imageData, 0, 0);
  return imageData.data;
}




// Generate Gaussian Distribution
// From uniform noise to normal noise (gaussian)
  // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  // If skew needed, use https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  // Or better here: https://spin.atomicobject.com/2019/09/30/skew-normal-prng-javascript/
const generateGaussianDistribution = function(targetMean, targetStd, numPoints, out){

  out = out || [];
  
  // Create points
  for (let i = 0; i < numPoints / 2; i++) {

    let U1 = Math.random();
    let U2 = Math.random();
    while(U1 == 0) U1 = Math.random(); // Make sure 0 does not happen
    while(U2 == 0) U2 = Math.random();
    // Normally distributed random number
    let Z0 = targetStd * Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * Math.PI * U2) + targetMean;
    let Z1 = targetStd * Math.sqrt(-2 * Math.log(U1)) * Math.sin(2 * Math.PI * U2) + targetMean;

    out.push(Z0);
    out.push(Z1);
  }

  
  // Calculate mean and std for testing
  // let mean = out.reduce((total, el) => total += el) / out.length;
  // let std = Math.sqrt(out.reduce((total, el) => total += (el - mean) * (el - mean)) / out.length);
  // console.log("Mean: " + mean);
  // console.log("Std: " + std);

  return out;
}
*/