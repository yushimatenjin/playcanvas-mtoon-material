import { Asset, Color, Script } from 'playcanvas';
import { createMToonMaterial } from './mtoon-material.mjs';
export class MToonMaterialScript extends Script {
  /** 
   * @attribute
   * @type {Asset}
   */
  mainTex;
  /**
   * @attribute
   * @type {Asset}
   */
  shadeTexture;

  /** @attribute 
   * @type {Asset}
   */
  bumpMap;
  /** @attribute 
   * @type {Asset}
   */
  sphereAdd;

  /** @attribute */
  color = new Color(1.0, 1.0, 1.0, 1.0);

  /** @attribute */
  shadeColor = new Color(0.0, 0.0, 0.0, 1.0);

  /** @attribute */
  emissionColor = new Color(0.0, 0.0, 0.0, 1.0);

  /** @attribute */
  outlineColor = new Color(0.0, 0.0, 0.0, 1.0);

  /** @attribute */
  rimColor = new Color(0.0, 0.0, 0.0, 1.0);

  /** @attribute */
  matcapFactor = new Color(0.0, 0.0, 0.0, 1.0);
  
  /** 
   * @attribute
   * @range [0, 1]
   */
  cutoff = 0.5;

  /** 
   * @attribute
   * @range [0, 2]
   */
  bumpScale = 1.0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  receiveShadowRate = 1.0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  shadingGradeRate = 0.5;

  /** 
   * @attribute
   * @range [-1, 1]
   */
  shadeShift = 0.0;

  /** 
   * @attribute
   * @range [-1, 1]
   */
  shadeToony = 0.8;

  /** 
   * @attribute
   * @range [0, 1]
   */
  lightColorAttenuation = 0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  indirectLightIntensity = 0.1;

  /** 
   * @attribute
   * @range [0, 0.1]
   */
  outlineWidth = 0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  outlineScaledMaxDistance = 0.5;

  /** 
   * @attribute
   * @range [0, 1]
   */
  outlineLightingMix = 0.5;

  /** 
   * @attribute
   * @range [0, 1]
   */
  debugMode = 0.0;

  /** 
   * @attribute
   * @range [0, 3]
   */
  blendMode = 0.0;

  /** 
   * @attribute
   * @range [0, 2]
   */
  outlineWidthMode = 0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  outlineColorMode = 0;

  /** 
   * @attribute
   * @range [0, 2]
   */
  cullMode = 2;

  /** 
   * @attribute
   * @range [0, 2]
   */
  outlineCullMode = 1.0;

  /** 
   * @attribute
   * @range [0, 10]
   */
  srcBlend = 1.0;

  /** 
   * @attribute
   * @range [0, 10]
   */
  dstBlend = 0.0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  zWrite = 1;

  /** 
   * @attribute
   * @range [0, 1]
   */
  rimLightingMix = 1.0;

  /** 
   * @attribute
   * @range [0, 10]
   */
  rimFresnelPower = 0.0;

  /** 
   * @attribute
   * @range [-1, 1]
   */
  rimLift = -0.13;

  /** 
   * @attribute
   * @range [-10, 10]
   */
  uvAnimScrollX = 0.0;

  /** 
   * @attribute
   * @range [-10, 10]
   */
  uvAnimScrollY = 0.0;

  /** 
   * @attribute
   * @range [-10, 10]
   */
  uvAnimRotation = 0.0;

  /** 
   * @attribute
   * @range [0, 1]
   */
  giEqualizationFactor = 0.8;

  // 前回の属性値を保存するためのオブジェクト
  _previousValues = {};

  initialize() {
    // デバイスの取得
    this.device = this.app.graphicsDevice;
    
    // 初期マテリアルの作成
    this._createMaterial();
    
    // 初期値を保存
    this._saveCurrentValues();
  }
  
  update() {
    // 属性の変更を確認
    if (this._checkAttributesChanged()) {
      this._createMaterial();
      this._saveCurrentValues();
    }
  }
  
  _checkAttributesChanged() {
    // 全ての属性を確認して変更があるかチェック
    if (!this._previousValues.color || 
        !this.color.equals(this._previousValues.color) ||
        !this.shadeColor.equals(this._previousValues.shadeColor) ||
        !this.emissionColor.equals(this._previousValues.emissionColor) ||
        !this.outlineColor.equals(this._previousValues.outlineColor) ||
        !this.rimColor.equals(this._previousValues.rimColor) ||
        !this.matcapFactor.equals(this._previousValues.matcapFactor) ||
        this.mainTex !== this._previousValues.mainTex ||
        this.shadeTexture !== this._previousValues.shadeTexture ||
        this.bumpMap !== this._previousValues.bumpMap ||
        this.sphereAdd !== this._previousValues.sphereAdd ||
        this.cutoff !== this._previousValues.cutoff ||
        this.bumpScale !== this._previousValues.bumpScale ||
        this.receiveShadowRate !== this._previousValues.receiveShadowRate ||
        this.shadingGradeRate !== this._previousValues.shadingGradeRate ||
        this.shadeShift !== this._previousValues.shadeShift ||
        this.shadeToony !== this._previousValues.shadeToony ||
        this.lightColorAttenuation !== this._previousValues.lightColorAttenuation ||
        this.indirectLightIntensity !== this._previousValues.indirectLightIntensity ||
        this.outlineWidth !== this._previousValues.outlineWidth ||
        this.outlineScaledMaxDistance !== this._previousValues.outlineScaledMaxDistance ||
        this.outlineLightingMix !== this._previousValues.outlineLightingMix ||
        this.debugMode !== this._previousValues.debugMode ||
        this.blendMode !== this._previousValues.blendMode ||
        this.outlineWidthMode !== this._previousValues.outlineWidthMode ||
        this.outlineColorMode !== this._previousValues.outlineColorMode ||
        this.cullMode !== this._previousValues.cullMode ||
        this.outlineCullMode !== this._previousValues.outlineCullMode ||
        this.srcBlend !== this._previousValues.srcBlend ||
        this.dstBlend !== this._previousValues.dstBlend ||
        this.zWrite !== this._previousValues.zWrite ||
        this.rimLightingMix !== this._previousValues.rimLightingMix ||
        this.rimFresnelPower !== this._previousValues.rimFresnelPower ||
        this.rimLift !== this._previousValues.rimLift ||
        this.uvAnimScrollX !== this._previousValues.uvAnimScrollX ||
        this.uvAnimScrollY !== this._previousValues.uvAnimScrollY ||
        this.uvAnimRotation !== this._previousValues.uvAnimRotation ||
        this.giEqualizationFactor !== this._previousValues.giEqualizationFactor) {
      return true;
    }
    return false;
  }
  
  _createMaterial() {
    const material = createMToonMaterial(this.device, {
      mainTex: this.mainTex,
      shadeTexture: this.shadeTexture,
      bumpMap: this.bumpMap,
      sphereAdd: this.sphereAdd,
      color: this.color,
      shadeColor: this.shadeColor,
      emissionColor: this.emissionColor,
      outlineColor: this.outlineColor,
      rimColor: this.rimColor,
      matcapFactor: this.matcapFactor,
      cutoff: this.cutoff,
      bumpScale: this.bumpScale,
      receiveShadowRate: this.receiveShadowRate,
      shadingGradeRate: this.shadingGradeRate,
      shadeShift: this.shadeShift,
      shadeToony: this.shadeToony,
      lightColorAttenuation: this.lightColorAttenuation,
      indirectLightIntensity: this.indirectLightIntensity,
      outlineWidth: this.outlineWidth,
      outlineScaledMaxDistance: this.outlineScaledMaxDistance,
      outlineLightingMix: this.outlineLightingMix,
      debugMode: this.debugMode,
      blendMode: this.blendMode,
      outlineWidthMode: this.outlineWidthMode,
      outlineColorMode: this.outlineColorMode,
      cullMode: this.cullMode,
      outlineCullMode: this.outlineCullMode,
      srcBlend: this.srcBlend,
      dstBlend: this.dstBlend,
      zWrite: this.zWrite,
      rimLightingMix: this.rimLightingMix,
      rimFresnelPower: this.rimFresnelPower,
      rimLift: this.rimLift,
      uvAnimScrollX: this.uvAnimScrollX,
      uvAnimScrollY: this.uvAnimScrollY,
      uvAnimRotation: this.uvAnimRotation,
      giEqualizationFactor: this.giEqualizationFactor,
    });

    this.entity.render.material = material;
  }
  
  _saveCurrentValues() {
    // 全ての属性の現在値を保存
    this._previousValues = {
      mainTex: this.mainTex,
      shadeTexture: this.shadeTexture,
      bumpMap: this.bumpMap,
      sphereAdd: this.sphereAdd,
      color: this.color.clone(),
      shadeColor: this.shadeColor.clone(),
      emissionColor: this.emissionColor.clone(),
      outlineColor: this.outlineColor.clone(),
      rimColor: this.rimColor.clone(),
      matcapFactor: this.matcapFactor.clone(),
      cutoff: this.cutoff,
      bumpScale: this.bumpScale,
      receiveShadowRate: this.receiveShadowRate,
      shadingGradeRate: this.shadingGradeRate,
      shadeShift: this.shadeShift,
      shadeToony: this.shadeToony,
      lightColorAttenuation: this.lightColorAttenuation,
      indirectLightIntensity: this.indirectLightIntensity,
      outlineWidth: this.outlineWidth,
      outlineScaledMaxDistance: this.outlineScaledMaxDistance,
      outlineLightingMix: this.outlineLightingMix,
      debugMode: this.debugMode,
      blendMode: this.blendMode,
      outlineWidthMode: this.outlineWidthMode,
      outlineColorMode: this.outlineColorMode,
      cullMode: this.cullMode,
      outlineCullMode: this.outlineCullMode,
      srcBlend: this.srcBlend,
      dstBlend: this.dstBlend,
      zWrite: this.zWrite,
      rimLightingMix: this.rimLightingMix,
      rimFresnelPower: this.rimFresnelPower,
      rimLift: this.rimLift,
      uvAnimScrollX: this.uvAnimScrollX,
      uvAnimScrollY: this.uvAnimScrollY,
      uvAnimRotation: this.uvAnimRotation,
      giEqualizationFactor: this.giEqualizationFactor,
    };
  }
}