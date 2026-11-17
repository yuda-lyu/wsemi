import isenum from './isenum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 前端針對DOM元素事件內座標(clientX, clientY)取得DOM元素陣列
 *
 * 屬查詢類(同domIsFocused)：clientX與clientY須為有效數字(有限數字或十進位數字字串，去頭尾空白後取值；NaN、Infinity、'0x10'、null、布林、陣列、包裝物件皆非有效數字)，判定通過後以cdbl轉為數字再交給document.elementsFromPoint；任一無效不呼叫原生API(原生會把null、''、true、[]強制轉成0或1)，不拋錯、不輸出console，回傳空陣列[]；原生API拋錯(如無document)亦不拋錯、不輸出console，回傳空陣列[]
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domElementsFromPoint.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} clientX 輸入指定x座標，須為有效數字，須基於顯示區(viewport)之x座標
 * @param {Number|String} clientY 輸入指定y座標，須為有效數字，須基於顯示區(viewport)之y座標
 * @returns {Array} 回傳DOM元素陣列(由上而下)，clientX或clientY無效、無document或取得失敗時回傳空陣列[]
 * @example
 * need test in browser
 *
 * window.addEventListener('mousemove', (e) => {
 *   console.log(domElementsFromPoint(e.clientX, e.clientY))
 * })
 *
 */
function domElementsFromPoint(clientX, clientY) {

    //check, 檢測之值即使用之值
    if (!isenum(clientX)) {
        return []
    }
    if (!isenum(clientY)) {
        return []
    }
    clientX = cdbl(clientX)
    clientY = cdbl(clientY)

    //elementsFromPoint
    let ps = []
    try {
        ps = document.elementsFromPoint(clientX, clientY)
    }
    catch (err) {
        ps = [] //原生拋錯(如無document)不外洩、不輸出console(查詢類, 同domFind)
    }

    return ps
}


export default domElementsFromPoint
