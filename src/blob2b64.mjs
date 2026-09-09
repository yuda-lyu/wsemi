import genPm from './genPm.mjs'
import isblob from './isblob.mjs'
import isWindow from './isWindow.mjs'


/**
 * 前端Blob或input檔案物件轉Base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blob2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} bb 輸入Blob或File
 * @returns {Promise} 回傳Promise，resolve回傳Blob或File的Base64字串，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let b64 = 'YWJj5ris6Kmm'
 * let u8a = b642u8arr(b64)
 * let bb = new Blob([u8a])
 * blob2b64(bb)
 *     .then(function(b64Out){
 *         console.log(b64Out)
 *         // => data:application/octet-stream;base64,YWJj5ris6Kmm
 *     })
 *
 */
function blob2b64(bb) {

    //check, 輸入無效屬呼叫端錯誤, 須先於環境檢查回報, 否則於瀏覽器外一律得到no window而無從分辨
    if (!isblob(bb)) {
        return Promise.reject('invalid bb')
    }

    //check, 原碼未做此檢查而直接new FileReader(), 於非瀏覽器會同步拋錯而非reject, 呼叫端之catch將完全接不到
    if (!isWindow()) {
        return Promise.reject('no window')
    }

    //pm
    let pm = genPm()

    try {

        //reader
        let reader = new FileReader()

        //onload
        reader.onload = function () {
            pm.resolve(reader.result)
        }

        //onerror
        reader.onerror = function (err) {
            pm.reject(err)
        }

        //readAsDataURL
        reader.readAsDataURL(bb)

    }
    catch (err) {
        pm.reject(err)
    }

    return pm
}


export default blob2b64
