import times from 'lodash/times'
import constant from 'lodash/constant'
import iser from './iser.mjs'
import ispint from './ispint.mjs'


/**
 * 產生重複n次任意資料之陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/repObj.test.js Github}
 * @memberOf wsemi
 * @param {*} o 輸入任意資料
 * @param {Integer} n 輸入重複次數之正整數
 * @returns {Array} 回傳任意資料之陣列
 * @example
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
