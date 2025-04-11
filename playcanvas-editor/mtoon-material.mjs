import {
  SEMANTIC_NORMAL,
  SEMANTIC_POSITION,
  SEMANTIC_TEXCOORD0,
  ShaderMaterial
} from 'playcanvas';
import { fragmentShader } from './mtoon-fragment.glsl.mjs';
import { applyMaterialParams } from './mtoon-material-params.mjs';
import { vertexShader } from './mtoon-vertex.glsl.mjs';

/**
 * Creates an MToon material, which is similar to Unity's MToon shader
 * @param device - The graphics device
 * @param params - Material parameters
 * @returns The created shader material
 */
const createMToonMaterial = (device, params = {}) => {
  // Create the shader material
  const material = new ShaderMaterial({
    uniqueName: 'MToonShader-' + Math.random().toString(36).substring(2, 15),
    vertexCode: vertexShader,
    fragmentCode: fragmentShader,
    attributes: {
      vertex_position: SEMANTIC_POSITION,
      vertex_normal: SEMANTIC_NORMAL,
      // Remove tangent attribute requirement
      vertex_texCoord0: SEMANTIC_TEXCOORD0
    }
  });

  // Apply default parameters, passing the device
  applyMaterialParams(device, material, params);

  // Set up animation for UV if needed
  if (params || params.uvAnimScrollX || params.uvAnimScrollY || params.uvAnimRotation) {
    const updateUvAnimation = () => {
      const delta = 1 / 60;
      const scrollX = ((material.getParameter('_UvAnimScrollX'))?.data || 0);
      const scrollY = ((material.getParameter('_UvAnimScrollY'))?.data || 0);
      const rotation = ((material.getParameter('_UvAnimRotation'))?.data || 0);

      material.setParameter('_UvAnimScrollX', scrollX + delta * (params.uvAnimScrollX || 0));
      material.setParameter('_UvAnimScrollY', scrollY + delta * (params.uvAnimScrollY || 0));
      material.setParameter('_UvAnimRotation', rotation + delta * (params.uvAnimRotation || 0));
    };

    let animationFrameId;
    const animate = () => {
      updateUvAnimation();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    material.cancelAnimation = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }

  return material;
};

export { createMToonMaterial };

