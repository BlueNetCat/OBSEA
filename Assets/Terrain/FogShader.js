export const fogFrag = `
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

export const fogFragParams = `
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

export const fogVertex = `
    #ifdef USE_FOG
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
    #endif
  `;

export const fogVertexParams = `
    #ifdef USE_FOG
      varying vec3 vWorldPosition;
    #endif
  `;