import isstr from './isstr.mjs'
import isnum from './isnum.mjs'
import isp0num from './isp0num.mjs'
import isn0num from './isn0num.mjs'
import isint from './isint.mjs'
import ispint from './ispint.mjs'
import isp0int from './isp0int.mjs'
import isnint from './isnint.mjs'
import isn0int from './isn0int.mjs'
import isfun from './isfun.mjs'


/**
 * 驗證數值是否為指定類型
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/verifyValue.test.js Github}
 * @memberOf wsemi
 * @param {String|Function} type 輸入判斷資料類型字串或判斷函式，資料類型可選為'isstr','isnum','isp0num','isn0num','isint','ispint','isp0int','isnint','isn0int','isfun'
 * @param {*} value 輸入任意資料
 * @returns {Object} 回傳判斷結果，屬性value為回傳資料類型的取值，屬性err為是否資料類型有錯，屬性errmsg為類型有錯時之錯誤訊息
 * @example
 *
 * console.log(verifyValue('12a5', 'isstr'))
 * // => r.err=false
 *
 * console.log(verifyValue('12', 'isint'))
 * // => r.err=false
 *
 * console.log(verifyValue('0', 'isp0int'))
 * // => r.err=false
 *
 * console.log(verifyValue('12', 'isp0int'))
 * // => r.err=false
 *
 * console.log(verifyValue('0', 'isn0int'))
 * // => r.err=false
 *
 * console.log(verifyValue('-12', 'isn0int'))
 * // => r.err=false
 *
 * console.log(verifyValue('12.34', 'isnum'))
 * // => r.err=false
 *
 * console.log(verifyValue('12.34', 'isp0num'))
 * // => r.err=false
 *
 * console.log(verifyValue('-12.34', 'isn0num'))
 * // => r.err=false
 *
 */
function verifyValue(value, type) {

    let err = false
    let errmsg = ''
    if (type === 'isstr') {
        if (!isstr(value)) {
            err = true
            errmsg = '需要為字串'
            value = ''
        }
    }
    else if (type === 'isnum') {
        if (!isnum(value)) {
            err = true
            errmsg = '需要為數字'
            value = 0
        }
    }
    else if (type === 'isp0num') {
        if (!isp0num(value)) {
            err = true
            errmsg = '需要為含0的正浮點數'
            value = 0
        }
    }
    else if (type === 'isn0num') {
        if (!isn0num(value)) {
            err = true
            errmsg = '需要為含0的負浮點數'
            value = 0
        }
    }
    else if (type === 'isint') {
        if (!isint(value)) {
            err = true
            errmsg = '需要為整數'
            value = 0
        }
    }
    else if (type === 'ispint') {
        if (!ispint(value)) {
            err = true
            errmsg = '需要為不含0正整數'
            value = 0
        }
    }
    else if (type === 'isp0int') {
        if (!isp0int(value)) {
            err = true
            errmsg = '需要為含0正整數'
            value = 0
        }
    }
    else if (type === 'isnint') {
        if (!isnint(value)) {
            err = true
            errmsg = '需要為不含0負整數'
            value = 0
        }
    }
    else if (type === 'isn0int') {
        if (!isn0int(value)) {
            err = true
            errmsg = '需要為含0負整數'
            value = 0
        }
    }
    else if (isfun(type)) {
        let f = type
        value = f(value)
    }
    else if (type === 'any') {
        if (!isnum(value) && !isstr(value)) {
            err = true
            errmsg = '需要為字串或數字'
            value = ''
        }
    }
    else {
        err = true
        errmsg = '需要指定驗證類型'
        value = null
    }
    let r = {
        value: value,
        err: err,
        errmsg: errmsg,
    }
    return r
}


export default verifyValue
