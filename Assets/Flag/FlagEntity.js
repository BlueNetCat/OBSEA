import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { FlagBehavior } from '/OBSEA/Assets/Flag/FlagBehavior.js'

class FlagEntity {
  
  isLoaded = false;
  windIntensity;
  windDirection;
  time = 0;

  beaufortTextures = [];
  
  constructor(scene, onload){

    // Initial variables
    this.windIntensity = 10; // km/h
    this.windDirection = 0; // degrees

    const gltfLoader = new GLTFLoader();
    // objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
    gltfLoader.load('/OBSEA/Assets/Flag/flag.glb', (gltf) => {
      // GLTF scene
      this.root = gltf.scene;
      this.flagObj = this.root.getObjectByName("Armature");//this.root.children[0];
      this.poleObj = this.root.getObjectByName("Pole");// this.root.children[1];
  
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
    if (paramName == 'windSpeed'){
      this.windIntensity = value;
      this.setFlagBeaufortColor(this.windIntensity);
    } else if (paramName == 'windDirection')
      this.windDirection = value + 180;
  }

  hideFlag(){
    if (this.root)
      this.root.visible = false;
  }
  showFlag(){
    if (this.root)
      this.root.visible = true;
  }

  updateWindParameters(params){
    // If no data, hide.
    this.root.visible = params.WSPD == undefined ? false : true;

    this.windIntensity = params.WSPD * 3.6 || this.windIntensity; // From m/s to km/h
    this.setFlagBeaufortColor(this.windIntensity);
    this.windDirection = params.WDIR || this.windDirection;
  }

  // Set flag color according to wind speed
  setFlagBeaufortColor(windInt){
    // Find beaufort scale (windInt is in km/h)
    let scale = 0;
    let upperLimBeaufort = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 300];
    for (let i = 0; i< upperLimBeaufort.length; i++){
      scale = i;
      if (windInt < upperLimBeaufort[i]){
        i = upperLimBeaufort.length; // Exit loop
      }
    }
    
    
    
    let texture;
    // Load texture only when necessary
    if (this.beaufortTextures[scale] == undefined){
      // Load texture
      const loader = new THREE.TextureLoader();
      texture = loader.load('/OBSEA/Assets/Flag/BeaufortScale/'+ scale +'.png');
      texture.encoding = THREE.sRGBEncoding;
      texture.magFilter = THREE.LinearFilter; //THREE.NearestFilter;
      texture.flipY = false;
    }
    else
      texture = this.beaufortTextures[scale];
    // Assign to material only if necessary (different beaufort scale now)
    if (this.flagObj.children[0].material.map.uuid != texture.uuid) // WARNING: children[0] is SkinnedMesh, but maybe better to do getObjectBy...
      this.flagObj.children[0].material.map = texture;
    
  }
}

export { FlagEntity }