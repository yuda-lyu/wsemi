/**
 * 判斷是否為Promise
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ispm.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值，任何輸入皆回傳布林值，讀取即拋錯之值(如已撤銷之Proxy、會拋錯之getter)回傳false
 * @example
 *
 * console.log(ispm('1.25'))
 * // => false
 *
 * console.log(ispm(new Promise(function() {})))
 * // => true
 *
 */
function ispm(v) {
    let b

    //c, Object.prototype.toString.call會觸發Symbol.toStringTag之getter與Proxy之陷阱(已撤銷之Proxy亦拋錯), 拋錯者無法判定為Promise故回傳false, 與下方讀取then之try一致, 使本函數於任何輸入皆回傳布林值
    let c
    try {
        c = Object.prototype.toString.call(v)
    }
    catch (err) {
        return false
    }
    b = c === '[object Promise]'
    if (b) {
        return true //若為[object Promise]則直接回傳true
    }

    if (c !== '[object Function]') {
        return false //若不是[object Promise]也不是[object Function]則直接回傳false
    }

    try {
        b = typeof v.subscribe !== 'function' && typeof v.then === 'function' //可偵測async function
    }
    catch (err) {}

    return b
}


export default ispm
