import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OBSEAStationEntity {
  constructor(url, scene){
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(url, (gltf) => { // '../Assets/OBSEAStation/OBSEAStation.glb'
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;
      root.translateY(-19.4);

      scene.add(root);
    });
  }
}

export { OBSEAStationEntity }