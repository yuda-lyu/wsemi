import repeat from 'lodash/repeat'
import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'


/**
 * 產生重複n次字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/rep.test.js Github}
 * @memberOf wsemi
 * @param {String} c 輸入欲重複的字串
 * @param {PositiveInteger} n 輸入重複次數之含零正整數
 * @returns {Array} 回傳任意資料之陣列
 * @example
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
