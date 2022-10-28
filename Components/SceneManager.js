import * as THREE from 'three';
import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://threejs.org/examples/jsm/loaders/FBXLoader.js'
import { RosaVentsEntity } from '/OBSEA/Assets/Orientation/RosaVentsEntity.js';
import { SandEntity } from '/OBSEA/Assets/Terrain/SandEntity.js';
import { SkyboxEntity } from '/OBSEA/Assets/Skybox/SkyboxEntity.js';

import * as FogShader from '/OBSEA/Assets/Terrain/FogShader.js'
import { OceanEntity } from '/OBSEA/Assets/Ocean/OceanEntity.js';
import { OBSEABuoyEntity } from '/OBSEA/Assets/OBSEABuoy/OBSEABuoyEntity.js';
import { OBSEAStationEntity } from '/OBSEA/Assets/OBSEAStation/ObseaStationEntity.js';
import { OBSEABiotopEntity } from '/OBSEA/Assets/OBSEABiotop/OBSEABiotopEntity.js'
//import { WindsockEntity } from '/OBSEA/Assets/Windsock/WindsockEntity.js';
import { FlagEntity } from '/OBSEA/Assets/Flag/FlagEntity.js';
import { CurrentEntity } from '/OBSEA/Assets/Current/CurrentEntity.js';
import { TextMeshEntity } from '/OBSEA/Assets/TextMesh/TextMeshEntity.js';

import { OBSEADataRetriever } from '/OBSEA/data/OBSEADataRetriever.js'



class SceneManager{

  stats;
  prevTime = 0;

  constructor(canvas){
    
    // Cache
    THREE.Cache.enabled = false;

    //const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer = renderer;

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 2000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera = camera;

    // CAMERA CONTROLS
    const controls = new OrbitControls(camera, canvas);
    this.controls = controls;
    // TODO: limit orbit controls
    // Surface
    camera.position.set(15, 10, 15);
    controls.target.set(0, 1, 0);
  // OBSEA base
  // camera.position.set(3, -16, 3);
  // controls.target.set(0,-19, 0);

    controls.update();
    controls.enableDamping = true;
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 1;

    // STATS
    let stats = new Stats();
    this.stats = stats;
    document.body.appendChild(stats.dom);
    stats.dom.style.right = '0px';
    stats.dom.style.left = null;
    stats.isVisible = false;
    stats.showPanel(false);
    
    






    // SCENE
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.background = new THREE.Color(0x47A0B9);
    this.scene.camera = this.camera;

    // Fog
    scene.fog = new THREE.FogExp2(new THREE.Color(0x47A0B9), 0.02);
    // Fog only below water
    THREE.ShaderChunk.fog_fragment = FogShader.fogFrag;
    THREE.ShaderChunk.fog_pars_fragment = FogShader.fogFragParams;
    THREE.ShaderChunk.fog_vertex = FogShader.fogVertex;
    THREE.ShaderChunk.fog_pars_vertex = FogShader.fogVertexParams;
    // AO shader fix
    THREE.ShaderChunk.aomap_fragment = `
    #ifdef USE_AOMAP
      float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r ) * aoMapIntensity ;
      reflectedLight.directDiffuse *= ambientOcclusion;
      reflectedLight.indirectDiffuse *= ambientOcclusion;
      reflectedLight.directSpecular *= ambientOcclusion;
      reflectedLight.indirectSpecular *= ambientOcclusion;
      #if defined( USE_ENVMAP ) && defined( STANDARD )
        float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
        reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
      #endif
    #endif`

    // Skybox
    this.skybox = new SkyboxEntity(scene);
    // Sand
    this.sand = new SandEntity(scene);
    // Ocean
    this.ocean = new OceanEntity(scene);
    // OBSEA Buoy
    this.obseaBuoy = new OBSEABuoyEntity(scene);
    // OBSEA Base
    this.obseaBase = new OBSEAStationEntity(scene);
    // OBSEA Biotop
    this.obseaBiotop = new OBSEABiotopEntity(scene);

    // Flag
    this.flag = new FlagEntity(scene, () => {
      this.flag.root.position.y = 1.3;
    });
    // Test TEXT
    this.windText = new TextMeshEntity(scene, "", 0.25, 0x000000, () => {
      this.windText.textObj.position.y = 9;
    });

    // Rosa dels vents
    this.rosaVents = new RosaVentsEntity(scene);
    this.rosaVents.root.position.y = 7;


    this.currents = new CurrentEntity(scene);





    // OBSEA Data
    // let dataRetriever = new OBSEADataRetriever(() => {
    //   // Modify ocean parameters
    //   if (ocean) ocean.updateOceanParameters(dataRetriever.currentParams);
    //   // Modify wind
    //   if (flag) flag.updateWindParameters(dataRetriever.currentParams);
    //   // Update currents
    //   if (currents) currents.updateCurrentParameters(dataRetriever.currentParams);
    // });




    { // LIGHT
      const skyColor = 0xB1E1FF;  // light blue
      const groundColor = 0x2090b9;  // blue
      const intensity = 0.6;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      scene.add(light);
    }

    { // LIGHT
      const color = 0xFFFFFF;
      const intensity = 0.8;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 10, 0);
      light.target.position.set(-5, 0, 0);
      scene.add(light);
      scene.add(light.target);
    }


  }




  // USER INTERACTIONS
  // Reposition camera
  focusOnBuoy = function(){
    // Tween camera position
    new TWEEN.Tween(this.camera.position)
      .to({ x: 15, y: 10, z: 15 }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    // Tween camera target
    new TWEEN.Tween(this.controls.target)
      .to({ x: 0, y: 1, z: 0 }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => this.controls.update())
      .start();
  }
  focusOnBase = function(){
    // Tween camera position
    new TWEEN.Tween(this.camera.position)
      .to({ x: 6, y: -16, z: 6 }, 4000)
      .start();
    // Tween camera target
    new TWEEN.Tween(this.controls.target)
      .to({ x: 0, y: -19, z: 0 }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => this.controls.update())
      .start();
  }
  faceNorthward = function(){
    // Tween camera position to face northward
    let dist = this.camera.position.distanceTo(this.controls.target);
    let newZ = Math.sqrt(dist * dist - Math.pow(this.camera.position.y-this.controls.target.y, 2));

    new TWEEN.Tween(this.camera.position)
      .to({ x: this.controls.target.x, z: newZ }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(()=>this.controls.update())
      .start();
  }



  // Show/Hide FPS
  showHideFPS = function(){
    let stats = this.stats;
    if (stats.isVisible){
      stats.showPanel(false);
      stats.isVisible = false;
    } else{
      stats.showPanel(0);
      stats.isVisible = true;
    }
  }









  // UPDATE
  update = function(time){
    
    if (this.prevTime == 0) this.prevTime = time; // Initial timestamp
    let dt = (time - this.prevTime) / 1000;
    this.prevTime = time;
    this.stats.update();


    // Ocean updates
    if (this.ocean && this.camera.position.y > -4) { // Limiting the updates by camera position does not improve performance in my PC 
      if (this.ocean.isLoaded) {
        this.ocean.update(dt);

        // Change buoy position
        if (this.obseaBuoy !== undefined) {
          if (this.obseaBuoy.isLoaded) {
            // Get y position and normal of the wave on that point
            let position = new THREE.Vector3();
            let normal = new THREE.Vector3();
            this.ocean.getNormalAndPositionAt(position, normal);
            
            // Exponential Moving Average (EMA) for position
            let coef = 0.8; // TODO: SHOULD NOT DEPEND ON FRAMERATE!!
            // dt from 16 to 40
            coef = 0.95 - 0.4 * (1 - dt / 16); // Dependent on frame rate
            
            let obseaBuoy = this.obseaBuoy;
            obseaBuoy.root.position.x = obseaBuoy.root.position.x * coef + (1 - coef) * position.x;
            obseaBuoy.root.position.y = obseaBuoy.root.position.y * coef + (1 - coef) * position.y;
            obseaBuoy.root.position.z = obseaBuoy.root.position.z * coef + (1 - coef) * position.z;

            // EMA for rotation
            normal.applyAxisAngle(new THREE.Vector3(1, 0, 0), 90 * Math.PI / 180)
            let tempQuat = new THREE.Quaternion();
            tempQuat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal.normalize());
            tempQuat.normalize();
            obseaBuoy.root.quaternion.slerp(tempQuat, 0.002);
          }
        }
      }
    }



    // Flag updates
    if (this.flag && this.camera.position.y > 0) {
      if (this.flag.isLoaded && this.flag.root.visible) {
        this.flag.update(time);
      }
    }



    // Current
    if (this.currents) {
      if (this.currents.isLoaded) {
        this.currents.update(dt);
      }
    }


  }





  // Resize renderer
  resizeRendererToDisplaySize = function (renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }




  // RENDER
  render = function (time) {

    // Tween update
    if (TWEEN)
      TWEEN.update();

    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.update(time);

    this.renderer.render(this.scene, this.camera);

    this.controls.update();

    requestAnimationFrame(this.render.bind(this));
  }


  startRender = function(){
    requestAnimationFrame(this.render.bind(this));
  }









  

}

export default SceneManager;