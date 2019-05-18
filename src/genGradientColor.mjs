import tinycolor from '@ctrl/tinycolor'
import iser from './iser.mjs'


/**
 * 產生highchart直條圖用漸變顏色物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genGradientColor.test.js Github}
 * @memberOf wsemi
 * @param {*} color 輸入color資料
 * @returns {Object} 回傳漸變顏色物件
 * @example
 * genGradientColor('#000')
 * // => {"linearGradient":{"x1":0,"x2":0,"y1":0,"y2":1},"stops":[[0,"hsla(0, 0%, 0%, 0.4)"],[1,"hsla(0, 0%, 0%, 0.9)"]]}
 */
function genGradientColor(color) {

    //check
    if (iser(color)) {
        return {}
    }

    //t
    let t = tinycolor(color)

    //check
    if (t.isValid === false) {
        return {}
    }

    return {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, t.setAlpha(0.4).toHslString()],
            [1, t.setAlpha(0.9).toHslString()]
        ]
    }
}


export default genGradientColor
