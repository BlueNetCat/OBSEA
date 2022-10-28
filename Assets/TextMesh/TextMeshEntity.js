// https://threejs.org/examples/#webgl_geometry_text
// https://dev.to/emurtzle/intro-to-threejs--interactive-text-exampletutorial-4d1k

// Use this to generate a new font: https://gero3.github.io/facetype.js/
import * as THREE from 'three';
import { FontLoader } from 'https://threejs.org/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://threejs.org/examples/jsm/geometries/TextGeometry.js';

class TextMeshEntity {

  tempVec3 = new THREE.Vector3();
  tempQuat = new THREE.Quaternion();

  constructor(scene, inputText, inputSize, inputColor, onload) {

    this.size = inputSize;
    this.color = inputColor;

    // Load font
    this.loadFont(() => {
      // Create text object
      this.textObj = this.createTextObj(inputText, inputSize, inputColor);
      // Add to scene
      if (this.textObj){
        scene.add(this.textObj);
        onload();
      }
    })

    this.scene = scene;  
  }


  // Loads the font and calls a function once its loaded
  loadFont = function(callback){
    const fontLoader = new FontLoader();
    //fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    fontLoader.load('/OBSEA/Assets/TextMesh/Helvetica 65 Medium_Regular.json', (font) => { 
      this.font = font;
      callback();
    });
  }


  createTextObj = function(inputText, inputSize, inputColor){
    // If font is loaded
    if (this.font){
      // Create mesh geomtry
      let geometry = new TextGeometry(inputText, {
        font: this.font,
        size: inputSize,
        height: inputSize/10,
        curveSegments: 4,
        bevelEnabled: true,
        bevelSize: inputSize/30,
        bevelThickness: inputSize/15,
        bevelOffset: 0, 
      });

      // Center geomtry
      geometry.computeBoundingBox(); // In the example, first center then calculate bounding box.
      geometry.center();

      // Create material
      let material = new THREE.MeshPhongMaterial({
        color: inputColor,
        specular: 0xffffff,
        shininess: 5,
        flatShading: false,
        opacity: 0.7,
        transparent: true
      });


      let textObj = new THREE.Mesh(geometry, material);
      // Returns the object
      return textObj;
    }
    // Load font
    else {
      // Creates a text once the font is loaded
      this.loadFont(() => this.createTextObj(inputText, inputSize, inputColor));
    }
  }



  // PUBLIC METHODS
  updateText(inText, inColor){
    this.color = inColor || this.color;
    // Current position
    this.tempVec3.copy(this.textObj.position);
    // Current rotation
    this.tempQuat.copy(this.textObj.quaternion);
    // Remove current text from scene
    this.scene.remove(this.textObj);
    // Create text
    this.textObj = this.createTextObj(inText, this.size, this.color);
    
    // Add to scene
    if (this.textObj){
      // Reposition
      this.textObj.position.copy(this.tempVec3);
      this.textObj.quaternion.copy(this.tempQuat);
      this.scene.add(this.textObj);
      if (this.facesCamera) // Face camera if faceCamera is called before at some point
        this.faceCamera();
    }
  }

  faceCamera(){
    let camera = this.scene.camera;
    // https://stackoverflow.com/questions/36201880/threejs-rotate-on-y-axis-to-face-camera
    //this.textObj.rotation.y = Math.atan2((camera.position.x - this.textObj.position.x), (camera.position.z - this.textObj.position.z));
    let rotY = Math.atan2((camera.position.x - this.textObj.position.x), (camera.position.z - this.textObj.position.z));
    // Tween text facing camera
    new TWEEN.Tween(this.textObj.rotation)
      .to(this.tempVec3.set(0, rotY, 0), 50)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();

    this.facesCamera = true;
  }

  removeText(){
    this.scene.remove(this.textObj);
  }

}

export {TextMeshEntity}