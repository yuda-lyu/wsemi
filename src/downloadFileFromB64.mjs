import isestr from './isestr.mjs'
import isWindow from './isWindow.mjs'


/**
 * 前端下載base64資料成為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromB64.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} b64 輸入base64資料字串
 * @example
 * need test in browser
 */
function downloadFileFromB64(cfn, b64) {

    //check
    if (!isestr(cfn)) {
        console.log('no filename')
        return
    }

    //check
    if (!isWindow()) {
        console.log('no window')
        return
    }

    //download

    //tag a
    let a = document.createElement('a')
    a.href = b64
    a.download = cfn

    //download
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

}


export default downloadFileFromB64
