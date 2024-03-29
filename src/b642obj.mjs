import isstr from './isstr.mjs'
import b642str from './b642str.mjs'
import j2o from './j2o.mjs'


/**
 * base64字串轉物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @returns {*} 回傳任意物件
 * @example
 *
 * console.log(b642obj('WzEsIjMiLCJhYmMiXQ=='))
 * // => [1, '3', 'abc']
 *
 */
function b642obj(b64) {

    //check
    if (!isstr(b64)) {
        return {}
    }

    let obj = {}
    try {
        obj = j2o(b642str(b64))
    }
    catch (err) {
        obj = {}
    }

    return obj
}


export default b642obj
