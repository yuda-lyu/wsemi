import tinycolor from '@ctrl/tinycolor'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 由hsl回傳hex顏色字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/hsl.test.js Github}
 * @memberOf wsemi
 * @param {Number} rh 輸入色相: Hue(0~1)
 * @param {Number} rs 輸入飽和度: Saturation(0~1)
 * @param {Number} rl 輸入亮度/明度: Lightness(0~1)
 * @returns {String} 回傳顏色字串(hex)
 * @example
 *
 */
function hsl(rh, rs, rl) {

    //check
    if (!isnum(rh) || !isnum(rs) || !isnum(rl)) {
        return ''
    }

    //check range
    function ck01(v) {
        return v >= 0 && v <= 1
    }
    rh = cdbl(rh)
    rs = cdbl(rs)
    rl = cdbl(rl)
    if (!ck01(rh) || !ck01(rs) || !ck01(rl)) {
        return ''
    }

    //使用hsl物件各值需0~100, 跟原版tinycolor不同
    return tinycolor({
        h: rh * 100,
        s: rs * 100,
        l: rl * 100
    }).toHexString()
}


export default hsl
