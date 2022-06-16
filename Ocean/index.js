import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
//import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://threejs.org/examples/jsm/loaders/FBXLoader.js'
// import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';


/* OCEAN
https://threejs.org/examples/webgl_shaders_ocean.html
https://29a.ch/slides/2012/webglwater/
https://29a.ch/sandbox/2012/terrain/
https://www.tamats.com/work/bwr/
https://madebyevan.com/webgl-water/
https://www.youtube.com/watch?v=kGEqaX4Y4bQ&ab_channel=JumpTrajectory
https://doc.babylonjs.com/advanced_topics/webGPU/computeShader
https://playground.babylonjs.com/?webgpu#YX6IB8#55
http://david.li/waves/
https://www.shadertoy.com/view/4dBcRD#
https://www.shadertoy.com/view/Xdlczl


TODO:
- Create a multiresolution plane
  - Future: Resolution based on camera position?
- Shader development platform for testing
- Implement ocean shader

- Fix fog above/below surface
- Skybox
  - Future: linked to real sun position


*/


function main() {
  // Cache
  THREE.Cache.enabled = false;

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.outputEncoding = THREE.sRGBEncoding;

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 2000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  

  const controls = new OrbitControls(camera, canvas);
  // TODO: limit orbit controls
  // Surface
  camera.position.set(5, 3, 5);
  controls.target.set(0, 1, 0);
  // OBSEA base
  // camera.position.set(3, -16, 3);
  // controls.target.set(0,-19, 0);

  
  controls.update();

  const scene = new THREE.Scene();
  let time = 0;

  // Skybox
  // const cubeTextureLoader = new THREE.CubeTextureLoader();
  // const cubeTexture = cubeTextureLoader.load([
  //   './skybox/front.png',
  //   './skybox/back.png',

  //   './skybox/top.png',
  //   './skybox/bottom.png',

  //   './skybox/right.png',
  //   './skybox/left.png',
  // ]);
  { // Skybox
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./skybox/skybox.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Scale
      root.scale.multiplyScalar(10);
      // Scene direction fix
      const angleFix = 90;
      root.rotation.y = angleFix * Math.PI / 180;

      scene.add(root);
    });


  }
  scene.background = new THREE.Color(0x47A0B9);

  
  
  // Fog
  scene.fog = new THREE.FogExp2(new THREE.Color(0x47A0B9), 0.02);

  THREE.ShaderChunk.fog_fragment = `
    #ifdef USE_FOG
      vec3 fogOrigin = cameraPosition;
      vec3 fogDirection = normalize(vWorldPosition - fogOrigin);
      float fogDepth = distance(vWorldPosition, fogOrigin);

      #ifdef FOG_EXP2
        float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
      #else
        float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
      #endif

      float underwaterFactor = max( -vWorldPosition.y / abs(vWorldPosition.y), 0.0);
      fogFactor = min(1.0, fogFactor * underwaterFactor);

      gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
    #endif
  `;

  THREE.ShaderChunk.fog_pars_fragment = `
    #ifdef USE_FOG
      uniform vec3 fogColor;
      varying vec3 vWorldPosition;
      #ifdef FOG_EXP2
        uniform float fogDensity;
      #else
        uniform float fogNear;
        uniform float fogFar;
      #endif
    #endif
  `;

  THREE.ShaderChunk.fog_vertex = `
    #ifdef USE_FOG
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
    #endif
  `;

  THREE.ShaderChunk.fog_pars_vertex = `
    #ifdef USE_FOG
      varying vec3 vWorldPosition;
    #endif
  `;


  let oceanHRTile = undefined;
  { // OCEAN SURFACE
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('../Assets/Terrain/OceanSurface.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;


      // OCEAN SHADER
      //THREE.ShaderChunk.fog_fragment
      // https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
      // https://www.khronos.org/opengles/sdk/docs/manglsl/docbook4/
      oceanHRTile = root.children[0];
      oceanHRTile.material = new THREE.ShaderMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        uniforms: {
          u_time: {value: time * 0.001},
          u_steepness: {value: 0.7},
          u_wavelength: {value: 7.0},
        },
        vertexShader: `
        
        #define PI 3.141592653589793

        uniform float u_time;
        uniform float u_steepness;
        uniform float u_wavelength;
        // TODO: 2D VELOCITY / DIRECTION

        varying vec3 v_WorldPosition;
        varying vec3 v_Normal;
        

        void main() {
          // Modify y position
          vec3 modPos = position;

          // Wave length
          float k = 2.0 * PI / u_wavelength;
          // Velocity is related to wave length
          float velocity = 0.35 * sqrt(9.8 / k);
          // Amplitude is related to wavelength
          float amplitude = u_steepness / k;

          // X wave movement
          float fx = k * (modPos.x - velocity * u_time);
          // Z wave movement
          //modPos.y += amplitude * sin(k * modPos.z - velocity * u_time);

          // Displacement
          modPos.y = amplitude * sin(fx);
          modPos.x += amplitude * cos(fx);

          // World position
          vec4 worldPosition = modelMatrix * vec4(modPos, 1.0);
          v_WorldPosition = worldPosition.xyz;

          // Screen space position
          gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);

          // Recalculate normal
          // https://catlikecoding.com/unity/tutorials/flow/waves/
          // Calculate tangent
          vec3 tangent = normalize(vec3(
            1.0 - u_steepness * sin(fx), 
            u_steepness * cos(fx), 
            0.0)
          );
          // Normal
			    vec3 normal = vec3(-tangent.y, tangent.x, 0.0);
          v_Normal = normal;
        }
        `,
        fragmentShader: `
          varying vec3 v_WorldPosition;
          varying vec3 v_Normal;

          void main(){
            vec3 color = vec3(0.2, 0.2, 1.0);

            vec3 sunPosition = vec3(0.0, 1.0, 0.0);
            
            // Diffuse color
            vec3 diffuseColor = color * max(0.0, dot(normalize(sunPosition), v_Normal));

            // Ambient color
            vec3 ambientColor = vec3(0.0,0.0,0.1);
            
            // Specular color
            vec3 reflection = normalize(reflect(normalize(-sunPosition), v_Normal));
            float specIncidence = max(0.0, dot(normalize(cameraPosition), reflection));
            float shiny = 20.0;
            vec3 specularColor = vec3(1.0,1.0,1.0) * pow(specIncidence, shiny); // * sunColor

            gl_FragColor = vec4(diffuseColor + specularColor, 1.0);



            //gl_FragColor = vec4(color*(v_WorldPosition.y*0.5+1.0) + vec3(0.0,0.0,0.2), 1.0);
          }
        `,
      });
      
      // TODO: mesh instancing and repeating
      // https://codeburst.io/infinite-scene-with-threejs-and-instancedmesh-adc74b8efcf4
      root.children[1].visible = false
      root.children[2].visible = false
    



      // Double sided
      root.children.forEach(child => {
        child.material.side = THREE.DoubleSide;
      });
      // Fix frustrum culling
      //root.children[0].children[1].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;
      root.translateY(-0.001);
      

      scene.add(root);
      console.log(dumpObject(root).join('\n'));
    });

  }



  { // TOP PLANE (ROSA DELS VENTS)
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

  // BOTTOM PLANE (SAND)
  {
    const pBottomSize = 200;
    const loader = new THREE.TextureLoader();
    const bottTexture = loader.load('../Assets/Terrain/SandDiffuse.jpg');
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

  
  
  
  { // OBSEA Station
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('../Assets/OBSEAStation/OBSEAStation.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;
      
      root.rotation.y = angleFix * Math.PI / 180;
      root.translateY(-19.4);
      
      scene.add(root);
      console.log(dumpObject(root).join('\n'));
    });


  }


  { // OBSEA Buoy
    // https://www.youtube.com/watch?v=6LA8vEB47Nk&ab_channel=DirkTeucher
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('../Assets/OBSEABuoy/OBSEABuoy.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].children[1].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;
      scene.add(root);

      // Material AO
      let mesh = root.children[0];
      let material = mesh.material;
      //material.aoMapIntensity = 2      

      console.log(dumpObject(root).join('\n'));
    });


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


  // UPDATE LOOP
  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    time += 0.016;
    //
    if (oceanHRTile != undefined){
      oceanHRTile.material.uniforms.u_time.value = time; // dt
      oceanHRTile.material.uniforms.u_time.uniformsNeedUpdate = true;
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
