import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';


class OBSEABiotopEntity {

  isLoaded = false;

  constructor(scene){

    // Load mesh
    let gltfLoader = new GLTFLoader();

    gltfLoader.load('/OBSEA/Assets/OBSEABiotop/biotop.glb', (gltf) => {


      let biotop = gltf.scene.children[0];

      // Biotop AO texture
      const loader = new THREE.TextureLoader();
      biotop.material.aoMap = loader.load('/OBSEA/Assets/OBSEABiotop/Textures/BiotopAmbientOcclusion.jpeg');
      biotop.material.aoMapIntensity = 1;
      biotop.material.metalnessMap = null;
      biotop.material.color.multiplyScalar(0.8);

      // For some reason uv2 (ao) has the y flipped
      const fixUV2 = function (uv2){
        for (let i = 1; i < uv2.length; i += 2) {
          uv2[i] = 1.0 - uv2[i];
        }
      }
      if (biotop.geometry.attributes.uv2){
        fixUV2(biotop.geometry.attributes.uv2.array);
      } else {
        console.warn("Could not find uv2 in BiotopEntity.")
      }

      // Bottom AO render order fix
      gltf.scene.children[1].renderOrder = 1;

      // Scene positioning
      gltf.scene.translateY(-19.35);
      gltf.scene.translateX(-6);
      gltf.scene.translateZ(1);
      gltf.scene.rotation.y = 66 * Math.PI / 180;


      scene.add(gltf.scene);

      this.isLoaded = true;

    });

  }


}


export { OBSEABiotopEntity }