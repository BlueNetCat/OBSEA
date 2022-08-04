import * as THREE from 'three';
// Sand textures - CC0 - https://polyhaven.com/a/aerial_beach_01
class SandEntity {
  
  constructor(scene) {
    const pBottomSize = 200;
    const loader = new THREE.TextureLoader();
    const bottTexture = loader.load('/OBSEA/Assets/Terrain/SandDiffuse.jpg');
    bottTexture.wrapS = THREE.RepeatWrapping;
    bottTexture.wrapT = THREE.RepeatWrapping;
    bottTexture.magFilter = THREE.LinearFilter; //THREE.NearestFilter;
    const repeats = pBottomSize / 10;
    bottTexture.repeat.set(repeats, repeats);

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

}

export {SandEntity};