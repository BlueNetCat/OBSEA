import * as THREE from 'three';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { Vector3 } from 'three';

class CurrentEntity {

  // Sea water velocity data (2022-03-15 16:00:00)
  cspd = [0.23637719856195943, 0.4141861055129687, 0.17368943548759663, 0.0556699200646094, 0.12816657130468925, 0.12855154608171776, 0.15359716794264142, 0.1315069960116191, 0.13918397896309762, 0.13106895131952495, 0.11450183404644661, 0.11022272905349423, 0.13011494917956198, 0.13836263946600616, 0.12045468027436708, 0.1099375731949728, 0.1368236821606552, 0.1116995076085835, 0.0706406398612017, 0.0377094152699296];
  roots = [];
  numCurrents = 20;

  scaleFactor = 5;

  u = [];
  v = [];
  z = [];

  isLoaded = false;
  time = 0;

  tempQ = new THREE.Quaternion();
  tempM = new THREE.Matrix4();
  upVec = new THREE.Vector3(0,1,0);
  tempVec3 = new THREE.Vector3();
  temp2Vec3 = new THREE.Vector3();

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
        for (let i = 0; i < this.numCurrents; i++) {
          let arr = root.clone();
          arr.translateY(-i);
          arr.scale.x = this.cspd[i] * this.scaleFactor;
          arr.scale.y = this.cspd[i] * this.scaleFactor;
          arr.scale.z = this.cspd[i] * this.scaleFactor;

          this.roots.push(arr);
          scene.add(arr);
        }

        this.root = root;
        this.isLoaded = true;
      });


    
  }


  update(dt){
    
    this.time += dt;

    this.roots.forEach( (arr, i) => {
      
      // let dirZ = Math.cos(this.cdir[i] * Math.PI / 180);
      // let dirX = Math.sin(this.cdir[i] * Math.PI / 180);

      let scaleFactor = Math.cos(this.time * 2 +  this.cspd[i])*0.5 + 1;

      //arr.scale.x = moveX;
      //arr.scale.z = this.cspd[i] * 2 + scaleFactor; 
    });

    // TODO: do some kind of animation with the current. Small particles moving in a direction.
  }

  hideCurrents(){
    for (let i = 0; i < 20; i++) {
      let arr = this.roots[i];
      arr.visible = false;
    }
  }
  showCurrents(){
    for (let i = 0; i < 20; i++) {
      let arr = this.roots[i];
      arr.visible = true;
    }
  }


  setCurrentParameters(params){//updateCurrentParameters(params){

    

    let u = this.u;
    let v = this.v;
    let z = this.z;
    for (let i = 0; i<20; i++){
      let arr = this.roots[i];

      u[i] = params['UCUR_' + i + 'm'];
      v[i] = params['VCUR_' + i + 'm'];
      z[i] = params['ZCUR_' + i + 'm'];

      if (u[i] == undefined){
        arr.visible = false;
        continue;
      } else
        arr.visible = true;

      this.cspd[i] = Math.sqrt(u[i]*u[i] + v[i]*v[i] + z[i]*z[i]);

      

      let tempQ = this.tempQ;
      let tempM = this.tempM;

      this.tempM.lookAt(this.tempVec3, this.temp2Vec3.set(u[i], z[i], -v[i]), this.upVec);
      this.tempQ.setFromRotationMatrix(this.tempM);
      arr.quaternion.copy(this.tempQ);
      
      // Scale
      let scaleFactor = this.scaleFactor;
      arr.scale.set(this.cspd[i] * scaleFactor, this.cspd[i] * scaleFactor, this.cspd[i] * scaleFactor);


    }
    
    //tempM.rota
  }

}

export {CurrentEntity}