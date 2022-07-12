import * as THREE from 'three';
import { Vector3 } from 'three';

// https://www.reddit.com/r/flying/comments/ip7k0y/faa_standard_windsock_should_indicate_direction/
// 28 km/h --> fully extended
// 5.6 km/h --> move freely
// There's no requirement that the windsock has stripes at all.
class WindsockBehavior{

  
  constructor(windSockObj, scene){
    // Scene object
    this.windsockObj = windSockObj;
    // Wind bones
    this.windBones = [];
    // Sock sections
    this.sockSections = [];

    // Create sock section bones
    let parent = windSockObj.children[0]; // Armature
    parent = parent.children[0];// First bone
    while (parent.children.length != 0) {
      // Sock sections
      this.sockSections.push(new SockSection(parent.children[0], parent, scene, this.sockSections.length == 0 ? true : false))
      // Wind bones
      this.windBones.push(parent.children[0]);
      parent = parent.children[0];
    }

    
    // Scene
    this.scene = scene;

    // INITIALIZE VALUES IN CONSTRUCTOR?
    // // Wind direction
    // let windDir = 270;
    // // Wind intensity in km/h
    // let windInt = 10;

    // Acceleration ( wind force and gravity)
    this.acc = new Vector3();
    // Update previous time
    this.prevTime = 0;
  }


  // Update wind bone rotations
  // https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519
  updateWindSock(windsockObj, windInt, windDir, time) {
    if (windsockObj == undefined)
      return;


    // Time elapsed
    let dt = time * 0.001 - this.prevTime;
    this.prevTime = time * 0.001;

    // Calculate wind vector
    let windRad = windDir * Math.PI / 180 + Math.PI; // Add 180 and make clockwise
    windRad = -windRad; // Clockwise

    // Rotate object
    windsockObj.rotation.y = windRad;

    // Wind components
    let windZ = Math.cos(windRad) * windInt;
    let windX = Math.sin(windRad) * windInt;
    // Add noise / turbulence
    windZ += (Math.random() * 2 - 1) * windZ * 0.01;
    windX += (Math.random() * 2 - 1) * windX * 0.01;

    // Rotate base wind sock - Does not work well, should rotate windSocks[0].bone, but it is messed up in the updates
    //windSocks[0].parentBone.quaternion.setFromEuler(new THREE.Euler(-110 * Math.PI/180, 0, 0), true); // TODO: Memory loss
    let windSocks = this.sockSections;
    windSocks.forEach((ws => {
      dt = 0.016*1.8;
      // TODO: WIND INTENSITY IS DECLARED AS VELOCITY, BUT WE USE FORCES (OR ACCELERATION)
      // TODO: FORCE COULD DECREASE AS WIND GOES THROUGH SOCK ( MORE FORCE AT THE BEGINNING, LESS AT THE END )
      // Acceleration
      this.acc.set(-windX, -9.8, -windZ);
      ws.update(dt, this.acc);
    }));

    // Correct for rotations
    // Store all world positions and rotations
    let wPositions = [];
    let localRots = [];
    for (let i = 0; i < windSocks.length; i++) {
      // World position
      wPositions[i] = windSocks[i].bone.getWorldPosition(new Vector3()); // TODO: Memory loss
      // Local rotation
      localRots[i] = windSocks[i].calcRotation();
    }
    // Apply rotations
    for (let i = 0; i < windSocks.length; i++) {
      windSocks[i].bone.quaternion.copy(localRots[i]);
    }
    // Restore global positions
    for (let i = 0; i < windSocks.length; i++) {
      this.setWorldPosition(windSocks[i].bone, wPositions[i]);
    }

  }


  // To set world position, set as scene child, change position and then reasign to parent again
  setWorldPosition(node, position) {

    let parentNode = node.parent;
    this.scene.attach(node)
    node.position.set(...position);
    parentNode.attach(node);

    node.updateMatrix();
    node.updateWorldMatrix();
    node.updateMatrixWorld();
  }




}






// Sock section
class SockSection {
  constructor(bone, parentBone, scene, isPinned) {

    this.bone = bone;
    this.parentBone = parentBone;

    this.scene = scene;

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

    // Rotation helpers
    this.neutralVec3 = new Vector3();
    this.tempVec3 = new Vector3();
    this.up = new Vector3(0, 1, 0);
    this.neutralQuaternion = new THREE.Quaternion();
    this.tempQuaternion = new THREE.Quaternion();
    this.tempM4 = new THREE.Matrix4();

    this.tempEuler = new THREE.Euler();
  }


  start() {
    // Physical properties
    this.bone.getWorldPosition(this.pos);
    this.bone.getWorldPosition(this.prevPos);
    this.parentBone.getWorldPosition(this.parentPos);

    this.vel = new Vector3();
    // Resting distance
    this.restDist = this.pos.distanceTo(this.parentPos);

  }


  update(dt, acc) {

    // First time
    if (this.count < this.initTimes) {
      this.count++;
      return;
    }
    else if (this.count == this.initTimes) {
      this.start();
      this.count++;
      return;
    }

    // Get world positions
    this.bone.getWorldPosition(this.pos);
    this.parentBone.getWorldPosition(this.parentPos);

    // Constraints
    for (let itAccuracy = 0; itAccuracy < 10; itAccuracy++) {
      // Distance constraints
      this.updateDistanceConstraint();
    }

    //let ss = JSON.stringify(this.bone.scale);

    // Verlet integration
    this.updatePhysics(dt, acc);

    // Set world positions
    this.setWorldPosition(this.bone, this.pos);

    if (this.bone.matrix.elements.includes(NaN))
      debugger;

    this.bone.scale.set(1, 1, 1);

    // if (ss != JSON.stringify(this.bone.scale))
    //   debugger;

  }



  updateDistanceConstraint() {
    // Link constraints

    // Distance constraint
    // Calculate the world distance between bones      
    this.diffPos.subVectors(this.parentPos, this.pos);
    let distance = this.pos.distanceTo(this.parentPos);

    // Difference ratio (scalar)
    let differenceScalar = (this.restDist - distance) / distance;

    // translation for each PointMass. They'll be pushed 1/2 the required distance to match their resting distances.
    let translatePos = this.diffPos.multiplyScalar(1 * differenceScalar);

    // Move bone closer together
    this.pos.sub(translatePos);
  }



  // Calculates the rotation of a bone based on its local position
  calcRotation() {

    // Get direction
    var direction = this.tempVec3.subVectors(this.neutralVec3, this.bone.position);
    // Rotate -90 degrees. Neutral rotation should be in the first iterations. Thats how we find this initial rotation.
    direction.applyEuler(this.tempEuler.set(Math.PI / 2, 0, 0));

    // Look at
    let rotationMatrix = this.tempM4;
    rotationMatrix.lookAt(this.neutralVec3, direction, this.bone.up);
    var quat = this.tempQuaternion.setFromRotationMatrix(rotationMatrix);

    return quat;
  }




  // Velvet integration
  updatePhysics(dt, acc) {

    // If it is pinned, ignore physics
    if (this.isPinned)
      return;

    // Physics
    // Inertia: objects in motion stay in motion.
    this.vel.subVectors(this.pos, this.prevPos);// vel*dt = pos - prePos

    // Dampen velocity
    this.vel.multiplyScalar(0.65);

    // nextPos = pos + vel*dt + 0.5*acc*dt*dt
    this.nextPos.addVectors(this.vel, acc.multiplyScalar(dt * dt * 0.5)); // nextPos += vel + 0.5*acc*dt*dt
    this.nextPos.add(this.pos); // nextPos += pos;

    this.prevPos.copy(this.pos); // prevPos = pos;

    this.pos.copy(this.nextPos); // pos = nextPos;

  }


  // To set world position, set as scene child, change position and then reasign to parent again
  // https://stackoverflow.com/questions/12547701/three-js-changing-the-world-position-of-a-child-3d-object
  setWorldPosition(node, position) {

    let parentNode = node.parent;
    this.scene.attach(node)
    node.position.set(...position);
    parentNode.attach(node);

    node.updateMatrix();
    node.updateWorldMatrix();
    node.updateMatrixWorld();
  }



}

export { WindsockBehavior}