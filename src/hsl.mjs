import TinyColor from '@ctrl/tinycolor'


/**
 * 由hsl回傳hex顏色字串
 *
 * @export
 * @param {Number} rh 輸入色相: Hue(0~1)
 * @param {Number} rs 輸入飽和度: Saturation(0~1)
 * @param {Number} rl 輸入亮度/明度: Lightness(0~1)
 * @returns {String} 回傳顏色字串(hex)
 */
export default function hsl(rh, rs, rl) {

    //使用hsl物件各值需0~100, 跟原版tinycolor不同
    return new TinyColor({
        h: rh * 100,
        s: rs * 100,
        l: rl * 100
    }).toHexString()
}
