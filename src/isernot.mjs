import iser from './iser.mjs'


/**
 * 判斷是否為廣義有效
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isernot(v) {

    return !iser(v)
}


export default isernot
