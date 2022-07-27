// https://threejs.org/docs/index.html#api/en/materials/ShaderMaterial
// https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html
// https://www.khronos.org/files/opengles_shading_language.pdf
// https://codepen.io/prisoner849/pen/WNQNdpv?editors=0010

export const OceanVertShader = `
        
  #define PI 3.141592653589793

  uniform float u_time;
  uniform sampler2D u_paramsTexture;

  uniform vec4 u_wave1Params;
  uniform vec4 u_wave2Params;
  uniform vec4 u_wave3Params;

  varying vec3 v_WorldPosition;
  varying vec3 v_Normal;
  varying vec4 v_OceanColor;



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

    // Get data texture values
    vec4 params1 = texture2D(u_paramsTexture, vec2(0.0/16.0, 0.0/16.0));
    vec4 params2 = texture2D(u_paramsTexture, vec2(1.0/16.0, 0.0/16.0));
    vec4 params3 = texture2D(u_paramsTexture, vec2(2.0/16.0, 0.0/16.0));

    // Rescale parameters
    params1.g = 6.0 * params1.g; // height
    params2.g = 6.0 * params2.g;
    params3.g = 6.0 * params3.g;


    vec2 texSize = vec2(16.0 ,16.0);
    //vec4 texValue = texture2D(u_paramsTexture, vec2(0.0/16.0, 0.0/16.0));
    //v_OceanColor = texValue;

    // Gerstner Wave
    // modPos += GerstnerWave(u_wave1Params, modPos, tangent, binormal);
    // modPos += GerstnerWave(u_wave2Params, modPos, tangent, binormal);
    // modPos += GerstnerWave(u_wave3Params, modPos, tangent, binormal);
    modPos += GerstnerWave(params1, modPos, tangent, binormal);
    modPos += GerstnerWave(params2, modPos, tangent, binormal);
    modPos += GerstnerWave(params3, modPos, tangent, binormal);

    // Normal
    vec3 normal = normalize(cross(binormal, tangent));
    v_Normal = normal;


    // World position
    vec4 worldPosition = modelMatrix * vec4(modPos, 1.0);
    v_WorldPosition = worldPosition.xyz;

    // Screen space position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
  }
  `;


export const OceanFragShader = `

  varying vec3 v_WorldPosition;
  varying vec3 v_Normal;
  //varying vec4 v_OceanColor;

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
    


    gl_FragColor = vec4(skyFresnel + waterFresnel + diffuseColor + specularColor, 0.92);
    
    //gl_FragColor = vec4(skyFresnel, 1.0);


    //gl_FragColor = vec4(diffuseColor + specularColor + sky, 1.0);
    //gl_FragColor = vec4( specularColor + sky, 1.0);
    //gl_FragColor = vec4(diffuseColor + specularColor, 1.0);
    //gl_FragColor = vec4(v_OceanColor.rgb, 1.0);

  }
  `;