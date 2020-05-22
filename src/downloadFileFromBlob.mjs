import isestr from './isestr.mjs'


/**
 * 前端下載binary資料核心, 支援IE11
 *
 * @private
 * @param {String} cfn 輸入檔名字串
 * @param {Blob} blob 輸入資料Blob
 */
function df_IE11(cfn, blob) {

    //check
    if (typeof window !== 'undefined') {
        console.log('no window')
        return
    }

    //msSaveOrOpenBlob
    window.navigator.msSaveOrOpenBlob(blob, cfn)

}


/**
 * 前端下載binary資料核心, 支援HTML5瀏覽器
 *
 * @private
 * @param {String} cfn 輸入檔名字串
 * @param {Blob} blob 輸入資料Blob
 */
function df_HTML5(cfn, blob) {

    //check
    if (typeof window !== 'undefined') {
        console.log('no window')
        return
    }

    //createObjectURL
    let url = window.URL.createObjectURL(blob)

    //tag a
    let a = document.createElement('a')
    a.href = url
    a.download = cfn

    //download
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    //revokeObjectURL
    window.URL.revokeObjectURL(url)

}


/**
 * 前端下載Blob資料成為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromBlob.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {Blob} blob 輸入資料Blob
 * @example
 * need test in browser
 */
function downloadFileFromBlob(cfn, blob) {

    //check
    if (!isestr(cfn)) {
        console.log('no filename')
        return
    }

    //check
    if (typeof window !== 'undefined') {
        console.log('no window')
        return
    }

    //download
    if (window.navigator && window.navigator.msSaveOrOpenBlob) { //IE11
        df_IE11(cfn, blob)
    }
    else {
        df_HTML5(cfn, blob)
    }

}


export default downloadFileFromBlob
