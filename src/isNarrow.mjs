/**
 * 前端判斷是否為窄版裝置
 * 主要判斷瀏覽器視窗寬度是否大於0與小於1024，若有傳DOM元素，則再加判斷該元素寬度是否大於0與小於700
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isNarrow.test.js Github}
 * @memberOf wsemi
 * @param {Element} [ele=undefined] 輸入為DOM元素，預設為不使用
 * @returns {Boolean} 回傳是否為窄版裝置
 * @example
 * need test in browser
 */
function isNarrow(ele) {

    //check
    if (!window) {
        return false
    }

    let rwdWidthWin = 1024
    let rwdWidthEle = 700

    //bwin
    let bwin = window.innerWidth > 0 && window.innerWidth <= rwdWidthWin

    //bele
    let bele = false
    if (ele) {
        bele = ele.clientWidth > 0 && ele.clientWidth <= rwdWidthEle
    }

    let r = bwin || bele

    return r
}


export default isNarrow
