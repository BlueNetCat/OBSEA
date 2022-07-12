import * as THREE from 'three';
import { Vector3 } from 'three';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

class OceanEntity {

  isLoaded = false;

  time = 0;
  tangent = new THREE.Vector3();
  binormal = new THREE.Vector3();
  normal = new THREE.Vector3();

  direction = new THREE.Vector2();

  tempVec3 = new THREE.Vector3();
  tempVec2 = new THREE.Vector2();
  
  // Constructor
  constructor(scene){

    // Load ocean mesh
    let gltfLoader = new GLTFLoader();
    gltfLoader.load('/OBSEA/Assets/Terrain/OceanSurface.glb', (gltf) => {

      // Keep HR tile and hide the other two
      this.oceanHRTile = gltf.scene.children[0];
      gltf.scene.children[1].visible = false;
      gltf.scene.children[2].visible = false;

      
      // Define material and shaders
      let oceanMaterial = new THREE.ShaderMaterial({
        blending: THREE.NormalBlending,
        transparent: true,
        // lights: true, // https://github.com/mrdoob/three.js/issues/16656
        uniforms: {
          u_time: { value: this.time },
          // u_steepness: { value: 0.5 },
          // u_wavelength: { value: 7.0 },
          // u_direction: { value: new THREE.Vector2(1, 0) },
          u_wave1Params: { value: new THREE.Vector4(0.5, 7.0, 1.0, 0.0) }, // steepness, waveHeight, directionx, directiony
          u_wave2Params: { value: new THREE.Vector4(0.25, 3.0, 1.0, 1.0) }, // steepness, waveHeight, directionx, directiony
          u_wave3Params: { value: new THREE.Vector4(0.25, 3.0, 1.0, 1.0) }, // steepness, waveHeight, directionx, directiony
        },
        vertexShader: `
        
        #define PI 3.141592653589793

        uniform float u_time;
        uniform vec4 u_wave1Params;
        uniform vec4 u_wave2Params;
        uniform vec4 u_wave3Params;

        varying vec3 v_WorldPosition;
        varying vec3 v_Normal;
        


        // Gerstner Wave
        // https://catlikecoding.com/unity/tutorials/flow/waves/
        vec3 GerstnerWave(
            vec4 waveParams, vec3 position, 
            inout vec3 tangent, inout vec3 binormal){

          float steepness = waveParams.x;
          float amplitude = waveParams.y / 2.0;
          float wavelength = amplitude * 2.0 * PI / steepness;
          vec2 direction = waveParams.zw;
        
          // Wave coefficient
          float k = 2.0 * PI / wavelength;
          // Velocity (related to gravity and wavelength)
          float velocity = 0.35 * sqrt(9.8 / k);
          
          

          // Normalize direction
          direction = normalize(direction);
          // Trochoidal wave movement
          float f = k * (dot(direction, position.xz) - velocity * u_time);

          // Tangent
          tangent += vec3(
            -direction.x * direction.x * (steepness * sin(f)),
            direction.x * (steepness * cos(f)),
            -direction.x * direction.y * (steepness * sin(f))
          );

          // Binormal
          binormal += vec3(
            -direction.x * direction.y * (steepness * sin(f)),
            direction.y * (steepness * cos(f)),
            -direction.y * direction.y * (steepness * sin(f))
          );

          return vec3(
            direction.x * (amplitude * cos(f)),
            amplitude * sin(f),
            direction.y * (amplitude * cos(f))
          );

        }


        void main() {
          // Get position
          vec3 modPos = position;

          // Declare tangent and binormal
          vec3 tangent = vec3(1.0, 0.0, 0.0);
          vec3 binormal = vec3(0.0, 0.0, 1.0);

          // Gerstner Wave
          modPos += GerstnerWave(u_wave1Params, modPos, tangent, binormal);
          modPos += GerstnerWave(u_wave2Params, modPos, tangent, binormal);
          modPos += GerstnerWave(u_wave3Params, modPos, tangent, binormal);

          // Normal
			    vec3 normal = normalize(cross(binormal, tangent));
          v_Normal = normal;


          // World position
          vec4 worldPosition = modelMatrix * vec4(modPos, 1.0);
          v_WorldPosition = worldPosition.xyz;

          // Screen space position
          gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
        }
        `,
        fragmentShader: `
          varying vec3 v_WorldPosition;
          varying vec3 v_Normal;

          void main(){
            // Sun position
            vec3 sunPosition = vec3(0.0, 1.0, 0.0);

            // Ocean color
            vec3 oceanColor = vec3(0.016, 0.064, 0.192);//(0.2, 0.2, 1.0);  
            
            // Diffuse color
            vec3 diffuseColor = oceanColor * max(0.0, dot(normalize(sunPosition), v_Normal));

            // Ambient color
            vec3 ambientColor = vec3(0.0,0.0,0.1);

            // Sky color
            vec3 skyColor = vec3(0.51, 0.75, 1.0);
            
            // Specular color
            vec3 reflection = normalize(reflect(normalize(-sunPosition), v_Normal));
            vec3 cameraRay = v_WorldPosition - cameraPosition;
            float specIncidence = max(0.0, dot(normalize(-cameraRay), reflection));
            float shiny = 50.0;
            vec3 specularColor = 0.5 * vec3(1.0,1.0,1.0) * pow(specIncidence, shiny); // * sunColor



            // Fresnel - CAMERARAY NEEDS A HACK? SWAP X BY Z AND NEGATE FIRST COMPONENT?
            // https://github.com/dli/waves/blob/master/simulation.js
            // https://www.shadertoy.com/view/4scSW4 with named variables
            // HACK - WARNING
            //float fresnel = 0.02 + 0.5 * pow(1.0 - dot(v_Normal, normalize(-cameraRay)), 5.0);
            // TODO: something wrong with the fresnel
            //float fresnel = 1.0 - (dot(vec3(0.0,1.0,0.0), normalize(cameraPosition))); // Camera position working
            //float fresnel = 1.0 - (dot(normalize(v_Normal), vec3(0.0,1.0,0.0))); // Normal working
            
            vec3 camR = normalize(-cameraRay);
            vec3 vN = v_Normal;
            float dotOperation = -(vN.x*camR.z) + (vN.y*camR.y) + (vN.z*camR.x);
            //float fresnel = 1.0 - (dot(normalize(v_Normal), normalize(-cameraRay)));
            //float fresnel = 1.0 - (dotOperation);
            float fresnel = 0.02 + 0.98 * pow(1.0 - (dotOperation), 5.0);

            fresnel = clamp(fresnel, 0.0, 1.0);
            vec3 skyFresnel = fresnel * skyColor;
            vec3 waterFresnel = (1.0 - fresnel) * oceanColor;//u_oceanColor * u_skyColor * diffuse;
            


            gl_FragColor = vec4(skyFresnel + waterFresnel + diffuseColor + specularColor, 1.0);
            
            //gl_FragColor = vec4(skyFresnel, 1.0);


            //gl_FragColor = vec4(diffuseColor + specularColor + sky, 1.0);
            //gl_FragColor = vec4( specularColor + sky, 1.0);
            //gl_FragColor = vec4(diffuseColor + specularColor, 1.0);

          }
        `,
      });



      oceanMaterial.side = THREE.DoubleSide;
      this.oceanHRTile.material = oceanMaterial;

      // Scene direction fix
      const angleFix = 90;

      gltf.scene.rotation.y = angleFix * Math.PI / 180;
      gltf.scene.translateY(-0.001);


      scene.add(gltf.scene);

      this.isLoaded = true;

    });

  }





  // Find normal at 0,0 using Gerstner equation
  getGerstnerPosition = function(params, position, tangent, binormal) { // position is needed if we decide to use xz movements
    let steepness = params[0];
    let amplitude = params[1] / 2.0;
    let wavelength = steepness * 2.0 * Math.PI / amplitude;
    this.direction.set(-params[3], params[2]);
    let direction = this.direction;//new THREE.Vector2(-params[3], params[2]);
    //let direction = new THREE.Vector2(params[2], params[3]);

    let k = 2.0 * Math.PI / wavelength;
    let velocity = 0.35 * Math.sqrt(9.8 / k);

    direction = direction.normalize();
    let f = k * direction.dot(this.tempVec2.set(position.x, position.z)) - velocity * this.time; // assume that we are always at x 0 and z 0 // float f = k * (dot(direction, position.xz) - velocity * u_time);

    this.tempVec3.set(
      -direction.x * direction.x * steepness * Math.sin(f),
      direction.x * steepness * Math.cos(f),
      -direction.x * direction.y * steepness * Math.sin(f)
    );
    tangent.add(this.tempVec3);

    this.tempVec3.set(
      -direction.x * direction.y * (steepness * Math.sin(f)),
      direction.y * (steepness * Math.cos(f)),
      -direction.y * direction.y * (steepness * Math.sin(f))
    );
    binormal.add(this.tempVec3);

    return this.tempVec3.set(
      direction.x * (amplitude * Math.cos(f)),
      amplitude * Math.sin(f),
      direction.y * (amplitude * Math.cos(f)))
  }




  getGestnerNormal = function(position, params1, params2, params3) {
    
    this.tangent.set(1,0,0);
    let tangent = this.tangent;
    this.binormal.set(0,0,1);
    let binormal = this.binormal;

    position.add(this.getGerstnerPosition(params1, position, tangent, binormal));
    position.add(this.getGerstnerPosition(params2, position, tangent, binormal));
    position.add(this.getGerstnerPosition(params3, position, tangent, binormal));

    let normal = this.normal;
    normal.crossVectors(binormal, tangent);
    normal.normalize();
    return normal;
  }



  getNormalAndPositionAt = function(position, normal){

    let calcNormal = this.getGestnerNormal(position, 
      this.getWaveParametersHTML("1"), 
      this.getWaveParametersHTML("2"), 
      this.getWaveParametersHTML("3"));

    normal.set(calcNormal.x, calcNormal.y, calcNormal.z);

  }




getWaveParametersHTML = function(id) {
  // Get wave height from slider
  let el = document.getElementById("sliderWaveHeight" + id);
  let waveHeight = parseFloat(el.value);
  el = document.getElementById("infoWaveHeight" + id);
  el.innerHTML = waveHeight + " m";

  // Get wind direction from slider
  el = document.getElementById("sliderSwellDirection" + id);
  let swellDir = parseFloat(el.value);
  el = document.getElementById("infoSwellDirection" + id);
  el.innerHTML = swellDir + " degrees";

  let dirZ = Math.cos(swellDir * Math.PI / 180);
  let dirX = Math.sin(swellDir * Math.PI / 180);

  // Get steepness from slider
  el = document.getElementById("sliderWaveSteepness" + id);
  let steepness = parseFloat(el.value);
  el = document.getElementById("infoWaveSteepness" + id);
  el.innerHTML = steepness + " steep";


  return [steepness, waveHeight, dirX, dirZ];
}








  // Update
  update(dt){
    this.time += dt;

    // Update shader parameters
    if (this.oceanHRTile != undefined) {
      let oceanHRTile = this.oceanHRTile;
      oceanHRTile.material.uniforms.u_time.value = this.time; // dt

      let params1 = this.getWaveParametersHTML("1");
      //params[0] = 0.5; // custom steepness
      oceanHRTile.material.uniforms.u_wave1Params.value.set(...params1);

      let params2 = this.getWaveParametersHTML("2");
      //params[0] = 0.25; // custom steepness
      oceanHRTile.material.uniforms.u_wave2Params.value.set(...params2);

      let params3 = this.getWaveParametersHTML("3");
      //params[0] = 0.2; // custom steepness
      oceanHRTile.material.uniforms.u_wave3Params.value.set(...params3);

      oceanHRTile.material.uniforms.u_time.uniformsNeedUpdate = true;
    }
  }

}

export { OceanEntity }