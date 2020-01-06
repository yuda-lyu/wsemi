import genPm from './genPm.mjs'


/**
 * 前端Blob或input檔案物件轉ArrayBuffer資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blob2ab.test.js Github}
 * @memberOf wsemi
 * @param {Blob|File} bb 輸入Blob或File
 * @returns {Promise} 回傳Promise，resolve回傳Blob或File的ArrayBuffer資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function blob2ab(bb) {

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


export default blob2ab
