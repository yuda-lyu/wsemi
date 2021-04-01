import isu8arr from './isu8arr.mjs'


/**
 * Unit8Array轉BinaryString，BinaryString為UTF-16編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2bs.test.js Github}
 * @memberOf wsemi
 * @param {Unit8Array} u8a 輸入Unit8Array資料
 * @returns {String} 回傳BinaryString字串
 * @example
 *
 * console.log(u8arr2bs(new Uint8Array([97, 98, 99])))
 * // => 'abc'
 *
 */
function u8arr2bs(u8a) {

    //check
    if (!isu8arr(u8a)) {
        return ''
    }

    let l = u8a.length
    let c = ''
    for (let i = 0; i < l; i++) {
        c += String.fromCharCode(u8a[i])
    }

    return c
}


export default u8arr2bs
