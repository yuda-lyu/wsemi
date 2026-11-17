import map from 'lodash-es/map.js'
import o2j from './o2j.mjs'
import htmlEncode from './htmlEncode.mjs'
import isEle from './isEle.mjs'


/**
 * 前端顯示log訊息，預設插入至body
 *
 * 歸DOM類(C18)：無document(非瀏覽器環境)或取不到body元素時不動作、不拋錯、不輸出console，回傳undefined
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bodyLog.test.mjs Github}
 * @memberOf wsemi
 * @param {...*} c 輸入不定個數之任意資料(以arguments讀取，各項經o2j轉成字串後以', '串接，再經htmlEncode跳脫後顯示)，未給任何引數時仍顯示一行空log
 * @example
 *
 * bodyLog('show訊息')
 * // => 由html顯示'show訊息'
 *
 * bodyLog('a', 123, { x: 1 })
 * // => 由html顯示'a, 123, {"x":1}'
 *
 */
function bodyLog() {

    //body, 無document或取不到body(null、非元素)不動作(同C18元素不存在不動作), 先於任何處理
    let body = null
    try {
        body = document.querySelector('body')
    }
    catch (err) {
        body = null
    }
    if (!isEle(body)) {
        return
    }

    //join arguments
    let as = map(arguments, function(v) {
        return o2j(v)
    }).join(', ')

    //msg
    let s = `
    <div style="padding:5px; font-size:10pt; font-family:Microsoft JhengHei, Helvetica;">
        <span style="color:#f26;">log: </span>
        <code>${htmlEncode(as)}</code>
    </div>
    `

    //append
    body.insertAdjacentHTML('beforeend', s)

}


export default bodyLog
