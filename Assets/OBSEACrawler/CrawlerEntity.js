import * as THREE from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OBSEACrawlerEntity {
  constructor(scene){
    const gltfLoader = new GLTFLoader();
    const texLoader = new THREE.TextureLoader();
    gltfLoader.load('/OBSEA/Assets/OBSEACrawler/Crawler.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;

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
      root.translateX(6);
      root.translateZ(-1);
      root.rotation.y = 66 * Math.PI / 180;

      scene.add(root);
    });
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