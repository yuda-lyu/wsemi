import isestr from './isestr.mjs'


/**
 * 前端判斷元素id是否存在
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isEleExistByID.test.mjs Github}
 * @memberOf wsemi
 * @param {String} id 輸入id字串
 * @returns {Boolean} 回傳判斷布林值，非瀏覽器環境(無document)回傳false
 * @example
 * need test in browser
 *
 * console.log(isEleExistByID('#id'))
 * // => true or false
 *
 */
function isEleExistByID(id) {

    //check
    if (!isestr(id)) {
        return false
    }

    //check, 未宣告之全域直接讀取為ReferenceError, 故須以typeof防護
    if (typeof document === 'undefined' || !document) {
        return false
    }

    return !(document.getElementById(id) === null)
}


export default isEleExistByID
