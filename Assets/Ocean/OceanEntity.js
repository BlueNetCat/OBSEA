import * as THREE from 'three';
import { Vector3 } from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import {OceanVertShader, OceanFragShader} from '/OBSEA/Assets/Ocean/OceanShader.js';
import { OceanParameters } from '/OBSEA/Assets/Ocean/OceanParams.js';

class OceanEntity {

  isLoaded = false;

  time = 0;
  tangent = new THREE.Vector3();
  binormal = new THREE.Vector3();
  normal = new THREE.Vector3();

  direction = new THREE.Vector2();

  tempVec3 = new THREE.Vector3();
  tempVec2 = new THREE.Vector2();

  // LOD - Ocean resolutions
  oceanLOD = {'HR': undefined,'MR': undefined, 'LR': undefined, 'LLR': undefined};

  customWaveParameters = [];
  oceanSteepness;

  // Swell parameters
  swellParameters = [
    { Hm0: 0.1, Mdir: 0, Steepness: 0.1 },
    { Hm0: 0.2, Mdir: 129, Steepness: 0.05 },
    { Hm0: 0.05, Mdir: 264, Steepness: 0.1 }
  ]

//   0.1, 0.1, 1.0, 0.0)
// }, // steepness, waveHeight, directionx, directionz
// u_wave2Params: { value: new THREE.Vector4(0.05, 0.2, 0.5, 1.0) }, // steepness, waveHeight, directionx, directionz
// u_wave3Params: {
//   value: new THREE.Vector4(0.1, 0.15, 1.0, 1.0)

  
  // Constructor
  constructor(scene){

    // Creates a texture that has parameters for generating waves. It includes wave steepness, height, direction X, and direction Z (RGBA).
    let imgSize = 4;
    this.imgSize = imgSize;
    this.oceanParams = new OceanParameters({}, imgSize);
    let paramsData = this.oceanParams.getWaveParamsImageData();//createWaveParamsImageData({}, imgSize);
    let paramsTexture = new THREE.DataTexture(paramsData, imgSize, imgSize, THREE.RGBAFormat, THREE.UnsignedByteType);
    paramsTexture.magFilter = THREE.NearestFilter;
    paramsTexture.needsUpdate = true;

    // Load normal texture for smaller waves that the geometry cannot capture
    // let normalTexture = new THREE.TextureLoader().load('/OBSEA/Assets/Terrain/OceanNormal.png');
    // normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;

    // Create video texture
    // https://blenderartists.org/t/animated-water-normal-map-tileable-looped/673140
    // https://threejs.org/examples/?q=video#webgl_materials_video
    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_video.html
    let videoEl = document.createElement("video");
    videoEl.loop = true; videoEl.crossOrigin = 'anonymous'; videoEl.playsInline = true; videoEl.muted = "muted";
    videoEl.src = '/OBSEA/Assets/Terrain/OceanNormal.mp4';
    videoEl.play();
    let normalTexture = new THREE.VideoTexture(videoEl);
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.encoding = THREE.linearEncoding; // Normal maps should not have a color correction https://threejs.org/docs/#manual/en/introduction/Color-management
    // document.body.append(videoEl);
    // videoEl.style.position = 'absolute';
    // videoEl.style.top = '0px';
    // videoEl.style.left = '0px';
    // <video id="video" loop crossOrigin="anonymous" playsinline style="display:none">
		// 	<source src="textures/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
		// 	<source src="textures/sintel.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
		// </video>

    

    // Load ocean mesh
    let gltfLoader = new GLTFLoader();

    gltfLoader.load('/OBSEA/Assets/Terrain/OceanSurfaceLR.glb', (gltf) => {

      // Define material and shaders
      let oceanMaterial = new THREE.ShaderMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        // lights: true, // https://github.com/mrdoob/three.js/issues/16656
        uniforms: {
          u_time: { value: this.time },
          u_fogUnderwaterColor: { value: new THREE.Vector3(scene.fog.color.r, scene.fog.color.g, scene.fog.color.b)},
          u_fogDensity: {value: scene.fog.density},
          u_paramsTexture: {value: paramsTexture},
          u_imgSize: {value: new THREE.Vector2(imgSize, imgSize)},
          u_steepnessFactor: { value: 0.2 },
          // u_wavelength: { value: 7.0 },
          // u_direction: { value: new THREE.Vector2(1, 0) },
          u_wave1Params: { value: new THREE.Vector4(0.1, 0.1, 0.0, 1.0) }, // steepness, waveHeight, directionx, directionz
          u_wave2Params: { value: new THREE.Vector4(0.05, 0.2, 0.5, 1.0) }, // steepness, waveHeight, directionx, directionz
          u_wave3Params: { value: new THREE.Vector4(0.1, 0.05, 1.0, 1.0) }, // steepness, waveHeight, directionx, directionz
          u_normalTexture: {value: normalTexture}, // TODO: WHAT IF THE TEXTURE TAKES TOO LONG TO LOAD?
        },
        vertexShader: OceanVertShader,
        fragmentShader: OceanFragShader,
      });
      oceanMaterial.side = THREE.DoubleSide;


      // Store the version
      this.oceanLOD.LR = gltf.scene.children[0];
      // Assign current version to oceanTile
      this.oceanTile = gltf.scene.children[0];
      this.oceanTile.material = oceanMaterial;


      // Scene fix
      gltf.scene.translateY(-0.001);

      scene.add(gltf.scene);
      let lowResScene = gltf.scene;

      // Redefine loading events of the gltf loader, so the mid- and high-res surfaces are not taken into account
      const manager = new THREE.LoadingManager();
      manager.onStart = () => {};
      manager.onProgress = () => {};
      manager.onLoad = () => {};
      gltfLoader = new GLTFLoader(manager);

      // LEVEL OF DETAIL INCREASE WHEN HIGHER RESOLUTIONS ARE LOADED
      // Load next resolution and add
      gltfLoader.load('/OBSEA/Assets/Terrain/OceanSurfaceMR.glb', (gltf) => {
        // Store the version
        this.oceanLOD.MR = gltf.scene.children[0];
        this.oceanTile = gltf.scene.children[0];
        this.oceanTile.material = oceanMaterial;
        // Scene fix
        gltf.scene.translateY(-0.001);
        // Remove previous version and add new
        scene.remove(this.oceanLOD.LR.parent);
        scene.add(gltf.scene);
        let midResScene = gltf.scene;
        // Load next resolution and add
        gltfLoader.load('/OBSEA/Assets/Terrain/OceanSurfaceHR.glb', (gltf) => {
          this.oceanLOD.HR = gltf.scene.children[0];
          this.oceanTile = gltf.scene.children[0];
          this.oceanTile.material = oceanMaterial;
          // Scene fix
          gltf.scene.translateY(-0.001);
          // Remove previous version and add new
          scene.remove(this.oceanLOD.MR.parent);
          scene.add(gltf.scene);
        });
      });


      this.isLoaded = true;

    });


    // USER ACTIONS
    // let el = document.getElementById("randomWaveHeights");
    // el.addEventListener("click", () => {
    //   this.oceanParams.randomizeWaveHeightDistribution();
    //   let paramsData = this.oceanParams.getWaveParamsImageData();
    //   let paramsTexture = new THREE.DataTexture(paramsData, this.imgSize, this.imgSize, THREE.RGBAFormat, THREE.UnsignedByteType);
    //   paramsTexture.magFilter = THREE.NearestFilter;
    //   paramsTexture.needsUpdate = true;
    //   // Update uniforms
    //   this.oceanTile.material.uniforms.u_paramsTexture.value = paramsTexture;
    //   //this.oceanLRTile.material.uniforms.u_paramsTexture.value = paramsTexture;
    // });
    // el = document.getElementById("randomWaveDirs");
    // el.addEventListener("click", () => {
    //   this.oceanParams.randomizeWaveDirectionDistribution();
    //   let paramsData = this.oceanParams.getWaveParamsImageData();
    //   let paramsTexture = new THREE.DataTexture(paramsData, imgSize, imgSize, THREE.RGBAFormat, THREE.UnsignedByteType);
    //   paramsTexture.magFilter = THREE.NearestFilter;
    //   paramsTexture.needsUpdate = true;
    //   // Update uniforms
    //   this.oceanTile.material.uniforms.u_paramsTexture.value = paramsTexture;
    //   //this.oceanLRTile.material.uniforms.u_paramsTexture.value = paramsTexture;
    // });


    // USER GUI
    this.customWaveParameters[0] = this.getWaveParametersHTML("1");
    this.customWaveParameters[1] = this.getWaveParametersHTML("2");
    this.customWaveParameters[2] = this.getWaveParametersHTML("3");
    this.oceanSteepness = this.getOceanParameters();
    
  }

  






  // USER INPUT 
  // Steepness range slider
  updateSteepness = function(steepness){
    if (this.oceanTile)
      this.oceanTile.material.uniforms.u_steepnessFactor.value = steepness;
  }
  updateSwell = function(varName, value, index){
    if (!this.oceanTile)
      return;
    if (varName == 'height'){
      this.swellParameters[index].Hm0 = value;
      this.oceanTile.material.uniforms.u_wave1Params.value.y = value;// steepness, waveHeight, directionx, directionz
    } else if (varName == 'direction'){
      this.swellParameters[index].Mdir = value;
      value += 90;
      let dirX = Math.cos(value * Math.PI / 180);
      let dirZ = Math.sin(value * Math.PI / 180);
      this.oceanTile.material.uniforms.u_wave1Params.value.z = dirX;
      this.oceanTile.material.uniforms.u_wave1Params.value.w = dirZ;
    } else if (varName == 'steepness'){
      this.swellParameters[index].Steepness = value;
      this.oceanTile.material.uniforms.u_wave1Params.value.x = value;
    }
  }
  // Update wave significant height
  updateWaveSignificantHeight = function(waveSignificantHeight){
    this.oceanParams.updateWaveSignificantHeight(waveSignificantHeight);
    this.updateParamsTexture();
  }
  // Update mean wave direction
  updateMeanWaveDirection = function(mdir){
    this.oceanParams.updateMeanWaveDirection(mdir);
    this.updateParamsTexture();
  }
  // Update wave directional spread
  updateDirectionalSpread = function(spr1){
    this.oceanParams.updateDirectionalSpread(spr1);
    this.updateParamsTexture();
  }

  // Update ocean parameters
  updateOceanParameters = function(params){
    this.oceanParams.updateParams(params);
    this.updateParamsTexture();
  }

  updateParamsTexture() {
    if (!this.oceanTile)
      return;
    let paramsData = this.oceanParams.getWaveParamsImageData();
    let paramsTexture = new THREE.DataTexture(paramsData, this.imgSize, this.imgSize, THREE.RGBAFormat, THREE.UnsignedByteType);
    paramsTexture.magFilter = THREE.NearestFilter;
    paramsTexture.needsUpdate = true;
    // Update uniforms
    this.oceanTile.material.uniforms.u_paramsTexture.value = paramsTexture;
  }











  // Find normal at 0,0 using Gerstner equation
  getGerstnerPosition = function(params, position, tangent, binormal) { // position is needed if we decide to use xz movements
    let steepness = params.Steepness;
    let amplitude = params.Hm0 / 2.0;
    let dir = params.Mdir;
    
    // Calculate direction
    dir += 90;
    let dirX = Math.cos(dir * Math.PI / 180);
    let dirZ = Math.sin(dir * Math.PI / 180);
    let direction = this.direction.set(dirX, dirZ);
    // this.oceanTile.material.uniforms.u_wave1Params.value.z = dirX;
    // this.oceanTile.material.uniforms.u_wave1Params.value.w = dirZ;

    let wavelength = amplitude * 2.0 * Math.PI / steepness;
    // this.direction.set(-params[3], params[2]);
    // let direction = this.direction;//new THREE.Vector2(-params[3], params[2]);

    let k = 2.0 * Math.PI / wavelength;
    let velocity = Math.sqrt(9.8 / k);

    direction = direction.normalize();
    let f = k * (direction.dot(this.tempVec2.set(position.x, position.z)) - velocity * this.time); // assume that we are always at x 0 and z 0 // float f = k * (dot(direction, position.xz) - velocity * u_time);

    this.tempVec3.set(
      -direction.x * direction.x * steepness * Math.sin(f),
      direction.x * steepness * Math.cos(f),
      -direction.x * direction.y * steepness * Math.sin(f)
    );
    tangent.add(this.tempVec3);

    this.tempVec3.set(
      -direction.x * direction.y * (steepness * Math.sin(f)),
      direction.y * (steepness * Math.cos(f)),
      -direction.y * direction.y * (steepness * Math.sin(f))
    );
    binormal.add(this.tempVec3);

    return this.tempVec3.set(
      direction.x * (amplitude * Math.cos(f)),
      amplitude * Math.sin(f),
      direction.y * (amplitude * Math.cos(f)))
  }




  getGerstnerNormal = function(position, params1, params2, params3) {
    
    this.tangent.set(1,0,0);
    let tangent = this.tangent;
    this.binormal.set(0,0,1);
    let binormal = this.binormal;

    this.tempVec3.copy(position);
    position.add(this.getGerstnerPosition(params1, this.tempVec3, tangent, binormal));
    position.add(this.getGerstnerPosition(params2, this.tempVec3, tangent, binormal));
    position.add(this.getGerstnerPosition(params3, this.tempVec3, tangent, binormal));

    let normal = this.normal;
    normal.crossVectors(binormal, tangent);
    normal.normalize();
    return normal;
  }



  getNormalAndPositionAt = function(position, normal){

    let calcNormal = this.getGerstnerNormal(position, 
      this.swellParameters[0], 
      this.swellParameters[1], 
      this.swellParameters[2]);

    normal.set(calcNormal.x, calcNormal.y, calcNormal.z);

  }



// TODO: improve the HTML interface and javascript architecture
getWaveParametersHTML = function(id) {
  // // Get wave height from slider
  // let el = document.getElementById("sliderWaveHeight" + id);
  // el.addEventListener("change", (ee) => {
  //   let waveHeight = parseFloat(ee.target.value);
  //   this.customWaveParameters[parseInt(id) - 1][1] = parseFloat(ee.target.value);
  //   // Info
  //   let el = document.getElementById("infoWaveHeight" + id);
  //   el.innerHTML = waveHeight + " m";

  // });
  // let waveHeight = parseFloat(el.value);
  // el = document.getElementById("infoWaveHeight" + id);
  // el.innerHTML = waveHeight + " m";


  // // Get wind direction from slider
  // el = document.getElementById("sliderSwellDirection" + id);
  // el.addEventListener("change", (ee) => {
  //   let swellDir = parseFloat(ee.target.value);
  //   swellDir = -swellDir - 90;
  //   let dirZ = Math.cos(swellDir * Math.PI / 180);
  //   let dirX = Math.sin(swellDir * Math.PI / 180);
  //   this.customWaveParameters[parseInt(id) - 1][2] = dirX;
  //   this.customWaveParameters[parseInt(id) - 1][3] = dirZ;
  //   // Info
  //   let el = document.getElementById("infoSwellDirection" + id);
  //   el.innerHTML = parseFloat(ee.target.value) + " degrees";
  // });
  // let swellDir = parseFloat(el.value);
  // el = document.getElementById("infoSwellDirection" + id);
  // el.innerHTML = swellDir + " degrees";
  

  // // Direction correction
  // swellDir = -swellDir - 90;
  // let dirZ = Math.cos(swellDir * Math.PI / 180);
  // let dirX = Math.sin(swellDir * Math.PI / 180);


  // // Get steepness from slider
  // el = document.getElementById("sliderWaveSteepness" + id);
  // let steepness = parseFloat(el.value);
  // el.addEventListener("change", (ee) => {
  //   let steepness = parseFloat(ee.target.value);
  //   this.customWaveParameters[parseInt(id) - 1][0] = steepness;
  //   // Info
  //   let el = document.getElementById("infoWaveSteepness" + id);
  //   el.innerHTML = steepness + " steep";
  // });
  // el = document.getElementById("infoWaveSteepness" + id);
  // el.innerHTML = steepness + " steep";
  


  // return [steepness, waveHeight, dirX, dirZ];
}



getOceanParameters = function(){
{/* <input id="seaSteepness" type="range" max="1" min="0" value="1" step="0.01" /> */}
    // <div id="infoSeaSteepness"></div>
  // Get sea steepness factor slider
  // let el = document.getElementById("sliderOceanSteepness");
  // el.addEventListener("change", (ee) =>{
  //   let steepFactor = parseFloat(ee.target.value);
  //   this.oceanSteepness = steepFactor;
  //   let el = document.getElementById("infoSeaSteepness");
  //   el.innerHTML = steepFactor;
  // })
  // let steepFactor = parseFloat(el.value);
  // el = document.getElementById("infoSeaSteepness");
  // el.innerHTML = steepFactor;

  // return steepFactor;
}








  // Update
  update(dt){
    this.time += dt*1.2;

    // Update shader parameters
    if (this.oceanTile != undefined) {
      let oceanTile = this.oceanTile;
      oceanTile.material.uniforms.u_time.value = this.time; // dt

      // let oceanSteepness = this.oceanSteepness;
      // oceanTile.material.uniforms.u_steepnessFactor.value = oceanSteepness;

      // let params1 = this.customWaveParameters[0];
      // oceanTile.material.uniforms.u_wave1Params.value.set(...params1);

      // let params2 = this.customWaveParameters[1];
      // oceanTile.material.uniforms.u_wave2Params.value.set(...params2);

      // let params3 = this.customWaveParameters[2];
      // oceanTile.material.uniforms.u_wave3Params.value.set(...params3);

      oceanTile.material.uniforms.u_time.uniformsNeedUpdate = true;
    }
  }

}

export { OceanEntity }