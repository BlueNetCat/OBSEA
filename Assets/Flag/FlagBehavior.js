import * as THREE from 'three';
import { AmbientLight, Vector3, Vector4 } from 'three';


class FlagBehavior {

  fixedTimestamp = 0.016;
  constraintAccuracy = 3;

  stiffness = 1;
  damping = 0.99;
  

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
        boneEl.setWorldRotation = this.setWorldRotation;
        
        // Assign physics to the bone
        boneEl.physics = new BonePhysics(boneEl, this.damping);
        // Assign bone to matrix position
        this.bones[ii][jj] = boneEl;
      }
    }

    
    // Create links
    for (let i = 0; i<this.bones.length; i++){
      for (let j = 0; j<this.bones[0].length; j++){
        this.bones[i][j].links = [];
        if (i != this.bones.length-1) // No link at the ends
          this.bones[i][j].links.push(new Link(this.bones[i][j], this.bones[i + 1][j], this.stiffness));
        if (j != this.bones[0].length - 1) // No link at the ends
          this.bones[i][j].links.push(new Link(this.bones[i][j], this.bones[i][j + 1], this.stiffness));
      }
    }

    // Create rotation corrections (orientates the bone towards the previous one)
    for (let i = 0; i < this.bones.length; i++) { 
      for (let j = 1; j < this.bones[0].length; j++) { // Skip first column
        this.bones[i][j].boneRotCorr = new BoneRotationCorrections(this.bones[i][j], this.bones[i][j -1]);
      }
    }

    // Create turbulences
    for (let i = 0; i < this.bones.length; i++) {
      for (let j = 0; j < this.bones[0].length - 1; j++) { // Skip last column
        if (i != this.bones.length - 1)
          this.bones[i][j].turbulence = new Turbulence(this.bones[i][j], this.bones[i][j + 1], this.bones[i + 1][j]);
        else // Last row
          this.bones[i][j].turbulence = new Turbulence(this.bones[i][j], this.bones[i][j + 1], this.bones[i - 1][j]); // Use bone above
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


    // Divide dt in timestamps for a fixed-dt physics simulation
    let timeTicks = Math.floor(dt/this.fixedTimestamp) + 1;
    let lastTimeStamp = this.fixedTimestamp * timeTicks - dt;
    //console.log(timeTicks + " time ticks.");
    if (timeTicks > 20){
      //console.log(dt);
      return;
    }
    

    for (let i = 0; i < timeTicks; i++){
      let timestamp = timeTicks - 1 == i ? lastTimeStamp : this.fixedTimestamp;
      
      // Update links
      for (let cAcc = 0; cAcc < this.constraintAccuracy; cAcc++){ // Constraint accuracy. The more it is solved the more accurate
        // Update angle constraints
        this.updateTurbulences(windInt);
        // Update links
        this.updateLinks();
      }
      // Update physics
      this.updatePhysics(timestamp, this.acc);
      // Update orientation
      this.updateBoneRotationCorrections();

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

  updateTurbulences(windInt){
    for (let i = 0; i < this.bones.length; i++) {
      for (let j = 0; j < this.bones[0].length - 1; j++) {
        this.bones[i][j].turbulence.update(windInt);
      }
    }
  }

  updatePhysics(dt, force) {
    for (let i = 0; i < this.bones.length; i++) {
      for (let j = 0; j < this.bones[0].length; j++) {
        let bb = this.bones[i][j];
        if (!bb.isFixed){
          bb.physics.update(dt, force);
        }
      }
    }
  }


  updateBoneRotationCorrections(){
    for (let i = 0; i < this.bones.length; i++) {
      for (let j = 1; j < this.bones[0].length; j++) {
        this.bones[i][j].boneRotCorr.update();
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

  setWorldRotation(q_rotation){
    let node = this;

    let parentNode = node.parent;
    this.scene.attach(node)
    node.quaternion.copy(q_rotation);
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

    //let d2 = posA.distanceTo(posB);
    //if (d2 > distance)
    //  debugger;

    
    this.boneA.setWorldPosition(posA);
    this.boneB.setWorldPosition(posB);
  }
}






class Turbulence {

  posA = new Vector3();
  posB = new Vector3();
  posC = new Vector3();

  vecBA = new Vector3();
  vecCA = new Vector3();
  vecCross = new Vector3();


  constructor (boneA, boneB, boneC){
    this.boneA = boneA;
    this.boneB = boneB;
    this.boneC = boneC;

  }

  update(windInt){
    // Get positions
    this.boneA.getWorldPosition(this.posA);
    this.boneB.getWorldPosition(this.posB);
    this.boneC.getWorldPosition(this.posC);
    
    // Get vectors
    this.vecBA.subVectors(this.posB, this.posA);
    this.vecCA.subVectors(this.posC, this.posA);

    // Wind intensity goes from 0 to 36 km/h
    // Below 0, we want a very small factor
    // Higher numbers demand higher factor

    let factor = 0.0001 * 5 * windInt/36;

    
    if (true){
      let randSign = (Math.round(Math.random())-0.5) * 2;
      // Cross vectors to move the flag sideways
      if (randSign > 0) {
        this.vecCross.crossVectors(this.vecBA, this.vecCA);
        this.vecCross.normalize();
        this.vecCross.multiplyScalar(factor); // ( this.minimumAngle - angle) / Math.max(angle, 1);
        this.posB.add(this.vecCross);
      } else {
        // Cross vectors in different directions
        this.vecCross.crossVectors(this.vecCA, this.vecBA);
        this.vecCross.normalize();
        this.vecCross.multiplyScalar(factor); // ( this.minimumAngle - angle) / Math.max(angle, 1);
        this.posB.add(this.vecCross);
      }
      
      this.boneB.setWorldPosition(this.posB);
      // this.boneC.setWorldPosition(this.posC);
    }
  }
}





class BonePhysics {

  constructor(bone, damping){
    this.bone = bone;
    this.damping = damping || 0.9999;

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
    this.vel.multiplyScalar(this.damping);

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






class BoneRotationCorrections {

  tempVec3 = new Vector3();
  tempVec3B = new Vector3();
  tempVec3C = new Vector3();
  neutralVec3 = new Vector3();
  upVec3 = new Vector3(0, 1, 0);
  tempEuler = new THREE.Euler();
  tempQuaternion = new THREE.Quaternion();
  tempQuatB = new THREE.Quaternion();
  tempM4 = new THREE.Matrix4();

  prevQuat = new THREE.Quaternion();

  constructor(bone, prevBone){
    this.bone = bone;
    this.prevBone = prevBone;
  }

  update(){
    let bb = this.bone;
    let bbPrev = this.prevBone;
    // Find resting quaternion (first iteration)
    if (bb.restQuat == undefined){
      bb.restQuat = bb.getWorldQuaternion(new THREE.Quaternion());
    }
    // Get world positions
    let pos = bb.getWorldPosition(this.tempVec3);
    let anchor = bbPrev.getWorldPosition(this.tempVec3B);
    // Direction (from point to anchor)
    let direction = this.tempVec3C.subVectors(anchor, pos);

    // Calculate rotation matrix
    let rotationMatrix = this.tempM4;
    rotationMatrix.lookAt(this.neutralVec3, direction, this.upVec3); // eye, target, up
    this.tempQuaternion.setFromRotationMatrix(rotationMatrix);

    // Multiply by resting quaternion
    this.tempQuaternion.multiply(bb.restQuat);

    // Compare with previous quaternion to avoid drastic changes
    bb.getWorldQuaternion(this.tempQuatB);
    let angleRad = this.tempQuatB.angleTo(this.tempQuaternion);
    let angle = angleRad * 180 / Math.PI;

    if (angle < 170) // Sometimes it goes to 179.99
      // Apply rotation matrix
      bb.setWorldRotation(this.tempQuaternion);
    
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