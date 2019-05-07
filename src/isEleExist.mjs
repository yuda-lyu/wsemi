import isestr from './isestr.mjs'


/**
 * 前端判斷元素id是否存在
 *
 * @export
 * @param {String} id 輸入id字串
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isEleExist(id) {

    //check
    if (!isestr(id)) {
        return false
    }

    return !(document.getElementById(id) === null)
}
