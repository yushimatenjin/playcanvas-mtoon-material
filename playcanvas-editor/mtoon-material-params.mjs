import { ADDRESS_REPEAT, Color, FILTER_NEAREST, PIXELFORMAT_R8_G8_B8_A8, Texture } from 'playcanvas';

export const DEFAULT_PARAMS = {
  // Default texture parameters are null
  mainTex: null,
  shadeTexture: null,
  bumpMap: null,
  sphereAdd: null,
  emissionMap: null,
  outlineWidthTexture: null,
  uvAnimationMaskTexture: null,
  rimMultiplyTexture: null,
  // Default color values
  color: new Color(1.0, 1.0, 1.0, 1),
  shadeColor: new Color(0.0, 0.0, 0.0, 1),
  emissionColor: new Color(0.0, 0.0, 0.0, 1),
  outlineColor: new Color(0, 0, 0, 1),
  rimColor: new Color(0.0, 0.0, 0.0, 1),

  // Float properties with defaults
  cutoff: 0.5,
  bumpScale: 1.0,
  receiveShadowRate: 1.0,
  shadingGradeRate: 0.5,
  shadeShift: 0.0,
  shadeToony: 0.8,
  lightColorAttenuation: 0,
  indirectLightIntensity: 0.1,
  outlineWidth: 0,
  outlineScaledMaxDistance: 0.5,
  outlineLightingMix: 0.5,
  debugMode: 0.0,
  blendMode: 0.0,
  outlineWidthMode: 0,
  outlineColorMode: 0,
  cullMode: 2,
  outlineCullMode: 1.0,
  srcBlend: 1.0,
  dstBlend: 0.0,
  zWrite: 1,
  rimLightingMix: 1.0,
  rimFresnelPower: 0.0,
  rimLift: -0.13,
  uvAnimScrollX: 0.0,
  uvAnimScrollY: 0.0,
  uvAnimRotation: 0.0,

  // MToon specific parameters
  giEqualizationFactor: 0.8,
  matcapFactor: new Color(0, 0, 0, 1)
};

/**
 * Represents the parameters for an MToon material.
 * @typedef {object} MToonMaterialParams
 * @property {Texture | object | null} [mainTex] - Main texture or asset.
 * @property {Texture | object | null} [shadeTexture] - Shade texture or asset.
 * @property {Texture | object | null} [bumpMap] - Normal map texture or asset.
 * @property {Texture | object | null} [sphereAdd] - Sphere additive texture (matcap) or asset.
 * @property {Texture | object | null} [emissionMap] - Emission map texture or asset.
 * @property {Texture | object | null} [outlineWidthTexture] - Outline width texture or asset.
 * @property {Texture | object | null} [uvAnimationMaskTexture] - UV animation mask texture or asset.
 * @property {Texture | object | null} [rimMultiplyTexture] - Rim multiply texture or asset.
 * @property {Color} [color] - Main color.
 * @property {Color} [shadeColor] - Shade color.
 * @property {Color} [emissionColor] - Emission color.
 * @property {Color} [outlineColor] - Outline color.
 * @property {Color} [rimColor] - Rim color.
 * @property {number} [cutoff] - Alpha cutoff value.
 * @property {number} [bumpScale] - Normal map scale.
 * @property {number} [receiveShadowRate] - Shadow receiving rate.
 * @property {number} [shadingGradeRate] - Shading grade rate.
 * @property {number} [shadeShift] - Shade shift value.
 * @property {number} [shadeToony] - Shade toony factor.
 * @property {number} [lightColorAttenuation] - Light color attenuation factor.
 * @property {number} [indirectLightIntensity] - Indirect light intensity factor.
 * @property {number} [outlineWidth] - Outline width value.
 * @property {number} [outlineScaledMaxDistance] - Outline scaled max distance.
 * @property {number} [outlineLightingMix] - Outline lighting mix factor.
 * @property {number} [debugMode] - Debug mode value.
 * @property {number} [blendMode] - Blend mode (0: Opaque, 1: Cutout, 2: Transparent, 3: TransparentWithZWrite).
 * @property {number} [outlineWidthMode] - Outline width mode (0: None, 1: WorldCoordinates, 2: ScreenCoordinates).
 * @property {number} [outlineColorMode] - Outline color mode (0: FixedColor, 1: MixedLighting).
 * @property {number} [cullMode] - Cull mode (0: None, 1: Front, 2: Back).
 * @property {number} [outlineCullMode] - Outline cull mode (0: None, 1: Front, 2: Back).
 * @property {number} [srcBlend] - Source blend factor.
 * @property {number} [dstBlend] - Destination blend factor.
 * @property {number} [zWrite] - ZWrite enable (0: Off, 1: On).
 * @property {number} [rimLightingMix] - Rim lighting mix factor.
 * @property {number} [rimFresnelPower] - Rim fresnel power.
 * @property {number} [rimLift] - Rim lift value.
 * @property {number} [uvAnimScrollX] - UV animation scroll X speed.
 * @property {number} [uvAnimScrollY] - UV animation scroll Y speed.
 * @property {number} [uvAnimRotation] - UV animation rotation speed.
 * @property {number} [giEqualizationFactor] - GI equalization factor.
 * @property {Color} [matcapFactor] - Matcap factor color.
 */

/**
 * Resolves a potential PlayCanvas Asset to its underlying resource (Texture).
 * If the input is not an Asset-like object with a 'resource' property,
 * it returns the input itself.
 * @param {any} param - The potential Asset or Texture.
 * @returns {Texture|null|undefined} The resolved Texture resource or the original input.
 * @private
 */
const resolveTextureResource = (param) => {
  if (param && typeof param === 'object' && param.resource !== undefined) {
    return param.resource;
  }
  return param;
};


/**
 * Applies parameters to the MToon shader material.
 * Texture parameters can be either Texture instances or Asset instances containing a texture.
 * @param {import('playcanvas').GraphicsDevice} device - The graphics device.
 * @param {import('playcanvas').Material} material - The material to apply parameters to (e.g., StandardMaterial or ShaderMaterial).
 * @param {MToonMaterialParams} params - Parameters to apply.
 */
export const applyMaterialParams = (device, material, params) => {

  const mergedParams = {
    // Deep copy color defaults
    color: new Color().copy(DEFAULT_PARAMS.color),
    shadeColor: new Color().copy(DEFAULT_PARAMS.shadeColor),
    emissionColor: new Color().copy(DEFAULT_PARAMS.emissionColor),
    outlineColor: new Color().copy(DEFAULT_PARAMS.outlineColor),
    rimColor: new Color().copy(DEFAULT_PARAMS.rimColor),
    matcapFactor: new Color().copy(DEFAULT_PARAMS.matcapFactor),
    // Copy other default properties
    ...Object.fromEntries(Object.entries(DEFAULT_PARAMS).filter(([key]) => !['color', 'shadeColor', 'emissionColor', 'outlineColor', 'rimColor', 'matcapFactor'].includes(key))),

    ...(params || {}) // Override with user-provided params
  };

  if (params?.color instanceof Color) {
    mergedParams.color = new Color().copy(params.color);
  }
  if (params?.shadeColor instanceof Color) {
    mergedParams.shadeColor = new Color().copy(params.shadeColor);
  }
  if (params?.emissionColor instanceof Color) {
    mergedParams.emissionColor = new Color().copy(params.emissionColor);
  }
  if (params?.outlineColor instanceof Color) {
    mergedParams.outlineColor = new Color().copy(params.outlineColor);
  }
  if (params?.rimColor instanceof Color) {
    mergedParams.rimColor = new Color().copy(params.rimColor);
  }
  if (params?.matcapFactor instanceof Color) {
    mergedParams.matcapFactor = new Color().copy(params.matcapFactor);
  }

  let textureWhite = null; 
  const getDefaultTexture = () => {
      if (!textureWhite) {

          textureWhite = new Texture(device, {
              width: 1,
              height: 1,
              format: PIXELFORMAT_R8_G8_B8_A8,
              mipmaps: false,
              minFilter: FILTER_NEAREST,
              magFilter: FILTER_NEAREST,
              addressU: ADDRESS_REPEAT,
              addressV: ADDRESS_REPEAT,
              name: 'mtoonDefaultWhite'
          });
          const pixelData = new Uint8Array([255, 255, 255, 255]);
          textureWhite.setSource(pixelData);
      }
      return textureWhite;
  };
  material.setParameter('_MainTex', resolveTextureResource(mergedParams.mainTex) || getDefaultTexture());
  material.setParameter('_ShadeTexture', resolveTextureResource(mergedParams.shadeTexture) || getDefaultTexture());
  material.setParameter('_BumpMap', resolveTextureResource(mergedParams.bumpMap) || getDefaultTexture());
  material.setParameter('_SphereAdd', resolveTextureResource(mergedParams.sphereAdd) || getDefaultTexture());
  material.setParameter('_EmissionMap', resolveTextureResource(mergedParams.emissionMap) || getDefaultTexture());
  material.setParameter('_OutlineWidthTexture', resolveTextureResource(mergedParams.outlineWidthTexture) || getDefaultTexture());
  material.setParameter('uvAnimationMaskTexture', resolveTextureResource(mergedParams.uvAnimationMaskTexture) || getDefaultTexture()); // Verify uniform name in shader
  material.setParameter('rimMultiplyTexture', resolveTextureResource(mergedParams.rimMultiplyTexture) || getDefaultTexture()); // Verify uniform name in shader


  if (mergedParams.color) {
    material.setParameter('_Color', [mergedParams.color.r, mergedParams.color.g, mergedParams.color.b, mergedParams.color.a]);
  }
  if (mergedParams.shadeColor) {
    material.setParameter('_ShadeColor', [mergedParams.shadeColor.r, mergedParams.shadeColor.g, mergedParams.shadeColor.b, mergedParams.shadeColor.a]);
  }
  if (mergedParams.emissionColor) {
    material.setParameter('_EmissionColor', [mergedParams.emissionColor.r, mergedParams.emissionColor.g, mergedParams.emissionColor.b, mergedParams.emissionColor.a]);
  }
  if (mergedParams.outlineColor) {
    material.setParameter('_OutlineColor', [mergedParams.outlineColor.r, mergedParams.outlineColor.g, mergedParams.outlineColor.b, mergedParams.outlineColor.a]);
  }
  if (mergedParams.rimColor) {
    material.setParameter('_RimColor', [mergedParams.rimColor.r, mergedParams.rimColor.g, mergedParams.rimColor.b, mergedParams.rimColor.a]);
  }

  const setParamIfDefined = (uniformName, value) => {
    if (value !== undefined && value !== null) {
      material.setParameter(uniformName, value);
    }
  };

  setParamIfDefined('_Cutoff', mergedParams.cutoff);
  setParamIfDefined('_BumpScale', mergedParams.bumpScale);
  setParamIfDefined('_ReceiveShadowRate', mergedParams.receiveShadowRate);
  setParamIfDefined('_ShadingGradeRate', mergedParams.shadingGradeRate);
  setParamIfDefined('_ShadeShift', mergedParams.shadeShift);
  setParamIfDefined('_ShadeToony', mergedParams.shadeToony);
  setParamIfDefined('_LightColorAttenuation', mergedParams.lightColorAttenuation);
  setParamIfDefined('_IndirectLightIntensity', mergedParams.indirectLightIntensity);
  setParamIfDefined('_OutlineWidth', mergedParams.outlineWidth);
  setParamIfDefined('_OutlineScaledMaxDistance', mergedParams.outlineScaledMaxDistance);
  setParamIfDefined('_OutlineLightingMix', mergedParams.outlineLightingMix);
  setParamIfDefined('_DebugMode', mergedParams.debugMode);
  setParamIfDefined('_BlendMode', mergedParams.blendMode);
  setParamIfDefined('_OutlineWidthMode', mergedParams.outlineWidthMode);
  setParamIfDefined('_OutlineColorMode', mergedParams.outlineColorMode);
  setParamIfDefined('_CullMode', mergedParams.cullMode);
  setParamIfDefined('_OutlineCullMode', mergedParams.outlineCullMode);
  setParamIfDefined('_SrcBlend', mergedParams.srcBlend);
  setParamIfDefined('_DstBlend', mergedParams.dstBlend);
  setParamIfDefined('_ZWrite', mergedParams.zWrite);
  setParamIfDefined('_RimLightingMix', mergedParams.rimLightingMix);
  setParamIfDefined('_RimFresnelPower', mergedParams.rimFresnelPower);
  setParamIfDefined('_RimLift', mergedParams.rimLift);
  setParamIfDefined('_UvAnimScrollX', mergedParams.uvAnimScrollX);
  setParamIfDefined('_UvAnimScrollY', mergedParams.uvAnimScrollY);
  setParamIfDefined('_UvAnimRotation', mergedParams.uvAnimRotation);

  setParamIfDefined('giEqualizationFactor', mergedParams.giEqualizationFactor);
  if (mergedParams.matcapFactor) {
    material.setParameter('matcapFactor', [mergedParams.matcapFactor.r, mergedParams.matcapFactor.g, mergedParams.matcapFactor.b, mergedParams.matcapFactor.a]);
  }
  material.update();
};