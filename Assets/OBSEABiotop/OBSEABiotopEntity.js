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

      // Define material and shaders
      let biotopMaterial = new THREE.ShaderMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        side: THREE.DoubleSide,
        // lights: true, // https://github.com/mrdoob/three.js/issues/16656
        uniforms: {
          u_colorTexture: { value: biotop.material.map},
          u_normalTexture: { value: biotop.material.normalMap },
          u_ambientOcclusion: { value: loader.load('/OBSEA/Assets/OBSEABiotop/Textures/BiotopAmbientOcclusion.jpeg') },

          fogColor: { value: new Vector3(scene.fog.color.r, scene.fog.color.g, scene.fog.color.b )},
          fogDensity: { value: scene.fog.density},
        },
        vertexShader: BiotopVertShader,
        fragmentShader: BiotopFragShader,
      });

      console.log(BiotopVertShader);
      console.log(BiotopFragShader);

      biotop.material = biotopMaterial;


      // Bottom AO render order fix
      gltf.scene.children[1].renderOrder = 1;

      //debugger;

      
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