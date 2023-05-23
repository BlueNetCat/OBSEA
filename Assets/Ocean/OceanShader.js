// https://threejs.org/docs/index.html#api/en/materials/ShaderMaterial
// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram -- cameraPosition matrices etc...
// https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html
// https://www.khronos.org/files/opengles_shading_language.pdf
// https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf // For WebGL

// Data texture
// https://codepen.io/prisoner849/pen/WNQNdpv?editors=0010

// Ben Cloward has some interesting tutorials with Unreal Engine on how to make water effects, but they are not explained
// UE Ocean using texture https://www.youtube.com/watch?v=r68DnTMeFFQ&list=PL78XDi0TS4lGXKflD2Z5aY2sLuIln6-sD&ab_channel=BenCloward
// Adding a Gestner wave to that https://www.youtube.com/watch?v=BJSMVvZMQ1w&ab_channel=BenCloward

// Gestner waves tutorial
// https://catlikecoding.com/unity/tutorials/flow/waves/

// 2D water effect
// https://brandenstrochinsky.blogspot.com/2016/06/water-effect.html
// Screen space reflections (SSR)
// https://www.youtube.com/watch?v=K2rs7K4y_sY&ab_channel=NullPointer
// https://threejs.org/examples/?q=post#webgl_postprocessing_ssr
// Mirror reflection
// http://www.shiplab.hials.org/app/simulator/Elias/

// Blending normals
// https://blog.selfshadow.com/publications/blending-in-detail/

// Foam
// RenderToTarget the displacement. Use it to create a foam texture and particles
// https://www.youtube.com/watch?v=UWGwq-_w08c&ab_channel=GhislainGirardot

// Read more about normal mapping
// https://www.youtube.com/watch?v=6_-NNKc4lrk&ab_channel=Makin%27StuffLookGood
// https://www.youtube.com/watch?v=JNj1A1bl7gg&ab_channel=VictorGordan

// GLSL OPTIMIZATIONS
// https://www.khronos.org/opengl/wiki/GLSL_Optimizations

// Use VS plugin "Comment tagged templates" and add /* glsl */
export const OceanVertShader = /* glsl */ `
        
  #define PI 3.141592653589793
  precision lowp float;

  uniform float u_time;
  uniform vec3 u_imgSize;
  uniform sampler2D u_paramsTexture;
  uniform float u_steepnessFactor;

  uniform vec4 u_wave1Params;
  uniform vec4 u_wave2Params;
  uniform vec4 u_wave3Params;

  

  varying vec3 v_WorldPosition;
  varying vec3 v_Normal;
  varying mat3 v_TBN;
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
    float velocity = sqrt(9.8 / k);
    
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

    // Attenuate waves as they get further away form the center (avoids artifacts)
    float distanceToCenter = distance(vec3(0.0, 0.0, 0.0), position);
    float distanceStart = 200.0;
    distanceToCenter = min(10000.0, max(distanceStart, distanceToCenter));
    float distanceFactor = max(0.0001, distanceStart/(distanceToCenter));

    // Declare tangent and binormal
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);


    // Gerstner Waves
    modPos += GerstnerWave(u_wave1Params, position, tangent, binormal); 
    // Attenuation
    modPos.y *= distanceFactor;
    tangent.x /= distanceFactor;
    binormal.z /= distanceFactor;
    tangent = normalize(tangent);
    binormal = normalize(binormal);

    modPos += GerstnerWave(u_wave2Params, position, tangent, binormal);
    // Attenuation
    modPos.y *= distanceFactor;
    tangent.x /= distanceFactor;
    binormal.z /= distanceFactor;
    tangent = normalize(tangent);
    binormal = normalize(binormal);

    modPos += GerstnerWave(u_wave3Params, position, tangent, binormal); 
    // Attenuation
    modPos.y *= distanceFactor;
    tangent.x /= distanceFactor;
    binormal.z /= distanceFactor;
    tangent = normalize(tangent);
    binormal = normalize(binormal);


    // Iterate over all the waves
    for (int i = 0; i < int(u_imgSize.x); i++){
      for (int j = 0; j < int(u_imgSize.y); j++){
        vec4 params = texture2D(u_paramsTexture, vec2(float(i)/u_imgSize.x, float(j)/u_imgSize.y));
        // Steepness factor
        params.r = params.r * u_steepnessFactor;
        // Wave height factor
        //params.g = params.g/(u_imgSize.x*u_imgSize.y);
        // Direction
        params.b = params.b - 0.5;
        params.a = params.a - 0.5;
        modPos += GerstnerWave(params, position, tangent, binormal);
        // Attenuation
        modPos.y *= distanceFactor;
        tangent.x /= distanceFactor;
        binormal.z /= distanceFactor;
        tangent = normalize(tangent);
        binormal = normalize(binormal);
      }
    }


    // Normal
    vec3 normal = normalize(cross(binormal, tangent));
    normal = (modelMatrix * vec4(normal, 0.0)).xyz; 
    v_Normal = normalize(normal.xyz); 

    // World position
    vec4 worldPosition = modelMatrix * vec4(modPos, 1.0);
    v_WorldPosition = worldPosition.xyz;

    // Model
    v_TBN = mat3(tangent, binormal, normal);


    // Screen space position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
  }
  `;












export const OceanFragShader = /* glsl */`

  precision lowp float;

  varying vec3 v_WorldPosition;
  varying vec3 v_Normal;
  varying mat3 v_TBN;

  uniform sampler2D u_normalTexture;
  uniform float u_time;
  // Fog
  uniform vec3 u_fogUnderwaterColor;
  uniform float u_fogDensity;

  //varying vec4 v_OceanColor;


  // https://github.com/dli/waves/blob/master/simulation.js
  vec3 hdr (vec3 color, float exposure) {
      return 1.0 - exp(-color * exposure);
  }



  void main(){

    // Bump texture for specular reflections
    vec2 scale = vec2(2.0,2.0);
    float speedFactor = 0.0;
    vec2 textCoord =  vec2(v_WorldPosition.xz + u_time * speedFactor);
    textCoord.xy /= scale.xy;
  
    // https://www.youtube.com/watch?v=6_-NNKc4lrk&ab_channel=Makin%27StuffLookGood
    vec3 textureValue = texture2D(u_normalTexture, textCoord).xyz;
    // We are using Y as up, but for this calculation, Z must be used, as the multiplication in TBN follows this order:
    // Red(x) * tangent + Green(y) * bitangent + Blue (z) * normal
    // Probably I should change either the order in the TBN (e.g. tangent, normal, bitangent) or the order in the multiplication
    vec3 normalTextureValueZUp = normalize(vec3(textureValue.xy * 2.0 - 1.0, textureValue.z));
    vec3 normal = normalTextureValueZUp.x * v_TBN[0] + normalTextureValueZUp.y * v_TBN[1] + normalTextureValueZUp.z * v_TBN[2];
    // Now the normal has xz as the horizontal plane and y as the vertical axis.

    // Normalize normals
    normal = normalize(normal); // Geometric normal + texture normal
    vec3 geoNormal = normalize(v_Normal); // Geometric normal


    // Normal blending - In case of having two normal maps. Normal blending is solved above using TBN
    // https://blog.selfshadow.com/publications/blending-in-detail/
    // Partial derivative blending
    //vec3 n1 = v_Normal;
    //vec3 n2 = normalTexel;
    //vec2 pd = n1.xy/n1.z + n2.xy/n2.z; // Add the PDs
    //vec3 normal  = normalize(vec3(pd, 1.0)); // Partial derivative
    //vec3 normal = normalize(vec3(n1.xy + n2.xy, n1.z*n2.z)); // Whiteout blending
    //vec3 normal = v_Normal;

    // Sun position
    vec3 sunPosition = vec3(0.0, 1.0, 0.0);

    // Ocean color
    vec3 oceanColor = vec3(0.016, 0.064, 0.192);//(0.2, 0.2, 1.0);  
    
    // Diffuse color
    vec3 diffuseColor = oceanColor * max(0.0, dot(normalize(sunPosition), geoNormal)); // NORMAL WITHOUT TEXTURE

    // Ambient color
    vec3 ambientColor = vec3(0.0,0.0,0.1);

    // Sky color
    vec3 skyColor = vec3(0.51, 0.75, 1.0);


    // Underwater factor (if camera is above or below water)
    float underwaterFactor = (abs(cameraPosition.y)/cameraPosition.y)*0.5 + 0.5;
    // Fog underwater (Fog exp 2)
    float fogDepth = distance(v_WorldPosition, cameraPosition);
    float fogDensity = u_fogDensity - u_fogDensity * 0.5 * underwaterFactor;
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * fogDepth * fogDepth );
    vec3 fogAirColor = vec3(0.8, 0.93, 1.0);
    vec3 fogColor = mix(u_fogUnderwaterColor, fogAirColor, underwaterFactor) ;

    
    // Specular color
    // -sunPosition = Incident ray
    vec3 reflection = normalize(reflect(normalize(-sunPosition), normal)); 
    vec3 cameraRay = v_WorldPosition - cameraPosition; // Camera and worldpos are correct
    float specIncidence = max(0.0, dot(normalize(-cameraRay), reflection));
    float shiny = 80.0;
    float specFactor = 5.0 * pow(specIncidence, shiny);
    vec3 specularColor = specFactor * vec3(1.0,1.0,1.0) ; // * sunColor



    // Fresnel - CAMERARAY NEEDS A HACK? SWAP X BY Z AND NEGATE FIRST COMPONENT?
    // https://github.com/dli/waves/blob/master/simulation.js
    // https://www.shadertoy.com/view/4scSW4 with named variables
    vec3 camR = normalize(-cameraRay); 
    float dotOperation = dot(geoNormal, camR); // USE NORMAL WITHOUT TEXTURE (from geometry)
    float fresnel = 0.02 + 0.98 * pow(1.0 - (dotOperation), 5.0);

    fresnel = clamp(fresnel, 0.0, 1.0);
    vec3 skyFresnel = fresnel * skyColor;
    vec3 waterFresnel = (1.0 - fresnel) * oceanColor;//(1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;
    //vec3 waterFresnel = (1.0 - fresnel) * (oceanColor*3.0 + skyColor + diffuseColor) / 5.0;
    

    vec3 color = skyFresnel*2.0 + waterFresnel*2.0 + diffuseColor + specularColor;
    

    color = hdr(color, 0.99); // From David Li https://github.com/dli/waves/blob/master/simulation.js

    // Add fog
    color = mix( color, fogColor, fogFactor );

    gl_FragColor = vec4(color, 0.9 + fogFactor*0.1);
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
    //gl_FragColor = vec4(normal.xz*0.5 + 0.5, normal.y, 1.0);
    //gl_FragColor = vec4(geoNormal.xz*0.5 + 0.5, geoNormal.y, 1.0);
    //gl_FragColor = vec4(normalize(vec3(normalTexel.x, 0.0, normalTexel.z)), 1.0);
    //gl_FragColor = vec4(normalize(textureValue), 1.0);

    //gl_FragColor = vec4(diffuseColor*5.0, 1.0);
    //gl_FragColor = vec4(diffuseColor +  specularColor, 1.0);
    //gl_FragColor = vec4(specIncidence, specIncidence, specIncidence, 1.0);
    //gl_FragColor = vec4(specularColor, 1.0);
    
    //gl_FragColor = vec4(normalize(reflection), 1.0);
    //gl_FragColor = vec4(normalize(v_WorldPosition), 1.0);
    //gl_FragColor = vec4((cameraPosition), 1.0);
    //gl_FragColor = vec4((normalTexel), 1.0);
  }
  `;