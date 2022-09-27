import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { RosaVentsEntity } from '/OBSEA/Assets/Orientation/RosaVentsEntity.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(10, 10, 20);

  const controls = new OrbitControls(camera, canvas);
  // TODO: limit orbit controls
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  
  
  let rosaVents = new RosaVentsEntity(null, scene);

  // BOTTOM PLANE
  {
    const pBottomSize = 5;
    const loader = new THREE.TextureLoader();
    const bottTexture = loader.load('../Assets/Terrain/Bottom.png');
    
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

  { // ARROW OBJECT
    
    const objLoader = new OBJLoader();
    // objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
    objLoader.load('../Assets/Orientation/ArrowX.obj', (root) => {

      // Add material
      const arrowMaterial = new THREE.MeshPhongMaterial({
        color: 0xFF0000,    // red (can also use a CSS color string here)
        flatShading: false,
      });
      root.children[0].material = arrowMaterial;

      //scene.add(root);

      // Sea water velocity data (2022-03-15 16:00:00)
      let cspd = [0.791, 0.880, 0.616, 0.465, 0.475, 0.457, 0.487, 0.456, 0.487, 0.458, 0.465, 0.445, 0.463, 0.422, 0.415];
      let cdir = [247, 241, 238, 240, 248, 248, 246, 248, 248, 248, 248, 250, 253, 249, 249];
      
      // Other arrows
      for (let i = 0; i < cspd.length; i++){
        let arr = root.clone();
        arr.translateY(-i);
        arr.scale.x = cspd[i];
        arr.scale.y = cspd[i];
        arr.scale.z = cspd[i];

        arr.rotation.y = cdir[i] * Math.PI / 180;
        scene.add(arr);
      }
      
      
    });


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

  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
