import o2j from './o2j.mjs'
import str2b64 from './str2b64.mjs'


/**
 * 任意資料轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2b64.test.js Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @returns {String} 回傳base64字串
 * @example
 * obj2b64([1, '3', 'abc'])
 * // => 'WzEsIjMiLCJhYmMiXQ=='
 *
 * obj2b64({ a: 12.34, b: 'abc' })
 * // => 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9'
 */
function obj2b64(data) {

    let b64 = ''
    try {
        b64 = str2b64(o2j(data))
    }
    catch (err) {
        b64 = ''
    }

    return b64
}


export default obj2b64
