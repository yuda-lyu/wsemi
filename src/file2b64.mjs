import genPm from './genPm.mjs'


/**
 * 前端input檔案物件轉Base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/file2b64.test.js Github}
 * @memberOf wsemi
 * @param {Object} file 輸入file物件
 * @returns {Promise} 回傳Promise，resolve回傳檔案的Base64字串，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function file2b64(file) {

    //pm
    let pm = genPm()

    //reader
    let reader = new FileReader()

    //onload
    reader.onload = function () {

        //resolve
        pm.resolve(reader.result)

    }

    //onerror
    reader.onerror = function (err) {

        //reject
        pm.reject(err)

    }

    //readAsDataURL
    reader.readAsDataURL(file)

    return pm
}


export default file2b64
