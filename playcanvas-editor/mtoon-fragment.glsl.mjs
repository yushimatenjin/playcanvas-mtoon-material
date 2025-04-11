export const fragmentShader = /* glsl */ `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vViewDirection;
    varying mat3 vTBN;
    
    uniform float giEqualizationFactor;
    uniform vec4 matcapFactor;
    uniform vec4 parametricRimColorFactor;
    
    uniform sampler2D uvAnimationMaskTexture;
    uniform sampler2D rimMultiplyTexture;
    
    uniform sampler2D _MainTex;
    uniform sampler2D _ShadeTexture;
    uniform sampler2D _BumpMap;
    uniform sampler2D _SphereAdd;
    uniform sampler2D _EmissionMap;
    uniform sampler2D _OutlineWidthTexture;
    
    uniform vec4 _Color;
    uniform vec4 _ShadeColor;
    uniform vec4 _EmissionColor;
    uniform vec4 _OutlineColor;
    uniform vec4 _RimColor;
    
    uniform float _Cutoff;
    uniform float _BumpScale;
    uniform float _ReceiveShadowRate;
    uniform float _ShadingGradeRate;
    uniform float _ShadeShift;
    uniform float _ShadeToony;
    uniform float _LightColorAttenuation;
    uniform float _IndirectLightIntensity;
    uniform float _OutlineWidth;
    uniform float _OutlineScaledMaxDistance;
    uniform float _OutlineLightingMix;
    uniform float _DebugMode;
    uniform float _BlendMode;
    uniform float _OutlineWidthMode;
    uniform float _OutlineColorMode;
    uniform float _CullMode;
    uniform float _OutlineCullMode;
    uniform float _SrcBlend;
    uniform float _DstBlend;
    uniform float _ZWrite;
    uniform float _RimLightingMix;
    uniform float _RimFresnelPower;
    uniform float _RimLift;
    uniform float _UvAnimScrollX;
    uniform float _UvAnimScrollY;
    uniform float _UvAnimRotation;
    
    uniform vec3 light0_color;
    uniform vec3 light0_direction;
    
    struct Material {
        vec3 baseColor;
        vec3 shadeColor;
        float shadingShift;
    };
    
    float linearstep(float edge0, float edge1, float x) {
        return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    }
    
    float calculateShading(float dotNL, float shadowFactor, float shadingShift, float toonyFactor) {
        float shading;
        
        if (abs(toonyFactor - 0.5) < 0.01 && abs(shadingShift + 0.5) < 0.01) {
            shading = dotNL;
        } else if (abs(toonyFactor) < 0.01 && abs(shadingShift) < 0.01) {
            shading = dotNL;
        } else {
            shading = smoothstep(shadingShift, shadingShift + (1.0 - toonyFactor), dotNL);
        }
        
        return shading * shadowFactor;
    }
    
    vec3 calculateDiffuse(Material material, float shading, vec3 lightColor) {
        float inversedShading = 1.0 - shading;
        return lightColor * mix(material.baseColor, material.shadeColor, inversedShading);
    }
    
    vec3 calculateDirectLight(vec3 normal, vec3 lightDir, vec3 lightColor, Material material, float shadowFactor, float toonyFactor) {
        vec3 normalizedLightDir = normalize(-lightDir);
        
        float rawDotNL = dot(normal, normalizedLightDir);
        
        float dotNL;
        
        if (abs(toonyFactor) < 0.01 && abs(material.shadingShift) < 0.01) {
            dotNL = rawDotNL * 0.5 + 0.5;
        } else {
            dotNL = max(rawDotNL, 0.0);
        }
        
        if (abs(toonyFactor - 0.5) < 0.01 && abs(material.shadingShift + 0.5) < 0.01) {
            dotNL = max(rawDotNL, 0.0);
        }
        
        float shading = calculateShading(dotNL, shadowFactor, material.shadingShift, toonyFactor);
        return calculateDiffuse(material, shading, lightColor);
    }
    
    float saturate(float x) {
        return clamp(x, 0.0, 1.0);
    }
    
    void main() {
        vec4 baseColor = _Color;
        vec3 viewNormal = normalize(vNormal);
        vec2 uv = vUv;
    
        float uvAnimMask = 1.0;
        if (texture2D(uvAnimationMaskTexture, vec2(0.0)).a > 0.0) {
            uvAnimMask = texture2D(uvAnimationMaskTexture, uv).b;
        }
        
        float uvRotCos = cos(_UvAnimRotation * uvAnimMask);
        float uvRotSin = sin(_UvAnimRotation * uvAnimMask);
        uv = mat2(uvRotCos, -uvRotSin, uvRotSin, uvRotCos) * (uv - 0.5) + 0.5;
        uv = uv + vec2(_UvAnimScrollX, _UvAnimScrollY) * uvAnimMask;
    
        if (texture2D(_BumpMap, vec2(0.0)).a > 0.0) {
            vec3 normal = texture2D(_BumpMap, uv).xyz;
            normal = normal * 2.0 - 1.0;
            normal.xy *= _BumpScale;
            viewNormal = normalize(vTBN * normal);
        }
    
        vec3 viewDir = normalize(vViewDirection);
        float dotNV = dot(viewNormal, normalize(vViewPosition));    
    
        if (texture2D(_MainTex, vec2(0.0)).a > 0.0) {
            baseColor *= texture2D(_MainTex, uv);
        }
    
        vec3 finalColor = vec3(baseColor.rgb);
        float alpha = baseColor.a;
     
        Material material;
        material.baseColor = baseColor.rgb;
        material.shadeColor = _ShadeColor.rgb;
        material.shadingShift = _ShadeShift;
        float shadowFactor = _ReceiveShadowRate;
    
        if (texture2D(_ShadeTexture, vec2(0.0)).a > 0.0) {
            vec3 shadeTextureColor = texture2D(_ShadeTexture, uv).rgb;
            material.shadeColor *= shadeTextureColor;
        }
    
        vec3 directionalLight = calculateDirectLight(viewNormal, light0_direction, light0_color, material, shadowFactor, _ShadeToony);
        finalColor = directionalLight;
    
        if (_OutlineWidth > 0.0) {
            float outline = step(dotNV, 1.0 - _OutlineWidth * 0.5);
            finalColor = mix(finalColor, _OutlineColor.rgb, outline * _OutlineLightingMix);
        }
    
        if (texture2D(_EmissionMap, vec2(0.0)).a > 0.0) {
            vec3 emission = texture2D(_EmissionMap, uv).rgb * _EmissionColor.rgb;
            finalColor += emission;
        }
    
        float rimDot = 1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0);
        float rimIntensity = smoothstep(0.0, 1.0, rimDot);
        rimIntensity = pow(rimIntensity, _RimFresnelPower);
        rimIntensity = smoothstep(_RimLift, 1.0, rimIntensity);
        vec3 rimColor = _RimColor.rgb * rimIntensity;
    
        vec3 sphereAdd = vec3(0.0);
        if (texture2D(_SphereAdd, vec2(0.0)).a > 0.0) {
            vec3 viewUp = vec3(0.0, -1.0, 0.0);
            vec3 viewRight = normalize(cross(viewUp, viewNormal));
            viewUp = normalize(cross(viewNormal, viewRight));
            
            vec2 matcapUv = vec2(
                dot(viewRight, normalize(vViewDirection)),
                dot(viewUp, normalize(vViewDirection))
            ) * 0.5 + 0.5;
            
            sphereAdd = texture2D(_SphereAdd, matcapUv).rgb * matcapFactor.rgb;
            
            float edgeFactor = 1.0 - abs(dot(viewNormal, normalize(vViewDirection)));
            edgeFactor = smoothstep(0.2, 0.8, edgeFactor);
            sphereAdd *= mix(1.0, 2.0, edgeFactor);
        }
    
        vec3 rimMultiply = vec3(1.0);
        if (texture2D(rimMultiplyTexture, vec2(0.0)).a > 0.0) {
            rimMultiply = texture2D(rimMultiplyTexture, uv).rgb;
        }
        
        rimColor *= rimMultiply;
        sphereAdd *= rimMultiply;
        finalColor += sphereAdd;
    
        finalColor = mix(finalColor, finalColor + rimColor, _RimLightingMix);
    
        if (alpha < _Cutoff) {
            discard;
        }
    
        gl_FragColor = vec4(finalColor, alpha);
    }
`; 