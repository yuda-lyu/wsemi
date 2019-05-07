import floor from 'lodash/floor'
import reverse from 'lodash/reverse'
import ispint from './isp0int.mjs'
import isbol from './isbool.mjs'


/**
 * 切分正整數
 * 例如10/3為[4,3,3]
 * 若輸入v,n不是整數或breverse不是布林值時則回傳空陣列
 * @export
 * @param {Integer} v 輸入要被切分的整數
 * @param {Integer} n 輸入要切分數量的整數
 * @param {Boolean} [breverse=true] 輸入是否要反轉順序，預設true為由小至大，反序則為由大至小
 * @returns {Array} 回傳切分後的整數陣列
 */
export default function sepInt(v, n, breverse = true) {

    //check
    if (!ispint(v)) {
        return []
    }
    if (!ispint(n)) {
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
