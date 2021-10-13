/**
 * 判斷是否為物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isobj.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isobj({}))
 * // => true
 *
 * console.log(isobj({ a: 123 }))
 * // => true
 *
 */
function isobj(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Object]'
}


export default isobj
