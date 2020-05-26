/**
 * 判斷是否為瀏覽器環境
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isWindow.test.js Github}
 * @memberOf wsemi
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * need test in browser
 */
function isWindow() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}


export default isWindow
