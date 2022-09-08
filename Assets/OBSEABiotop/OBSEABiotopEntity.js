import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { BiotopVertShader, BiotopFragShader } from '/OBSEA/Assets/OBSEABiotop/BiotopShader.js';
import { Vector3 } from 'three';


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
      let arr = biotop.geometry.attributes.uv2.array;
      for (let i = 1; i < arr.length; i+=2){
        arr[i] = 1.0 - arr[i];
      }

      // Bottom AO render order fix
      gltf.scene.children[1].renderOrder = 1;

      // Scene positioning
      gltf.scene.translateY(-19.35);
      gltf.scene.translateX(-5);
      gltf.scene.rotation.y = 15 * Math.PI / 180;


      scene.add(gltf.scene);

      this.isLoaded = true;

    });

  }


}


export { OBSEABiotopEntity }