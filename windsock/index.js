import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
//import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { Vector3 } from 'three';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(3, 3, 0);

  const controls = new OrbitControls(camera, canvas);
  // TODO: limit orbit controls
  controls.target.set(0, 2, 0);
  controls.update();

  // GUI
  let gui = new GUI();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  { // TOP PLANE
    const planeSize = 5;

    const loader = new THREE.TextureLoader();
    // const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    const texture = loader.load('../3Dcurrent/NESW.png');
    texture.encoding = THREE.sRGBEncoding;
    //texture.wrapS = THREE.RepeatWrapping;
    //texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter; //THREE.NearestFilter;
    //const repeats = planeSize / 10;
    //texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  // BOTTOM PLANE
  {
    const pBottomSize = 5;
    const loader = new THREE.TextureLoader();
    const bottTexture = loader.load('../3Dcurrent/Bottom.png');
    
    const planeBottom = new THREE.PlaneGeometry(pBottomSize, pBottomSize);
    const pBottMat = new THREE.MeshPhongMaterial({
      map: bottTexture,
      side: THREE.DoubleSide,
      transparent: true
    });
    const pBottMesh = new THREE.Mesh(planeBottom, pBottMat);
    pBottMesh.translateY(-19.4);
    pBottMesh.rotation.x = Math.PI * -.5;
    
    scene.add(pBottMesh);
  }

  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0x2090b9;  // blue
    const intensity = 0.6;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }


  let windsockObj;
  const windBones = [];
  // Wind direction
  let windDir = 270;
  let animWindDir = 270;
  // Wind intensity in km/h
  let windInt = 10;
  let animWindInt = 10;

  // Wind ragdoll class
  let windSocks = [];

  { // WIND SOCK
    const gltfLoader = new GLTFLoader();
    // objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
    gltfLoader.load('windsock.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      windsockObj = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      

      

      // https://www.reddit.com/r/flying/comments/ip7k0y/faa_standard_windsock_should_indicate_direction/
      // 28 km/h --> fully extended
      // 5.6 km/h --> move freely
      // There's no requirement that the windsock has stripes at all.
      // Wind sock cones
      let parent = root.children[0]; // Armature
      parent = parent.children[0];// First bone
      while (parent.children.length != 0){
        // Wind socks
        windSocks.push(new SockSection(parent.children[0], parent, windSocks.length == 0 ? true : false))

        windBones.push(parent.children[0]);
        parent = parent.children[0];
      }
      

      //updateWindSock(windsockObj, windBones, windInt, windDir);


      setupGui(windBones);


      scene.add(root);


      console.log(dumpObject(root).join('\n'));
    });


  }


  // Update wind bone rotations
  // https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519
  let prevTime = 0;
  let timer = 2;
  let currentWindInt = windInt;
  class SockSection {
    constructor(bone, parentBone, isPinned){

      this.bone = bone;
      this.parentBone = parentBone;
      
      // Is pinned
      this.isPinned = isPinned || false;

      // Helpers
      this.pos = new Vector3();
      this.parentPos = new Vector3();
      this.nextPos = new Vector3();
      this.prevPos = new Vector3();
      this.diffPos = new Vector3();
      this.count = 0;
      this.initTimes = 40;
    }


    start(){
      // Physical properties
      this.bone.getWorldPosition(this.pos);
      this.bone.getWorldPosition(this.prevPos);
      this.parentBone.getWorldPosition(this.parentPos);

      this.vel = new Vector3();
      // Resting distance
      this.restDist = this.pos.distanceTo(this.parentPos);
    }

    
    update(dt, acc){
      // First time
      if (this.count < this.initTimes){
        this.count++;
        return;
      }
      else if (this.count == this.initTimes){
        this.start();
        this.count++;
        return;
      }

      // Get world positions
      this.bone.getWorldPosition(this.pos);
      this.parentBone.getWorldPosition(this.parentPos);
     
      for (let itAccuracy = 0; itAccuracy < 20; itAccuracy++){
        // Distance constraints
        this.updateConstraints();
      }
      
      // Verlet integration
      this.updatePhysics(dt, acc);

      // Set world positions
      setWorldPosition(this.bone, this.pos);
      
      //setWorldPosition(this.parentBone, this.parentPos);
    }



    updateConstraints(){

      
      // Link constraints
      // Calculate the distance between bones      
      this.diffPos.subVectors(this.parentPos,this.pos);
      let distance = this.pos.distanceTo(this.parentPos);
      
      // Difference ratio (scalar)
      let differenceScalar = (this.restDist - distance) / distance;
      if (Math.abs(differenceScalar) > 0.02){
        //debugger;
      }
    

      // translation for each PointMass. They'll be pushed 1/2 the required distance to match their resting distances.
      let translatePos = this.diffPos.multiplyScalar(0.5 * differenceScalar);

      // Move bones closer together
      //if (!this.isPinned)
        //this.parentPos.add(translatePos);
      this.pos.sub(translatePos);

    }

    // Velvet integration
    updatePhysics(dt, acc){

      // If it is pinned, ignore physics
      if (this.isPinned)
        return;

      // Physics
      // Inertia: objects in motion stay in motion.
      this.vel.subVectors(this.pos, this.prevPos);// vel*dt = pos - prePos
          // let precision = 1e6;
          // this.vel.multiplyScalar(precision);
          // this.vel.roundToZero();
          // this.vel.divideScalar(precision);
//debugger;
      // Dampen velocity
      this.vel.multiplyScalar(0.95);
      //this.vel.multiplyScalar(0.0);

      // nextPos = pos + vel*dt + 0.5*acc*dt*dt
      this.nextPos.addVectors(this.vel, acc.multiplyScalar(dt * dt * 0.5)); // nextPos += vel + 0.5*acc*dt*dt
      this.nextPos.add(this.pos); // nextPos += pos;
      
      this.prevPos.copy(this.pos); // prevPos = pos;

      this.pos.copy(this.nextPos); // pos = nextPos;

      //setWorldPosition(this.bone, this.pos);

      // Put velocity in the right units
      this.vel.multiplyScalar(1/dt);
    }


    // Update rotations
    updateRotations() {
      if (this.count <= this.initTimes) {
        return;
      }

      
      // Get world positions
      this.bone.getWorldPosition(this.pos);
      this.parentBone.getWorldPosition(this.parentPos);

      let localPos = new Vector3();
      localPos.copy(this.bone.position);

      console.log(JSON.stringify(this.pos))
      console.log(JSON.stringify(this.bone.position))
      console.log(JSON.stringify(this.bone.parent.position))


      // Set to world coordinates
      let parentNode = this.bone.parent;
      scene.attach(this.bone)

      // Orientate bones
      const rotationMatrix = new THREE.Matrix4();
      let up = new Vector3(0,-1,0);
      rotationMatrix.lookAt(this.parentPos, this.pos, this.bone.up); // World coordinates
      this.bone.quaternion.setFromRotationMatrix(rotationMatrix);

      this.bone.rotateX(-Math.PI/2);

      // Set to local coordinates
      parentNode.attach(this.bone);

      

      // Reset world positions
      setWorldPosition(this.bone, this.pos);

      this.bone.position.copy(localPos);

      console.log(JSON.stringify(this.pos))
      console.log(JSON.stringify(this.bone.position))
      console.log(JSON.stringify(this.bone.parent.position))
      console.log("\n")
      
    }


  }

  // To set world position, set as scene child, change position and then reasign to parent again
  // https://stackoverflow.com/questions/12547701/three-js-changing-the-world-position-of-a-child-3d-object
  function setWorldPosition(node, position){
    
    let parentNode = node.parent;
    scene.attach(node)
    node.position.set(...position);
    parentNode.attach(node);

    
    node.updateMatrix();
    node.updateWorldMatrix();
    node.updateMatrixWorld();
  }



  // Set orientation and world position
  function setRotation(node, position, parentPosition){

    // Set to world coordinates
    let parentNode = node.parent;
    scene.attach(node)

    // Orientate bones
    const rotationMatrix = new THREE.Matrix4();
    let up = new Vector3(0, -1, 0);
    rotationMatrix.lookAt(this.parentPos, this.pos, node.up); // World coordinates
    node.quaternion.setFromRotationMatrix(rotationMatrix);

    node.rotateX(-Math.PI / 2);

    // Set to local coordinates
    parentNode.attach(node);
    
  }






  
  function updateWindSock(windsock, bones, windInt, windDir, time){
    if (windsock == undefined)
      return;



    // Time elapsed
    let dt = time * 0.001 - prevTime;
    prevTime = time * 0.001;

    windSocks.forEach((ws => {
      dt = 0.016;
      // Acceleration
      let acc = new Vector3(0,-9.8,-10);
      ws.update(dt, acc);
    }));

    windSocks.forEach((ws => {
      ws.updateRotations();
    }))

    return;
    

    

    // Wind gust turbulence
    if (dt > timer){
      animWindInt = windInt + Math.random() * windInt * 0.3; // 10% variability (could be wind gust)
      prevTime = time*0.001;
      timer = 1 + Math.random();
    }
    // When inflating, change is faster
    let factor = 0.99;
    if (animWindInt > currentWindInt + 0.2)
      factor = 0.94;
    else
      animWindInt = windInt + windInt*Math.random()*0.1;
    
    currentWindInt = animWindInt * (1-factor) + currentWindInt * factor;

    


    // Normalize intensity
    let normInt = currentWindInt / 28; // 0 to 1
    // Calculate point in the sock
    let point = normInt * bones.length;


    let totalAngle = 0;
    let maxAngle = 90 * (1 - normInt * 0.7);
    let angle = 0;
    for (let i = 0; i < bones.length; i++) {
      // Filled by wind
      if (Math.floor(point) > i) {
        continue;
      }
      // Current being filled
      // Distance to stripe
      if (Math.floor(point) == i) {
        let dist = point - i;
        angle = maxAngle * (1 - dist);
        totalAngle += angle;
      } // Rest 
      else {
        angle = maxAngle - totalAngle;
        totalAngle += angle;
      }

      bones[i].rotation.x = - angle * Math.PI / 180;
    }


    // Scene direction fix
    const angleFix = 90;// Rotation
    let totalRotation = angleFix - windDir;
    windsock.rotation.y = totalRotation * Math.PI / 180;
  }





  // Print scene outline
  function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
  }




  // Bones GUI
  function setupGui(bones) {

    let folder = gui.addFolder('Wind');

    //folder.add(windInt)

    //const bones = mesh.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {

      const bone = bones[i];

      folder = gui.addFolder('Bone ' + i);

      folder.add(bone.position, 'x', - 10 + bone.position.x, 10 + bone.position.x);
      folder.add(bone.position, 'y', - 10 + bone.position.y, 10 + bone.position.y);
      folder.add(bone.position, 'z', - 10 + bone.position.z, 10 + bone.position.z);

      folder.add(bone.rotation, 'x', - Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.rotation, 'y', - Math.PI * 0.5, Math.PI * 0.5);
      folder.add(bone.rotation, 'z', - Math.PI * 0.5, Math.PI * 0.5);

      folder.add(bone.scale, 'x', 0, 2);
      folder.add(bone.scale, 'y', 0, 2);
      folder.add(bone.scale, 'z', 0, 2);

      folder.controllers[0].name('position.x');
      folder.controllers[1].name('position.y');
      folder.controllers[2].name('position.z');

      folder.controllers[3].name('rotation.x');
      folder.controllers[4].name('rotation.y');
      folder.controllers[5].name('rotation.z');

      folder.controllers[6].name('scale.x');
      folder.controllers[7].name('scale.y');
      folder.controllers[8].name('scale.z');

    }

  }




  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // Update loop
    updateWindSock(windsockObj, windBones, windInt, windDir, time);


    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
