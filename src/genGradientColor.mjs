import TinyColor from '@ctrl/tinycolor'


/**
 * 產生highchart直條圖用漸變顏色物件
 *
 * @memberOf wsemi
 * @param {String} hex 輸入hex顏色字串
 * @returns {Object} 回傳漸變顏色物件
 */
function genGradientColor(hex) {

    return {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, new TinyColor(hex).setAlpha(0.4).toHslString()],
            [1, new TinyColor(hex).setAlpha(0.9).toHslString()]
        ]
    }
}


export default genGradientColor
