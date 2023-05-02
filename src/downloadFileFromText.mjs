import isestr from './isestr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isWindow from './isWindow.mjs'
import downloadFileFromBlob from './downloadFileFromBlob.mjs'


/**
 * 前端下載text資料成為utf-8(含BOM)檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/downloadFileFromText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fileName 輸入檔名字串
 * @param {String} ccont 輸入內容字串
 * @param {Boolean} [withBOM=true] 輸入是否添加BOM，預設true
 * @example
 * need test in browser
 *
 * let ctxt = 'abc\r\nde測試'
 * downloadFileFromText('data.txt',ctxt,false)
 *
 * let ccsv = 'a,b,c\r\nd,e,測試'
 * downloadFileFromText('data.csv',ccsv,true)
 *
 */
function downloadFileFromText(fileName, ccont, withBOM = true) {

    //check
    if (!isWindow()) {
        console.log('no window')
        return
    }

    //check
    if (!isestr(fileName)) {
        console.log('invalid filename')
        return
    }
    if (!isstr(ccont)) { //可允許空字串
        console.log('invalid content')
        return
    }
    if (!isbol(withBOM)) {
        console.log('withBOM is not a boolean')
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
    downloadFileFromBlob(fileName, blob)

}


export default downloadFileFromText
