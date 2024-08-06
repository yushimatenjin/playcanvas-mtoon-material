import { CULLFACE_BACK, FUNC_LESSEQUAL, BLEND_NONE } from "playcanvas";
import { MToonMaterial } from "../../dist/index.mjs";

import { expect } from "chai";

describe("Material", function () {
  function checkDefaultMaterial(material) {
    expect(material).to.be.an.instanceof(MToonMaterial);
    expect(material.alphaTest).to.equal(0);
    expect(material.alphaToCoverage).to.equal(false);
    expect(material.alphaWrite).to.equal(true);
    expect(material.blendType).to.equal(BLEND_NONE);
    expect(material.blueWrite).to.equal(true);
    expect(material.cull).to.equal(CULLFACE_BACK);
    expect(material.depthBias).to.equal(0);
    expect(material.depthTest).to.equal(true);
    expect(material.depthFunc).to.equal(FUNC_LESSEQUAL);
    expect(material.depthWrite).to.equal(true);
    expect(material.greenWrite).to.equal(true);
    expect(material.name).to.equal("Untitled");
    expect(material.redWrite).to.equal(true);
    expect(material.slopeDepthBias).to.equal(0);
    expect(material.stencilBack).to.not.exist;
    expect(material.stencilFront).to.not.exist;
  }

  describe("#constructor()", function () {
    it("should create a new instance", function () {
      const material = new MToonMaterial();
      checkDefaultMaterial(material);
    });
  });

  describe("#clone()", function () {
    it("should clone a material", function () {
      const material = new MToonMaterial();
      const clone = material.clone();
      checkDefaultMaterial(clone);
    });
  });

  describe("#copy()", function () {
    it("should copy a material", function () {
      const src = new MToonMaterial();
      const dst = new MToonMaterial();
      dst.copy(src);
      checkDefaultMaterial(dst);
    });
  });
});
