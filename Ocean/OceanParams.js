/*
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


const WAVE_MAX = 15;


// Create wave parameters
// https://en.wikipedia.org/wiki/Significant_wave_height
// https://en.wikipedia.org/wiki/Trochoidal_wave
export const createWaveParamsImageData = function(imgSize){


  // Params
  let hm0 = 1.5; // Hm0_ADCPWaves
  let hOneThird = 2; // avHeightOnethirdADCPWaves
  let hOneTenth = 2.5; // Hsig_upper_10_per_cent

  let meanDir = 95; // MeanDir_ADCPWaves
  let stdDir = 90; // ?


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

  // Generate direction distribution
  let waveDirections = generateGaussianDistribution(meanDir, stdDir, numWaves);

  // Generate steepness distribution
  let waveSteepness = generateGaussianDistribution(0.25, 0.1, numWaves);



  



  // Create a texture
  let canvas = document.createElement("canvas");
  canvas.width = imgSize;
  canvas.height = imgSize;
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  document.body.append(canvas);

  let context = canvas.getContext('2d');
  // Get pixels
  let imageData = context.getImageData(0, 0, imgSize, imgSize);

  // Fill pixels and scale values from 0 to 255
  for (let i = 0; i < numWaves; i++){
    // Wave range
    // let waveHeight = Math.abs(waveHeights[i]);
    // imageData.data[i * 4] = 255 * waveHeight / WAVE_MAX;
    // // Direction range
    // let dirX = Math.cos(waveDirections[i] * Math.PI / 180)
    // imageData.data[i * 4 + 1] = 255 * (dirX + 1) / 2;
    // let dirZ = Math.sin(waveDirections[i] * Math.PI / 180);
    // imageData.data[i * 4 + 2] = 255 * (dirZ + 1) / 2;
    // // Steepness range
    // let waveSteep = Math.abs(waveSteepness[i]);
    // imageData.data[i * 4 + 3] = 255 * waveSteep;
    if (i%2 == 0){
      imageData.data[i * 4] = 255;
      imageData.data[i * 4 + 1] = 0;
      imageData.data[i * 4 + 2] = 255;
      imageData.data[i * 4 + 3] = 255;
    } else{
      imageData.data[i * 4] = 0;
      imageData.data[i * 4 + 1] = 0;
      imageData.data[i * 4 + 2] = 255;
      imageData.data[i * 4 + 3] = 255;
    }
  }

  imageData.data[0] = 255;
  imageData.data[1] = 0;
  imageData.data[2] = 0;
  imageData.data[3] = 255;

  // Put data into the texture
  //context.putImageData(imageData, 0, 0);
  return imageData.data;
  //return canvas;
  //let dataURL = canvas.toDataURL();
}




// Generate Gaussian Distribution
// From uniform noise to normal noise (gaussian)
  // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  // If skew needed, use https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
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