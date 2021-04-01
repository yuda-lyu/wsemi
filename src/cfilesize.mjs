import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import dig from './dig.mjs'


/**
 * 檔案大小(bytes)自動轉換單位
 * 可調整檔案大小為b,kb,mb,gb，並添加單位
 * 若輸入不是數字或字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cfilesize.test.js Github}
 * @memberOf wsemi
 * @param {Number|String} b 輸入單位需為bytes的檔案大小，可為數字或字串
 * @returns {String} 回傳自動轉換單位後的字串
 * @example
 *
 * console.log(cfilesize(0))
 * // => '0.0 b'
 *
 * console.log(cfilesize(100))
 * // => '100.0 b'
 *
 * console.log(cfilesize(2048))
 * // => '2.0 kb'
 *
 * console.log(cfilesize(2000000))
 * // => '1.9 mb'
 *
 * console.log(cfilesize(2000000000))
 * // => '1.9 gb'
 *
 */
function cfilesize(b) {

    //check
    if (!isnum(b)) {
        return ''
    }

    b = cdbl(b)
    if (b < 1024) {
        return dig(b, 1) + ' b'
    }
    else if (b < 1024 * 1024) {
        return dig(b / 1024, 1) + ' kb'
    }
    else if (b < 1024 * 1024 * 1024) {
        return dig(b / 1024 / 1024, 1) + ' mb'
    }
    else if (b < 1024 * 1024 * 1024 * 1024) {
        return dig(b / 1024 / 1024 / 1024, 1) + ' gb'
    }

    return ''
}


export default cfilesize
