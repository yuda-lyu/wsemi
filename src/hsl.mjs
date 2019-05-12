import TinyColor from '@ctrl/tinycolor'


/**
 * 由hsl回傳hex顏色字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/hsl.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Number} rh 輸入色相: Hue(0~1)
 * @param {Number} rs 輸入飽和度: Saturation(0~1)
 * @param {Number} rl 輸入亮度/明度: Lightness(0~1)
 * @returns {String} 回傳顏色字串(hex)
 */
function hsl(rh, rs, rl) {

    //使用hsl物件各值需0~100, 跟原版tinycolor不同
    return new TinyColor({
        h: rh * 100,
        s: rs * 100,
        l: rl * 100
    }).toHexString()
}


export default hsl
