import genPm from './genPm.mjs'
import isWindow from './isWindow.mjs'


function coreOthers(bb) {

    //pm
    let pm = genPm()

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

    return pm
}


function coreHTML5(bb) {
    return bb.arrayBuffer()
}


/**
 * 前端Blob或input檔案物件轉ArrayBuffer資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blob2ab.test.js Github}
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
 *         // => ArrayBuffer(3) {
 *         //     [[Int8Array]]: Int8Array(3) [66, 97, 115]
 *         //     [[Uint8Array]]: Uint8Array(3) [66, 97, 115]
 *         //     byteLength: 3
 *         // }
 *     })
 *
 */
function blob2ab(bb) {

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
