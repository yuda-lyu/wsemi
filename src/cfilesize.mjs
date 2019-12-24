import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import dig from './dig.mjs'


/**
 * 檔案大小(kb)自動轉換單位
 * 可調整檔案大小為kb,mb,g，並添加單位
 * 若輸入不是數字或字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cfilesize.test.js Github}
 * @memberOf wsemi
 * @param {Number|String} kb 輸入單位需為kb的檔案大小，可為數字或字串
 * @returns {String} 回傳自動轉換單位後的字串
 * @example
 * console.log(cfilesize(0))
 * // => '0.0 kb'
 *
 * console.log(cfilesize(100))
 * // => '100.0 kb'
 *
 * console.log(cfilesize(2048))
 * // => '2.0 mb'
 *
 * console.log(cfilesize(2000000))
 * // => '1.9 gb'
 */
function cfilesize(kb) {

    //check
    if (!isnum(kb)) {
        return ''
    }

    kb = cdbl(kb)
    if (kb < 1024) {
        return dig(kb, 1) + ' kb'
    }
    else if (kb < 1024 * 1024) {
        return dig(kb / 1024, 1) + ' mb'
    }
    else if (kb < 1024 * 1024 * 1024) {
        return dig(kb / 1024 / 1024, 1) + ' gb'
    }

    return ''
}


export default cfilesize
