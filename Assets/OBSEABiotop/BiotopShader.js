import * as THREE from 'three';

export const BiotopVertShader = /* glsl */ `
  #define USE_FOG
  #define FOG_EXP2
  
  ${THREE.ShaderChunk.fog_pars_vertex}

  attribute vec2 uv2;

  varying vec2 vUv;
  varying vec2 vUvAO;

  void main(){

    vUv = uv;
    vUvAO = uv2;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vec4 mvPosition = modelViewPosition;
    ${THREE.ShaderChunk.fog_vertex}
    
  }

  `;



export const BiotopFragShader = /* glsl */`
  #define USE_FOG
  #define FOG_EXP2

  uniform sampler2D u_colorTexture;
  uniform sampler2D u_normalTexture;
  uniform sampler2D u_ambientOcclusion;

  ${THREE.ShaderChunk.fog_pars_fragment}

  varying vec2 vUv;
  varying vec2 vUvAO;

  void main(){


    vec4 color = texture2D(u_colorTexture, vUv);
    vec2 uvAO = vUvAO;

    uvAO.y = 1.0-uvAO.y; // Superhack
    vec4 ao = texture2D(u_ambientOcclusion, uvAO);

    gl_FragColor = vec4(color*ao);

    ${THREE.ShaderChunk.fog_fragment}

  }


  `;