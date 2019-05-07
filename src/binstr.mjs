import each from 'lodash/each'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'


/**
 * 判斷字串s是否「任一出現於、全部包含於」字串陣列keys內元素
 *
 * @export
 * @param {String} s 輸入要判斷的字串
 * @param {Array|String} keys 輸入字串陣列或字串
 * @param {String} mode 輸入模式，預設為'anyone'
 * @returns {Boolean} 回傳判斷布林值
 */
export default function binstr(s, keys, mode = 'anyone') {

    //check
    if (!isestr(s)) {
        return false
    }

    //keys為字串不是陣列時自動轉陣列
    if (!isarr(keys) && isestr(keys)) {
        keys = [keys]
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
