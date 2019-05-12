import j2o from './j2o.mjs'
import o2j from './o2j.mjs'


/**
 * 暴力cloneDeep物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/oo.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {*} o 輸入任意資料
 * @returns {*} 回傳任意資料
 */
function oo(o) {

    return j2o(o2j(o))
}


export default oo
