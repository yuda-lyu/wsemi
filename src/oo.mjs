import j2o from './j2o.mjs'
import o2j from './o2j.mjs'


/**
 * 暴力cloneDeep物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/oo.test.js Github}
 * @memberOf wsemi
 * @param {*} o 輸入任意資料
 * @returns {*} 回傳任意資料
 * @example
 * oo([1, '3', 'abc'])
 * // => [1, '3', 'abc']
 *
 * oo([1, '3', 'abc', function(){}])
 * // => [1, '3', 'abc', null]
 *
 * oo({ a: 12.34, b: 'abc' })
 * // => { a: 12.34, b: 'abc' }
 *
 * oo({ a: 12.34, b: 'abc', c: function(){} })
 * // => { a: 12.34, b: 'abc' }
 */
function oo(o) {

    //check
    if (o === undefined) {
        return undefined
    }

    return j2o(o2j(o))
}


export default oo
