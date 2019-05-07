import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import dig from './dig.mjs'


/**
 * 檔案大小(kb)自動轉換單位
 * 可調整檔案大小為kb,mb,g，並添加單位
 * 若輸入不是數字或字串時則回傳空字串
 * @export
 * @param {Number|String} kb 輸入單位需為kb的檔案大小，可為數字或字串
 * @returns {String} 回傳自動轉換單位後的字串
 */
export default function cfilesize(kb) {

    //check
    if (!isestr(kb) && !isnum(kb)) {
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
        return dig(kb / 1024 / 1024, 1) + ' g'
    }

    return ''
}
