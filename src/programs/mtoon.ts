import { ShaderGenerator, ShaderUtils } from 'playcanvas';

import vert from "../shaders/vert"
import frag from "../shaders/frag"

class ShaderGeneratorMToon extends ShaderGenerator {
    generateKey(options: any) {
        let key = "mtoon";
        for (const prop in options) {
            if (options.hasOwnProperty(prop)) {
                key += options[prop];
            }
        }
        return key;
    }

    createShaderDefinition(device: any, options: any) {
        const vertOptions = {
            useOutline: options.useOutline,
            outlineWidthWorld: options.useOutline
        }

        const fragOptions = {
            useOutline: options.useOutline,
            outlineWidthTexture: options.useOutlineWidthMultiplyTexture,
            mainTex: options.useMainTex,
            shadeTexture: options.useShadeTexture,
            bumpMap: options.useBumpMap,
            sphereAdd: options.useSphereAdd,
            emissionMap: options.useEmission,
            rimMultiplyTexture: options.useRimMultiplyTexture,
            animationMaskTexture: options.useUvAnimationMaskTexture
        }

        return ShaderUtils.createDefinition(device, {
            name: 'MToon',
            vertexCode: vert(vertOptions),
            fragmentCode: frag(fragOptions)
        });
    }
}

const mToon = new ShaderGeneratorMToon();

export { mToon };