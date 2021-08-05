
import isu8arr from './isu8arr.mjs'


/**
 * Unit8Array資料轉Blob資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2blob.test.mjs Github}
 * @memberOf wsemi
 * @param {Unit8Array} u8a 輸入Unit8Array資料
 * @returns {Blob} 回傳Blob資料
 * @example
 * need test in browser
 *
 * let u8a = new Uint8Array([1, 2.3, '45', 'abc'])
 * let bb = u8arr2blob(u8a)
 * console.log(bb)
 * // => Blob {size: 4, type: ""}
 *
 */
function u8arr2blob(u8a) {

    //check
    if (!isu8arr(u8a)) {
        return new Blob()
    }

    let bb = new Blob([u8a])
    return bb
}


export default u8arr2blob
