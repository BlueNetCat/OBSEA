import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
//import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://threejs.org/examples/jsm/loaders/FBXLoader.js'
import { OceanEntity } from './OceanEntity.js';
import { SandEntity } from '../Assets/Terrain/SandEntity.js';
import * as FogShader from '../Assets/Terrain/FogShader.js'
import { OBSEAStationEntity } from '../Assets/OBSEAStation/ObseaStationEntity.js';
import { OBSEABuoyEntity } from '../Assets/OBSEABuoy/OBSEABuoyEntity.js';
import { SkyboxEntity } from '../Assets/Skybox/SkyboxEntity.js';
import { RosaVentsEntity } from '../Assets/Orientation/RosaVentsEntity.js';
// import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';


/* OCEAN
https://threejs.org/examples/webgl_shaders_ocean.html
https://29a.ch/slides/2012/webglwater/
https://29a.ch/sandbox/2012/terrain/
https://www.tamats.com/work/bwr/
https://madebyevan.com/webgl-water/
https://www.youtube.com/watch?v=kGEqaX4Y4bQ&ab_channel=JumpTrajectory
https://doc.babylonjs.com/advanced_topics/webGPU/computeShader
https://playground.babylonjs.com/?webgpu#YX6IB8#55
http://david.li/waves/
https://www.shadertoy.com/view/4dBcRD#
https://www.shadertoy.com/view/Xdlczl

sky shader
https://threejs.org/examples/?q=sky#webgl_shaders_sky


TODO:
- Decide about multiresolution plane
- Implement ocean shader
- Buoy movement based on the equations

- Fix fog above/below surface
- Skybox
  - Future: linked to real sun position


*/


function main() {
  // Cache
  THREE.Cache.enabled = false;

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 2000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  

  const controls = new OrbitControls(camera, canvas);
  // TODO: limit orbit controls
  // Surface
  camera.position.set(5, 3, 5);
  controls.target.set(0, 1, 0);
  // OBSEA base
  // camera.position.set(3, -16, 3);
  // controls.target.set(0,-19, 0);

  
  controls.update();

  const scene = new THREE.Scene();
  let time = 0;




  // Skybox
  let skybox = new SkyboxEntity(scene);
  
  // Fog
  scene.fog = new THREE.FogExp2(new THREE.Color(0x47A0B9), 0.02);

  THREE.ShaderChunk.fog_fragment = FogShader.fogFrag;
  THREE.ShaderChunk.fog_pars_fragment = FogShader.fogFragParams;
  THREE.ShaderChunk.fog_vertex = FogShader.fogVertex;
  THREE.ShaderChunk.fog_pars_vertex = FogShader.fogVertexParams;


  // OCEAN (loads and adds ocean to the scene)
  let oceanEntity = new OceanEntity(scene);
 
  // Sand
  let sandEntity = new SandEntity(scene);

  // OBSEA Station
  let obseaSt = new OBSEAStationEntity(scene);

  // OBSEA Buoy
  let buoyEntity = new OBSEABuoyEntity(scene);

  // Rosa dels Vents
  let rosaVents = new RosaVentsEntity(scene);

  


  { // LIGHT
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0x2090b9;  // blue
    const intensity = 0.6;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  { // LIGHT
    const color = 0xFFFFFF;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }


  







  // Print scene outline
  function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
  }




  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }



  function getWaveParametersHTML(id){
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

    let dirZ = Math.cos(swellDir * Math.PI / 180);
    let dirX = Math.sin(swellDir * Math.PI / 180);

    // Get steepness from slider
    el = document.getElementById("sliderWaveSteepness" + id);
    let steepness  = parseFloat(el.value);
    el = document.getElementById("infoWaveSteepness" + id);
    el.innerHTML = steepness + " steep";


    return [steepness, waveHeight, dirX, dirZ];
  }


  function update(){
    time += 0.016;

    // Update
    //if (oceanHRTile != undefined) {
    if (oceanEntity != undefined) {
      oceanEntity.update(0.016);      

      
      // Change buoy position
      if (buoyEntity !== undefined){
        if (buoyEntity.isLoaded){
          // Get y position and normal of the wave on that point
          let position = new THREE.Vector3();
          let normal = new THREE.Vector3();
          oceanEntity.getNormalAndPositionAt(position, normal);

          // Exponential Moving Average (EMA) for position
          let coef = 0.98;
          buoyEntity.root.position.x = buoyEntity.root.position.x * coef + (1 - coef)*position.x;
          buoyEntity.root.position.y = buoyEntity.root.position.y * coef + (1 - coef) *position.y;
          buoyEntity.root.position.z = buoyEntity.root.position.z * coef + (1 - coef) *position.z;

          // EMA for rotation
          normal.applyAxisAngle(new THREE.Vector3(1, 0, 0), 90 * Math.PI / 180)
          let tempQuat = new THREE.Quaternion();
          tempQuat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal.normalize());
          tempQuat.normalize();
          //buoy.quaternion.set(...tempQuat);
          buoyEntity.root.quaternion.slerp(tempQuat, 0.002);
        }
        
      }
      
    }
  }



  // UPDATE LOOP
  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    update();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
