import oc from './color.mjs'
import iser from './iser.mjs'


/**
 * 產生highchart直條圖用漸變顏色物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genGradientColor.test.js Github}
 * @memberOf wsemi
 * @param {*} color 輸入color資料
 * @returns {Object} 回傳漸變顏色物件
 * @example
 *
 * console.log(genGradientColor('#000'))
 * // => {
 * //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
 * //     stops: [ [ 0, 'rgba(0, 0, 0, 0.4)' ], [ 1, 'rgba(0, 0, 0, 0.9)' ] ]
 * //     }
 *
 * console.log(genGradientColor('hsl (320, 50%, 40%)'))
 * // => {
 * //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
 * //     stops: [
 * //         [ 0, 'rgba(153, 51, 119, 0.4)' ],
 * //         [ 1, 'rgba(153, 51, 119, 0.9)' ]
 * //     ]
 * // }
 *
 * console.log(genGradientColor('hsva (320, 100%, 50%, 0.1)'))
 * // => {
 * //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
 * //     stops: [ [ 0, 'rgba(128, 0, 85, 0.4)' ], [ 1, 'rgba(128, 0, 85, 0.9)' ] ]
 * // }
 *
 * console.log(genGradientColor('#6a3'))
 * // => {
 * //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
 * //     stops: [
 * //         [ 0, 'rgba(102, 170, 51, 0.4)' ],
 * //         [ 1, 'rgba(102, 170, 51, 0.9)' ]
 * //     ]
 * // }
 *
 * console.log(genGradientColor('#6b8e23'))
 * // => {
 * //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
 * //     stops: [
 * //         [ 0, 'rgba(107, 142, 35, 0.4)' ],
 * //         [ 1, 'rgba(107, 142, 35, 0.9)' ]
 * //     ]
 * // }
 *
 * console.log(genGradientColor('skyblue'))
 * // => {
 * //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
 * //     stops: [
 * //         [ 0, 'rgba(135, 206, 235, 0.4)' ],
 * //         [ 1, 'rgba(135, 206, 235, 0.9)' ]
 * //     ]
 * // }
 *
 */
function genGradientColor(color) {

    //check
    if (iser(color)) {
        return {}
    }

    //rgba
    let rgba
    try {
        rgba = oc.toRgba(color)
    }
    catch (err) {
        return {}
    }

    //cv
    function cv(o, a) {
        o.a = a
        let r = oc.toRgbaString(o)
        return r
    }

    let c0 = cv(rgba, 0.4)
    let c1 = cv(rgba, 0.9)

    return {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: [
            [0, c0],
            [1, c1]
        ]
    }
}


export default genGradientColor
