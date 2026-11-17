/**
 * 前端找尋DOM元素
 *
 * 屬查詢類(同domIsFocused)：query須為非空之原始字串(包裝物件new String無效)，其餘輸入(非字串、空字串)、選擇器語法錯誤、無document(非瀏覽器環境)皆不拋錯、訊息不含輸入值，一律回傳null；有效但無符合元素亦回傳null
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFind.test.mjs Github}
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串，須為非空之CSS選擇器字串
 * @returns {Element|null} 回傳DOM元素，無符合元素、query無效、選擇器語法錯誤或無document時回傳null
 * @example
 * need test in browser
 *
 * let ele = domFind('#id')
 *
 */
function domFind(query) {

    //check, 檢測先於呼叫原生API(原生會把非字串轉成字串當選擇器, 如5得原生SyntaxError、null被當標籤名null而無聲得null)
    if (typeof query !== 'string' || query === '') {
        return null
    }

    //querySelector, 選擇器語法錯誤(原生SyntaxError, 訊息含選擇器全文)與無document皆不外洩
    let r = null
    try {
        r = document.querySelector(query)
    }
    catch (err) {
        r = null
    }

    return r
}


export default domFind
