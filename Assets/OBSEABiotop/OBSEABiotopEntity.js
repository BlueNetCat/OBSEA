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

      // Define material and shaders
      let biotopMaterial = new THREE.ShaderMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        // lights: true, // https://github.com/mrdoob/three.js/issues/16656
        uniforms: {
          // u_time: { value: this.time },
          // u_fogUnderwaterColor: { value: new THREE.Vector3(scene.fog.color.r, scene.fog.color.g, scene.fog.color.b) },
          // u_fogDensity: { value: scene.fog.density },
          // u_paramsTexture: { value: paramsTexture },
          // u_imgSize: { value: new THREE.Vector2(imgSize, imgSize) },
          // u_steepnessFactor: { value: 0.4 },
          // u_wavelength: { value: 7.0 },
          // u_direction: { value: new THREE.Vector2(1, 0) },
          // u_wave1Params: { value: new THREE.Vector4(0.5, 7.0, 1.0, 0.0) }, // steepness, waveHeight, directionx, directionz
          // u_wave2Params: { value: new THREE.Vector4(0.25, 3.0, 1.0, 1.0) }, // steepness, waveHeight, directionx, directionz
          // u_wave3Params: { value: new THREE.Vector4(0.25, 3.0, 1.0, 1.0) }, // steepness, waveHeight, directionx, directionz
          // u_normalTexture: { value: normalTexture }, // TODO: WHAT IF THE TEXTURE TAKES TOO LONG TO LOAD?
        },
        vertexShader: BiotopVertShader,
        fragmentShader: BiotopFragShader,
      });
      biotopMaterial.side = THREE.DoubleSide;
      biotopMaterial.depthWrite = false;
      biotopMaterial.depthTest = false;


      // Bottom AO render order fix
      gltf.scene.children[1].renderOrder = 1



      
      // Scene positioning
      gltf.scene.translateY(-19.3);
      gltf.scene.translateX(-5);
      gltf.scene.rotation.y = 15 * Math.PI / 180;

  
      

      scene.add(gltf.scene);

      this.isLoaded = true;

    });

  }


}


export { OBSEABiotopEntity }