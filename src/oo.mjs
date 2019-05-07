import j2o from './j2o.mjs'
import o2j from './o2j.mjs'


/**
 * 暴力cloneDeep物件
 *
 * @export
 * @param {*} o 輸入任意資料
 * @returns {*} 回傳任意資料
 */
export default function oo(o) {

    return j2o(o2j(o))
}
