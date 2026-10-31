import isenum from './isenum.mjs'
import dig from './dig.mjs'


/**
 * 檔案大小(bytes)自動轉換單位
 * 可調整檔案大小為b,kb,mb,gb，並添加單位
 * b須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cfilesize.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} b 輸入單位需為bytes的檔案大小，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳空字串
 * @returns {String} 回傳自動轉換單位後的字串，b非有效數字時回傳空字串
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
    if (!isenum(b)) {
        return ''
    }

    b = Number(b) //檢測之值即為使用之值(去頭尾空白後Number)
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
