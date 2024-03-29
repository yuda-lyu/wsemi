import times from 'lodash-es/times.js'
import constant from 'lodash-es/constant.js'
import iser from './iser.mjs'
import ispint from './ispint.mjs'


/**
 * 產生重複n次任意資料之陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/repObj.test.mjs Github}
 * @memberOf wsemi
 * @param {*} o 輸入任意資料
 * @param {Integer} n 輸入重複次數之正整數
 * @returns {Array} 回傳任意資料之陣列
 * @example
 *
 * console.log(repObj({ a: 12.45, b: 'opqr' }, 2))
 * // => [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }]
 *
 * console.log(repObj({ a: 12.45, b: 'opqr' }, 0))
 * // => []
 *
 */
function repObj(o, n) {

    //check
    if (iser(o)) {
        return []
    }
    if (!ispint(n)) {
        return []
    }

    let r = times(n, constant(o))

    return r
}


export default repObj
