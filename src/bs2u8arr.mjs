import isestr from './isestr.mjs'


/**
 * BinaryString轉Unit8Array，BinaryString為UTF-16編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bs2u8arr.test.js Github}
 * @memberOf wsemi
 * @param {String} bs 輸入BinaryString字串
 * @returns {Unit8Array} 回傳Unit8Array資料
 * @example
 * console.log(bs2u8arr('abc'))
 * // => new Uint8Array([97, 98, 99])
 */
function bs2u8arr(str) {

    //check
    if (!isestr(str)) {
        return new Uint8Array()
    }

    let l = str.length
    let u8a = new Uint8Array(l)
    for (let i = 0; i < l; i++) {
        u8a[i] = str.charCodeAt(i)
    }

    return u8a
}


export default bs2u8arr
