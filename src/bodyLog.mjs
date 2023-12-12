import map from 'lodash-es/map'
import o2j from './o2j.mjs'
import htmlEncode from './htmlEncode.mjs'


/**
 * 前端顯示log訊息，預設插入至body
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bodyLog.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入字串
 * @example
 *
 * bodyLog('show訊息')
 * // => 由html顯示'show訊息'
 *
 */
function bodyLog() {

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
    document.querySelector('body').insertAdjacentHTML('beforeend', s)

}


export default bodyLog
