import * as THREE from 'three';
import { Vector3 } from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import {OceanVertShader, OceanFragShader} from '/OBSEA/Ocean/OceanShader.js';
import { createWaveParamsImageData } from '/OBSEA/Ocean/OceanParams.js';

class OceanEntity {

  isLoaded = false;

  time = 0;
  tangent = new THREE.Vector3();
  binormal = new THREE.Vector3();
  normal = new THREE.Vector3();

  direction = new THREE.Vector2();

  tempVec3 = new THREE.Vector3();
  tempVec2 = new THREE.Vector2();
  
  // Constructor
  constructor(scene){

    // Creates a texture that has parameters for generating waves. It includes wave height, direction X, direction Z, and steepness (RGBA).
    // let paramsCanvas = createWaveParamsTexture();
    // let paramsTexture = new THREE.TextureLoader().load(paramsCanvas.toDataURL());
    // paramsTexture.magFilter = THREE.NearestFilter;
    // paramsTexture.minFilter = THREE.NearestFilter;
    //console.log(paramsTexture);
    // sqrt(Number of waves)
    // Creates a texture that has parameters for generating waves. It includes wave height, direction X, direction Z, and steepness (RGBA).
    // TODO: instead of getting image data, I think I could use directly floats to create THREE.DataTexture.
    let imgSize = 5;
    let numWaves = imgSize * imgSize;
    let paramsData = createWaveParamsImageData(imgSize);
    let paramsTexture = new THREE.DataTexture(paramsData, imgSize, imgSize, THREE.RGBAFormat, THREE.UnsignedByteType);
    paramsTexture.magFilter = THREE.NearestFilter;
    paramsTexture.needsUpdate = true;
    

    // Load ocean mesh
    let gltfLoader = new GLTFLoader();
    gltfLoader.load('/OBSEA/Assets/Terrain/OceanSurface.glb', (gltf) => {

      // Keep HR tile and hide the other two
      this.oceanHRTile = gltf.scene.children[0];
      this.oceanLRTile = gltf.scene.children[1];
      //gltf.scene.children[1].visible = false;
      //gltf.scene.children[2].visible = false;

      
      // Define material and shaders
      let oceanMaterial = new THREE.ShaderMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        // lights: true, // https://github.com/mrdoob/three.js/issues/16656
        uniforms: {
          u_time: { value: this.time },
          u_paramsTexture: {value: paramsTexture},
          u_imgSize: {value: new THREE.Vector2(imgSize, imgSize)},
          // u_steepness: { value: 0.5 },
          // u_wavelength: { value: 7.0 },
          // u_direction: { value: new THREE.Vector2(1, 0) },
          u_wave1Params: { value: new THREE.Vector4(0.5, 7.0, 1.0, 0.0) }, // steepness, waveHeight, directionx, directiony
          u_wave2Params: { value: new THREE.Vector4(0.25, 3.0, 1.0, 1.0) }, // steepness, waveHeight, directionx, directiony
          u_wave3Params: { value: new THREE.Vector4(0.25, 3.0, 1.0, 1.0) }, // steepness, waveHeight, directionx, directiony
        },
        vertexShader: OceanVertShader,
        fragmentShader: OceanFragShader,
      });



      oceanMaterial.side = THREE.DoubleSide;
      this.oceanHRTile.material = oceanMaterial;
      this.oceanLRTile.material = oceanMaterial;

      // Scene direction fix
      const angleFix = 90;

      gltf.scene.rotation.y = angleFix * Math.PI / 180;
      gltf.scene.translateY(-0.001);


      scene.add(gltf.scene);

      this.isLoaded = true;

    });

  }





  // Find normal at 0,0 using Gerstner equation
  getGerstnerPosition = function(params, position, tangent, binormal) { // position is needed if we decide to use xz movements
    let steepness = params[0];
    let amplitude = params[1] / 2.0;
    let wavelength = steepness * 2.0 * Math.PI / amplitude;
    this.direction.set(-params[3], params[2]);
    let direction = this.direction;//new THREE.Vector2(-params[3], params[2]);
    //let direction = new THREE.Vector2(params[2], params[3]);

    let k = 2.0 * Math.PI / wavelength;
    let velocity = 0.35 * Math.sqrt(9.8 / k);

    direction = direction.normalize();
    let f = k * direction.dot(this.tempVec2.set(position.x, position.z)) - velocity * this.time; // assume that we are always at x 0 and z 0 // float f = k * (dot(direction, position.xz) - velocity * u_time);

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




  getGestnerNormal = function(position, params1, params2, params3) {
    
    this.tangent.set(1,0,0);
    let tangent = this.tangent;
    this.binormal.set(0,0,1);
    let binormal = this.binormal;

    position.add(this.getGerstnerPosition(params1, position, tangent, binormal));
    position.add(this.getGerstnerPosition(params2, position, tangent, binormal));
    position.add(this.getGerstnerPosition(params3, position, tangent, binormal));

    let normal = this.normal;
    normal.crossVectors(binormal, tangent);
    normal.normalize();
    return normal;
  }



  getNormalAndPositionAt = function(position, normal){

    let calcNormal = this.getGestnerNormal(position, 
      this.getWaveParametersHTML("1"), 
      this.getWaveParametersHTML("2"), 
      this.getWaveParametersHTML("3"));

    normal.set(calcNormal.x, calcNormal.y, calcNormal.z);

  }




getWaveParametersHTML = function(id) {
  // Get wave height from slider
  let el = document.getElementById("sliderWaveHeight" + id);
  let waveHeight = parseFloat(el.value);
  el = document.getElementById("infoWaveHeight" + id);
  el.innerHTML = waveHeight + " m";

  // Get wind direction from slider
  el = document.getElementById("sliderSwellDirection" + id);
  let swellDir = parseFloat(el.value);
  el = document.getElementById("infoSwellDirection" + id);
  el.innerHTML = swellDir + " degrees";

  // Direction correction
  swellDir = -swellDir - 90;
  let dirZ = Math.cos(swellDir * Math.PI / 180);
  let dirX = Math.sin(swellDir * Math.PI / 180);

  // Get steepness from slider
  el = document.getElementById("sliderWaveSteepness" + id);
  let steepness = parseFloat(el.value);
  el = document.getElementById("infoWaveSteepness" + id);
  el.innerHTML = steepness + " steep";


  return [steepness, waveHeight, dirX, dirZ];
}








  // Update
  update(dt){
    this.time += dt;

    // Update shader parameters
    if (this.oceanHRTile != undefined) {
      let oceanHRTile = this.oceanHRTile;
      oceanHRTile.material.uniforms.u_time.value = this.time; // dt
      this.oceanLRTile.material.uniforms.u_time.value = this.time; // dt

      let params1 = this.getWaveParametersHTML("1");
      //params[0] = 0.5; // custom steepness
      oceanHRTile.material.uniforms.u_wave1Params.value.set(...params1);
      this.oceanLRTile.material.uniforms.u_wave1Params.value.set(...params1);

      let params2 = this.getWaveParametersHTML("2");
      //params[0] = 0.25; // custom steepness
      oceanHRTile.material.uniforms.u_wave2Params.value.set(...params2);
      this.oceanLRTile.material.uniforms.u_wave2Params.value.set(...params2);

      let params3 = this.getWaveParametersHTML("3");
      //params[0] = 0.2; // custom steepness
      oceanHRTile.material.uniforms.u_wave3Params.value.set(...params3);
      this.oceanLRTile.material.uniforms.u_wave3Params.value.set(...params3);

      oceanHRTile.material.uniforms.u_time.uniformsNeedUpdate = true;
      this.oceanLRTile.material.uniforms.u_time.uniformsNeedUpdate = true;
    }
  }

}

export { OceanEntity }