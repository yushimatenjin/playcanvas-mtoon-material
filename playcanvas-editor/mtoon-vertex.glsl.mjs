export const vertexShader = /* glsl */ `
    #include "transformCoreVS"
    #include "normalCoreVS"

    attribute vec2 vertex_texCoord0;

    uniform vec3 view_position;

    uniform float _OutlineWidth;
    uniform float _OutlineScaledMaxDistance;
    uniform sampler2D _OutlineWidthTexture;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vViewDirection;
    varying mat3 vTBN;

    void main() {
        vec4 pos = vec4(vertex_position.xyz, 1.0);
    
        vec3 N = normalize(vec3(matrix_model * vec4(vertex_normal, 0.0)));
        vec3 normal = normalize(matrix_normal * vertex_normal);
        
        // Generate a default tangent since the attribute is not available
        vec3 T = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
        // If the cross product is too small, use a different default
        if (length(T) < 0.1) {
            T = normalize(cross(N, vec3(1.0, 0.0, 0.0)));
        }
        
        vec3 B = cross(N, T);
        vUv = vertex_texCoord0;
        vTBN = mat3(T, B, N);
    
        pos = matrix_model * pos;
        vViewPosition = -pos.xyz;
    
        if (_OutlineWidth > 0.0) {
            float outlineTex = 1.0;
            
            if (texture2D(_OutlineWidthTexture, vec2(0.0)).a > 0.0) {
                outlineTex = texture2D(_OutlineWidthTexture, vertex_texCoord0).r;
            }
            
            float outlineWidth = _OutlineWidth * outlineTex;
            
            pos.xyz += normal * outlineWidth * 0.01;
            
            pos = matrix_viewProjection * pos;
        } else {
            pos = matrix_viewProjection * pos;
            pos.z += 1E-6 * pos.w;
        }
        gl_Position = pos;
    
        vec4 worldPosition = matrix_model * vec4(vertex_position.xyz, 1.0);
        vViewDirection = view_position - worldPosition.xyz;
        vNormal = normalize(matrix_normal * normal);
    }
`; 