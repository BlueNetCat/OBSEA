import * as THREE from 'three';
import { DataTexture3D, Vector3, Vector4 } from 'three';

// https://www.reddit.com/r/flying/comments/ip7k0y/faa_standard_windsock_should_indicate_direction/
// 28 km/h --> fully extended
// 5.6 km/h --> move freely
// There's no requirement that the windsock has stripes at all.
class FlagBehavior {

  fixedTimestamp = 0.016;
  constraintAccuracy = 3;

  constructor(flagObj, scene) {
    // Scene object
    this.flagObj = flagObj;
    // Create bones matrix
    this.bones = [];
    for (let i = 0; i<flagObj.children.length; i++){
      let boneEl = flagObj.children[i]
      // Ignore non-bone children (SkinnedMesh)
      if (boneEl.type == 'Bone'){
        let boneName = boneEl.name; // 'ij' is the name format (defined in flag.blend)
        let ii = parseInt(boneName[0]);
        let jj = parseInt(boneName[1]);
        // Initialize row
        if (this.bones[ii] == undefined)
          this.bones[ii] = [];
        
        // Fix the bones close to the pole
        if (jj == 0)
          boneEl.isFixed = true;

        // Assign setWorldPosition function to the bone
        boneEl.scene = scene;
        boneEl.setWorldPosition = this.setWorldPosition;
        // Assign physics to the bone
        boneEl.physics = new BonePhysics(boneEl);
        // Assign bone to matrix position
        this.bones[ii][jj] = boneEl;
      }
    }

    
    // Create links
    for (let i = 0; i<this.bones.length; i++){
      for (let j = 0; j<this.bones[0].length; j++){
        this.bones[i][j].links = [];
        if (i != this.bones.length-1) // No link at the ends
          this.bones[i][j].links.push(new Link(this.bones[i][j], this.bones[i + 1][j]));
        if (j != this.bones[0].length - 1) // No link at the ends
          this.bones[i][j].links.push(new Link(this.bones[i][j], this.bones[i][j + 1]));
      }
    }
    // Scene
    this.scene = scene;


    // Acceleration ( wind force and gravity)
    this.acc = new Vector3();
    // Update previous time
    this.prevTime = 0;
  }


  // Update flag bone positions
  // https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519
  updateFlag(flagObj, windInt, windDir, time) {
    if (flagObj == undefined)
      return;

    // Time elapsed
    let dt = time * 0.001 - this.prevTime;
    this.prevTime = time * 0.001;

    // Calculate wind vector
    let windRad = windDir * Math.PI / 180 + Math.PI; // Add 180 and make clockwise
    windRad = -windRad; // Clockwise

    // Rotate object
    flagObj.rotation.y = windRad;
    
    // Wind components
    let windZ = Math.cos(windRad) * windInt;
    let windX = Math.sin(windRad) * windInt;
    // Add noise / turbulence
    windZ += (Math.random() * 2 - 1) * windZ * 0.01;
    windX += (Math.random() * 2 - 1) * windX * 0.01;

    // Force
    this.acc.set(-windX, -9.8, -windZ);
    // this.acc.set(-windX, -9.8, -windZ);


    // Divide dt in timestamps for a fixed-dt physics simulation
    let timeTicks = Math.floor(dt/this.fixedTimestamp) + 1;
    let lastTimeStamp = this.fixedTimestamp * timeTicks - dt;
    console.log(timeTicks + " time ticks.");
    if (timeTicks > 10){
      console.log(dt);
      return;
    }
    

    for (let i = 0; i < timeTicks; i++){
      let timestamp = timeTicks - 1 == i ? lastTimeStamp : this.fixedTimestamp;
      // Update links
      for (let cAcc = 0; cAcc < this.constraintAccuracy; cAcc++){ // Constraint accuracy. The more it is solved the more accurate
        this.updateLinks();
      }
      // Update physics
      this.updatePhysics(timestamp, this.acc);

    }
    
    return;




    // Rotate base wind sock - Does not work well, should rotate windSocks[0].bone, but it is messed up in the updates
    //windSocks[0].parentBone.quaternion.setFromEuler(new THREE.Euler(-110 * Math.PI/180, 0, 0), true); // TODO: Memory loss
    let windSocks = this.sockSections;
    windSocks.forEach((ws => {
      dt = 0.016 * 1.8;
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


  updateLinks(){
    for (let i = 0; i < this.bones.length; i++) {
      for (let j = 0; j < this.bones[0].length; j++) {
        let bb = this.bones[i][j];
        for (let k = 0; k < bb.links.length; k++){
          bb.links[k].updateLink();
        }
      }
    }
  }

  updatePhysics(dt, force) {
    for (let i = 0; i < this.bones.length; i++) {
      for (let j = 0; j < this.bones[0].length; j++) {
        if (!this.bones[i][j].isFixed)
          this.bones[i][j].physics.update(dt, force);
      }
    }
  }



  // To set world position, set as scene child, change position and then reasign to parent again
  setWorldPosition(position) {
    let node = this;

    let parentNode = node.parent;
    this.scene.attach(node)
    node.position.set(...position);
    parentNode.attach(node);

    node.updateMatrix();
    node.updateWorldMatrix();
    node.updateMatrixWorld();
  }

}










class Link {
  restingDistance;
  stiffness;

  boneA;
  boneB;

  // Helpers
  posA = new Vector3();
  posB = new Vector3();
  diffPos = new Vector3();
  tempVec3 = new Vector3();

  constructor(boneA, boneB, stiffness, restingDistance){
    this.boneA = boneA;
    this.boneB = boneB;
    if (restingDistance)
      this.restingDistance = restingDistance;
    else { // Calculate resting distance
      this.boneA.getWorldPosition(this.posA);
      this.boneB.getWorldPosition(this.posB);
      this.restingDistance = this.posA.distanceTo(this.posB);
    }
    this.stiffness = stiffness || 1;
  }

  // Keeps the distances between bones
  updateLink(){
    let posA = this.posA;
    let posB = this.posB;
    // Calculate distance between bones
    this.boneA.getWorldPosition(posA);
    this.boneB.getWorldPosition(posB);
    if (isNaN(posA.x) || isNaN(posB.x))
      debugger;

    // Distance between points
    let distance = posA.distanceTo(posB);

    // Difference ratio of distance in respect to the resting distance
    let difference = (this.restingDistance - distance) / distance;

    //if (difference > 0.01 && this.boneA.name == '23')
    //  debugger;

    // Points can have different masses. Ignored for flag
    let massA = 1;
    let massB = 1;
    let scalarA = 0.5 / this.stiffness;//this.stiffness * (1 / (massA * (1/massA + 1/massB) ));
    let scalarB = 0.5 / this.stiffness;//this.stiffness - scalarA;

    // Pull or push if it is not pinned
    if (!this.boneA.isFixed){
      this.tempVec3.subVectors(posA, posB);
      this.tempVec3.multiplyScalar(scalarA * difference);
      posA.add(this.tempVec3);
    } if (!this.boneB.isFixed) {
      this.tempVec3.subVectors(posA, posB);
      this.tempVec3.multiplyScalar(scalarB * difference);
      posB.sub(this.tempVec3);
    }

    let d2 = posA.distanceTo(posB);
    //if (d2 > distance)
    //  debugger;

    
    this.boneA.setWorldPosition(posA);
    this.boneB.setWorldPosition(posB);
  }
}








class BonePhysics {

  constructor(bone){
    this.bone = bone;

    // Helpers
    this.pos = new Vector3();
    this.vel = new Vector3();
    this.nextPos = new Vector3();
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

  update(dt, force){
    
    
    // Calculate velocity. We don't divide by time because in the calculation of the next position it is not multiplied by time
    this.bone.getWorldPosition(this.pos);
    // Initialize prevPos if it does not exist
    if (this.prevPos == undefined)
      this.prevPos = new Vector3(...this.pos);
    this.vel.subVectors(this.pos, this.prevPos);

    //  Dampen velocity
    this.vel.multiplyScalar(0.99);

    // Calculate the next position using Verlet Integration
    this.tempVec3.set(...force);
    this.tempVec3.multiplyScalar(dt * dt * 0.5); // 0.5 * acc * t^2
    this.tempVec3.add(this.vel); // + vel * t
    this.tempVec3.add(this.pos); // + pos0
    
    // Store previous position
    this.prevPos.set(...this.pos);
    // Set world position
    this.bone.setWorldPosition(this.tempVec3);
    
  }

}




























// Sock section
class SockSection {
  constructor(bone, parentBone, scene, isFixed) {

    this.bone = bone;
    this.parentBone = parentBone;

    this.scene = scene;

    // Is pinned
    this.isFixed = isFixed || false;

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
    if (this.isFixed)
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

export { FlagBehavior }