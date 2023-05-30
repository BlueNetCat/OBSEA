import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OBSEACrawlerEntity {

  leftEngine = 0;
  rightEngine = 0;
  orientation = new THREE.Vector3();
  stepSize = 0.005;
  angularStep = 0.022;
  morphStep = 0.065; // One step equals to a displacement of 0.065m
  distanceToAxis = 0.26;

  constructor(scene){
    const gltfLoader = new GLTFLoader();
    const texLoader = new THREE.TextureLoader();
    gltfLoader.load('/OBSEA/Assets/OBSEACrawler/Crawler.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      this.root = root;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      // Change rotation order
      root.rotation.reorder('YZX');
      // Get grips for animation
      this.gripsLeft = this.root.getObjectByName('GripsLeft');
      this.gripsRight = this.root.getObjectByName('GripsRight');
      // Set morph targets to 0.5
      this.gripsLeft.morphTargetInfluences[0] = 0.5;
      this.gripsRight.morphTargetInfluences[0] = 0.5;


      // Floor ambient occlusion
      let aoBottom = root.getObjectByName('Floor_AO');
      // https://threejs.org/docs/index.html#api/en/constants/CustomBlendingEquations
      // https://threejs.org/docs/#api/en/constants/Materials
      aoBottom.material.transparent = true;
      aoBottom.material.metalness = 1;
      aoBottom.material.roughness = 1;
      aoBottom.material.map = texLoader.load('/OBSEA/Assets/OBSEACrawler/crawler_floor_ao_alpha.png');
      aoBottom.renderOrder = 1;


      // Camera glass
      let cameraGlass = root.getObjectByName('FrontSphere');
      cameraGlass.material.map = texLoader.load('/OBSEA/Assets/OBSEACrawler/HDRI_transparent.png');
      cameraGlass.material.transparent = true;
      cameraGlass.material.opacity = 1;
      cameraGlass.renderOrder = 1;

      // Objects with ambient occlusion
      let objectsAO = [
        'StructTopFront',
        'StructBottom',
        //'TopCylinderLong', // Could be just white?
        //'BackCableBox', // Multimaterial
        'WheelLeftBack',
        'WheelLeftFront',
        'WheelRightBack',
        'WheelRightFront'
      ];
      for (let i = 0; i < objectsAO.length; i++){
        let obj = root.getObjectByName(objectsAO[i]);
        obj.material.color.setRGB(0.82, 0.75, 0.5);
        // Loading the ambient occlusion manually does not work. The gltf export contains the ao texture
        //obj.material.map = texLoader.load('/OBSEA/Assets/OBSEACrawler/crawler_ao.png');
        //obj.material.map.flipY = false;
      }


      // Scene positioning
      root.translateY(-19.35);
      root.translateX(-1.5);
      root.translateZ(3);
      root.rotation.y = -110 * Math.PI / 180;


      // USER ACTIONS
      document.addEventListener("keydown", (e)=> {
        // Create key status
        if (window.keyStatus == undefined){
          window.keyStatus = {};
        }
        // TODO: optimize this using e.keyCode which is a number
        window.keyStatus[e.code] = true;
      }, false);
      document.addEventListener("keyup", (e)=> {
        // Create key status
        if (window.keyStatus == undefined){
          window.keyStatus = {};
        }
        // TODO: optimize this using e.keyCode which is a number
        window.keyStatus[e.code] = false;
      }, false);



      scene.add(root);
    });
  }






  // UPDATE
  update(dt){
    // Return if no key was ever pressed
    let keyStatus = window.keyStatus;
    if (keyStatus == undefined)
      return
    
    // ENGINE STATUS
    // Left engine
    if (keyStatus['KeyQ'] || keyStatus['KeyW'] || keyStatus['ArrowUp'])
      this.leftEngine = 1;
    else if (keyStatus['KeyA'] || keyStatus['KeyS'] || keyStatus['ArrowDown'])
      this.leftEngine = -1;
    else
      this.leftEngine = 0;

    // Right engine
    if (keyStatus['KeyE'] || keyStatus['KeyW'] || keyStatus['ArrowUp'])
      this.rightEngine = 1;
    else if (keyStatus['KeyD'] || keyStatus['KeyS'] || keyStatus['ArrowDown'])
      this.rightEngine = -1;
    else
      this.rightEngine = 0;

    // If engines are off, return
    if (this.rightEngine == 0 && this.leftEngine == 0)
      return;

    

    // ACTIONS
    // Rotate around center
    // TODO: USE DT?
    if (this.rightEngine + this.leftEngine == 0){
      // Rotate clockwise
      if (this.leftEngine == 1) this.root.rotateY(this.angularStep);
      // Rotate counter-clockwise
      if (this.leftEngine == -1) this.root.rotateY(-this.angularStep);
    } 
    
    // Rotate around one belt
    // Four cases!
    if (Math.abs(this.rightEngine - this.leftEngine) == 1){

      let side = Math.abs(this.leftEngine) - Math.abs(this.rightEngine);
      let turnDirection = -side * this.leftEngine + -side * this.rightEngine;

      // 1 Move children
      for (let i = 0; i < this.root.children.length; i++){
        this.root.children[i].translateX(this.distanceToAxis * side);
      }
      // 2 Move root to reposition children
      this.root.translateX(this.distanceToAxis  * side);
      // 3 Rotate root
      this.root.rotateY(turnDirection * this.angularStep / 2);
      // 4 Move root
      this.root.translateX(-this.distanceToAxis * side);
      // 5 Move children
      for (let i = 0; i < this.root.children.length; i++){
        this.root.children[i].translateX(-this.distanceToAxis * side);
      }
    }


    // Move forward or backward
    // TODO: USE DT?
    if (this.rightEngine == this.leftEngine){
      // Translation is already taking into account the rotation of the object
      this.root.translateZ(-this.rightEngine * this.stepSize);
    }


    // ANIMATE
    let wLB = this.root.getObjectByName('WheelLeftBack');
    let wLF = this.root.getObjectByName('WheelLeftFront');

    let wRB = this.root.getObjectByName('WheelRightBack');
    let wRF = this.root.getObjectByName('WheelRightFront');

    if (this.leftEngine != 0){
      // Grips morph targets
      let value = this.gripsLeft.morphTargetInfluences[0];
      value += this.morphStep * this.leftEngine;
      this.gripsLeft.morphTargetInfluences[0] = value > 1 ? value - 1 : value < 0 ? value + 1 : value; // Modular from 0 to 1
      wLB.rotateX(this.morphStep * this.leftEngine * -30 * Math.PI / 180);
      wLF.rotateX(this.morphStep * this.leftEngine * -30 * Math.PI / 180);
    }
    if (this.rightEngine != 0){
      // Grips morph targets
      let value = this.gripsRight.morphTargetInfluences[0];
      value += this.morphStep * this.rightEngine;
      this.gripsRight.morphTargetInfluences[0] = value > 1 ? value - 1 : value < 0 ? value + 1 : value; // Modular from 0 to 1
      wRB.rotateX(this.morphStep * this.rightEngine * 30 * Math.PI / 180);
      wRF.rotateX(this.morphStep * this.rightEngine * 30 * Math.PI / 180);
    }
  }


}

export { OBSEACrawlerEntity }





/*

// Script to create alpha from a white-black ambient occlusion

let img = new Image();
img.src = '/OBSEA/Assets/OBSEACrawler/crawler_floor_ao.png';

img.onload = () => {
  let cnv = document.createElement('canvas');
  cnv.width = img.width;
  cnv.height = img.height;
  let ctx = cnv.getContext("2d");
  
  ctx.drawImage(img, 0,0);
  let imgData = ctx.getImageData(0, 0, cnv.width, cnv.height);
  
  
  for (let i = 0; i < imgData.data.length/4; i++){
    let value = imgData.data[i*4];
    // Turn all pixels to black
    imgData.data[i*4] = 0;
    imgData.data[i*4 + 1] = 0;
    imgData.data[i*4 + 2] = 0;
    // Set alpha
    imgData.data[i*4 + 3] = 255 - value;
  }
  // Paint data
  ctx.putImageData(imgData, 0, 0);
  // Download
  let link = document.createElement('a');
  link.download = 'crawler_floor_ao_alpha.png';
  link.href = cnv.toDataURL()
  link.click();
}


*/