/**
 * 判斷是否為Promise
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ispm.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * console.log(ispm('1.25'))
 * // => false
 *
 * console.log(ispm(new Promise(function() {})))
 * // => true
 */
function ispm(v) {
    let b

    let c = Object.prototype.toString.call(v)
    b = c === '[object Promise]'
    if (b) {
        return true //若為[object Promise]則直接回傳true
    }

    if (c !== '[object Function]') {
        return false //若不是[object Promise]也不是[object Function]則直接回傳false
    }

    try {
        b = v && typeof v.subscribe !== 'function' && typeof v.then === 'function' //可偵測async function
    }
    catch (err) {}

    return b
}


export default ispm
