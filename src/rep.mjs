import repeat from 'lodash-es/repeat.js'
import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'


/**
 * 產生重複n次字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/rep.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入欲重複的字串
 * @param {Integer} n 輸入重複次數之含零正整數
 * @returns {Array} 回傳任意資料之陣列
 * @example
 *
 * console.log(rep('abc', 2))
 * // => 'abcabc'
 *
 */
function rep(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!isp0int(n)) {
        return ''
    }

    let r = repeat(c, n)

    return r
}


export default rep
