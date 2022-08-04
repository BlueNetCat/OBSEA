// https://threejs.org/docs/index.html#api/en/materials/ShaderMaterial
// https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html
// https://www.khronos.org/files/opengles_shading_language.pdf
// https://codepen.io/prisoner849/pen/WNQNdpv?editors=0010
// Ben Cloward has some interesting tutorials with Unreal Engine on how to make water effects
// UE Ocean using texture https://www.youtube.com/watch?v=r68DnTMeFFQ&list=PL78XDi0TS4lGXKflD2Z5aY2sLuIln6-sD&ab_channel=BenCloward
// Adding a Gestner wave to that https://www.youtube.com/watch?v=BJSMVvZMQ1w&ab_channel=BenCloward

// 2D water effect
// https://brandenstrochinsky.blogspot.com/2016/06/water-effect.html
// Screen space reflections (SSR)
// https://www.youtube.com/watch?v=K2rs7K4y_sY&ab_channel=NullPointer
// https://threejs.org/examples/?q=post#webgl_postprocessing_ssr

// Blending normals
// https://blog.selfshadow.com/publications/blending-in-detail/

// Read more about normal mapping
// https://www.youtube.com/watch?v=6_-NNKc4lrk&ab_channel=Makin%27StuffLookGood
// https://www.youtube.com/watch?v=JNj1A1bl7gg&ab_channel=VictorGordan

// Use VS plugin "Comment tagged templates" and add /* glsl */
export const OceanVertShader = /* glsl */ `
        
  #define PI 3.141592653589793

  uniform float u_time;
  uniform vec3 u_imgSize;
  uniform sampler2D u_paramsTexture;
  uniform float u_steepnessFactor;

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

    float steepness = max(waveParams.x, 0.01);
    float amplitude = max(waveParams.y, 0.01) / 2.0;
    float wavelength = amplitude * 2.0 * PI / steepness;
    vec2 direction = waveParams.zw;

    // Wave coefficient
    float k = 2.0 * PI / wavelength;
    // Velocity (related to gravity and wavelength)
    float velocity = 0.35 * sqrt(9.8 / k);
    
    

    // Normalize direction
    direction = normalize(direction);
    // Trochoidal wave movement
    float f = k * (dot(direction, position.xz) - velocity * u_time); // + randomPhase

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


    // Iterate over all the waves
    for (int i = 0; i < int(u_imgSize.x); i++){
      for (int j = 0; j < int(u_imgSize.y); j++){
        vec4 params = texture2D(u_paramsTexture, vec2(float(i)/u_imgSize.x, float(j)/u_imgSize.y));
        // Steepness factor
        params.r = params.r * u_steepnessFactor;
        // Wave height
        //params.g = params.g/(u_imgSize.x*u_imgSize.y);
        // Direction
        params.b = params.b - 0.5;
        params.a = params.a - 0.5;
        modPos += GerstnerWave(params, modPos, tangent, binormal);
      }
    }


    // Normal
    vec3 normal = normalize(cross(binormal, tangent));
    //normal = (modelMatrix * vec4(normal, 1.0)).xyz; // Produces strange blending between ocean meshes
    v_Normal = normal.xzy; // Do the rotation manually

    // World position
    vec4 worldPosition = modelMatrix * vec4(modPos, 1.0);
    v_WorldPosition = worldPosition.xyz;


    // Screen space position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
  }
  `;












export const OceanFragShader = /* glsl */`

  varying vec3 v_WorldPosition;
  varying vec3 v_Normal;
  uniform sampler2D u_normalTexture;
  uniform float u_time;

  //varying vec4 v_OceanColor;


  // https://github.com/dli/waves/blob/master/simulation.js
  vec3 hdr (vec3 color, float exposure) {
      return 1.0 - exp(-color * exposure);
  }



  void main(){

    // Bump texture for specular reflections
    vec2 scale = vec2(5.0,5.0);
    float speedFactor = 0.0;
    vec2 textCoord =  vec2(v_WorldPosition.xz + u_time * speedFactor);
    textCoord.x = textCoord.x / scale.x;
    textCoord.y = textCoord.y / scale.y;
  
    vec4 normalTexel = texture2D(u_normalTexture, textCoord) * 2.0 - 1.0; // Should be world position or local position?
    //normalTexel.xyz = normalTexel.xzy; // Put normal texel in the same coordinates as the v_Normal
    // Normal blending
    // https://blog.selfshadow.com/publications/blending-in-detail/
    // Partial derivative blending
    vec3 n1 = v_Normal;
    vec3 n2 = normalTexel.xyz;
    vec2 pd = n1.xy/n1.z + n2.xy/n2.z; // Add the PDs
    vec3 normal  = normalize(vec3(pd, 1.0)); // Partial derivative
    //vec3 normal = normalize(vec3(n1.xy + n2.xy, n1.z*n2.z)); // Whiteout blending
    //vec3 normal = v_Normal;

    // float glossyFactor = 0.0;
    // vec3 normal = normalize(normalTexel.xzy)*glossyFactor + v_Normal.xyz; // HACK: v_Normal seems to have the z and the y flipped.

    // normal = normalize(normal.xyz);

    // Sun position
    vec3 sunPosition = vec3(0.0, 10.0, 0.0);

    // Ocean color
    vec3 oceanColor = vec3(0.016, 0.064, 0.192);//(0.2, 0.2, 1.0);  
    
    // Diffuse color
    vec3 diffuseColor = oceanColor * max(0.0, dot(normalize(sunPosition), v_Normal)); // NORMAL WITHOUT TEXTURE

    // Ambient color
    vec3 ambientColor = vec3(0.0,0.0,0.1);

    // Sky color
    vec3 skyColor = vec3(0.51, 0.75, 1.0);
    
    // Specular color
    // -sunPosition = Incident ray
    //vec3 reflection = normalize(reflect(normalize(-sunPosition), normal)); // TODO: NORMAL HAS Z AND Y FLIPPED
    vec3 reflection = normalize(reflect(normalize(sunPosition), normal)); // TODO: NORMAL HAS Z AND Y FLIPPED
    vec3 cameraRay = v_WorldPosition - cameraPosition;
    float specIncidence = max(0.0, dot(normalize(-cameraRay), reflection));
    float shiny = 100.0;
    float specFactor = 5.0;
    vec3 specularColor = specFactor * vec3(1.0,1.0,1.0) * pow(specIncidence, shiny); // * sunColor



    // Fresnel - CAMERARAY NEEDS A HACK? SWAP X BY Z AND NEGATE FIRST COMPONENT?
    // https://github.com/dli/waves/blob/master/simulation.js
    // https://www.shadertoy.com/view/4scSW4 with named variables
    // HACK - WARNING 
    vec3 nFresnel = v_Normal; // USE NORMAL WITHOUT TEXTURE (from geometry)
    vec3 camR = normalize(-cameraRay); // TODO: NORMAL HAS Z AND Y FLIPPED
    float dotOperation = -(nFresnel.x*camR.z) + (nFresnel.z*camR.y) + (nFresnel.y*camR.x); // SOME HACK THAT MAKES IT LOOK GOOD
    //float fresnel = 1.0 - (dotOperation);
    float fresnel = 0.02 + 0.98 * pow(1.0 - (dotOperation), 5.0);

    fresnel = clamp(fresnel, 0.0, 1.0);
    vec3 skyFresnel = fresnel * skyColor;
    vec3 waterFresnel = (1.0 - fresnel) * oceanColor;//(1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;
    //vec3 waterFresnel = (1.0 - fresnel) * (oceanColor*3.0 + skyColor + diffuseColor) / 5.0;
    

    vec3 color = skyFresnel*2.0 + waterFresnel*2.0 + diffuseColor + specularColor;

    color = hdr(color, 0.99); // From David Li https://github.com/dli/waves/blob/master/simulation.js

    gl_FragColor = vec4(color, 0.9);
    //gl_FragColor = vec4(skyFresnel + waterFresnel + diffuseColor + specularColor, 0.92);
    

    //gl_FragColor = vec4(skyFresnel, 1.0);
    //gl_FragColor = vec4(waterFresnel, 1.0);
    //gl_FragColor = vec4(dotOperation, dotOperation, dotOperation, 1.0);
    //gl_FragColor = vec4(fresnel, fresnel, fresnel, 1.0);


    //gl_FragColor = vec4(diffuseColor + specularColor + skyColor, 1.0);
    //gl_FragColor = vec4( specularColor + skyColor, 1.0);
    //gl_FragColor = vec4(diffuseColor + specularColor, 1.0);
    //gl_FragColor = vec4(v_OceanColor.rgb, 1.0);
    //gl_FragColor = vec4((temp.xzy + 1.0)/2.0, 1.0);
    //gl_FragColor = vec4((normalTexel.xyz + 1.0)/2.0, 1.0);
    //gl_FragColor = vec4((normal.xyz + 1.0)/2.0, 1.0);
    //gl_FragColor = vec4(diffuseColor*5.0, 1.0);
    //gl_FragColor = vec4(diffuseColor +  specularColor, 1.0);
    //gl_FragColor = vec4(specIncidence, specIncidence, specIncidence, 1.0);
  }
  `;