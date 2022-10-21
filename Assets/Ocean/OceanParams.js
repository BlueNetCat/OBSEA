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
    Hm0: 1.04,
    H3: 0.94,
    H10: 1.21,
    hMax: 1.58,
    Mdir: 195.58,
    Spr1: 36.7,
    timestamp: '2019-11-14 02:05h',
  }

  imgSize;
 
  waveHeights = [];
  waveDirections = [];
  waveSteepness = [];

  WAVE_MAX = 6;

  constructor(oceanParameters, imgSize){
    // Assign given ocean parameters (if any)
    let keys = Object.keys(oceanParameters);
    keys.forEach(kk => this.oceanParameters[kk] = oceanParameters[kk]);

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

    // HACK - Use H3 to reduce the mean. We assume that H0 is representing the 66% of the distribution
    let meanHeight = this.oceanParameters.Hm0 * 0.5/0.66; // H3 is always smaller than Hm0 in the data?

    let stdOneThird = (this.oceanParameters.H3 - meanHeight) / z_score_OneThird;
    let stdOneTenth = (this.oceanParameters.H10 - meanHeight) / z_score_OneTenth;
    let stdHeight = stdOneThird * 0.5 + stdOneTenth * 0.5;
    this.oceanParameters.stdHeight = stdHeight;

    // console.log("Std 1/3: " + stdOneThird + ", Std 1/10: " + stdOneTenth);


    // Generate gaussian distribution for wave height
    this.waveHeights = this.generateGaussianDistribution(meanHeight, stdHeight, this.numWaves);
    // Limit wave heights
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = el > this.oceanParameters.hMax ? el / 5 : el);
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = el < 0 ? Math.abs(meanHeight + stdHeight*(Math.random()- 0.5)) : el); // If negative, resample as Hm0 + sigma*0.5*rand(-1,1);
    //console.log("Maximum wave height: " + Math.max(...this.waveHeights));
    //console.log("Minimum wave height: " + Math.min(...this.waveHeights));

    // Generate direction distribution
    this.waveDirections = this.generateGaussianDistribution(this.oceanParameters.Mdir, this.oceanParameters.Spr1, this.numWaves);

    // Generate steepness distribution
    this.waveSteepness = this.generateGaussianDistribution(0.25, 0.1, this.numWaves);
    this.waveSteepness.forEach((el, index) => this.waveSteepness[index] = Math.abs(el));
    //console.log("Maximum wave steepness: " + Math.max(...this.waveSteepness));
    //console.log("Minimum wave steepness: " + Math.min(...this.waveSteepness));
  }



  // Given parameters by the csv
  updateParams = function(params){
    this.oceanParameters.Hm0 = params.Hm0;
    this.oceanParameters.H3 = params.H3 < 0 ? params.Hm0 : params.H3; // Could have invalid number (-999.99);
    this.oceanParameters.H10 = params.H10;
    this.oceanParameters.hMax = params.Hmax;

    this.oceanParameters.Mdir = params.Mdir;
    this.oceanParameters.Spr1 = params.Spr1 < 0 ? 90 : params.Spr1; // Could have invalid number (-999.99);

    this.oceanParameters.timestamp = params.timestamp;

    this.generateDistributions();
    this.updateHTMLGidget();
  }

  // Update wave significant height
  updateWaveSignificantHeight = function(Hm0){
    this.oceanParameters.Hm0 = Hm0;
    this.generateDistributions();
    //this.updateHTMLGidget();
  }
  updateMeanWaveDirection = function(mdir){
    this.oceanParameters.Mdir = mdir;
    this.generateDistributions();
    //this.updateHTMLGidget();
  }
  updateDirectionalSpread = function(spr1){
    this.oceanParameters.Spr1 = spr1;
    this.generateDistributions();
  }






  createHTMLGidget = function(){
    this.canvas = document.createElement("canvas");
    let canvas = this.canvas;
    canvas.width = 300;
    canvas.height = 500;
    canvas.style.position = "absolute";
    canvas.style.bottom = "0px";
    canvas.style.right = "0px";
    //document.body.append(canvas);
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
    let xFactor = 80;
    // Axis
    context.strokeStyle = "rgb(255,255,255)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(0, 100);
    context.lineTo(0, 0);
    context.lineTo((this.oceanParameters.hMax*1.2) * xFactor, 0);
    context.stroke();
    // Hm0
    context.strokeStyle = "rgba(255, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.Hm0 * xFactor, 100);
    context.lineTo(this.oceanParameters.Hm0 * xFactor, 0);
    context.stroke();
    // H3
    context.strokeStyle = "rgba(255, 0, 255, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.H3 * xFactor, 100);
    context.lineTo(this.oceanParameters.H3 * xFactor, 0);
    context.stroke();
    // H10
    context.strokeStyle = "rgba(0, 255, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.oceanParameters.H10 * xFactor, 100);
    context.lineTo(this.oceanParameters.H10 * xFactor, 0);
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
    context.fillText('Wave heights. Num. waves: ' + this.waveHeights.length, 0, 0);
    context.fillText('Timestamp: ' + this.oceanParameters.timestamp, 0, textSeparation)
    context.font = '10pt Calibri';
    context.fillStyle = "rgba(255, 255, 0, 0.8)";
    context.fillText('Hm0: ' + this.oceanParameters.Hm0 + "m", 0, textSeparation*2);
    context.fillStyle = "rgba(255, 0, 255, 0.8)";
    context.fillText("H3: " + this.oceanParameters.H3 + "m", 0, textSeparation * 3);
    context.fillStyle = "rgba(127, 255, 127, 0.8)";
    context.fillText("H10: " + this.oceanParameters.H10, 0, textSeparation * 4);
    context.fillStyle = "rgba(255, 127, 127, 0.8)";
    context.fillText('Hmax: ' + this.oceanParameters.hMax + "m", 0, textSeparation * 5);

    context.resetTransform();


    // WAVE DIRECTIONS
    context.translate(canvas.width / 2, 380);
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
    context.lineTo(Math.cos(this.oceanParameters.Mdir * Math.PI / 180) * radius * 1.2, Math.sin(this.oceanParameters.Mdir * Math.PI / 180) * radius * 1.2);
    context.stroke();
    // Histogram
    context.lineWidth = 2;
    let step = 15;
    let histSizeFactor = 7;
    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.moveTo(0, 0);
    for (let i = 0; i < 360 + step; i = i + step) {
      let filtered = this.waveDirections.filter(el => {
        el = (el + 360 * 10) % 360; // Transform to 0-360 space
        return ((el < i % 360 + step) && (el > i % 360))
      });
      let amount = histSizeFactor * radius * filtered.length / this.waveDirections.length;
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
    context.fillText('Mdir: ' + this.oceanParameters.Mdir + " º", 0, textSeparation);
    context.fillText("Spr1: " + this.oceanParameters.Spr1 + " º", 0, textSeparation * 2);
    context.resetTransform();
  }




  getWaveParamsImageData = function(){
    // Create a texture
    let canvas = document.createElement("canvas");
    canvas.width = this.imgSize;
    canvas.height = this.imgSize;

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
      // Direction range (negative for clockwise rotation)
      let dirX = Math.sin((-this.waveDirections[i]) * Math.PI / 180)
      imageData.data[i * 4 + 2] = 255 * (dirX + 1) / 2;
      let dirZ = Math.cos((-this.waveDirections[i]) * Math.PI / 180);
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
    this.waveHeights = this.generateGaussianDistribution(this.oceanParameters.Hm0, this.oceanParameters.stdHeight, this.numWaves);
    // Limit wave heights
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = el < 0 ? Math.abs(meanHeight + stdHeight * (Math.random() - 0.5)) : el); // If negative, resample as Hm0 + sigma*0.5*rand(-1,1);
    this.waveHeights.forEach((el, index) => this.waveHeights[index] = el > this.oceanParameters.hMax ? el / 5 : el);

    // TODO: SOMETIMES WAVES DISAPPEAR FOR NO REASON...
    this.updateHTMLGidget();
  }

  // Regenerate distribution for waveHeight
  randomizeWaveDirectionDistribution = function () {
    // Generate gaussian distribution for wave height
    this.waveDirections = this.generateGaussianDistribution(this.oceanParameters.Mdir, this.oceanParameters.Spr1, this.numWaves);

    this.updateHTMLGidget();
  }

}