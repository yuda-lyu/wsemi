import get from 'lodash-es/get.js'
import lotrim from 'lodash-es/trim.js'
import drop from 'lodash-es/drop.js'
import reverse from 'lodash-es/reverse.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import strdelleft from './strdelleft.mjs'
import strdelright from './strdelright.mjs'


/**
 * 字串頭尾去除空白字串，若字串開頭含有BOM亦可清除，若輸入不是字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/trim.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.excludeString=false] 輸入是否頭尾去除非數字字串布林值，預設false
 * @returns {String} 回傳去除空白的字串
 * @example
 *
 * console.log(trim(' abc '))
 * // => 'abc'
 *
 * console.log(trim(' 中 文 '))
 * // => '中 文'
 *
 * console.log(trim(' abc 中 文 '))
 * // => 'abc 中 文'
 *
 * console.log(trim(' abc123 '))
 * // => 'abc123'
 *
 * console.log(trim(' abc123 ', { excludeString: true }))
 * // => '123'
 *
 * console.log(trim(' 123abc ', { excludeString: true }))
 * // => '123'
 *
 * console.log(trim(' a3b321c ', { excludeString: true }))
 * // => '3b321'
 *
 */
function trim(c, opt = {}) {

    //excludeString
    let excludeString = get(opt, 'excludeString')
    if (!isbol(excludeString)) {
        excludeString = false
    }

    //check
    if (!isestr(c)) {
        return ''
    }

    //isCharNum
    let isCharNum = (c) => {
        return (c >= '0' && c <= '9') || (c === '.') || (c === '-') || (c === '+')
    }

    //trim
    let r = lotrim(c)

    //excludeString
    if (excludeString) {

        //ss
        let ss = r.split('')
        // console.log('ss', ss)

        //剔除開頭非數字
        for (let i = 0; i < ss.length; i++) {
            if (isCharNum(ss[i])) {
                r = strdelleft(r, i)
                ss = drop(ss, i)
                break
            }
        }
        // console.log('r1', r, 'ss1', ss)

        //剔除結尾非數字
        ss = reverse(ss)
        // console.log('ss2', ss)
        for (let i = 0; i < ss.length; i++) {
            if (isCharNum(ss[i])) {
                r = strdelright(r, i)
                break
            }
        }
        // console.log('r2', r)

    }

    return r
}


export default trim
