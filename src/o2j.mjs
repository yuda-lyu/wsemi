import isundefined from './isundefined.mjs'


/**
 * 任意資料轉json文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/o2j.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Boolean} [bFormat=false] 輸入是否格式化布林值，預設為false
 * @returns {String} 回傳json格式字串
 * @example
 *
 * console.log(o2j([1, '3', 'abc']))
 * // => '[1,"3","abc"]'
 *
 * console.log(o2j({ a: 12.34, b: 'abc' }))
 * // => '{"a":12.34,"b":"abc"}'
 *
 * console.log(o2j({ a: 12.34, b: 'abc' }, true))
 * // => {
 *   "a": 12.34,
 *   "b": "abc"
 * }
 *
 */
function o2j(v, bFormat = false) {

    //check
    if (isundefined(v)) {
        return ''
    }

    let c = ''
    try {
        if (bFormat) {
            c = JSON.stringify(v, null, 2)
        }
        else {
            c = JSON.stringify(v)
        }
    }
    catch (err) {
        c = ''
    }

    return c
}


export default o2j
