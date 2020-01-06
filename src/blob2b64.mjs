import genPm from './genPm.mjs'


/**
 * 前端Blob或input檔案物件轉Base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/blob2b64.test.js Github}
 * @memberOf wsemi
 * @param {Blob|File} bb 輸入Blob或File
 * @returns {Promise} 回傳Promise，resolve回傳Blob或File的Base64字串，reject回傳錯誤訊息
 * @example
 * need test in browser
 */
function blob2b64(bb) {

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
    reader.readAsDataURL(bb)

    return pm
}


export default blob2b64
