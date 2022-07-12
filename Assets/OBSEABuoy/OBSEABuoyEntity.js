import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OBSEABuoyEntity {

  isLoaded = false;

  constructor(scene){
    // https://www.youtube.com/watch?v=6LA8vEB47Nk&ab_channel=DirkTeucher
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/OBSEA/Assets/OBSEABuoy/OBSEABuoy.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;
      scene.add(root);

      this.root = root;

      // Material AO
      let mesh = root.children[0];
      let material = mesh.material;    

      this.isLoaded = true;

    });
  }
}

export { OBSEABuoyEntity }