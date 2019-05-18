import floor from 'lodash/floor'
import reverse from 'lodash/reverse'
import isint from './isint.mjs'
import isp0int from './isp0int.mjs'
import isbol from './isbol.mjs'


/**
 * 由整數v切分n個正整數，回傳切分後之整數陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/sepInt.test.js Github}
 * @memberOf wsemi
 * @param {Integer} v 輸入要被切分的整數
 * @param {Integer} n 輸入要切分數量的整數
 * @param {Boolean} [breverse=true] 輸入是否要反轉順序，預設true為由小至大，反序則為由大至小
 * @returns {Array} 回傳切分後的整數陣列
 * @example
 * sepInt(10, 3)
 * // => [3, 3, 4]
 */
function sepInt(v, n, breverse = true) {

    //check
    if (!isint(v)) {
        return []
    }
    if (!isp0int(n)) {
        return []
    }
    if (!isbol(breverse)) {
        return []
    }

    let q = floor(v / n)
    let s = v - q * n
    let r = []
    for (let i = 1; i <= n; i++) {
        let w = q
        if (i <= s) {
            w = q + 1
        }
        r.push(w)
    }
    if (breverse) {
        r = reverse(r)
    }

    return r
}


export default sepInt
