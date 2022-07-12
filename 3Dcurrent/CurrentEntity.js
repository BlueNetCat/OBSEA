import * as THREE from 'three';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';

class CurrentEntity {

  // Sea water velocity data (2022-03-15 16:00:00)
  cspd = [0.791, 0.880, 0.616, 0.465, 0.475, 0.457, 0.487, 0.456, 0.487, 0.458, 0.465, 0.445, 0.463, 0.422, 0.415];
  cdir = [247, 241, 238, 240, 248, 248, 246, 248, 248, 248, 248, 250, 253, 249, 249];
  roots = [];

  isLoaded = false;
  time = 0;

  constructor(scene) {
      const objLoader = new OBJLoader();
      // objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
      objLoader.load('/OBSEA/Assets/Orientation/ArrowX.obj', (root) => {

        // Add material
        const arrowMaterial = new THREE.MeshPhongMaterial({
          color: 0xFF0000,    // red (can also use a CSS color string here)
          flatShading: false,
        });
        root.children[0].material = arrowMaterial;

        // Other arrows
        for (let i = 0; i < this.cspd.length; i++) {
          let arr = root.clone();
          arr.translateY(-i);
          arr.scale.x = this.cspd[i]*2;
          arr.scale.y = this.cspd[i]*2;
          arr.scale.z = this.cspd[i]*2;

          arr.rotation.y = this.cdir[i] * Math.PI / 180;

          this.roots.push(arr);
          scene.add(arr);
        }


        this.isLoaded = true;
      });


    
  }

  update(dt){
    this.time += dt;

    this.roots.forEach( (arr, i) => {
      
      let dirZ = Math.cos(this.cdir[i] * Math.PI / 180);
      let dirX = Math.sin(this.cdir[i] * Math.PI / 180);

      let moveX = Math.cos(this.time * 2) * dirX;
      let moveZ = Math.cos(this.time * 2) * dirZ;

      //arr.scale.x = moveX;
      arr.scale.z = this.cspd[i] * 2 + moveZ; 
    });

    // TODO: do some kind of animation with the current. Small particles moving in a direction.
  }

  setParams(currentIntArr, currentDirArr){
    this.cspd = currentIntArr;
    this.cdir = currentDirArr;
  }

}

export {CurrentEntity}