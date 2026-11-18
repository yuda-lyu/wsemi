import each from 'lodash-es/each.js'
import isstr from './isstr.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'


/**
 * 判斷字串s是否「任一出現於、全部包含於」字串陣列keys內元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/binstr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} s 輸入要判斷的字串
 * @param {Array|String} keys 輸入字串陣列或字串，須為非空字串，或內含元素皆為非空字串之非空陣列，否則回傳false；單一空元素之陣列([null]、['']、[{}])視為一個無效元素(非有效字串)而回傳false，與[null, null]相同，不被當成空陣列
 * @param {String} [mode='anyone'] 輸入模式字串，可選'anyone'與'all'，其他值(含null、數字、布林、物件、陣列、包裝物件、不在可選集合之字串)視為未給而改用預設'anyone'，不報錯，預設為'anyone'
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(binstr('1.25abc', 'ab'))
 * // => true
 *
 */
function binstr(s, keys, mode = 'anyone') {

    //check
    if (!isestr(s)) {
        return false
    }

    //check mode, opt類位置參數(簽名預設'anyone'): 非預期之輸入視為未給, 改用預設'anyone'(K3, W-13/N-B, 使用者2026-11-16)
    if (mode !== 'anyone' && mode !== 'all') {
        mode = 'anyone'
    }

    //keys為字串不是陣列時自動轉陣列
    if (isstr(keys)) {
        if (isestr(keys)) {
            keys = [keys]
        }
        else {
            return false
        }
    }

    //keys需為非空陣列; 單一空元素([null]、['']、[{}])為一個元素, 不得被當成空陣列, 其不是有效字串而於下方回傳false(同[null, null]; W-19, 比照第三批)
    if (!isarr(keys) || keys.length === 0) {
        return false
    }

    //check keys內都需要為字串
    let bNotStr = false
    each(keys, function(key) {
        if (!isestr(key)) {
            bNotStr = true
        }
    })
    if (bNotStr) {
        return false
    }

    //instr
    function instr(s, key) {
        return s.indexOf(key)
    }

    //判斷是否任一出現、全部包含keys元素
    let n = 0
    each(keys, function(key) {
        if (instr(s, key) !== -1) {
            n++
        }
    })

    if (mode === 'anyone') {
        return n > 0
    }
    else if (mode === 'all') {
        return n === keys.length
    }
    return false
}


export default binstr
