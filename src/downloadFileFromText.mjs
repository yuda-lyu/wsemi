import isestr from './isestr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'


/**
 * 前端下載text資料成為utf-8(含BOM)檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromText.test.js Github}
 * @memberOf wsemi
 * @param {String} cfn 輸入檔名字串
 * @param {String} ccont 輸入內容字串
 * @param {Boolean} [withBOM=true] 輸入是否添加BOM，預設true
 * @example
 * need test in browser
 */
function downloadFileFromText(cfn, ccont, withBOM = true) {

    //check
    if (!isestr(cfn)) {
        console.log('invalid filename')
        return
    }
    if (!isstr(ccont)) { //可允許空字串
        console.log('invalid content')
        return
    }
    if (!isbol(withBOM)) {
        console.log('withBOM is not boolean')
        return
    }

    //blob
    let blob
    if (withBOM) {
        blob = new Blob(['\ufeff', ccont]) //ccont為utf8格式, 另添加BOM
    }
    else {
        blob = new Blob([ccont])
    }

    //downloadFileFromBlob
    downloadFileFromBlob(cfn, blob)

}


export default downloadFileFromText
