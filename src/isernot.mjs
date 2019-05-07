import iser from './iser.mjs'


/**
 * 判斷是否為廣義有效
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isernot(v) {

    return !iser(v)
}
