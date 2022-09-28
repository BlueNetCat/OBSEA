import * as THREE from 'three';
import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
//import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { WindsockBehavior } from '../Assets/Windsock/WindsockBehavior.js'
import { RosaVentsEntity } from '../Assets/Orientation/RosaVentsEntity.js';
import { WindsockEntity } from '../Assets/Windsock/WindsockEntity.js';
import { FlagEntity } from '../Assets/Flag/FlagEntity.js';

let stats;

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(3, 3, 0);

  const controls = new OrbitControls(camera, canvas);
  // TODO: limit orbit controls
  controls.target.set(0, 2, 0);
  controls.update();

  // GUI
  //let gui = new GUI();

  // STATS
  stats = new Stats();
  document.body.appendChild(stats.dom);
  stats.dom.style.right = '0px';
  stats.dom.style.left = null;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  // Rosa dels Vents
  let rosaVents = new RosaVentsEntity(scene);


  // Sky light
  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0x2090b9;  // blue
    const intensity = 0.6;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  // Windsock
  let windsock = new WindsockEntity(scene);
  // Flag
  let flag = new FlagEntity(scene, () => {
    flag.root.position.y = -3;
  });






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

  function render(time) {

    stats.update();

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

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

    // Update loop
    if (windsock){
      if (windsock.isLoaded){
        windsock.setWindParams(windInt, windDir);
        windsock.update(time);
      }
    }
    if (flag) {
      if (flag.isLoaded) {
        flag.setWindParams(windInt, windDir);
        flag.update(time);
      }
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
