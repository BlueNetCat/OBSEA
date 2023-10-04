import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OBSEABuoyEntity {

  isLoaded = false;

  constructor(scene, onload){
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

      // Scale by half (probably right size)
      root.scale.multiplyScalar(0.5);
      this.root = root;

      // Material AO
      let mesh = root.children[0];
      let material = mesh.material;    

      this.isLoaded = true;

      if(onload)
        onload();

    });
  }

  setOpacity = (inOpacity) => {
    this.recursiveSetOpacity(inOpacity, this.root.children[0]);
    // this.root.children[0].material.opacity = inOpacity;
    // this.root.children[0].material.transparent = true;
  }

  recursiveSetOpacity = (inOpacity, obj) => {
    obj.material.opacity = inOpacity;
    obj.material.transparent = true;
    if (obj.children.length != 0){
      obj.children.forEach(ch => this.recursiveSetOpacity(inOpacity, ch));
    }
  }
}

export { OBSEABuoyEntity }