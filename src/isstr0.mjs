import isstr from './isstr.mjs'


/**
 * 判斷是否為空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isstr0.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isstr0(v) {

    if (isstr(v)){
        if (v === '') {
            return true
        }
    }
    return false
}


export default isstr0
