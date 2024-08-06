interface ShaderOptions {
  outlineWidthTexture?: boolean;
  useOutline?: boolean;
  outlineWidthWorld?: boolean;
  outlineWidthScreen?: boolean;
}

export default (options: ShaderOptions) => /* glsl */ `
${options.useOutline ? "#define USE_OUTLINE" : ""}
${options.outlineWidthTexture ? "#define USE_OUTLINEWIDTHTEXTURE" : ""}
${options.outlineWidthWorld ? "#define OUTLINE_WIDTH_WORLD" : ""}
${options.outlineWidthScreen ? "#define OUTLINE_WIDTH_SCREEN" : ""}

attribute vec3 aPosition;
attribute vec3 vertex_normal;
attribute vec4 vertex_tangent;
attribute vec2 vertex_texCoord0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
uniform mat3 matrix_normal;
uniform vec3 view_position;

// MToon Uniforms
uniform float _OutlineWidth;
uniform float _OutlineScaledMaxDistance;
uniform sampler2D _OutlineWidthTexture;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vViewDirection;
varying mat3 vTBN;

    void main() {
        vec4 pos = vec4(aPosition, 1.0);
    
        vec3 T = normalize(vec3(matrix_model * vertex_tangent));
        vec3 N = normalize(vec3(matrix_model * vec4(vertex_normal, 0.0)));
        vec3 B = cross(N, T);
        vec3 normal = normalize(matrix_normal * vertex_normal);
        vUv = vertex_texCoord0;
        vTBN = mat3(T, B, N);
    
        // モデル空間での頂点処理
        pos = matrix_model * pos;
        vViewPosition = -pos.xyz;
    
        #ifdef OUTLINE
            float outlineTex = 1.0;
            #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
                outlineTex = texture2D(_OutlineWidthTexture, vertex_texCoord0).r;
            #endif
            
            float outlineWidth = _OutlineWidth * outlineTex;
            
            #ifdef OUTLINE_WIDTH_WORLD
                pos.xyz += normal * outlineWidth * 0.01;
            #endif
            
            #ifdef OUTLINE_WIDTH_SCREEN
                vec4 clipPos = matrix_viewProjection * pos;
                vec3 clipNormal = (matrix_viewProjection * vec4(normal, 0.0)).xyz;
                float outlineWidthClip = outlineWidth * clipPos.w;
                clipPos.xy += normalize(clipNormal.xy) * outlineWidthClip * vec2(1.0, _OutlineScaledMaxDistance);
                pos = clipPos;
            #else
                pos = matrix_viewProjection * pos;
            #endif
        #else
            pos = matrix_viewProjection * pos;
            pos.z  += 1E-6 * pos.w;
        #endif
        gl_Position = pos;
    
    vec4 worldPositon = matrix_model * vec4(aPosition, 1.0);
    vViewDirection = view_position - worldPositon.xyz;
    vNormal = normalize(matrix_normal * normal);
}
`;
