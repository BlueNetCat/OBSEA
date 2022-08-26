import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class SkyboxEntity {

  constructor(scene){
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/OBSEA/Assets/Skybox/skybox.glb', (gltf) => { // '../Assets/Skybox/skybox.glb'
      // GLTF scene
      const root = gltf.scene;
      // Scale
      root.scale.multiplyScalar(9.5);
      // Scene direction fix
      const angleFix = 90;
      root.rotation.y = angleFix * Math.PI / 180;
      root.position.y = -1;

      scene.add(root);
    });

    scene.background = new THREE.Color(0x47A0B9);

  }
  
}

export {SkyboxEntity}