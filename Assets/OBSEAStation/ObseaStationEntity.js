import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OBSEAStationEntity {
  constructor(scene){
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/OBSEA/Assets/OBSEAStation/OBSEAStation.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;

      // Fix specular on the bottom
      let aoBottom = root.getObjectByName('OBSEABottomAO');
      aoBottom.material.roughness = 1;

      // Positioning
      root.translateY(-19.4);
      root.rotation.y = 5 * Math.PI / 180;

      scene.add(root);
    });
  }
}

export { OBSEAStationEntity }