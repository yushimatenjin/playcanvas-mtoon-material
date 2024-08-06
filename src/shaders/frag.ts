interface ShaderOptions {
    outlineWidthTexture?: boolean;
    useOutline?: boolean;
    mainTex?: boolean;
    shadeTexture?: boolean;
    bumpMap?: boolean;
    sphereAdd?: boolean;
    emissionMap?: boolean;
    shadingShiftTexture?: boolean;
    rimMultiplyTexture?: boolean;
    animationMaskTexture: boolean;
}

export default (options: ShaderOptions) => /* glsl */`
${options.useOutline ? '#define USE_OUTLINE' : ''}
${options.outlineWidthTexture ? '#define USE_OUTLINEWIDTHTEXTURE' : ''}
${options.mainTex ? '#define USE_MAINTEX' : ''}
${options.shadeTexture ? '#define USE_SHADETEXTURE' : ''}
${options.bumpMap ? '#define USE_BUMPMAP' : ''}
${options.sphereAdd ? '#define USE_SPHEREADD' : ''}
${options.emissionMap ? '#define USE_EMISSIONMAP' : ''}
${options.shadingShiftTexture ? '#define USE_SHADINGSHIFTTEXTURE' : ''}
${options.rimMultiplyTexture ? '#define USE_RIMTEXTURE' : ''}
${options.animationMaskTexture ? '#define USE_ANIMATION_MASK_TEXTURE' : ''}

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vViewDirection;
varying mat3 vTBN;

// MToon Uniforms
uniform float giEqualizationFactor;
uniform float shadingShiftTextureScale;
uniform vec4 matcapFactor;
uniform vec4 parametricRimColorFactor;

// MToon Texture
uniform sampler2D uvAnimationMaskTexture;
uniform sampler2D rimMultiplyTexture;

// VRM Uniforms
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

// PlayCanvas specific uniforms
uniform vec3 light0_color;
uniform vec3 light0_direction;

struct Material {
    vec3 baseColor;     // 基本色
    vec3 shadeColor;    // 影の色
    float shadingShift; // シェーディングのシフト量
};

float linearstep(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}
float calculateShading(float dotNL, float shadowFactor, float shadingShift, float toonyFactor) {
    float shading = smoothstep(_ShadeShift, _ShadeShift + (1.0 - _ShadeToony), dotNL);    
    return shading * shadowFactor;
}

vec3 calculateDiffuse(Material material, float shading, vec3 lightColor) {
    return lightColor * mix(material.baseColor, material.shadeColor, shading);
}

vec3 calculateDirectLight(vec3 normal, vec3 lightDir, vec3 lightColor, Material material, float shadowFactor, float toonyFactor) {
    float dotNL = max(dot(normal, lightDir), 0.0);
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

    #ifdef USE_ANIMATION_MASK_TEXTURE
        uvAnimMask = texture2D(uvAnimationMaskTexture, uv).b;
    #endif
    float uvRotCos = cos(_UvAnimRotation * uvAnimMask);
    float uvRotSin = sin(_UvAnimRotation * uvAnimMask);
    uv = mat2(uvRotCos, -uvRotSin, uvRotSin, uvRotCos) * (uv - 0.5) + 0.5;
    uv = uv + vec2(_UvAnimScrollX, _UvAnimScrollY) * uvAnimMask;

    #ifdef USE_BUMPMAP
        vec3 normal = texture2D(_BumpMap, uv).xyz;
        normal = normal * 2.0 - 1.0;
        normal.xy *= _BumpScale;
        viewNormal = normalize(vTBN * normal);
    #endif

    vec3 viewPosition = normalize(vViewPosition);
    vec3 viewDir = normalize(vViewDirection);
    float dotNV = dot(viewNormal, viewPosition);    

    #ifdef USE_MAINTEX
        baseColor *= texture2D(_MainTex, uv);
    #endif

    vec3 finalColor = vec3(baseColor.rgb);
    float alpha = baseColor.a;
 
    Material material;
    material.baseColor = baseColor.rgb;
    material.shadeColor = _ShadeColor.rgb;
    material.shadingShift = _ShadeShift;
    float shadowFactor = _ReceiveShadowRate;

    #ifdef USE_SHADINGSHIFTTEXTURE
        material.shadingShift += texture2D(_ShadingShiftTexture, uv).r * shadingShiftTextureScale;
    #endif

    #ifdef USE_SHADETEXTURE
        vec3 shadeTextureColor = texture2D(_ShadeTexture, uv).rgb;
        material.shadeColor *= shadeTextureColor;
    #endif

    // シェーディング
    vec3 directionalLight = calculateDirectLight(viewNormal, light0_direction, light0_color, material, shadowFactor, _ShadeToony);

    finalColor = directionalLight;

    #ifdef USE_OUTLINE
    // Outline calculation
    float outlineWidth = _OutlineWidth;
    
    #ifdef USE_OUTLINEWIDTHTEXTURE
        vec2 outlineWidthUv = uv;
        outlineWidth *= texture2D(_OutlineWidthTexture, outlineWidthUv).r;
    #endif

    float outline = step(dotNV, 1.0 - outlineWidth);
    finalColor = mix(finalColor, _OutlineColor.rgb, outline * _OutlineLightingMix);
    #endif

    #ifdef USE_EMISSIONMAP
        vec3 emission = texture2D(_EmissionMap, uv).rgb * _EmissionColor.rgb;
        finalColor += emission;
    #endif

    // Calculate rim lighting effect
    float rimDot = 1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0);
    float rimIntensity = smoothstep(0.0, 1.0, rimDot);

    // Apply Fresnel effect
    rimIntensity = pow(rimIntensity, _RimFresnelPower);

    // Apply rim lift
    rimIntensity =  smoothstep(_RimLift, 1.0, rimIntensity);

    // Calculate rim color
    vec3 rimColor = _RimColor.rgb * rimIntensity;

    #ifdef USE_SPHEREADD
        vec2 matcapUv = vec2(viewNormal.x * 0.5 + 0.5, viewNormal.y * 0.5 + 0.5);
        vec3 sphereAdd = texture(_SphereAdd, matcapUv).rgb;
        finalColor += sphereAdd;
    #endif

    #ifdef USE_RIMTEXTURE
        vec3 rimMultiply = texture2D(rimMultiplyTexture, vUv).rgb;
        finalColor *= rimMultiply;
    #endif

    // Mix rim color with final color based on _RimLightingMix
    finalColor = mix(finalColor, finalColor + rimColor, _RimLightingMix);

    // Apply alpha cutoff
    if (alpha < _Cutoff) {
        discard;
    }

    gl_FragColor = vec4(finalColor, alpha);
}`;