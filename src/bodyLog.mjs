import map from 'lodash/map'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import o2j from './o2j.mjs'
import htmlEncode from './htmlEncode.mjs'


/**
 * 前端顯示log訊息，預設插入至body
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bodyLog.test.js Github}
 * @memberOf wsemi
 * @param {String} c 輸入字串
 * @param {Element} ele 輸入DOM元素，預設為body
 * @example
 * bodyLog('show訊息')
 * // => 由html顯示'show訊息'
 */
function bodyLog(c, ele) {

    //check
    if (!isestr(c)) {
        return ''
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

    //ele
    if (!isEle(ele)) {
        ele = document.querySelector('body')
    }

    //append
    ele.insertAdjacentHTML('beforeend', s)

}


export default bodyLog
