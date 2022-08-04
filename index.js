import * as THREE from 'three';
import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://threejs.org/examples/jsm/loaders/FBXLoader.js'
import { RosaVentsEntity } from '/OBSEA/Assets/Orientation/RosaVentsEntity.js';
import { SandEntity } from '/OBSEA/Assets/Terrain/SandEntity.js';
import { SkyboxEntity } from '/OBSEA/Assets/Skybox/SkyboxEntity.js';

import * as FogShader from '/OBSEA/Assets/Terrain/FogShader.js'
import { OceanEntity } from '/OBSEA/Ocean/OceanEntity.js';
import { OBSEABuoyEntity } from '/OBSEA/Assets/OBSEABuoy/OBSEABuoyEntity.js';
import { OBSEAStationEntity } from '/OBSEA/Assets/OBSEAStation/ObseaStationEntity.js';
import { WindsockEntity } from '/OBSEA/Assets/Windsock/WindsockEntity.js';
import { CurrentEntity } from '/OBSEA/3Dcurrent/CurrentEntity.js';
// import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';


let stats;


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
  
  // CAMERA CONTROLS
  const controls = new OrbitControls(camera, canvas);
  // TODO: limit orbit controls
  // Surface
  camera.position.set(15, 10, 15);
  controls.target.set(0, 1, 0);
  // OBSEA base
  // camera.position.set(3, -16, 3);
  // controls.target.set(0,-19, 0);

  
  controls.update();
  controls.enableDamping = true;
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 1;


  // STATS
  stats = new Stats();
  document.body.appendChild(stats.dom);
  stats.dom.style.right = '0px';
  stats.dom.style.left = null;


  // USER INTERACTION
  // Focus on buoy or base
  let focusOnBase = document.getElementById("focusOnBase");
  if (focusOnBase){
    focusOnBase.addEventListener("click", ()=>{
      camera.position.set(5, -16, 5);
      controls.target.set(0, -19, 0);
    });
  }
  let focusOnBuoy = document.getElementById("focusOnBuoy");
  if (focusOnBuoy) {
    focusOnBuoy.addEventListener("click", () => {
      camera.position.set(15, 10, 15);
      controls.target.set(0, 1, 0);
    });
  }

  // Click on object
  // TODO: https://www.youtube.com/watch?v=VwSRizyr1pI&ab_channel=LateNightCoders


  


  // SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x47A0B9);
  // Fog
  scene.fog = new THREE.FogExp2(new THREE.Color(0x47A0B9), 0.02);
  // Fog only below water
  THREE.ShaderChunk.fog_fragment = FogShader.fogFrag;
  THREE.ShaderChunk.fog_pars_fragment = FogShader.fogFragParams;
  THREE.ShaderChunk.fog_vertex = FogShader.fogVertex;
  THREE.ShaderChunk.fog_pars_vertex = FogShader.fogVertexParams;

  // Skybox
  let skybox = new SkyboxEntity(scene);
  // Sand
  let sand = new SandEntity(scene);
  // Ocean
  let ocean = new OceanEntity(scene);
  // OBSEA Buoy
  let obseaBuoy = new OBSEABuoyEntity(scene);
  // OBSEA Base
  let obseaBase = new OBSEAStationEntity(scene);

  // Windsock
  let windsock = new WindsockEntity(scene, ()=>{
    windsock.root.position.y = 1;
    windsock.root.scale.addScalar(2);
  });

  // Rosa dels vents
  let rosaVents = new RosaVentsEntity(scene);
  rosaVents.root.position.y = 7;


  let currents = new CurrentEntity(scene);


  



  // DRAG AND DROP
  document.body.addEventListener('drop', (e) => {
    // Prevent default behavior (Prevent file from being opened)
    e.preventDefault();
    e.stopPropagation();

    var files = e.dataTransfer.files;
    if (files.length > 1)
      console.log("Multiple files dragged. Reading the first .csv only.");

    // Load files
    var count = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      let extension = file.name.substring(file.name.length - 3);
      if (extension != "csv") {
        console.error("Only csv files accepted. Format found: " + extension);
        continue;
      }
      console.log("File droped: " + file.name);

      var reader = new FileReader();
      reader.fname = file.name;
      // Load files
      reader.onload = (e) => {
        // Read csv
        let rawSS = e.target.result;
        let rowsSS = rawSS.split("\n");
        for (let i = 0; i < rowsSS.length; i++) {
          rowsSS[i] = rowsSS[i].split(",");
        }

        // Process csv file
        // Create HTML slider on the bottom
        let slider = document.createElement("input");
        slider.type = "range";
        slider.max = rowsSS.length - 2; // Last row is empty
        slider.min = 1;
        slider.step = 1;
        slider.value = 1;

        slider.onchange = (e) => {
          let index = parseInt(e.target.value);
          let header = rowsSS[0];
          let data = rowsSS[index];
          // Parse parameters from csv
          let params = {};
          params[header[0]] = data[0].substring(0, data[0].length - 3) + 'h'; // timestamp
          for (let i = 1; i < header.length; i++){
            params[header[i]] = parseFloat(data[i]);
          }
          // Modify ocean parameters
          ocean.updateOceanParameters(params);
        }
        slider.style.position = "absolute";
        slider.style.bottom = "10%";
        slider.style.width = "80%";
        slider.style.left = "10%";
        slider.style.right = "10%";
        document.body.appendChild(slider);

        // <input id="sliderWaveHeight1" type="range" max="6" min="0.1" value="0.6" step="0.1" />

      }
      reader.readAsText(file);
    }
  });
  document.body.addEventListener('dragover', (event) => {
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();
  });

  


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





  function update(time){

    stats.update();
    

    // Ocean updates
    if (ocean){
      if (ocean.isLoaded){
        ocean.update(0.016);

        // Change buoy position
        if (obseaBuoy !== undefined) {
          if (obseaBuoy.isLoaded) {
            // Get y position and normal of the wave on that point
            let position = new THREE.Vector3();
            let normal = new THREE.Vector3();
            ocean.getNormalAndPositionAt(position, normal);

            // Exponential Moving Average (EMA) for position
            let coef = 0.98;
            obseaBuoy.root.position.x = obseaBuoy.root.position.x * coef + (1 - coef) * position.x;
            obseaBuoy.root.position.y = obseaBuoy.root.position.y * coef + (1 - coef) * position.y;
            obseaBuoy.root.position.z = obseaBuoy.root.position.z * coef + (1 - coef) * position.z;

            // EMA for rotation
            normal.applyAxisAngle(new THREE.Vector3(1, 0, 0), 90 * Math.PI / 180)
            let tempQuat = new THREE.Quaternion();
            tempQuat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal.normalize());
            tempQuat.normalize();
            //buoy.quaternion.set(...tempQuat);
            obseaBuoy.root.quaternion.slerp(tempQuat, 0.002);
          }

        }

      }
    }

    // Windsock updates
    if (windsock){
      if (windsock.isLoaded){
        windsock.update(time);

        // Get wind intensity from slider
        let el = document.getElementById("sliderWindIntensity");
        let windInt = parseFloat(el.value);
        el = document.getElementById("infoWindIntensity");
        el.innerHTML = windInt + " km/h";

        // Get wind direction from slider
        el = document.getElementById("sliderWindDir");
        let windDir = parseFloat(el.value);
        el = document.getElementById("infoWindDir");
        el.innerHTML = windDir + " degrees";

        windsock.setWindParams(windInt, windDir);

      }
    }

    // Current
    if (currents){
      if (currents.isLoaded){
        currents.update(0.016);
      }
    }
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

  function render(time) {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    update(time);

    renderer.render(scene, camera);

    controls.update();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
