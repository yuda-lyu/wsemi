/**
 * 任意資料轉json文字
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Boolean} [bFormat=false] 輸入是否格式化布林值，預設為false
 * @returns {String} 回傳json格式字串
 */
function o2j(v, bFormat = false) {

    let c = ''
    try {
        if (bFormat) {
            c = JSON.stringify(v, null, 2)
        }
        else {
            c = JSON.stringify(v)
        }
    }
    catch (err) {
        c = ''
    }

    return c
}


export default o2j
