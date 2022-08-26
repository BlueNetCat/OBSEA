import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { WindsockBehavior } from '/OBSEA/Assets/Windsock/WindsockBehavior.js'

class WindsockEntity {
  
  isLoaded = false;
  windIntensity;
  windDirection;
  time = 0;
  
  constructor(scene, onload){

    // Initial variables
    this.windIntensity = 10; // km/h
    this.windDirection = 0; // degrees

    const gltfLoader = new GLTFLoader();
    // objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
    gltfLoader.load('/OBSEA/Assets/Windsock/windsock.glb', (gltf) => {
      // GLTF scene
      this.root = gltf.scene;
  
      // Fix frustrum culling
      this.root.children[0].children[1].frustumCulled = false;

      // Create Windsock Behavior
      this.windsockBehavior = new WindsockBehavior(this.root, scene);

      scene.add(this.root);

      this.isLoaded = true;

      if (onload)
        onload();
    });

  }

  // UPDATE
  update(time){
    this.time = time; // TODO: USE dt instead of time. Should also change the function inside windsockBehavior
    this.windsockBehavior.updateWindSock(this.root, this.windIntensity, this.windDirection, this.time);
  }

  // Set wind parameters
  setWindParams(windIntensity, windDirection){
    this.windIntensity = windIntensity;
    this.windDirection = windDirection;
  }
}

export {WindsockEntity}