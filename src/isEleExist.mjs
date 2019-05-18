import isestr from './isestr.mjs'


/**
 * 前端判斷元素id是否存在
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isEleExist.test.js Github}
 * @memberOf wsemi
 * @param {String} id 輸入id字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * need test in browser
 */
function isEleExist(id) {

    //check
    if (!isestr(id)) {
        return false
    }

    return !(document.getElementById(id) === null)
}


export default isEleExist
