import genPm from './genPm.mjs'


/**
 * 前端input檔案物件轉Uint8Array資料陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/file2u8arr.test.js Github}
 * @memberOf wsemi
 * @param {Object} file 輸入file物件
 * @returns {Promise} 回傳Promise，resolve回傳檔案的Uint8Array資料陣列，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function file2u8arr(file) {

    //pm
    let pm = genPm()

    //reader
    let reader = new FileReader()

    //onload
    reader.onload = function(event) {

        //ab
        let ab = event.target.result

        //u8a
        let u8a = new Uint8Array(ab)

        //resolve
        pm.resolve(u8a)

    }

    //onerror
    reader.onerror = function (err) {
        pm.reject(err)
    }

    //readAsArrayBuffer
    reader.readAsArrayBuffer(file)

    return pm
}


export default file2u8arr
