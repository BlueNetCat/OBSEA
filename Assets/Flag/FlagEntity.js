import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { FlagBehavior } from '/OBSEA/Assets/Flag/FlagBehavior.js'

class FlagEntity {
  
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
    gltfLoader.load('/OBSEA/Assets/Flag/flag.glb', (gltf) => {
      // GLTF scene
      this.root = gltf.scene;
      this.flagObj = this.root.children[0];
      this.poleObj = this.root.children[1];
  
      // Fix frustrum culling
      this.flagObj.frustumCulled = false; // Flag
      this.poleObj.frustumCulled = false; // Pole

      this.root.scale.addScalar(2);

      // Create Flag Behavior
      this.flagBehavior = new FlagBehavior(this.flagObj, scene);

      scene.add(this.root);

      this.isLoaded = true;

      if (onload)
        onload();
    });

  }

  // UPDATE
  update(time){
    this.time = time; // TODO: USE dt instead of time. Should also change the function inside windsockBehavior
    this.flagBehavior.updateFlag(this.flagObj, this.windIntensity, this.windDirection, this.time);
  }

  // Set wind parameters
  setWindParameters(paramName, value){
    if (paramName == 'windSpeed')
      this.windIntensity = value;
    else if (paramName == 'windDirection')
      this.windDirection = value + 180;
  }

  updateWindParameters(params){
    // If no data, hide.
    this.root.visible = params.WSPD == undefined ? false : true;

    this.windIntensity = params.WSPD * 3.6 || this.windIntensity; // From m/s to km/h
    this.windDirection = params.WDIR || this.windDirection;
  }
}

export { FlagEntity }