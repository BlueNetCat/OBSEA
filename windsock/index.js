import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
//import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { Vector3 } from 'three';
import { SockSection, Windsock } from './Windsock.js'

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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  { // TOP PLANE
    const planeSize = 5;

    const loader = new THREE.TextureLoader();
    // const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    const texture = loader.load('../3Dcurrent/NESW.png');
    texture.encoding = THREE.sRGBEncoding;
    //texture.wrapS = THREE.RepeatWrapping;
    //texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter; //THREE.NearestFilter;
    //const repeats = planeSize / 10;
    //texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  // BOTTOM PLANE
  {
    const pBottomSize = 5;
    const loader = new THREE.TextureLoader();
    const bottTexture = loader.load('../3Dcurrent/Bottom.png');
    
    const planeBottom = new THREE.PlaneGeometry(pBottomSize, pBottomSize);
    const pBottMat = new THREE.MeshPhongMaterial({
      map: bottTexture,
      side: THREE.DoubleSide,
      transparent: true
    });
    const pBottMesh = new THREE.Mesh(planeBottom, pBottMat);
    pBottMesh.translateY(-19.4);
    pBottMesh.rotation.x = Math.PI * -.5;
    
    scene.add(pBottMesh);
  }

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


  

  // Wind ragdoll class
  let windsockEntity = undefined;
  let windsockObj = undefined;
  { // WIND SOCK
    const gltfLoader = new GLTFLoader();
    // objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
    gltfLoader.load('windsock.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      windsockObj = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      
      // Create Windsock entity
      windsockEntity = new Windsock(windsockObj, scene);
      
      scene.add(root);

      console.log(dumpObject(root).join('\n'));
    });


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

  function render(time) {

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
    if (windsockEntity != undefined)
      windsockEntity.updateWindSock(windsockObj, windInt, windDir, time);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
