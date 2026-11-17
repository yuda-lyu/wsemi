/**
 * 前端找尋多DOM元素
 *
 * 屬查詢類(同domIsFocused)：query須為非空之原始字串(包裝物件new String無效)，其餘輸入(非字串、空字串)、選擇器語法錯誤、無document(非瀏覽器環境)皆不拋錯、訊息不含輸入值，一律回傳空陣列[]；有效但無符合元素時回傳空NodeList
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFinds.test.mjs Github}
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串，須為非空之CSS選擇器字串
 * @returns {NodeList|Array} 回傳符合之DOM元素集合(document.querySelectorAll之NodeList，非Array，無符合時為空NodeList)；query無效、選擇器語法錯誤或無document時回傳空陣列[]，皆可用length與索引存取
 * @example
 * need test in browser
 *
 * let eles = domFinds('[name="abc"]')
 *
 */
function domFinds(query) {

    //check, 檢測先於呼叫原生API(原生會把非字串轉成字串當選擇器)
    if (typeof query !== 'string' || query === '') {
        return []
    }

    //querySelectorAll, 選擇器語法錯誤(原生SyntaxError, 訊息含選擇器全文)與無document皆不外洩
    let r = []
    try {
        r = document.querySelectorAll(query)
    }
    catch (err) {
        r = []
    }

    return r
}


export default domFinds
