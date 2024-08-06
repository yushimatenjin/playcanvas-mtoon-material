import { Color, ShaderProcessorOptions, Material, Texture, BLEND_NORMAL } from "playcanvas";
import { getProgramLibrary } from "playcanvas";
import { mToon } from "./programs/mtoon";

export default class MToonMaterial extends Material {
  // MToon Float Properties
  giEqualizationFactor: number;

  // MToon Vector Properties
  matcapFactor: Color;

  // MToon Texture Properties
  uvAnimationMaskTexture: Texture | null;
  rimMultiplyTexture: Texture | null;

  // Float properties
  _Cutoff: number;
  _BumpScale: number;
  _ReceiveShadowRate: number;
  _ShadingGradeRate: number;
  _ShadeShift: number;
  _ShadeToony: number;
  _LightColorAttenuation: number;
  _IndirectLightIntensity: number;
  _OutlineWidth: number;
  _OutlineScaledMaxDistance: number;
  _OutlineLightingMix: number;
  _DebugMode: number;
  _BlendMode: number;
  _OutlineWidthMode: number;
  _OutlineColorMode: number;
  _CullMode: number;
  _OutlineCullMode: number;
  _SrcBlend: number;
  _DstBlend: number;
  _ZWrite: number;
  _RimLightingMix: number;
  _RimFresnelPower: number;
  _RimLift: number;
  _UvAnimScrollX: number;
  _UvAnimScrollY: number;
  _UvAnimRotation: number;

  // Vector properties
  _Color: Color;
  _EmissionColor: Color;
  _ShadeColor: Color;
  _RimColor: Color;
  _OutlineColor: Color;

  // Texture properties
  _BumpMap?: Texture | null;
  _EmissionMap?: Texture | null;
  _MainTex?: Texture | null;
  _OutlineWidthTexture?: Texture | null;
  _ShadeTexture?: Texture | null;
  _SphereAdd?: Texture | null;

  constructor() {
    super();
    // MToon Float Properties
    this.giEqualizationFactor = 0.9;

    // MToon Vector Properties
    this.matcapFactor = new Color(1, 1, 1, 1);

    // MToon Texture Properties
    this.uvAnimationMaskTexture = null;
    this.rimMultiplyTexture = null;

    this._ZWrite = 1;
    this._Cutoff = 0.5;
    this._CullMode = 2;
    this._BumpScale = 1.0;
    this._ShadeShift = 0.0; // default value
    this._ShadeToony = 0.9; // default value
    this._IndirectLightIntensity = 0.1;
    this._RimLightingMix = 1.0;
    this._RimFresnelPower = 5.0;
    this._RimLift = 0.0;
    this._OutlineWidthMode = 0;
    this._OutlineWidth = 0.0;
    this._OutlineColorMode = 0;
    this._OutlineLightingMix = 1.0;
    this._UvAnimScrollX = 0.0;
    this._UvAnimScrollY = 0.0;
    this._UvAnimRotation = 0.0;

    this._ReceiveShadowRate = 1.0;
    this._ShadingGradeRate = 1.0;
    this._LightColorAttenuation = 0.0;
    this._OutlineScaledMaxDistance = 1.0;
    this._DebugMode = 0.0;
    this._BlendMode = 0.0;
    this._OutlineCullMode = 1.0;
    this._SrcBlend = 1.0;
    this._DstBlend = 0.0;

    this._Color = new Color(1, 1, 1, 1);
    this._EmissionColor = new Color(0, 0, 0, 1);
    this._ShadeColor = new Color(0, 0, 0, 1);
    this._RimColor = new Color(0, 0, 0, 1);
    this._OutlineColor = new Color(0, 0, 0, 1);

    // Texture properties are initialized as null
    this._MainTex = null;
    this._BumpMap = null;
    this._EmissionMap = null;
    this._ShadeTexture = null;
    this._SphereAdd = null;
    this._OutlineWidthTexture = null;
  }

  // This method is called when the material is created and when material.update is called
  updateUniforms(device: any, scene: any): void {
    this.clearParameters();
    // MToon Float Properties
    this.setParameter("giEqualizationFactor", this.giEqualizationFactor);

    // MToon Vector Properties
    this.setParameter("matcapFactor", [this.matcapFactor.r, this.matcapFactor.g, this.matcapFactor.b, this.matcapFactor.a]);

    // MToon Texture Properties
    if (this.uvAnimationMaskTexture) this.setParameter("uvAnimationMaskTexture", this.uvAnimationMaskTexture);
    if (this.rimMultiplyTexture) this.setParameter("rimMultiplyTexture", this.rimMultiplyTexture);

    // Float properties
    this.setParameter("_Cutoff", this._Cutoff);
    this.setParameter("_BumpScale", this._BumpScale);
    this.setParameter("_ReceiveShadowRate", this._ReceiveShadowRate);
    this.setParameter("_ShadingGradeRate", this._ShadingGradeRate);
    this.setParameter("_ShadeShift", this._ShadeShift);
    this.setParameter("_ShadeToony", this._ShadeToony);
    this.setParameter("_LightColorAttenuation", this._LightColorAttenuation);
    this.setParameter("_IndirectLightIntensity", this._IndirectLightIntensity);
    this.setParameter("_OutlineWidth", this._OutlineWidth);
    this.setParameter("_OutlineScaledMaxDistance", this._OutlineScaledMaxDistance);
    this.setParameter("_OutlineLightingMix", this._OutlineLightingMix);
    this.setParameter("_DebugMode", this._DebugMode);
    this.setParameter("_BlendMode", this._BlendMode);
    this.setParameter("_OutlineWidthMode", this._OutlineWidthMode);
    this.setParameter("_OutlineColorMode", this._OutlineColorMode);
    this.setParameter("_CullMode", this._CullMode);
    this.setParameter("_OutlineCullMode", this._OutlineCullMode);
    this.setParameter("_SrcBlend", this._SrcBlend);
    this.setParameter("_DstBlend", this._DstBlend);
    this.setParameter("_ZWrite", this._ZWrite);
    this.setParameter("_RimLightingMix", this._RimLightingMix);
    this.setParameter("_RimFresnelPower", this._RimFresnelPower);
    this.setParameter("_RimLift", this._RimLift);
    this.setParameter("_UvAnimScrollX", this._UvAnimScrollX);
    this.setParameter("_UvAnimScrollY", this._UvAnimScrollY);
    this.setParameter("_UvAnimRotation", this._UvAnimRotation);

    // TODO: Switch to use requestAnimationFrame
    setInterval(() => {
      const delta = 0.01;
      const scrollX = this.getParameter("_UvAnimScrollX").data as number;
      const scrollY = this.getParameter("_UvAnimScrollY").data as number;
      const rotation = this.getParameter("_UvAnimRotation").data as number;
      this.setParameter("_UvAnimScrollX", scrollX + delta * this._UvAnimScrollX);
      this.setParameter("_UvAnimScrollY", scrollY + delta * this._UvAnimScrollY);
      this.setParameter("_UvAnimRotation", rotation + delta * this._UvAnimRotation);
    }, 10);

    // Color properties
    this.setParameter("_Color", [this._Color.r, this._Color.g, this._Color.b, this._Color.a]);
    this.setParameter("_EmissionColor", [this._EmissionColor.r, this._EmissionColor.g, this._EmissionColor.b, this._EmissionColor.a]);
    this.setParameter("_OutlineColor", [this._OutlineColor.r, this._OutlineColor.g, this._OutlineColor.b, this._OutlineColor.a]);
    this.setParameter("_ShadeColor", [this._ShadeColor.r, this._ShadeColor.g, this._ShadeColor.b, this._ShadeColor.a]);
    this.setParameter("_RimColor", [this._RimColor.r, this._RimColor.g, this._RimColor.b, this._RimColor.a]);

    // Texture properties
    if (this._BumpMap) this.setParameter("_BumpMap", this._BumpMap);
    if (this._EmissionMap) this.setParameter("_EmissionMap", this._EmissionMap);
    if (this._MainTex) this.setParameter("_MainTex", this._MainTex);
    if (this._OutlineWidthTexture) this.setParameter("_OutlineWidthTexture", this._OutlineWidthTexture);
    if (this._ShadeTexture) this.setParameter("_ShadeTexture", this._ShadeTexture);
    if (this._SphereAdd) this.setParameter("_SphereAdd", this._SphereAdd);
  }

  getShaderVariant(device: any, scene: any, objDefs: number, renderParams: any, pass: any, sortedLights: any, viewUniformFormat: any, viewBindGroupFormat: any, vertexFormat: any): any {
    this.blendType = BLEND_NORMAL;
    this.depthTest = true;
    this.depthWrite = true;

    const options = {
      // define the shader variant
      useOutline: !!this._OutlineWidthMode,
      useMainTex: !!this._MainTex,
      useShadeTexture: !!this._ShadeTexture,
      useBumpMap: !!this._BumpMap,
      useSphereAdd: !!this._SphereAdd,
      useEmission: !!this._EmissionMap,
      useOutlineWidthMultiplyTexture: !!this._OutlineWidthTexture,
      useRimMultiplyTexture: !!this.rimMultiplyTexture,
      useUvAnimationMaskTexture: !!this.uvAnimationMaskTexture,
      _Cutoff: this._Cutoff,
      _BumpScale: this._BumpScale,
      _ReceiveShadowRate: this._ReceiveShadowRate,
      _ShadingGradeRate: this._ShadingGradeRate,
      _ShadeShift: this._ShadeShift,
      _ShadeToony: this._ShadeToony,
      _LightColorAttenuation: this._LightColorAttenuation,
      _IndirectLightIntensity: this._IndirectLightIntensity,
      _OutlineWidth: this._OutlineWidth,
      _OutlineScaledMaxDistance: this._OutlineScaledMaxDistance,
      _OutlineLightingMix: this._OutlineLightingMix,
      _DebugMode: this._DebugMode,
      _BlendMode: this._BlendMode,
      _OutlineWidthMode: this._OutlineWidthMode,
      _OutlineColorMode: this._OutlineColorMode,
      _CullMode: this._CullMode,
      _OutlineCullMode: this._OutlineCullMode,
      _SrcBlend: this._SrcBlend,
      _DstBlend: this._DstBlend,
      _ZWrite: this._ZWrite,
      _Color: this._Color,
      _EmissionColor: this._EmissionColor,
      _OutlineColor: this._OutlineColor,
      _ShadeColor: this._ShadeColor,
      _RimLightingMix: this._RimLightingMix,
      _RimFresnelPower: this._RimFresnelPower,
      _RimLift: this._RimLift,
      _UvAnimScrollX: this._UvAnimScrollX,
      _UvAnimScrollY: this._UvAnimScrollY,
      _UvAnimRotation: this._UvAnimRotation,
    };

    const processingOptions = new ShaderProcessorOptions(viewUniformFormat, viewBindGroupFormat, vertexFormat);
    const library = getProgramLibrary(device);
    library.register("MToon", mToon);
    return library.getProgram("MToon", options, processingOptions, this.userId);
  }
}
