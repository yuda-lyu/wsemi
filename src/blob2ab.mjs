import genPm from './genPm.mjs'
import isblob from './isblob.mjs'
import isWindow from './isWindow.mjs'


function coreOthers(bb) {

    //pm
    let pm = genPm()

    //reader與readAsArrayBuffer皆須納入try, 否則會同步拋錯而非reject, 呼叫端之catch將完全接不到
    try {

        //reader
        let reader = new FileReader()

        //onload
        reader.onload = function() {

            //ab
            let ab = reader.result //event.target.result

            //resolve
            pm.resolve(ab)

        }

        //onerror
        reader.onerror = function (err) {
            pm.reject(err)
        }

        //readAsArrayBuffer
        reader.readAsArrayBuffer(bb)

    }
    catch (err) {
        pm.reject(err)
    }

    return pm
}


function coreHTML5(bb) {
    return bb.arrayBuffer()
}


/**
 * 前端Blob或input檔案物件轉ArrayBuffer資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blob2ab.test.mjs Github}
 * @memberOf wsemi
 * @param {Blob|File} bb 輸入Blob或File
 * @returns {Promise} 回傳Promise，resolve回傳Blob或File的ArrayBuffer資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let bb = new Blob([new Uint8Array([66, 97, 115])])
 * blob2ab(b)
 *     .then(function(ab){
 *         console.log(ab)
 *         // => ArrayBuffer(3) {
 *         //     [[Int8Array]]: Int8Array(3) [66, 97, 115]
 *         //     [[Uint8Array]]: Uint8Array(3) [66, 97, 115]
 *         //     byteLength: 3
 *         // }
 *     })
 *
 */
function blob2ab(bb) {

    //check, 輸入無效屬呼叫端錯誤, 須先於環境檢查回報, 否則於瀏覽器外一律得到no window而無從分辨
    if (!isblob(bb)) {
        return Promise.reject('invalid bb')
    }

    //check
    if (!isWindow()) {
        return Promise.reject('no window')
    }

    try {
        return coreHTML5(bb)
    }
    catch (err) {
        return coreOthers(bb) //IE11, Opera, Safari
    }
}


export default blob2ab
